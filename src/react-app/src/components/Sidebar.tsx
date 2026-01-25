import { useMemo } from 'react';
import { useApiStore, useUIStore, useFavoritesStore } from '../store';
import type { EndpointInfo, HttpMethod, Operation, PathItem } from '../types/openapi';
import { getMethodColor, toTitleCase } from '../utils/helpers';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

interface TagGroup {
  tag: string;
  description?: string;
  endpoints: EndpointInfo[];
}

export function Sidebar() {
  const { spec, searchTerm, setSearchTerm, selectedHttpVerbs, setSelectedHttpVerbs, setCurrentEndpoint, currentPath, currentMethod } = useApiStore();
  const { toggleTheme, theme } = useUIStore();
  const { favorites, isFavorite, toggleFavorite } = useFavoritesStore();

  // Build tag groups from spec
  const tagGroups = useMemo<TagGroup[]>(() => {
    if (!spec?.paths) return [];

    const groups: Map<string, EndpointInfo[]> = new Map();
    const tagDescriptions: Map<string, string> = new Map();

    // Get tag descriptions
    spec.tags?.forEach((tag) => {
      tagDescriptions.set(tag.name, tag.description || '');
    });

    // Group endpoints by tag
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      HTTP_METHODS.forEach((method) => {
        const operation = (pathItem as PathItem)[method] as Operation | undefined;
        if (!operation) return;

        const tags = operation.tags || ['default'];
        tags.forEach((tag) => {
          if (!groups.has(tag)) {
            groups.set(tag, []);
          }
          groups.get(tag)!.push({
            path,
            method,
            operation,
            tag,
          });
        });
      });
    });

    return Array.from(groups.entries()).map(([tag, endpoints]) => ({
      tag,
      description: tagDescriptions.get(tag),
      endpoints,
    }));
  }, [spec]);

  // Filter endpoints
  const filteredGroups = useMemo(() => {
    return tagGroups
      .map((group) => ({
        ...group,
        endpoints: group.endpoints.filter((endpoint) => {
          // Filter by HTTP verb
          if (selectedHttpVerbs.length > 0 && !selectedHttpVerbs.includes(endpoint.method)) {
            return false;
          }

          // Filter by search term
          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchesPath = endpoint.path.toLowerCase().includes(search);
            const matchesSummary = endpoint.operation.summary?.toLowerCase().includes(search);
            const matchesOpId = endpoint.operation.operationId?.toLowerCase().includes(search);
            return matchesPath || matchesSummary || matchesOpId;
          }

          return true;
        }),
      }))
      .filter((group) => group.endpoints.length > 0);
  }, [tagGroups, searchTerm, selectedHttpVerbs]);

  // Favorites section
  const favoriteEndpoints = useMemo(() => {
    if (!spec?.paths) return [];
    return favorites
      .map((fav) => {
        const pathItem = spec.paths[fav.path];
        if (!pathItem) return null;
        const operation = pathItem[fav.method.toLowerCase() as HttpMethod];
        if (!operation) return null;
        return {
          path: fav.path,
          method: fav.method.toLowerCase() as HttpMethod,
          operation,
          tag: operation.tags?.[0] || 'default',
        };
      })
      .filter(Boolean) as EndpointInfo[];
  }, [favorites, spec]);

  const toggleHttpVerb = (verb: string) => {
    if (selectedHttpVerbs.includes(verb)) {
      setSelectedHttpVerbs(selectedHttpVerbs.filter((v) => v !== verb));
    } else {
      setSelectedHttpVerbs([...selectedHttpVerbs, verb]);
    }
  };

  return (
    <div className="h-full flex flex-col min-w-80">
      {/* Header with Logo */}
      <div className="p-6 flex justify-center items-center border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[var(--text-primary)]">OpenAPI UI</span>
          <a 
            href="https://github.com/jakubkozera/openapi-ui" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="View on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 0.297C5.373 0.297 0 5.67 0 12.297c0 5.28 3.438 9.747 8.207 11.325.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.415-4.033-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.304-5.467-1.334-5.467-5.933 0-1.31.468-2.381 1.236-3.22-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.48 11.48 0 0 1 3.003-.403c1.019.005 2.047.138 3.003.403 2.29-1.552 3.296-1.23 3.296-1.23.655 1.652.243 2.873.12 3.176.77.839 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 5.921.43.371.823 1.102.823 2.222v3.293c0 .32.192.694.801.576C20.565 22.04 24 17.576 24 12.297c0-6.627-5.373-12-12-12Z" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="px-4 py-4 border-b border-[var(--border)]">

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 bg-[var(--bg-tertiary)] border border-[var(--border)] 
                       rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]
                       focus:outline-none focus:border-[var(--accent)]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* HTTP Verb Filter */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex flex-wrap gap-1">
          {['get', 'post', 'put', 'delete', 'patch'].map((verb) => (
            <button
              key={verb}
              onClick={() => toggleHttpVerb(verb)}
              className={`
                px-2 py-0.5 text-xs font-medium rounded uppercase
                ${selectedHttpVerbs.includes(verb)
                  ? `${getMethodColor(verb)} text-white`
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}
              `}
            >
              {verb}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints List */}
      <div className="flex-1 overflow-auto">
        {/* Favorites */}
        {favoriteEndpoints.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider flex items-center">
              <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Favorites
            </div>
            <div className="space-y-0.5">
              {favoriteEndpoints.map((endpoint) => (
                <EndpointItem
                  key={`fav-${endpoint.method}-${endpoint.path}`}
                  endpoint={endpoint}
                  isActive={currentPath === endpoint.path && currentMethod === endpoint.method}
                  isFavorite={true}
                  onSelect={() => setCurrentEndpoint(endpoint.path, endpoint.method)}
                  onToggleFavorite={() => toggleFavorite(endpoint.path, endpoint.method, endpoint.operation.summary)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tag Groups */}
        {filteredGroups.map((group) => (
          <TagGroupComponent
            key={group.tag}
            group={group}
            currentPath={currentPath}
            currentMethod={currentMethod}
            onSelectEndpoint={setCurrentEndpoint}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        ))}
      </div>

      {/* Theme Toggle Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full p-2 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm">Light Mode</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-sm">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface TagGroupComponentProps {
  group: TagGroup;
  currentPath: string | null;
  currentMethod: HttpMethod | null;
  onSelectEndpoint: (path: string, method: HttpMethod) => void;
  onToggleFavorite: (path: string, method: string, summary?: string) => boolean;
  isFavorite: (path: string, method: string) => boolean;
}

function TagGroupComponent({
  group,
  currentPath,
  currentMethod,
  onSelectEndpoint,
  onToggleFavorite,
  isFavorite,
}: TagGroupComponentProps) {
  return (
    <details className="group" open>
      <summary className="px-4 py-2 cursor-pointer list-none flex items-center justify-between hover:bg-[var(--bg-tertiary)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {toTitleCase(group.tag)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">{group.endpoints.length}</span>
          <svg
            className="w-4 h-4 text-[var(--text-muted)] transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </summary>
      <div className="space-y-0.5">
        {group.endpoints.map((endpoint) => (
          <EndpointItem
            key={`${endpoint.method}-${endpoint.path}`}
            endpoint={endpoint}
            isActive={currentPath === endpoint.path && currentMethod === endpoint.method}
            isFavorite={isFavorite(endpoint.path, endpoint.method)}
            onSelect={() => onSelectEndpoint(endpoint.path, endpoint.method)}
            onToggleFavorite={() => onToggleFavorite(endpoint.path, endpoint.method, endpoint.operation.summary)}
          />
        ))}
      </div>
    </details>
  );
}

interface EndpointItemProps {
  endpoint: EndpointInfo;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

function EndpointItem({ endpoint, isActive, isFavorite, onSelect, onToggleFavorite }: EndpointItemProps) {
  const methodClass = `method-${endpoint.method}`;
  
  return (
    <div
      className={`
        group px-3 py-2 cursor-pointer flex items-start gap-2
        ${isActive ? 'bg-[var(--bg-accent)]' : 'hover:bg-[var(--bg-tertiary)]'}
      `}
      onClick={onSelect}
    >
      <span className={`${methodClass} font-semibold text-xs uppercase min-w-[45px] text-right flex-shrink-0 mt-0.5`}>
        {endpoint.method}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--text-primary)] leading-tight">
          {endpoint.operation.summary || endpoint.path}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`
          p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0
          ${isFavorite ? 'opacity-100 text-yellow-500' : 'text-[var(--text-muted)]'}
        `}
      >
        <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>
    </div>
  );
}
