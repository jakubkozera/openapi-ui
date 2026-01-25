import { useState, useMemo } from 'react';
import { useCollectionStore, useApiStore } from '../store';
import type { CollectionResult } from '../types/openapi';

export function CollectionRunner() {
  const { 
    collection, 
    results, 
    isRunning, 
    currentIndex,
    delay,
    currentCollectionName,
    addRequest, 
    removeRequest, 
    toggleRequest,
    reorderRequests,
    setDelay,
    clearCollection,
    runCollection,
    saveCollection,
    loadCollection,
    deleteCollection,
    getSavedCollections,
  } = useCollectionStore();

  const { currentOperation } = useApiStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'results'>('queue');

  const savedCollections = useMemo(() => getSavedCollections(), [getSavedCollections]);

  const handleAddCurrentEndpoint = () => {
    if (!currentOperation) return;

    addRequest({
      name: currentOperation.operation.summary || `${currentOperation.method.toUpperCase()} ${currentOperation.path}`,
      method: currentOperation.method,
      path: currentOperation.path,
      pathParams: {},
      queryParams: {},
      headers: {},
      body: '',
      outputParameters: [],
    });
  };

  const handleRun = async () => {
    await runCollection();
    setActiveTab('results');
  };

  const handleSave = () => {
    if (collectionName.trim()) {
      saveCollection(collectionName.trim());
      setShowSaveDialog(false);
      setCollectionName('');
    }
  };

  const handleLoad = (name: string) => {
    loadCollection(name);
    setShowLoadDialog(false);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Delete collection "${name}"?`)) {
      deleteCollection(name);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderRequests(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < collection.length - 1) {
      reorderRequests(index, index + 1);
    }
  };

  const enabledCount = collection.filter(r => r.enabled).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Collection Runner</h3>
            {currentCollectionName && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Collection: {currentCollectionName}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLoadDialog(true)}
              className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
            >
              Load
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={collection.length === 0}
              className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)] disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={clearCollection}
              disabled={collection.length === 0}
              className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)] disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Add Current Endpoint */}
        {currentOperation && (
          <button
            onClick={handleAddCurrentEndpoint}
            className="w-full px-3 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Current Endpoint to Collection
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'queue'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Queue ({collection.length})
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'results'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Results ({results.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'queue' ? (
          <QueueTab
            collection={collection}
            isRunning={isRunning}
            currentIndex={currentIndex}
            delay={delay}
            enabledCount={enabledCount}
            onToggle={toggleRequest}
            onRemove={removeRequest}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onSetDelay={setDelay}
            onRun={handleRun}
          />
        ) : (
          <ResultsTab results={results} isRunning={isRunning} />
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 w-96">
            <h4 className="text-lg font-medium text-[var(--text-primary)] mb-4">Save Collection</h4>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded text-[var(--text-primary)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!collectionName.trim()}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 w-96 max-h-[80vh] overflow-auto">
            <h4 className="text-lg font-medium text-[var(--text-primary)] mb-4">Load Collection</h4>
            {savedCollections.length === 0 ? (
              <p className="text-[var(--text-muted)] text-center py-8">No saved collections</p>
            ) : (
              <div className="space-y-2 mb-4">
                {savedCollections.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{col.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {col.requestCount} request{col.requestCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(col.name)}
                        className="px-3 py-1 text-xs bg-[var(--accent)] text-white rounded hover:opacity-90"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(col.name)}
                        className="px-3 py-1 text-xs bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-secondary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QueueTab({
  collection,
  isRunning,
  currentIndex,
  delay,
  enabledCount,
  onToggle,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSetDelay,
  onRun,
}: {
  collection: any[];
  isRunning: boolean;
  currentIndex: number;
  delay: number;
  enabledCount: number;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onSetDelay: (delay: number) => void;
  onRun: () => void;
}) {
  return (
    <div className="p-4">
      {collection.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-[var(--text-muted)]">No requests in collection</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Select an endpoint and click "Add Current Endpoint to Collection"
          </p>
        </div>
      ) : (
        <>
          {/* Execution Controls */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  Delay between requests (ms)
                </label>
                <input
                  type="number"
                  value={delay}
                  onChange={(e) => onSetDelay(parseInt(e.target.value) || 0)}
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  disabled={isRunning}
                />
              </div>
              <div className="pt-5">
                <button
                  onClick={onRun}
                  disabled={isRunning || enabledCount === 0}
                  className="px-6 py-2 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isRunning ? 'Running...' : `Run Collection (${enabledCount})`}
                </button>
              </div>
            </div>
            {isRunning && (
              <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <div className="animate-spin w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
                Executing request {currentIndex + 1} of {enabledCount}
              </div>
            )}
          </div>

          {/* Request List */}
          <div className="space-y-2">
            {collection.map((request, index) => (
              <div
                key={request.id}
                className={`bg-[var(--bg-tertiary)] border rounded-lg p-3 ${
                  request.enabled ? 'border-[var(--border)]' : 'border-[var(--border)] opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={request.enabled}
                    onChange={() => onToggle(request.id)}
                    disabled={isRunning}
                    className="mt-1 w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMethodClass(request.method)}`}>
                        {request.method.toUpperCase()}
                      </span>
                      <span className="text-sm text-[var(--text-primary)] font-mono truncate">
                        {request.path}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">{request.name}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onMoveUp(index)}
                      disabled={isRunning || index === 0}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onMoveDown(index)}
                      disabled={isRunning || index === collection.length - 1}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRemove(request.id)}
                      disabled={isRunning}
                      className="p-1 text-[var(--text-muted)] hover:text-red-400 disabled:opacity-30"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ResultsTab({ results, isRunning }: { results: CollectionResult[]; isRunning: boolean }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (results.length === 0 && !isRunning) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-[var(--text-muted)]">No results yet</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Run the collection to see results here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {results.map((result, index) => {
        const isExpanded = expandedIndex === index;
        const statusCode = typeof result.response.status === 'number' ? result.response.status : 0;
        const isSuccess = statusCode >= 200 && statusCode < 300;
        const isError = result.error || statusCode >= 400;

        return (
          <div
            key={index}
            className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full p-3 flex items-center gap-3 hover:bg-[var(--bg-secondary)] text-left"
            >
              <svg
                className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMethodClass(result.request.method)}`}>
                    {result.request.method.toUpperCase()}
                  </span>
                  <span className="text-sm text-[var(--text-primary)] font-mono truncate">
                    {result.request.path}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`font-medium ${isSuccess ? 'text-green-400' : isError ? 'text-red-400' : 'text-orange-400'}`}>
                    {result.response.status} {result.response.statusText}
                  </span>
                  <span className="text-[var(--text-muted)]">{Math.round(result.duration)}ms</span>
                  <span className="text-[var(--text-muted)]">{new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-[var(--border)] p-4 bg-[var(--bg-secondary)]">
                {result.error && (
                  <div className="mb-3 p-2 bg-red-900/20 border border-red-700/50 rounded text-sm text-red-400">
                    Error: {result.error}
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[var(--text-muted)]">Status:</span>{' '}
                    <span className={isSuccess ? 'text-green-400' : isError ? 'text-red-400' : 'text-orange-400'}>
                      {result.response.status} {result.response.statusText}
                    </span>
                  </div>
                  {result.response.body !== null && result.response.body !== undefined && (
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Response:</span>
                      <pre className="p-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded text-xs overflow-auto max-h-64">
                        {typeof result.response.body === 'object'
                          ? JSON.stringify(result.response.body, null, 2)
                          : String(result.response.body)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getMethodClass(method: string): string {
  const classes: Record<string, string> = {
    get: 'bg-blue-900/30 text-blue-400',
    post: 'bg-green-900/30 text-green-400',
    put: 'bg-orange-900/30 text-orange-400',
    delete: 'bg-red-900/30 text-red-400',
    patch: 'bg-purple-900/30 text-purple-400',
  };
  return classes[method.toLowerCase()] || 'bg-gray-900/30 text-gray-400';
}
