# OpenAPI UI - Agent Instructions

## Architecture

- `src/core/react/`: active React application, plain JavaScript with JSX.
- `src/core/js/codeApiGenerators/` and `src/core/js/codeSnippets.js`: reused ES-module generators.
- Other old `src/core/js/` and `src/core/css/` files are retired UI implementations and are not loaded.
- `src/c-sharp/OpenApiUi/Lib/`: ASP.NET Core middleware, targeting .NET 6, 8, 9 and 10.
- `src/vsc-extension/openapi-ui/src/`: TypeScript extension and webview HTTP/storage bridge.
- `src/c-sharp/OpenApiUi.Sample/`: local sample API referencing the local library project.

Do not introduce new UI behavior into retired DOM modules or load their global scripts.
Use React components, controlled state and imported modules, not global event handlers.
See `src/core/README.md` for feature details, persistence contracts and limitations.

## Build and Test

Node.js 22.12 or newer is required. From the repository root:

```sh
npm ci --prefix src/core
npm test --prefix src/core
npm run build --prefix src/core
npm run build:demo --prefix src/core
```

The core uses Vite for development and esbuild for production. `node build.js` in
`src/core` builds `dist/` and automatically synchronizes assets to C# `Content/` and
extension `core-dist/`. `node demo-build.js` builds the standalone demo with sample specs.
Do not manually edit generated bundles. Keep `index.html`, `bundle.js`, `bundle.css`,
`#swagger_path#` and `#base_url#` compatible with both hosts.

```sh
npm run dev --prefix src/core
dotnet run --project src/c-sharp/OpenApiUi.Sample
npm run compile-tests --prefix src/vsc-extension/openapi-ui
npm run lint --prefix src/vsc-extension/openapi-ui
npm run compile --prefix src/vsc-extension/openapi-ui
```

Use Vitest and Testing Library for React components and domain logic. Extend nearby
tests for each behavior change. Extension proxy/storage tests use Mocha; compilation
emits them to `out/test/`. Use browser smoke checks for meaningful interaction changes,
including narrow webviews, standalone mobile, theme changes and session restoration.

## State and Security

- `workspace.js` owns the versioned reducer and restore validation. Source and API title
  identify a workspace. Preserve existing drafts when activating an already open tab.
- Browser state uses localStorage; webviews also persist through extension workspaceState.
  Reuse `window.openapiHost`; never acquire the VS Code API a second time.
- History is capped at 100 metadata records. Do not persist response bodies or File objects.
- Authorization credentials persist only after explicit opt-in. Drafts and variables may
  contain secrets; do not log their content or include them in error messages/history.
- `api.js` owns request serialization, OpenAPI normalization and output extraction.
  Single requests and the runner must use the same request engine.
- Respect operation-level security overrides and AND/OR requirements. JSONPath evaluation
  must remain disabled for scripts. Sanitize imported Markdown using DOMPurify.
- Support existing `{{variable}}` and `{{@output}}` syntax and migration of old storage keys.
- Do not broaden automatic network access to external schema references.

## Styling

Use semantic custom properties from `react/styles.css`, not hard-coded component colors
or old Tailwind classes. Standalone has System, Light, Graphite and High contrast themes.
VS Code maps semantic colors to `--vscode-*` variables and owns the current theme. Keep
light, dark and both high-contrast webviews usable, including live theme changes.
Use lucide-react icons, accessible labels, keyboard interactions and responsive layouts.
Monaco must retain a textarea fallback when its CDN is unavailable.

## Host Contracts

Middleware serves embedded resources and replaces HTML meta attribute placeholders;
HTML-encode replacements. Check UI URLs both with and without trailing slashes.
The extension uses webview resource URIs, injects CSP and fetch/storage support before
the bundle, and proxies HTTP requests to avoid CORS. Preserve multipart boundaries,
binary bytes, cancellation and request IDs. Bound and validate incoming storage messages.

Release workflows publish NuGet on `v*-nuget`, VSIX on `v*-vsix`, and the demo via Pages.
Core dependencies must be installed before either host or demo is built.
