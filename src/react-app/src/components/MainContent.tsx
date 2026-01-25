import { useMemo, useState } from 'react';
import { useApiStore, useUIStore, useFavoritesStore } from '../store';
import type { Parameter, Response, HttpMethod } from '../types/openapi';
import { getMethodColor, resolveRef } from '../utils/helpers';
import { renderMarkdown } from '../utils/markdown';

export function MainContent() {
  const { spec } = useApiStore();
  const { leftSidebarOpen, setLeftSidebarOpen } = useUIStore();

  // Get all endpoints grouped by tags
  const groupedByTags = useMemo(() => {
    if (!spec?.paths) return [];

    const allEndpoints: { path: string; method: HttpMethod; operation: any; tag: string }[] = [];
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as HttpMethod[]).forEach((method) => {
        const op = (pathItem as any)[method];
        if (op) {
          allEndpoints.push({
            path,
            method,
            operation: op,
            tag: op.tags?.[0] || 'default',
          });
        }
      });
    });

    const tagMap = new Map<string, typeof allEndpoints>();
    allEndpoints.forEach((endpoint) => {
      if (!tagMap.has(endpoint.tag)) {
        tagMap.set(endpoint.tag, []);
      }
      tagMap.get(endpoint.tag)!.push(endpoint);
    });

    const result: Array<{ tag: string; description?: string; endpoints: typeof allEndpoints }> = [];
    tagMap.forEach((endpoints, tag) => {
      result.push({
        tag,
        description: spec.tags?.find(t => t.name === tag)?.description,
        endpoints,
      });
    });

    return result;
  }, [spec]);

  if (!spec) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  const { setCurrentEndpoint } = useApiStore.getState();
  const { isFavorite, toggleFavorite } = useFavoritesStore.getState();
  const { setRightSidebarOpen } = useUIStore.getState();

  // Tag section with collapsible endpoints
  const TagSection = ({ tag, description, endpoints: tagEndpoints }: { tag: string; description?: string; endpoints: typeof groupedByTags[0]['endpoints'] }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-full text-left py-2 group"
        >
          <svg 
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] capitalize">
            {tag}
          </h2>
          <span className="text-sm text-[var(--text-muted)]">
            {tagEndpoints.length} endpoint{tagEndpoints.length !== 1 ? 's' : ''}
          </span>
        </button>
        {description && (
          <p className="text-[var(--text-secondary)] text-sm ml-6 mb-2">{description}</p>
        )}
        <div 
          className={`space-y-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {tagEndpoints.map((endpoint) => (
            <EndpointCard 
              key={`${endpoint.method}-${endpoint.path}`}
              endpoint={endpoint}
              isFavorite={isFavorite(endpoint.path, endpoint.method)}
              onToggleFavorite={() => toggleFavorite(endpoint.path, endpoint.method, endpoint.operation.summary)}
              onTryItOut={() => {
                setCurrentEndpoint(endpoint.path, endpoint.method);
                setRightSidebarOpen(true);
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar - only when no sidebar */}
      {!leftSidebarOpen && (
        <div className="flex items-center p-4 border-b border-[var(--border)]">
          <button
            onClick={() => setLeftSidebarOpen(true)}
            className="p-2 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            title="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* API Info Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            {spec.info?.title || 'API Documentation'}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-sm">
              Version {spec.info?.version}
            </span>
          </div>
          {spec.info?.description && (
            <div 
              className="prose prose-invert max-w-none text-[var(--text-secondary)]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(spec.info.description) }}
            />
          )}
        </div>

        {/* Endpoints by Tag */}
        {groupedByTags.map(({ tag, description, endpoints }) => (
          <TagSection key={tag} tag={tag} description={description} endpoints={endpoints} />
        ))}
      </div>
    </div>
  );
}

// Endpoint card component with collapsible details
function EndpointCard({ 
  endpoint, 
  isFavorite, 
  onToggleFavorite, 
  onTryItOut 
}: { 
  endpoint: { path: string; method: HttpMethod; operation: any; tag: string };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onTryItOut: () => void;
}) {
  const { spec } = useApiStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasAuth = endpoint.operation.security !== undefined 
    ? endpoint.operation.security?.length > 0 
    : (spec?.security?.length ?? 0) > 0;

  // Get parameters
  const parameters = useMemo(() => {
    const params = endpoint.operation.parameters || [];
    return {
      path: params.filter((p: any) => p.in === 'path'),
      query: params.filter((p: any) => p.in === 'query'),
      header: params.filter((p: any) => p.in === 'header'),
    };
  }, [endpoint.operation]);

  const requestBody = endpoint.operation.requestBody 
    ? resolveRef(spec!, endpoint.operation.requestBody) 
    : null;

  const responses = useMemo(() => {
    if (!endpoint.operation.responses) return [];
    return Object.entries(endpoint.operation.responses).map(([code, response]): { code: string; response: Response | null } => ({
      code,
      response: resolveRef<Response>(spec!, response as any) || null,
    }));
  }, [endpoint.operation, spec]);

  return (
    <div
      className={`main-content-section p-3 bg-[var(--bg-secondary)] flex flex-col gap-3 border-l-4 rounded-r transition-all hover:bg-[var(--bg-tertiary)] method-border-${endpoint.method.toLowerCase()} ${endpoint.operation.deprecated ? 'opacity-60' : ''}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Favorite heart */}
        <button
          onClick={onToggleFavorite}
          className="flex-shrink-0 p-1 hover:scale-110 transition-transform"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg 
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-[var(--text-muted)]'}`}
            fill={isFavorite ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Expand arrow */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg 
                className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
              {/* Lock icon for auth */}
              {hasAuth && (
                <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              <code className="text-[var(--text-primary)] font-mono text-sm">
                {endpoint.path}
              </code>
            </button>
            
            {/* Right side: deprecated badge + method button */}
            <div className="ml-auto flex items-center gap-2">
              {endpoint.operation.deprecated && (
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-xs font-semibold rounded">
                  DEPRECATED
                </span>
              )}
              <button
                onClick={onTryItOut}
                className={`endpoint-badge ${getMethodColor(endpoint.method)} flex items-center gap-1 px-3 py-1 rounded font-bold text-sm border transition-colors hover:opacity-90`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l14 7-14 7V5z" />
                </svg>
                {endpoint.method.toUpperCase()}
              </button>
            </div>
          </div>
          {endpoint.operation.summary && (
            <p className="text-[var(--text-muted)] text-sm mt-2">
              {endpoint.operation.summary}
            </p>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-8 space-y-4 slide-in">
          {/* Description */}
          {endpoint.operation.description && (
            <div 
              className="prose prose-invert max-w-none text-[var(--text-secondary)] text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(endpoint.operation.description) }}
            />
          )}

          {/* Deprecated warning */}
          {endpoint.operation.deprecated && (
            <div className="inline-flex items-center px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Deprecated
            </div>
          )}

          {/* Parameters */}
          {(parameters.path.length > 0 || parameters.query.length > 0 || parameters.header.length > 0) && (
            <div>
              <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">Parameters</h3>
              {parameters.path.length > 0 && <ParameterTable title="Path Parameters" parameters={parameters.path} spec={spec!} />}
              {parameters.query.length > 0 && <ParameterTable title="Query Parameters" parameters={parameters.query} spec={spec!} />}
              {parameters.header.length > 0 && <ParameterTable title="Header Parameters" parameters={parameters.header} spec={spec!} />}
            </div>
          )}

          {/* Request Body */}
          {requestBody && (
            <div>
              <h3 className="text-md font-medium text-[var(--text-primary)] mb-2">Request Body</h3>
              {requestBody.description && (
                <p className="text-sm text-[var(--text-secondary)] mb-2">{requestBody.description}</p>
              )}
              {requestBody.required && (
                <span className="text-xs text-red-400 mb-2 block">Required</span>
              )}
            </div>
          )}

          {/* Responses */}
          {responses.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">Responses</h3>
              <div className="space-y-2">
                {responses.map(({ code, response }) => (
                  <div key={code} className="border border-[var(--border)] rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                        code.startsWith('2') ? 'bg-green-500/20 text-green-400' : 
                        code.startsWith('4') ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {code}
                      </span>
                      {response?.description && (
                        <span className="text-sm text-[var(--text-secondary)]">{response.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Parameter table component
function ParameterTable({ title, parameters, spec }: { title: string; parameters: Parameter[]; spec: any }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">{title}</h4>
      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-tertiary)]">
            <tr>
              <th className="text-left p-2 text-[var(--text-secondary)] font-medium">Name</th>
              <th className="text-left p-2 text-[var(--text-secondary)] font-medium">Type</th>
              <th className="text-left p-2 text-[var(--text-secondary)] font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((param, idx) => {
              const resolvedParam = resolveRef(spec, param as any);
              const schema = resolvedParam?.schema ? resolveRef(spec, resolvedParam.schema as any) : null;
              return (
                <tr key={idx} className="border-t border-[var(--border)]">
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <code className="text-[var(--text-primary)]">{resolvedParam?.name}</code>
                      {resolvedParam?.required && <span className="text-red-400 text-xs">*</span>}
                    </div>
                  </td>
                  <td className="p-2">
                    <code className="text-xs text-[var(--text-muted)]">{schema?.type || 'string'}</code>
                  </td>
                  <td className="p-2 text-[var(--text-secondary)]">{resolvedParam?.description || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
