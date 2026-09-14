import * as vscode from "vscode";
import {
  fetchProxy,
  FetchProxyRequest,
  FetchProxyResult,
  isFetchProxyError,
} from "./fetchProxy";

/**
 * Message types for webview <-> extension communication
 */
export interface WebviewMessage {
  type: string;
  requestId?: string;
  payload?: unknown;
}

export interface FetchRequestMessage extends WebviewMessage {
  type: "fetchRequest";
  requestId: string;
  payload: FetchProxyRequest;
}

export interface FetchResponseMessage extends WebviewMessage {
  type: "fetchResponse";
  requestId: string;
  payload: FetchProxyResult;
}

/**
 * Type guard to check if a message is a fetch request
 */
export function isFetchRequestMessage(
  message: WebviewMessage,
): message is FetchRequestMessage {
  return (
    message.type === "fetchRequest" &&
    typeof message.requestId === "string" &&
    message.payload !== undefined
  );
}

/**
 * WebviewMessageHandler class handles messages from the webview
 * and dispatches them to appropriate handlers
 */
export class WebviewMessageHandler {
  private controllers = new Map<string, AbortController>();
  constructor(
    private webview: vscode.Webview,
    private workspaceState?: vscode.Memento,
  ) {}

  /**
   * Handle incoming message from webview
   * @param message - The message from webview
   */
  async handleMessage(message: WebviewMessage): Promise<void> {
    if (!message || typeof message !== "object") {
      return;
    }
    if (
      message.type === "fetchCancel" &&
      typeof message.requestId === "string"
    ) {
      this.controllers.get(message.requestId)?.abort();
      return;
    }
    if (message.type === "workspaceSave" && this.workspaceState) {
      const payload = message.payload as
        | { key?: unknown; value?: unknown }
        | undefined;
      if (
        typeof payload?.key !== "string" ||
        !payload.key.startsWith("openapi-ui:") ||
        payload.key.length > 4096
      ) {
        return;
      }
      if (
        payload.value !== null &&
        (typeof payload.value !== "string" || payload.value.length > 5_000_000)
      ) {
        return;
      }
      try {
        await this.workspaceState.update(
          `openapi-ui:storage:${payload.key}`,
          payload.value ?? undefined,
        );
      } catch {
        await this.webview.postMessage({ type: "workspaceSaveError" });
      }
      return;
    }
    if (isFetchRequestMessage(message)) {
      await this.handleFetchRequest(message);
    }
    // Add more message type handlers here as needed
  }

  /**
   * Handle fetch request from webview
   */
  private async handleFetchRequest(
    message: FetchRequestMessage,
  ): Promise<void> {
    const request = message.payload;
    const controller = new AbortController();
    this.controllers.set(message.requestId, controller);

    try {
      const result = await fetchProxy.fetch(request, controller.signal);

      const response: FetchResponseMessage = {
        type: "fetchResponse",
        requestId: message.requestId,
        payload: result,
      };

      this.webview.postMessage(response);
    } catch (error) {
      const errorResponse: FetchResponseMessage = {
        type: "fetchResponse",
        requestId: message.requestId,
        payload: {
          error: true,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };

      this.webview.postMessage(errorResponse);
    } finally {
      this.controllers.delete(message.requestId);
    }
  }

  dispose(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}

/**
 * Set up message handling for a webview panel
 * @param panel - The webview panel to set up
 * @returns Disposable for cleanup
 */
export function setupWebviewMessageHandler(
  panel: vscode.WebviewPanel,
  workspaceState?: vscode.Memento,
): vscode.Disposable {
  const handler = new WebviewMessageHandler(panel.webview, workspaceState);

  const subscription = panel.webview.onDidReceiveMessage(
    (message: WebviewMessage) => {
      handler.handleMessage(message);
    },
  );
  return {
    dispose: () => {
      subscription.dispose();
      handler.dispose();
    },
  };
}
