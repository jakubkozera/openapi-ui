/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const path = __importStar(__webpack_require__(2));
const fs = __importStar(__webpack_require__(3));
function activate(context) {
    // Register the webview provider for the sidebar view
    const provider = new OpenAPIWebviewProvider(context.extensionPath);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("openapi-ui-sidebar", provider));
    // Register command to open OpenAPI UI in main editor area
    let disposable = vscode.commands.registerCommand("openapi-ui.openView", () => {
        const panel = vscode.window.createWebviewPanel("openapiUI", "OpenAPI UI", vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, "..", "..", "core", "demo-dist")),
            ],
        });
        panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);
    });
    context.subscriptions.push(disposable);
}
class OpenAPIWebviewProvider {
    _extensionPath;
    static viewType = "openapi-ui-sidebar";
    constructor(_extensionPath) {
        this._extensionPath = _extensionPath;
    }
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this._extensionPath, "..", "..", "core", "demo-dist")),
            ],
        };
        // Create a simple interface with a button to open in editor
        webviewView.webview.html = getSidebarContent();
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "openInEditor":
                    vscode.commands.executeCommand("openapi-ui.openView");
                    return;
            }
        }, undefined, []);
    }
}
function getSidebarContent() {
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
function deactivate() { }
function getWebviewContent(webview, extensionPath) {
    // Path to the core/dist directory
    const distPath = path.join(extensionPath, "..", "..", "core", "demo-dist");
    const htmlPath = path.join(distPath, "index.html");
    try {
        // Read the HTML file
        let htmlContent = fs.readFileSync(htmlPath, "utf8");
        // Create URIs for the CSS and JS files
        const cssUri = webview.asWebviewUri(vscode.Uri.file(path.join(distPath, "bundle.css")));
        const jsUri = webview.asWebviewUri(vscode.Uri.file(path.join(distPath, "bundle.js")));
        const imgUri = webview.asWebviewUri(vscode.Uri.file(path.join(distPath, "openapi-ui.png")));
        // Replace the relative paths with webview URIs
        htmlContent = htmlContent.replace('href="bundle.css"', `href="${cssUri}"`);
        htmlContent = htmlContent.replace('src="bundle.js"', `src="${jsUri}"`);
        htmlContent = htmlContent.replace('src="openapi-ui.png"', `src="${imgUri}"`);
        return htmlContent;
    }
    catch (error) {
        console.error("Error loading HTML file:", error);
        return getFallbackContent();
    }
}
function getFallbackContent() {
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


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map