import { useState, useMemo, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { useApiStore, useAuthStore, useVariablesStore, useUIStore } from '../store';
import type { Parameter, RequestBody, Schema } from '../types/openapi';
import { resolveRef, generateExampleFromSchema, getStatusColorClass, formatDuration, formatBytes } from '../utils/helpers';

interface FormValues {
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  duration: number;
  size: number;
}

export function TryItOut() {
  const { spec, currentOperation, baseUrl } = useApiStore();
  const { getAuthHeaders } = useAuthStore();
  const { replaceVariables } = useVariablesStore();
  const { requestTab, setRequestTab, isExecuting, setIsExecuting } = useUIStore();

  const [formValues, setFormValues] = useState<FormValues>({
    pathParams: {},
    queryParams: {},
    headers: {},
    body: '{}',
  });

  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get parameters and request body
  const { pathParams, queryParams, headerParams, requestBody } = useMemo(() => {
    if (!spec || !currentOperation) {
      return { pathParams: [], queryParams: [], headerParams: [], requestBody: null };
    }

    const allParams: Parameter[] = [];
    const { path, operation } = currentOperation;

    // Path-level parameters
    const pathItem = spec.paths[path];
    if (pathItem?.parameters) {
      pathItem.parameters.forEach((p) => {
        const resolved = resolveRef<Parameter>(spec, p);
        if (resolved) allParams.push(resolved);
      });
    }

    // Operation-level parameters
    if (operation.parameters) {
      operation.parameters.forEach((p) => {
        const resolved = resolveRef<Parameter>(spec, p);
        if (resolved) allParams.push(resolved);
      });
    }

    const reqBody = operation.requestBody ? resolveRef<RequestBody>(spec, operation.requestBody) : null;

    return {
      pathParams: allParams.filter((p) => p.in === 'path'),
      queryParams: allParams.filter((p) => p.in === 'query'),
      headerParams: allParams.filter((p) => p.in === 'header'),
      requestBody: reqBody,
    };
  }, [spec, currentOperation]);

  // Initialize form values with examples
  useEffect(() => {
    if (!spec || !currentOperation) return;

    const newValues: FormValues = {
      pathParams: {},
      queryParams: {},
      headers: {},
      body: '{}',
    };

    // Path parameters
    pathParams.forEach((param) => {
      const example = param.example || generateExampleFromSchema(param.schema, spec);
      newValues.pathParams[param.name] = example ? String(example) : '';
    });

    // Query parameters
    queryParams.forEach((param) => {
      const example = param.example || generateExampleFromSchema(param.schema, spec);
      if (example !== undefined && example !== null) {
        newValues.queryParams[param.name] = String(example);
      }
    });

    // Request body
    if (requestBody?.content) {
      const contentType = Object.keys(requestBody.content)[0];
      const mediaType = requestBody.content[contentType];
      if (mediaType.schema) {
        const schema = resolveRef<Schema>(spec, mediaType.schema);
        const example = mediaType.example || (schema ? generateExampleFromSchema(schema, spec) : null);
        if (example) {
          newValues.body = typeof example === 'string' ? example : JSON.stringify(example, null, 2);
        }
      }
    }

    setFormValues(newValues);
  }, [spec, currentOperation, pathParams, queryParams, requestBody]);

  const handleExecute = async () => {
    if (!currentOperation || !spec) return;

    setIsExecuting(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      // Build URL
      let path = currentOperation.path;
      Object.entries(formValues.pathParams).forEach(([name, value]) => {
        path = path.replace(`{${name}}`, encodeURIComponent(replaceVariables(value)));
      });

      let url = path.startsWith('http') ? path : `${baseUrl}${path}`;

      // Add query params
      const queryString = Object.entries(formValues.queryParams)
        .filter(([, value]) => value !== '')
        .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(replaceVariables(value))}`)
        .join('&');
      
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }

      // Build headers
      const headers = getAuthHeaders();
      Object.entries(formValues.headers).forEach(([name, value]) => {
        if (value) headers.set(name, replaceVariables(value));
      });

      // Build fetch options
      const fetchOptions: RequestInit = {
        method: currentOperation.method.toUpperCase(),
        headers,
      };

      // Add body for POST/PUT/PATCH
      if (['post', 'put', 'patch'].includes(currentOperation.method) && formValues.body) {
        const bodyContent = replaceVariables(formValues.body);
        fetchOptions.body = bodyContent;
        
        // Set content-type if not already set
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
      }

      // Execute request
      const res = await fetch(url, fetchOptions);
      const duration = performance.now() - startTime;

      // Get response body
      const contentType = res.headers.get('Content-Type') || '';
      let responseBody: unknown;
      const bodyText = await res.text();
      const size = new Blob([bodyText]).size;

      if (contentType.includes('application/json')) {
        try {
          responseBody = JSON.parse(bodyText);
        } catch {
          responseBody = bodyText;
        }
      } else {
        responseBody = bodyText;
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseBody,
        duration,
        size,
      });

      setRequestTab('response');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsExecuting(false);
    }
  };

  if (!currentOperation) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Select an endpoint to try it out</p>
      </div>
    );
  }

  const hasBodySupport = ['post', 'put', 'patch'].includes(currentOperation.method);

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        <button
          onClick={() => setRequestTab('request')}
          className={`
            px-4 py-2 text-sm font-medium border-b-2 transition-colors
            ${requestTab === 'request'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
          `}
        >
          Request
        </button>
        <button
          onClick={() => setRequestTab('response')}
          className={`
            px-4 py-2 text-sm font-medium border-b-2 transition-colors
            ${requestTab === 'response'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
          `}
        >
          Response
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {requestTab === 'request' ? (
          <div className="space-y-4">
            {/* Path Parameters */}
            {pathParams.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Path Parameters</h4>
                <div className="space-y-2">
                  {pathParams.map((param) => (
                    <div key={param.name}>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">
                        {param.name}
                        {param.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formValues.pathParams[param.name] || ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            pathParams: { ...prev.pathParams, [param.name]: e.target.value },
                          }))
                        }
                        placeholder={param.description || param.name}
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] 
                                   rounded text-sm text-[var(--text-primary)]
                                   focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query Parameters */}
            {queryParams.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Query Parameters</h4>
                <div className="space-y-2">
                  {queryParams.map((param) => (
                    <div key={param.name}>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">
                        {param.name}
                        {param.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formValues.queryParams[param.name] || ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            queryParams: { ...prev.queryParams, [param.name]: e.target.value },
                          }))
                        }
                        placeholder={param.description || param.name}
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] 
                                   rounded text-sm text-[var(--text-primary)]
                                   focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Headers */}
            {headerParams.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Headers</h4>
                <div className="space-y-2">
                  {headerParams.map((param) => (
                    <div key={param.name}>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">
                        {param.name}
                        {param.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formValues.headers[param.name] || ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            headers: { ...prev.headers, [param.name]: e.target.value },
                          }))
                        }
                        placeholder={param.description || param.name}
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] 
                                   rounded text-sm text-[var(--text-primary)]
                                   focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body */}
            {hasBodySupport && requestBody && (
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  Request Body
                  {requestBody.required && <span className="text-red-400 ml-1">*</span>}
                </h4>
                {requestBody.description && (
                  <p className="text-xs text-[var(--text-secondary)] mb-2">{requestBody.description}</p>
                )}
                <div className="border border-[var(--border)] rounded overflow-hidden">
                  <Editor
                    height="300px"
                    language="json"
                    value={formValues.body}
                    onChange={(value) => setFormValues((prev) => ({ ...prev, body: value || '{}' }))}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Execute Button */}
            <div className="pt-4">
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className={`
                  w-full px-4 py-3 rounded font-medium text-white
                  ${isExecuting
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-[var(--accent)] hover:opacity-90'}
                `}
              >
                {isExecuting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Executing...
                  </span>
                ) : (
                  'Execute'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Response */}
            {error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            ) : response ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${getStatusColorClass(response.status)}`}>
                      {response.status}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">{response.statusText}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span>Time: {formatDuration(response.duration)}</span>
                    <span>Size: {formatBytes(response.size)}</span>
                  </div>
                </div>

                {/* Headers */}
                <details className="border border-[var(--border)] rounded">
                  <summary className="px-4 py-2 cursor-pointer bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-primary)]">
                    Response Headers ({Object.keys(response.headers).length})
                  </summary>
                  <div className="p-4 space-y-1">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-[var(--accent)] font-mono">{key}:</span>{' '}
                        <span className="text-[var(--text-secondary)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </details>

                {/* Body */}
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Response Body</h4>
                  <div className="border border-[var(--border)] rounded overflow-hidden">
                    <Editor
                      height="400px"
                      language="json"
                      value={typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                      }}
                      theme="vs-dark"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[var(--text-muted)] text-center">
                  Execute a request to see the response
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
