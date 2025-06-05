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
const storage_1 = __webpack_require__(4);
const treeDataProvider_1 = __webpack_require__(5);
function activate(context) {
    // Initialize storage
    const storage = new storage_1.OpenAPIStorage(context);
    // Initialize tree data provider
    const treeDataProvider = new treeDataProvider_1.OpenAPITreeDataProvider(storage);
    // Register tree view
    const treeView = vscode.window.createTreeView("openapi-ui-sidebar", {
        treeDataProvider: treeDataProvider,
        showCollapseAll: true,
    });
    context.subscriptions.push(treeView);
    // Register command to open OpenAPI UI in main editor area
    let openViewDisposable = vscode.commands.registerCommand("openapi-ui.openView", () => {
        const panel = vscode.window.createWebviewPanel("openapiUI", "OpenAPI UI", vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, "..", "..", "core", "demo-dist")),
            ],
        });
        panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);
    });
    // Register command to add OpenAPI source
    let addSourceDisposable = vscode.commands.registerCommand("openapi-ui.addSource", async () => {
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
                }
                catch {
                    return "Please enter a valid URL";
                }
            },
        });
        if (!url) {
            return;
        }
        storage.addSource(name, url);
        vscode.window.showInformationMessage(`Added OpenAPI source: ${name}`);
    });
    // Register command to remove OpenAPI source
    let removeSourceDisposable = vscode.commands.registerCommand("openapi-ui.removeSource", async (item) => {
        const result = await vscode.window.showWarningMessage(`Are you sure you want to remove "${item.source.name}"?`, { modal: true }, "Yes", "No");
        if (result === "Yes") {
            storage.removeSource(item.source.id);
            vscode.window.showInformationMessage(`Removed OpenAPI source: ${item.source.name}`);
        }
    });
    // Register command to refresh sources
    let refreshSourcesDisposable = vscode.commands.registerCommand("openapi-ui.refreshSources", () => {
        treeDataProvider.refresh();
        vscode.window.showInformationMessage("Refreshed OpenAPI sources");
    });
    // Register command to load source (placeholder for future implementation)
    let loadSourceDisposable = vscode.commands.registerCommand("openapi-ui.loadSource", async (source) => {
        vscode.window.showInformationMessage(`Loading OpenAPI source: ${source.name} (${source.url}) - Not implemented yet`);
    });
    context.subscriptions.push(openViewDisposable, addSourceDisposable, removeSourceDisposable, refreshSourcesDisposable, loadSourceDisposable);
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

/***/ }),
/* 4 */
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
exports.OpenAPIStorage = void 0;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(3));
const path = __importStar(__webpack_require__(2));
class OpenAPIStorage {
    context;
    storageFile;
    sources = [];
    onDidChangeEmitter = new vscode.EventEmitter();
    onDidChange = this.onDidChangeEmitter.event;
    constructor(context) {
        this.context = context;
        // Store the JSON file in the workspace storage path
        const storagePath = context.globalStorageUri.fsPath;
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
        this.storageFile = path.join(storagePath, "openapi-sources.json");
        this.loadSources();
    }
    loadSources() {
        try {
            if (fs.existsSync(this.storageFile)) {
                const content = fs.readFileSync(this.storageFile, "utf-8");
                const data = JSON.parse(content);
                this.sources = data.sources.map((source) => ({
                    ...source,
                    createdAt: new Date(source.createdAt),
                }));
            }
        }
        catch (error) {
            console.error("Error loading OpenAPI sources:", error);
            this.sources = [];
        }
    }
    saveSources() {
        try {
            const data = {
                sources: this.sources,
            };
            fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2), "utf-8");
            this.onDidChangeEmitter.fire();
        }
        catch (error) {
            console.error("Error saving OpenAPI sources:", error);
            vscode.window.showErrorMessage("Failed to save OpenAPI sources");
        }
    }
    getSources() {
        return [...this.sources];
    }
    addSource(name, url) {
        const newSource = {
            id: this.generateId(),
            name,
            url,
            createdAt: new Date(),
        };
        this.sources.push(newSource);
        this.saveSources();
    }
    removeSource(id) {
        const initialLength = this.sources.length;
        this.sources = this.sources.filter((source) => source.id !== id);
        if (this.sources.length < initialLength) {
            this.saveSources();
            return true;
        }
        return false;
    }
    getSource(id) {
        return this.sources.find((source) => source.id === id);
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
exports.OpenAPIStorage = OpenAPIStorage;


/***/ }),
/* 5 */
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
exports.OpenAPITreeItem = exports.OpenAPITreeDataProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
class OpenAPITreeDataProvider {
    storage;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    constructor(storage) {
        this.storage = storage;
        // Listen to storage changes and refresh the tree
        this.storage.onDidChange(() => {
            this.refresh();
        });
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - return all sources
            const sources = this.storage.getSources();
            return Promise.resolve(sources.map((source) => new OpenAPITreeItem(source)));
        }
        return Promise.resolve([]);
    }
}
exports.OpenAPITreeDataProvider = OpenAPITreeDataProvider;
class OpenAPITreeItem extends vscode.TreeItem {
    source;
    collapsibleState;
    constructor(source, collapsibleState = vscode
        .TreeItemCollapsibleState.None) {
        super(source.name, collapsibleState);
        this.source = source;
        this.collapsibleState = collapsibleState;
        this.tooltip = `${source.name}\n${source.url}\nCreated: ${source.createdAt.toLocaleString()}`;
        this.description = source.url;
        this.contextValue = "openapi-source";
        // Add icons
        this.iconPath = new vscode.ThemeIcon("globe");
        // Add command to load the source when clicked (for future implementation)
        this.command = {
            command: "openapi-ui.loadSource",
            title: "Load OpenAPI Source",
            arguments: [source],
        };
    }
}
exports.OpenAPITreeItem = OpenAPITreeItem;


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