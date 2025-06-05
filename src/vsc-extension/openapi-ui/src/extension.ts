import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { OpenAPIStorage } from "./storage";
import { OpenAPITreeDataProvider, OpenAPITreeItem } from "./treeDataProvider";
import { OpenAPISource } from "./models";

export function activate(context: vscode.ExtensionContext) {
  // Initialize storage
  const storage = new OpenAPIStorage(context);

  // Initialize tree data provider
  const treeDataProvider = new OpenAPITreeDataProvider(storage);
  // Register tree view
  const treeView = vscode.window.createTreeView("openapi-ui-sidebar", {
    treeDataProvider: treeDataProvider,
    showCollapseAll: false,
  });
  context.subscriptions.push(treeView);

  // Register command to open OpenAPI UI in main editor area
  let openViewDisposable = vscode.commands.registerCommand(
    "openapi-ui.openView",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "openapiUI",
        "OpenAPI UI",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(
              path.join(context.extensionPath, "..", "..", "core", "dist")
            ),
          ],
        }
      );

      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionPath
      );
    }
  );

  // Register command to add OpenAPI source
  let addSourceDisposable = vscode.commands.registerCommand(
    "openapi-ui.addSource",
    async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Enter a name for the OpenAPI source",
        placeHolder: "e.g., My API",
      });

      if (!name) {
        return;
      }

      const url = await vscode.window.showInputBox({
        prompt: "Enter the URL of the OpenAPI specification",
        placeHolder: "e.g., https://api.example.com/openapi.json",
        validateInput: (value) => {
          if (!value) {
            return "URL is required";
          }
          try {
            new URL(value);
            return null;
          } catch {
            return "Please enter a valid URL";
          }
        },
      });

      if (!url) {
        return;
      }

      storage.addSource(name, url);
      vscode.window.showInformationMessage(`Added OpenAPI source: ${name}`);
    }
  );

  // Register command to remove OpenAPI source
  let removeSourceDisposable = vscode.commands.registerCommand(
    "openapi-ui.removeSource",
    async (item: OpenAPITreeItem) => {
      const result = await vscode.window.showWarningMessage(
        `Are you sure you want to remove "${item.source.name}"?`,
        { modal: true },
        "Yes",
        "No"
      );

      if (result === "Yes") {
        storage.removeSource(item.source.id);
        vscode.window.showInformationMessage(
          `Removed OpenAPI source: ${item.source.name}`
        );
      }
    }
  );

  // Register command to refresh sources
  let refreshSourcesDisposable = vscode.commands.registerCommand(
    "openapi-ui.refreshSources",
    () => {
      treeDataProvider.refresh();
      vscode.window.showInformationMessage("Refreshed OpenAPI sources");
    }
  ); // Register command to load source
  let loadSourceDisposable = vscode.commands.registerCommand(
    "openapi-ui.loadSource",
    async (sourceId?: string) => {
      let selectedSourceId = sourceId;

      // If no source ID provided, show selection dialog
      if (!selectedSourceId) {
        const sources = storage.getSources();

        if (sources.length === 0) {
          vscode.window
            .showInformationMessage(
              "No OpenAPI sources available. Add a source first.",
              "Add Source"
            )
            .then((selection) => {
              if (selection === "Add Source") {
                vscode.commands.executeCommand("openapi-ui.addSource");
              }
            });
          return;
        }

        // Create quick pick items
        const quickPickItems = sources.map((source) => ({
          label: source.name,
          description: source.url,
          detail: `Created: ${source.createdAt.toLocaleString()}`,
          sourceId: source.id,
        }));

        const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
          placeHolder: "Select an OpenAPI source to load",
          matchOnDescription: true,
          matchOnDetail: true,
        });

        if (!selectedItem) {
          return; // User cancelled selection
        }

        selectedSourceId = selectedItem.sourceId;
      }

      const source = storage.getSource(selectedSourceId);
      if (!source) {
        vscode.window.showErrorMessage("OpenAPI source not found");
        return;
      }

      if (!source.name || !source.url) {
        vscode.window.showErrorMessage("Invalid OpenAPI source data");
        return;
      }

      try {
        const panel = vscode.window.createWebviewPanel(
          "openapiSourceUI",
          `OpenAPI UI - ${source.name}`,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.file(
                path.join(context.extensionPath, "..", "..", "core", "dist")
              ),
            ],
          }
        );

        panel.webview.html = getWebviewContent(
          panel.webview,
          context.extensionPath,
          source.url
        );

        vscode.window.showInformationMessage(
          `Loaded OpenAPI source: ${source.name}`
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to load OpenAPI source: ${error}`
        );
      }
    }
  );
  context.subscriptions.push(
    openViewDisposable,
    addSourceDisposable,
    removeSourceDisposable,
    refreshSourcesDisposable,
    loadSourceDisposable
  );
}

export function deactivate() {}

function getWebviewContent(
  webview: vscode.Webview,
  extensionPath: string,
  openapiUrl?: string
): string {
  // Path to the core/dist directory
  const distPath = path.join(extensionPath, "..", "..", "core", "dist");
  const htmlPath = path.join(distPath, "index.html");

  try {
    // Read the HTML file
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Create URIs for the CSS and JS files
    const cssUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(distPath, "bundle.css"))
    );
    const jsUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(distPath, "bundle.js"))
    );

    const imgUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(distPath, "openapi-ui.png"))
    ); // Replace the relative paths with webview URIs
    htmlContent = htmlContent.replace('href="bundle.css"', `href="${cssUri}"`);
    htmlContent = htmlContent.replace('src="bundle.js"', `src="${jsUri}"`);
    htmlContent = htmlContent.replace(
      'src="openapi-ui.png"',
      `src="${imgUri}"`
    );

    // Replace the OpenAPI URL placeholder if provided
    if (openapiUrl) {
      htmlContent = htmlContent.replace("#swagger_path#", openapiUrl);
    }

    return htmlContent;
  } catch (error) {
    console.error("Error loading HTML file:", error);
    return getFallbackContent();
  }
}

function getFallbackContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>OpenAPI UI - Error</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .error { color: #d73a49; background: #f8f8f8; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="error">
        <h2>Error Loading OpenAPI UI</h2>
        <p>Could not load the HTML file from core/dist/index.html</p>
        <p>Please ensure the files are built and available in the correct location.</p>
    </div>
</body>
</html>`;
}
