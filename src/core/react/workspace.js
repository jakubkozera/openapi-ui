export const WORKSPACE_VERSION = 1;
export const HISTORY_LIMIT = 100;

function validDraft(draft) {
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return false;
  if (
    ["path", "body", "contentType"].some(
      (key) => draft[key] !== undefined && typeof draft[key] !== "string",
    )
  )
    return false;
  return ["parameters", "headers", "form", "outputs"].every(
    (key) =>
      draft[key] === undefined ||
      (Array.isArray(draft[key]) &&
        draft[key].every(
          (row) =>
            row &&
            typeof row === "object" &&
            typeof row.name === "string" &&
            (row.value === undefined ||
              ["string", "number", "boolean"].includes(typeof row.value)),
        )),
  );
}

export function workspaceKey(source, spec) {
  const identity = source?.startsWith("data:")
    ? `${spec.info?.title || "API"}:${spec.info?.version || ""}`
    : source || "default";
  return `openapi-ui:workspace:${encodeURIComponent(identity)}:${encodeURIComponent(spec.info?.title || "API")}`;
}

export function emptyWorkspace() {
  return {
    version: WORKSPACE_VERSION,
    tabs: [],
    active: "overview",
    history: [],
    favorites: [],
    variables: [],
    collections: [],
  };
}

export function restoreWorkspace(storage, key, operations) {
  const fallback = emptyWorkspace();
  try {
    const saved = JSON.parse(storage.getItem(key));
    if (!saved || saved.version !== WORKSPACE_VERSION) return fallback;
    const ids = new Set(operations.map((operation) => operation.id));
    const tabs = Array.isArray(saved.tabs)
      ? saved.tabs.filter(
          (tab, index, all) =>
            tab &&
            ids.has(tab.id) &&
            validDraft(tab.draft) &&
            all.findIndex((item) => item?.id === tab.id) === index,
        )
      : [];
    return {
      ...fallback,
      tabs,
      active: tabs.some((tab) => tab.id === saved.active)
        ? saved.active
        : "overview",
      history: Array.isArray(saved.history)
        ? saved.history
            .filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.method === "string" &&
                typeof item.path === "string" &&
                typeof item.at === "string",
            )
            .slice(0, HISTORY_LIMIT)
        : [],
      favorites: Array.isArray(saved.favorites)
        ? saved.favorites.filter((id) => ids.has(id))
        : [],
      variables: Array.isArray(saved.variables)
        ? saved.variables.filter(
            (item) =>
              item &&
              typeof item.name === "string" &&
              ["string", "number", "boolean"].includes(typeof item.value),
          )
        : [],
      collections: Array.isArray(saved.collections)
        ? saved.collections
            .filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                Array.isArray(item.requests),
            )
            .map((collection) => ({
              ...collection,
              requests: collection.requests.filter(
                (request) =>
                  request &&
                  typeof request.id === "string" &&
                  ids.has(request.operationId) &&
                  validDraft(request.draft),
              ),
            }))
        : [],
      server: typeof saved.server === "string" ? saved.server : undefined,
    };
  } catch {
    return fallback;
  }
}

export function persistWorkspace(storage, key, state) {
  try {
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function workspaceReducer(state, action) {
  switch (action.type) {
    case "open":
      return {
        ...state,
        active: action.id,
        tabs: state.tabs.some((tab) => tab.id === action.id)
          ? state.tabs
          : [...state.tabs, { id: action.id, draft: action.draft }],
      };
    case "activate":
      return { ...state, active: action.id };
    case "close": {
      const index = state.tabs.findIndex((tab) => tab.id === action.id);
      const tabs = state.tabs.filter((tab) => tab.id !== action.id);
      return {
        ...state,
        tabs,
        active:
          state.active === action.id
            ? tabs[Math.max(0, index - 1)]?.id || "overview"
            : state.active,
      };
    }
    case "draft":
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.id
            ? { ...tab, draft: { ...tab.draft, ...action.patch } }
            : tab,
        ),
      };
    case "history":
      return {
        ...state,
        history: [action.entry, ...state.history].slice(0, HISTORY_LIMIT),
      };
    case "favorite":
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [...state.favorites, action.id],
      };
    case "update":
      return { ...state, ...action.patch };
    default:
      return state;
  }
}
