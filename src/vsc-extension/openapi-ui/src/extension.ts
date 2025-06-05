import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  // Register the webview provider for the sidebar view
  const provider = new OpenAPIWebviewProvider(context.extensionPath);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("openapi-ui-sidebar", provider)
  );

  // Register command to open OpenAPI UI in main editor area
  let disposable = vscode.commands.registerCommand(
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
              path.join(context.extensionPath, "..", "..", "core", "demo-dist")
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

  context.subscriptions.push(disposable);
}

class OpenAPIWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "openapi-ui-sidebar";

  constructor(private readonly _extensionPath: string) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          path.join(this._extensionPath, "..", "..", "core", "demo-dist")
        ),
      ],
    };

    // Create a simple interface with a button to open in editor
    webviewView.webview.html = getSidebarContent();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "openInEditor":
            vscode.commands.executeCommand("openapi-ui.openView");
            return;
        }
      },
      undefined,
      []
    );
  }
}

function getSidebarContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenAPI UI</title>
    <style>
        body { 
            font-family: var(--vscode-font-family);
            padding: 20px; 
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .open-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .open-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .description {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 10px;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="logo">🔧 OpenAPI UI</div>
    <button class="open-button" onclick="openInEditor()">
        Open in Editor
    </button>
    <div class="description">
        Click the button above to open OpenAPI UI in the main editor area for better viewing experience.
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function openInEditor() {
            vscode.postMessage({
                command: 'openInEditor'
            });
        }
    </script>
</body>
</html>`;
}

export function deactivate() {}

function getWebviewContent(
  webview: vscode.Webview,
  extensionPath: string
): string {
  // Path to the core/dist directory
  const distPath = path.join(extensionPath, "..", "..", "core", "demo-dist");
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
    );

    // Replace the relative paths with webview URIs
    htmlContent = htmlContent.replace('href="bundle.css"', `href="${cssUri}"`);
    htmlContent = htmlContent.replace('src="bundle.js"', `src="${jsUri}"`);
    htmlContent = htmlContent.replace(
      'src="openapi-ui.png"',
      `src="${imgUri}"`
    );

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
