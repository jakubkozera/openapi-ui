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
  message: WebviewMessage
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
  constructor(private webview: vscode.Webview) {}

  /**
   * Handle incoming message from webview
   * @param message - The message from webview
   */
  async handleMessage(message: WebviewMessage): Promise<void> {
    if (isFetchRequestMessage(message)) {
      await this.handleFetchRequest(message);
    }
    // Add more message type handlers here as needed
  }

  /**
   * Handle fetch request from webview
   */
  private async handleFetchRequest(message: FetchRequestMessage): Promise<void> {
    const request = message.payload;

    try {
      const result = await fetchProxy.fetch(request);

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
    }
  }
}

/**
 * Set up message handling for a webview panel
 * @param panel - The webview panel to set up
 * @returns Disposable for cleanup
 */
export function setupWebviewMessageHandler(
  panel: vscode.WebviewPanel
): vscode.Disposable {
  const handler = new WebviewMessageHandler(panel.webview);

  return panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
    handler.handleMessage(message);
  });
}
