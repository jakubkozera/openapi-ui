# OpenAPI UI - VS Code Extension

A powerful Visual Studio Code extension that provides an intuitive interface for viewing and managing OpenAPI specifications directly within your development environment.

## Features

- **OpenAPI Viewer**: Interactive UI for browsing OpenAPI specifications
- **Source Management**: Add, remove and organize multiple OpenAPI sources
- **URL Support**: Load OpenAPI specs from remote URLs or local files
- **Activity Bar Integration**: Dedicated sidebar for quick access to API sources
- **Request Proxy**: Send webview requests without browser CORS limitations
- **Workspace Persistence**: Restore request tabs, drafts, variables and collections

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "OpenAPI UI"
4. Click Install

### Manual Installation

1. Clone this repository
2. Navigate to the extension directory
3. Run `npm install` to install dependencies
4. Press `F5` to launch a new Extension Development Host window

## Usage

### Getting Started

1. **Open the OpenAPI UI Panel**
   - Click on the OpenAPI UI icon in the Activity Bar
   - Or use Command Palette (Ctrl+Shift+P) and search for "Open OpenAPI UI"

2. **Add an OpenAPI Source**
   - Click the "+" button in the OpenAPI Sources panel
   - Enter a name for your API source
   - Provide the URL or file path to your OpenAPI specification

3. **View Your API**
   - Click on any source in the sidebar to load it
   - The OpenAPI specification will open in the main editor area

![vscode-extension](https://raw.githubusercontent.com/jakubkozera/openapi-ui/refs/heads/master/src/vsc-extension/openapi-ui/vscode-extension.png)

## Features

- **React Workspace** - Searchable collections and persistent request tabs
- **Request Editing** - Parameters, headers, bodies, forms and file uploads
- **Authorization** - Bearer, Basic, API Key, OAuth2 and OpenID Connect
- **Variables** - Monaco highlighting for environment and JSONPath output variables
- **Native Themes** - VS Code light, dark and high-contrast token support
- **Collection Runner** - Ordered execution with output chaining
- **Real-time Response Viewing** - Immediate feedback with formatted response data

![OpenAI UI overview](https://raw.githubusercontent.com/jakubkozera/openapi-ui/refs/heads/master/readme-assets/openapi-ui-overview.png)

### Advanced Features

#### Collection Runner

- Execute multiple API requests in sequence for testing workflows

![collection-runner](https://raw.githubusercontent.com/jakubkozera/openapi-ui/refs/heads/master/readme-assets/collection-runner.png)

- Variable extraction and chaining between requests

![Request variables](https://raw.githubusercontent.com/jakubkozera/openapi-ui/refs/heads/master/readme-assets/request-editor-variables.png)
![Output variables](https://raw.githubusercontent.com/jakubkozera/openapi-ui/refs/heads/master/readme-assets/output-variables.png)

## Configuration

The extension stores your OpenAPI sources locally using VS Code's workspace storage. No external configuration is required.

## Supported OpenAPI Versions

- OpenAPI 3.0.x
- OpenAPI 3.1.x
- Swagger 2.0 (partial support)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
