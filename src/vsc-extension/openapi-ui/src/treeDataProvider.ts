import * as vscode from "vscode";
import { OpenAPISource } from "./models";
import { OpenAPIStorage } from "./storage";

export class OpenAPITreeDataProvider
  implements vscode.TreeDataProvider<OpenAPITreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    OpenAPITreeItem | undefined | null | void
  > = new vscode.EventEmitter<OpenAPITreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    OpenAPITreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private storage: OpenAPIStorage) {
    // Listen to storage changes and refresh the tree
    this.storage.onDidChange(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: OpenAPITreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OpenAPITreeItem): Thenable<OpenAPITreeItem[]> {
    if (!element) {
      // Root level - return all sources
      const sources = this.storage.getSources();
      return Promise.resolve(
        sources.map((source) => new OpenAPITreeItem(source))
      );
    }

    return Promise.resolve([]);
  }
}

export class OpenAPITreeItem extends vscode.TreeItem {
  constructor(
    public readonly source: OpenAPISource,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None
  ) {
    super(source.name, collapsibleState);

    this.tooltip = `${source.name}\n${
      source.url
    }\nCreated: ${source.createdAt.toLocaleString()}`;
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
