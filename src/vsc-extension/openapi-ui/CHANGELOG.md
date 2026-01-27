# Change Log

All notable changes to the "openapi-ui" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.1] - 2026-01-27

### Added

- **Load from Disk**: New command `openapi-ui.loadFromDisk` to load OpenAPI specifications from local files
  - Supports JSON and YAML files via file picker dialog
  - Accepts optional file path parameter for programmatic usage
  - Validates JSON content before loading
  - Displays file name in webview title

## [1.1.0] - 2026-01-27

### Added
- **CORS Bypass**: Backend HTTP proxy to eliminate CORS errors when loading OpenAPI specs from web APIs
  - All HTTP/HTTPS requests now route through VS Code extension backend
  - Support for custom headers, all HTTP methods (GET, POST, PUT, PATCH, DELETE)
  - Self-signed certificate support for local development
  - Automatic timeout handling and error recovery
- **Fetch Interceptor**: Transparent fetch API interception in webview
  - All `fetch()` calls automatically proxied through extension backend
  - Response-like objects with full API compatibility (`json()`, `text()`, `blob()`, etc.)
  - Handles data URLs and blob URLs natively without proxy
- **Comprehensive Test Suite**: Unit tests for all new proxy and messaging components
  - FetchProxy tests with real HTTP server
  - WebviewMessageHandler tests
  - FetchInterceptor script validation tests




## [Unreleased]

- Initial release