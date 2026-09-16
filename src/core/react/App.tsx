import React, {
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  Braces,
  ChevronDown,
  ChevronRight,
  Code2,
  FolderOpen,
  History as HistoryIcon,
  House,
  KeyRound,
  Menu,
  PanelsTopLeft,
  Play,
  Search,
  Star,
  Upload,
  X,
} from "lucide-react";
import { RequestTabContextMenu } from "./RequestTabContextMenu";
import {
  buildRequest,
  extractOutputs,
  getOperations,
  makeDraft,
  METHODS,
  parseSpec,
  sendRequest,
  serverUrl,
} from "./api";
import {
  persistWorkspace,
  restoreWorkspace,
  workspaceKey,
  workspaceReducer,
} from "./workspace";
import {
  browserStorage,
  initialTheme,
  migrateLegacy,
  readJson,
} from "./platform";
import { Authorization } from "./Authorization";
import { RequestView } from "./RequestView";
import { Runner } from "./Runner";
import { CodeTools, History, ImportSpec, Overview, Variables } from "./Tools";
import { IconButton, Method } from "./ui";
import { completeAuthorization } from "./oauth";
import type {
  Credentials,
  Draft,
  Notify,
  OpenApiDocument,
  Operation,
  ResponseData,
  SavedRequest,
  StorageLike,
  Variables as VariableList,
} from "./types";

const tools = [
  { id: "requests", label: "Collections", icon: FolderOpen },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "variables", label: "Variables", icon: Braces },
  { id: "auth", label: "Authorization", icon: KeyRound },
  { id: "runner", label: "Runner", icon: Play },
  { id: "code", label: "Code", icon: Code2 },
];

interface AppProps {
  initialSpec?: OpenApiDocument;
  initialSource?: string;
  storage?: StorageLike;
}
interface LoadedSpec {
  spec: OpenApiDocument;
  source: string;
  revision?: number;
}

export function App({
  initialSpec,
  initialSource = "swagger.json",
  storage = browserStorage(),
}: AppProps) {
  const [loaded, setLoaded] = useState<LoadedSpec | null>(
    initialSpec ? { spec: initialSpec, source: initialSource } : null,
  );
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [theme, setTheme] = useState(() => initialTheme(storage));
  const [toast, setToast] = useState<{
    message: string;
    failure: boolean;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const importKey = `openapi-ui:last-import:${location.pathname}`;
  function notify(message: string, failure = false) {
    setToast({ message, failure });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    document.body.dataset.theme = theme;
    try {
      storage.setItem("openapi-ui:theme", theme);
    } catch {
      /* Theme remains usable without storage. */
    }
  }, [theme]);
  useEffect(() => {
    if (initialSpec) return;
    const abort = new AbortController();
    async function load() {
      try {
        const imported =
          !window.openapiHost && readJson(storage, importKey, null);
        if (imported?.text) {
          setLoaded({
            spec: parseSpec(imported.text),
            source: imported.source,
          });
          return;
        }
        const source = new URL(initialSource, location.href).href;
        const response = await fetch(source, { signal: abort.signal });
        if (!response.ok)
          throw new Error(`Cannot load specification: HTTP ${response.status}`);
        const spec = parseSpec(await response.text());
        if (!abort.signal.aborted) setLoaded({ spec, source });
      } catch (failure) {
        if (!(failure instanceof DOMException && failure.name === "AbortError"))
          setError(
            failure instanceof Error ? failure.message : String(failure),
          );
      }
    }
    load();
    return () => abort.abort();
  }, [initialSpec, initialSource]);
  return (
    <>
      {loaded ? (
        <Workspace
          key={`${workspaceKey(loaded.source, loaded.spec)}:${loaded.revision || 0}`}
          {...loaded}
          storage={storage}
          theme={theme}
          onTheme={setTheme}
          notify={notify}
          onImport={() => setImporting(true)}
        />
      ) : (
        <main className="startup">
          <PanelsTopLeft size={36} />
          <h1>OpenAPI UI</h1>
          {error ? (
            <>
              <p role="alert">{error}</p>
              <button className="primary" onClick={() => setImporting(true)}>
                <Upload size={16} />
                Import collection
              </button>
              <button
                onClick={() => {
                  storage.removeItem(importKey);
                  location.reload();
                }}
              >
                Retry configured source
              </button>
            </>
          ) : (
            <p role="status">Loading collection...</p>
          )}
        </main>
      )}
      {importing && (
        <ImportSpec
          onClose={() => setImporting(false)}
          notify={notify}
          onImport={(spec, source, text) => {
            try {
              storage.setItem(importKey, JSON.stringify({ source, text }));
            } catch {
              notify(
                "Collection loaded, but it could not be saved for the next session.",
                true,
              );
            }
            setLoaded((previous) => ({
              spec,
              source,
              revision: (previous?.revision || 0) + 1,
            }));
            setError("");
          }}
        />
      )}
      {toast && (
        <div
          className={`toast ${toast.failure ? "toast-error" : ""}`}
          role={toast.failure ? "alert" : "status"}
        >
          {toast.message}
          <IconButton
            label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </IconButton>
        </div>
      )}
    </>
  );
}

