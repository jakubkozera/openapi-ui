# React Core

The active UI lives in `react/`. React owns the collection overview, navigation,
request tabs, forms, responses and tools. The old DOM-driven modules and CSS are
not loaded. The C#, JavaScript/TypeScript and request snippet generators are reused
as ES modules from `js/`.

## Development

Node.js 22.12 or newer is required. From the repository root:

```sh
npm ci --prefix src/core
npm run dev --prefix src/core
npm run typecheck --prefix src/core
npm test --prefix src/core
npm run build --prefix src/core
npm run build:demo --prefix src/core
```

Vite serves the development app at the URL printed in the terminal. Production uses
esbuild and preserves the existing `index.html`, `bundle.js`, `bundle.css` contract.
`node build.js` also synchronizes assets to the C# `Content/` and VS Code `core-dist/`
directories. Do not edit generated bundles. `node demo-build.js` builds `demo-dist/`
with sample specifications and uses the same React application.

The HTML retains `#swagger_path#` and `#base_url#` for hosting integrations, now in
HTML meta attributes. The middleware and extension encode replacement values.
The sample API references the local C# project:

```sh
dotnet run --project src/c-sharp/OpenApiUi.Sample
```

## Workspace and Features

- Collection overview, tag navigation, search, HTTP method filtering and favorites.
- Request tabs with independent drafts and in-memory responses, keyboard navigation,
  closing tabs and restoration across sessions. Existing endpoint hash links work.
- OpenAPI 3.x and Swagger 2.0, JSON/YAML import from URL, file or pasted content.
- Server selection, path/query/header parameters, JSON/text/XML bodies, URL-encoded
  forms and multipart file uploads. Required path parameters and JSON syntax are checked.
- Bearer, Basic, API key, OAuth2 and OIDC. Operation security overrides global security;
  alternative requirements and combined schemes are respected. Without a complete set
  of valid credentials, requests are sent without generated authorization and the API
  decides whether anonymous access is allowed (including public endpoints under global
  security declarations). Explicit request headers are preserved.
  OAuth authorization code uses S256 PKCE. For compatibility with v1, OAuth2 implicit
  flows default Client ID to the first scope's prefix before its final `/`, unless the
  scheme provides `clientId`. This is a legacy convention, not general OAuth discovery;
  the Client ID remains editable for providers using a separate client registration.
  VS Code supports completing an external redirect using its callback URL.
- Response status, timing, size, body, headers, request details and downloads.
- Variables including legacy `{{@output}}` syntax; JSONPath extraction runs without eval.
- Saved collection runner with ordering, enable/disable, delay, cancellation, stop on
  error, output-variable chaining, request editing, collection import/export and result export.
- Snippets for cURL, JavaScript, Python, C# and Java; configurable C# and JS/TS clients.
- Monaco with a usable textarea fallback when the editor CDN is unavailable.

## Persistence and Security

Versioned keys under `openapi-ui:workspace:` isolate API workspaces by source and title.
Saved data includes open tabs, the active tab, request drafts, selected server,
favorites, variables, collections and the latest 100 history entries. History contains
operation metadata, status and timing, not response bodies or credentials. Reopening
history opens the corresponding request tab; it does not replay the request.

Draft bodies, custom headers and variables can contain sensitive data and are stored
unencrypted. Dedicated authorization credentials are memory-only unless the user
explicitly enables **Remember credentials on this device**. Files and response payloads
are never automatically persisted. Do not store production secrets on shared devices.

Standalone storage uses localStorage. VS Code additionally saves through the existing
webview bridge into extension workspaceState, restoring it before React starts.
Storage failures are shown without disabling the editor. Malformed records and deleted
operations are excluded on restore. Existing vanilla-UI variables, output values,
favorites and compatible saved collections are copied on first use without deleting
their old storage keys. Legacy credentials are not silently imported.

## Themes

Standalone presets: System, Light, Graphite and High contrast. The choice is persisted.
The stylesheet uses semantic CSS custom properties. VS Code overrides them with
`--vscode-editor-*`, `--vscode-sideBar-*`, `--vscode-input-*`, `--vscode-list-*`,
`--vscode-button-*`, focus and contrast tokens, including live theme changes.
The standalone theme selector is hidden inside VS Code. Monaco follows the host colors.

## Tests and Verification

Vitest and Testing Library cover workspace restoration, malformed storage, React
request editing, history privacy, response rendering, sanitized Markdown, runner
sequencing, request serialization, security alternatives, OAuth state/PKCE, generators
and migration. Extension Mocha tests cover storage messages, HTTP proxying and executing
the webview script with multipart bytes, binary downloads and cancellation.

```sh
npm run compile-tests --prefix src/vsc-extension/openapi-ui
node src/vsc-extension/openapi-ui/node_modules/mocha/bin/mocha.js --ui tdd src/vsc-extension/openapi-ui/out/test/fetchProxy.test.js src/vsc-extension/openapi-ui/out/test/fetchInterceptor.test.js src/vsc-extension/openapi-ui/out/test/webviewMessageHandler.test.js
npm run compile --prefix src/vsc-extension/openapi-ui
```

Browser smoke checks should cover desktop and mobile overview, multiple request tabs,
draft persistence after reload, real API execution, uploads/downloads, all theme presets,
VS Code token changes, import, runner and code generation.

## Limits

Standalone requests still obey browser CORS and mixed-content rules. VS Code uses its
existing HTTP proxy, now with lossless binary transport and abort propagation. Browsers
cannot directly set Cookie headers: cookie authentication must be established on the
API origin. External `$ref` documents are not resolved; bundle references before import.
Specification examples are not a complete JSON Schema validator. Live OAuth providers
require their own registered client and redirect configuration. Font and Monaco CDNs
are optional network resources; request editing still works without them.
