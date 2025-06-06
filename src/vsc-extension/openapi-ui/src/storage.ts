import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { OpenAPISource, OpenAPISourceStorage } from "./models";

export class OpenAPIStorage {
  private readonly storageFile: string;
  private sources: OpenAPISource[] = [];
  private onDidChangeEmitter = new vscode.EventEmitter<void>();
  public readonly onDidChange = this.onDidChangeEmitter.event;

  constructor(private context: vscode.ExtensionContext) {
    // Store the JSON file in the workspace storage path
    const storagePath = context.globalStorageUri.fsPath;
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    this.storageFile = path.join(storagePath, "openapi-sources.json");
    this.loadSources();
  }

  private loadSources(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const content = fs.readFileSync(this.storageFile, "utf-8");
        const data: OpenAPISourceStorage = JSON.parse(content);
        this.sources = data.sources.map((source) => ({
          ...source,
          createdAt: new Date(source.createdAt),
        }));
      }
    } catch (error) {
      console.error("Error loading OpenAPI sources:", error);
      this.sources = [];
    }
  }

  private saveSources(): void {
    try {
      const data: OpenAPISourceStorage = {
        sources: this.sources,
      };
      fs.writeFileSync(
        this.storageFile,
        JSON.stringify(data, null, 2),
        "utf-8"
      );
      this.onDidChangeEmitter.fire();
    } catch (error) {
      console.error("Error saving OpenAPI sources:", error);
      vscode.window.showErrorMessage("Failed to save OpenAPI sources");
    }
  }

  public getSources(): OpenAPISource[] {
    return [...this.sources];
  }

  public addSource(name: string, url: string): void {
    const newSource: OpenAPISource = {
      id: this.generateId(),
      name,
      url,
      createdAt: new Date(),
    };

    this.sources.push(newSource);
    this.saveSources();
  }

  public removeSource(id: string): boolean {
    const initialLength = this.sources.length;
    this.sources = this.sources.filter((source) => source.id !== id);

    if (this.sources.length < initialLength) {
      this.saveSources();
      return true;
    }
    return false;
  }

  public getSource(id: string): OpenAPISource | undefined {
    return this.sources.find((source) => source.id === id);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