interface WorkspaceProps {
  spec: OpenApiDocument;
  source: string;
  storage: StorageLike;
  theme: string;
  onTheme: (theme: string) => void;
  notify: Notify;
  onImport: () => void;
}

export function Workspace({
  spec,
  source,
  storage,
  theme,
  onTheme,
  notify,
  onImport,
}: WorkspaceProps) {
  const operations = getOperations(spec) as Operation[];
  const key = workspaceKey(source, spec);
  const [state, dispatch] = useReducer(workspaceReducer, null, () => {
    const restored = restoreWorkspace(storage, key, operations);
    const migrated = !storage.getItem(key)
      ? migrateLegacy(storage, spec, operations, makeDraft)
      : {};
    return {
      ...restored,
      ...migrated,
      tabs: restored.tabs.map((tab: any) => ({
        ...tab,
        draft: {
          ...makeDraft(
            operations.find((operation) => operation.id === tab.id),
            spec,
          ),
          ...tab.draft,
        },
      })),
    };
  });
  const [view, setView] = useState("requests");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [method, setMethod] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [responses, setResponses] = useState<Record<string, ResponseData>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<
    Record<string, Record<string, File | undefined>>
  >({});
  const [savedRequest, setSavedRequest] = useState<SavedRequest | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const controllers = useRef(new Map<string, AbortController>());
  const stateRef = useRef(state);
  const sessionCredentials = useRef(`${key}:credentials`);
  const [remember, setRemember] = useState(
    () => !!readJson(storage, sessionCredentials.current, null),
  );
  const [credentials, setCredentials] = useState<Credentials>(() =>
    readJson(storage, sessionCredentials.current, {}),
  );
  const active = state.tabs.find((tab: any) => tab.id === state.active);
  const operation = operations.find((item) => item.id === state.active);
  const rawBase = document.querySelector<HTMLMetaElement>(
    'meta[name="openapi-base-url"]',
  )?.content;
  const defaultServer = serverUrl(
    operation?.servers ? { ...spec, servers: operation.servers } : spec,
    source,
    rawBase && !rawBase.startsWith("#")
      ? rawBase
      : /^https?:/.test(location.origin)
        ? location.origin
        : "http://localhost",
  );
  const server = state.server ?? defaultServer;
  const query = deferredSearch.toLowerCase().trim();
  const filtered = operations.filter(
    (item) =>
      (!method || item.method === method) &&
      (!onlyFavorites || state.favorites.includes(item.id)) &&
      `${item.method} ${item.path} ${item.summary || ""} ${item.operationId || ""} ${(item.tags || []).join(" ")}`
        .toLowerCase()
        .includes(query),
  );
  const groups = [
    ...new Set(filtered.map((item) => item.tags?.[0] || "Requests")),
  ];
  stateRef.current = state;

  const closeTabs = (ids: string[], action: { type: string; id: string }) => {
    if (!ids.length) return;
    ids.forEach((id) => controllers.current.get(id)?.abort());
    dispatch(action);
    setResponses((previous) => {
      const next = { ...previous };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    setPending((previous) => {
      const next = { ...previous };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    setFiles((previous) => {
      const next = { ...previous };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  };

  useEffect(() => {
    setStorageFailed(!persistWorkspace(storage, key, state));
  }, [state]);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "workspaceSaveError") setStorageFailed(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  useEffect(() => {
    try {
      if (remember)
        storage.setItem(
          sessionCredentials.current,
          JSON.stringify(credentials),
        );
      else storage.removeItem(sessionCredentials.current);
    } catch {
      notify("Credentials could not be saved.", true);
    }
  }, [credentials, remember]);
  useEffect(() => {
    let mounted = true;
    completeAuthorization(location.href)
      .then((result) => {
        if (!result || !mounted) return;
        if (result.workspace !== key) {
          notify("OAuth callback belongs to another collection.", true);
          return;
        }
        setCredentials((previous) => ({
          ...previous,
          [result.scheme]: result.credential,
        }));
        history.replaceState(null, "", location.pathname);
        notify("Authorization completed");
      })
      .catch((error) => notify(error.message, true));
    return () => {
      mounted = false;
      controllers.current.forEach((controller) => controller.abort());
    };
  }, []);
  useEffect(() => {
    const navigate = () => {
      let hash;
      try {
        hash = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }
      const match = operations.find(
        (item) =>
          `${item.method}-${item.path}` === hash ||
          `${item.method}-${item.path.replace(/[{}]/g, "")}` === hash,
      );
      if (match) openOperation(match);
    };
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  function openOperation(
    item?: Operation,
    draft?: Draft,
    saved?: SavedRequest,
  ) {
    if (!item) {
      notify("This operation is no longer present in the specification.", true);
      return;
    }
    dispatch({
      type: "open",
      id: item.id,
      draft: draft || makeDraft(item, spec),
    });
    if (draft) dispatch({ type: "draft", id: item.id, patch: draft });
    setSavedRequest(saved ? { ...saved, operationId: item.id } : null);
    setView("requests");
    setSidebarOpen(false);
  }

  function addTabToRunner(tabId: string) {
    const tab = state.tabs.find((item: any) => item.id === tabId);
    const tabOperation = operations.find((item) => item.id === tabId);
    if (!tab || !tabOperation) return;
    const collection = state.collections[0] || {
      id: crypto.randomUUID(),
      name: spec.info?.title || "Collection",
      requests: [],
      delay: 0,
    };
    const request = {
      id: crypto.randomUUID(),
      operationId: tabOperation.id,
      draft: structuredClone(tab.draft),
      enabled: true,
    };
    const updated = {
      ...collection,
      requests: [...collection.requests, request],
    };
    dispatch({
      type: "update",
      patch: {
        collections: state.collections.length
          ? state.collections.map((item: any) =>
              item.id === collection.id ? updated : item,
            )
          : [updated],
      },
    });
    notify(`Added to ${collection.name}`);
  }

  function addToRunner() {
    if (operation && active) addTabToRunner(operation.id);
  }

  async function execute(
    item: Operation,
    draft: Draft,
    variables: VariableList,
    signal: AbortSignal,
    requestFiles: Record<string, File | undefined> = {},
  ) {
    let response: ResponseData;
    const started = performance.now();
    try {
      const request = buildRequest(
        item,
        draft,
        server,
        variables,
        credentials,
        spec,
        requestFiles,
      );
      response = await sendRequest(request, signal);
      response.request = `${item.method.toUpperCase()} ${request.url}\n${[...request.options.headers].map(([name, value]) => `${name}: ${/authorization|cookie|key|token|secret/i.test(name) ? "[redacted]" : value}`).join("\n")}`;
    } catch (error) {
      if (
        (error instanceof DOMException && error.name === "AbortError") ||
        signal.aborted
      )
        throw new DOMException("Request cancelled", "AbortError");
      response = {
        ok: false,
        status: 0,
        statusText: "Request failed",
        body: error instanceof Error ? error.message : String(error),
        headers: {},
        duration: Math.round(performance.now() - started),
        size: 0,
      };
    }
    if (signal?.aborted)
      throw new DOMException("Request cancelled", "AbortError");
    setResponses((previous) => ({ ...previous, [item.id]: response }));
    dispatch({
      type: "history",
      entry: {
        id: crypto.randomUUID(),
        operationId: item.id,
        method: item.method,
        path: item.path,
        status: response.status,
        duration: response.duration,
        at: new Date().toISOString(),
      },
    });
    let nextVariables = variables;
    if (response.ok) {
      try {
        nextVariables = extractOutputs(draft.outputs, response.body, variables);
        if (nextVariables !== variables)
          dispatch({ type: "update", patch: { variables: nextVariables } });
      } catch (error) {
        notify(
          `Output variable extraction failed: ${error instanceof Error ? error.message : String(error)}`,
          true,
        );
      }
    }
    return { response, variables: nextVariables };
  }

  async function send(requestFiles: Record<string, File | undefined>) {
    if (!operation || !active) return;
    const id = operation.id;
    if (controllers.current.has(id)) return;
    const controller = new AbortController();
    controllers.current.set(id, controller);
    setPending((previous) => ({ ...previous, [id]: true }));
    try {
      await execute(
        operation,
        active.draft,
        stateRef.current.variables,
        controller.signal,
        requestFiles,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        notify("Request cancelled");
      else notify(error instanceof Error ? error.message : String(error), true);
    } finally {
      controllers.current.delete(id);
      setPending((previous) => ({ ...previous, [id]: false }));
    }
  }

  function activate(id: string) {
    dispatch({ type: "activate", id });
    setView("requests");
    setSidebarOpen(false);
  }
  const host =
    !!window.openapiHost || document.body.className.includes("vscode-");
  return (
    <div className="app-shell">
      <header className="app-header">
        <IconButton
          label="Toggle collections"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={19} />
        </IconButton>
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            activate("overview");
          }}
        >
          <PanelsTopLeft size={22} />
          <span>OpenAPI UI</span>
        </a>
        <span className="header-divider" />
        <span className="header-title">{spec.info?.title || "Collection"}</span>
        <button className="text-button import-button" onClick={onImport}>
          <Upload size={15} />
          Import
        </button>
        {!host && (
          <label className="theme-picker">
            <span>Theme</span>
            <select
              aria-label="Theme"
              value={theme}
              onChange={(event) => onTheme(event.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark-plus">Dark+</option>
              <option value="dark-modern">Dark Modern</option>
              <option value="graphite">Graphite</option>
              <option value="github-light">GitHub Light</option>
              <option value="github-dark">GitHub Dark</option>
              <option value="visual-studio-light">Visual Studio Light</option>
              <option value="visual-studio-dark">Visual Studio Dark</option>
              <option value="contrast">High contrast</option>
            </select>
          </label>
        )}
      </header>
      <nav className="activity-bar" aria-label="Workspace tools">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            title={label}
            aria-label={label}
            aria-current={view === id ? "page" : undefined}
            onClick={() => {
              setView(id);
              setSidebarOpen(false);
            }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close collections"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`collection-sidebar ${sidebarOpen ? "is-open" : ""}`}
        aria-label="Collection navigation"
      >
        <div className="sidebar-heading">
          <strong>Collections</strong>
          <IconButton label="Import collection" onClick={onImport}>
            <Upload size={16} />
          </IconButton>
        </div>
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search requests"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests"
          />
        </label>
        <div className="sidebar-filters">
          <select
            aria-label="Filter by HTTP method"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            <option value="">All methods</option>
            {METHODS.map((value) => (
              <option value={value} key={value}>
                {value.toUpperCase()}
              </option>
            ))}
          </select>
          <IconButton
            label="Show favorites"
            aria-pressed={onlyFavorites}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
          >
            <Star size={16} fill={onlyFavorites ? "currentColor" : "none"} />
          </IconButton>
        </div>
        <button
          className={`collection-root ${state.active === "overview" && view === "requests" ? "selected" : ""}`}
          onClick={() => activate("overview")}
        >
          <ChevronDown size={14} />
          <FolderOpen size={17} />
          <span>{spec.info?.title || "Collection"}</span>
          <span className="count">{operations.length}</span>
        </button>
        <div className="request-tree">
          {groups.map((group) => (
            <details key={`${group}:${query}:${method}:${onlyFavorites}`} open>
              <summary>
                <ChevronRight className="expand-chevron" size={14} />
                {group}
                <span>
                  {
                    filtered.filter(
                      (item) => (item.tags?.[0] || "Requests") === group,
                    ).length
                  }
                </span>
              </summary>
              {filtered
                .filter((item) => (item.tags?.[0] || "Requests") === group)
                .map((item) => (
                  <button
                    className={`tree-request ${state.active === item.id ? "selected" : ""}`}
                    key={item.id}
                    title={`${item.method.toUpperCase()} ${item.path}`}
                    onClick={() => openOperation(item)}
                  >
                    <Method method={item.method} />
                    <span>{item.summary || item.path}</span>
                    {state.favorites.includes(item.id) && <Star size={12} />}
                  </button>
                ))}
            </details>
          ))}
          {filtered.length === 0 && (
            <p className="empty">No matching requests.</p>
          )}
        </div>
        <footer className="sidebar-footer">
          <span className="status-dot" />
          {operations.length} requests
          <span>v{spec.info?.version || "1.0"}</span>
        </footer>
      </aside>
      <main className="workspace-main">
        <div
          className="request-tabs"
          role="tablist"
          aria-label="Open requests"
          onKeyDown={(event) => {
            const current = event.target as HTMLElement;
            if (
              !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) ||
              current.getAttribute("role") !== "tab"
            )
              return;
            const tabs = [
              ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="tab"]',
              ),
            ];
            const index = tabs.indexOf(current as HTMLButtonElement);
            const target =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? tabs.length - 1
                  : (index +
                      (event.key === "ArrowRight" ? 1 : -1) +
                      tabs.length) %
                    tabs.length;
            event.preventDefault();
            tabs[target].focus();
            tabs[target].click();
          }}
        >
          <button
            role="tab"
            aria-selected={state.active === "overview" && view === "requests"}
            onClick={() => activate("overview")}
          >
            <House size={15} />
            Overview
          </button>
          {state.tabs.map((tab: any) => {
            const item = operations.find(
              (candidate) => candidate.id === tab.id,
            );
            if (!item) return null;
            return (
              <div
                className={`request-tab ${state.active === tab.id && view === "requests" ? "active" : ""}`}
                key={tab.id}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setContextMenu({
                    id: tab.id,
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
              >
                <button
                  role="tab"
                  aria-selected={state.active === tab.id && view === "requests"}
                  onClick={() => activate(tab.id)}
                  title={`${item.method.toUpperCase()} ${item.path}`}
                >
                  <Method method={item.method} />
                  <span>{item.summary || item.path}</span>
                  {pending[item.id] && <span className="pending-dot" />}
                </button>
                <IconButton
                  label={`Close ${item.summary || item.path}`}
                  onClick={() =>
                    closeTabs([tab.id], { type: "close", id: tab.id })
                  }
                >
                  <X size={14} />
                </IconButton>
              </div>
            );
          })}
        </div>
        {contextMenu && (
          <RequestTabContextMenu
            tabs={state.tabs}
            tabId={contextMenu.id}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            isFavorite={state.favorites.includes(contextMenu.id)}
            onFavorite={() => {
              dispatch({ type: "favorite", id: contextMenu.id });
              setContextMenu(null);
            }}
            onAddToRunner={() => {
              addTabToRunner(contextMenu.id);
              setContextMenu(null);
            }}
            onAction={(action, ids) => {
              closeTabs(ids, { type: action, id: contextMenu.id });
              setContextMenu(null);
            }}
          />
        )}
        <div className="server-bar">
          <label>
            <span className="status-dot" />
            Server
            <input
              aria-label="Server URL"
              list="server-options"
              value={server}
              onChange={(event) =>
                dispatch({
                  type: "update",
                  patch: { server: event.target.value },
                })
              }
            />
          </label>
          <datalist id="server-options">
            {(operation?.servers || spec.servers || []).map(
              (item: any, index: number) => (
                <option
                  key={`${item.url}:${index}`}
                  value={serverUrl({ servers: [item] }, source, defaultServer)}
                >
                  {item.description}
                </option>
              ),
            )}
          </datalist>
        </div>
        {storageFailed && (
          <p role="alert" className="error-banner">
            Session could not be saved. Browser storage is unavailable or full.
          </p>
        )}
        {savedRequest &&
          operation &&
          savedRequest.operationId === operation.id &&
          view === "requests" && (
            <div className="saved-request-bar">
              <span>Editing a saved collection request</span>
              <button
                onClick={() => {
                  dispatch({
                    type: "update",
                    patch: {
                      collections: state.collections.map((collection: any) =>
                        collection.id === savedRequest.collectionId
                          ? {
                              ...collection,
                              requests: collection.requests.map(
                                (request: any) =>
                                  request.id === savedRequest.requestId
                                    ? {
                                        ...request,
                                        draft: structuredClone(active.draft),
                                      }
                                    : request,
                              ),
                            }
                          : collection,
                      ),
                    },
                  });
                  notify("Collection request updated");
                }}
              >
                Save to collection
              </button>
            </div>
          )}
        <div className="workspace-content">
          {view === "requests" &&
            (active && operation ? (
              <RequestView
                key={operation.id}
                operation={operation}
                spec={spec}
                draft={active.draft}
                onChange={(patch) =>
                  dispatch({ type: "draft", id: operation.id, patch })
                }
                onSend={send}
                onCancel={() => controllers.current.get(operation.id)?.abort()}
                response={responses[operation.id]}
                pending={pending[operation.id]}
                favorite={state.favorites.includes(operation.id)}
                onFavorite={() =>
                  dispatch({ type: "favorite", id: operation.id })
                }
                onAddToCollection={addToRunner}
                notify={notify}
                files={files[operation.id] || {}}
                onFile={(name, file) =>
                  setFiles((previous) => ({
                    ...previous,
                    [operation.id]: { ...previous[operation.id], [name]: file },
                  }))
                }
                onAuth={() => setView("auth")}
              />
            ) : (
              <Overview
                spec={spec}
                operations={operations}
                onOpen={openOperation}
                onRunner={() => {
                  if (!state.collections.length)
                    dispatch({
                      type: "update",
                      patch: {
                        collections: [
                          {
                            id: crypto.randomUUID(),
                            name: spec.info?.title || "Collection",
                            requests: operations.map((item) => ({
                              id: crypto.randomUUID(),
                              operationId: item.id,
                              draft: makeDraft(item, spec),
                              enabled: true,
                            })),
                            delay: 0,
                          },
                        ],
                      },
                    });
                  setView("runner");
                }}
              />
            ))}
          {view === "variables" && (
            <Variables
              variables={state.variables}
              onChange={(variables) =>
                dispatch({ type: "update", patch: { variables } })
              }
            />
          )}
          {view === "history" && (
            <History
              history={state.history}
              onOpen={(id) =>
                openOperation(operations.find((item) => item.id === id))
              }
              onClear={() =>
                dispatch({ type: "update", patch: { history: [] } })
              }
            />
          )}
          {view === "auth" && (
            <Authorization
              spec={spec}
              credentials={credentials}
              onChange={setCredentials}
              workspace={key}
              remember={remember}
              onRemember={setRemember}
              notify={notify}
              operation={operation}
              enabled={active?.draft.authEnabled}
              onEnabled={(authEnabled) =>
                operation &&
                dispatch({
                  type: "draft",
                  id: operation.id,
                  patch: { authEnabled },
                })
              }
            />
          )}
          {view === "runner" && (
            <Runner
              collections={state.collections}
              onChange={(collections) =>
                dispatch({ type: "update", patch: { collections } })
              }
              operations={operations}
              onOpen={openOperation}
              execute={execute}
              variables={state.variables}
              notify={notify}
            />
          )}
          {view === "code" && (
            <CodeTools
              spec={spec}
              operation={operation}
              draft={active?.draft}
              server={server}
              variables={state.variables}
              credentials={credentials}
              notify={notify}
            />
          )}
        </div>
        <footer className="workspace-status">
          <span>
            {view === "requests"
              ? active && operation
                ? `${operation.method.toUpperCase()} ${operation.path}`
                : "Collection overview"
              : tools.find((tool) => tool.id === view)?.label}
          </span>
          <span>{state.tabs.length} open tabs</span>
          <span>{storageFailed ? "Not saved" : "Session saved"}</span>
        </footer>
      </main>
    </div>
  );
}
