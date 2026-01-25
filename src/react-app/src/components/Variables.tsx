import { useState, useMemo } from 'react';
import { useVariablesStore } from '../store';

export function Variables() {
  const { variables, outputVariables, set, delete: deleteVar, clear, clearOutputs, replaceVariables } = useVariablesStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [editVarName, setEditVarName] = useState('');
  const [editVarValue, setEditVarValue] = useState('');
  const [previewText, setPreviewText] = useState('');

  const variablesArray = useMemo(() => Array.from(variables.entries()), [variables]);
  const outputVariablesArray = useMemo(() => Array.from(outputVariables.entries()), [outputVariables]);

  const handleAdd = () => {
    if (newVarName.trim() && newVarValue.trim()) {
      set(newVarName.trim(), newVarValue.trim());
      setNewVarName('');
      setNewVarValue('');
    }
  };

  const handleEdit = (key: string) => {
    setEditingKey(key);
    const value = variables.get(key);
    setEditVarName(key);
    setEditVarValue(value || '');
  };

  const handleSaveEdit = () => {
    if (editingKey && editVarName.trim() && editVarValue.trim()) {
      // If name changed, delete old and add new
      if (editVarName !== editingKey) {
        deleteVar(editingKey);
      }
      set(editVarName.trim(), editVarValue.trim());
      setEditingKey(null);
      setEditVarName('');
      setEditVarValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditVarName('');
    setEditVarValue('');
  };

  const handleDelete = (key: string) => {
    if (confirm(`Delete variable "${key}"?`)) {
      deleteVar(key);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all variables?')) {
      clear();
    }
  };

  const handleClearOutputs = () => {
    if (confirm('Clear all output variables?')) {
      clearOutputs();
    }
  };

  const previewResult = useMemo(() => {
    if (!previewText) return '';
    return replaceVariables(previewText);
  }, [previewText, replaceVariables]);

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">Variables</h3>
          {variablesArray.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Variable Usage:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use <code className="px-1 py-0.5 bg-blue-900/40 rounded">{'{{variableName}}'}</code> to reference regular variables</li>
                <li>Use <code className="px-1 py-0.5 bg-blue-900/40 rounded">{'{{@outputVar}}'}</code> to reference output variables from Collection Runner</li>
                <li>Variables work in URLs, headers, query parameters, and request bodies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add Variable Form */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Add New Variable</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              placeholder="Variable name"
              className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <input
              type="text"
              value={newVarValue}
              onChange={(e) => setNewVarValue(e.target.value)}
              placeholder="Variable value"
              className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!newVarName.trim() || !newVarValue.trim()}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* Variables Table */}
        {variablesArray.length > 0 ? (
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">Name</th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">Value</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variablesArray.map(([key, value]) => (
                  <tr key={key} className="border-b border-[var(--border)] last:border-0">
                    {editingKey === key ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editVarName}
                            onChange={(e) => setEditVarName(e.target.value)}
                            className="w-full px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            autoFocus
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editVarValue}
                            onChange={(e) => setEditVarValue(e.target.value)}
                            className="w-full px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded hover:bg-green-900/50"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 text-xs bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded hover:text-[var(--text-secondary)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2">
                          <code className="text-sm text-[var(--text-primary)] font-mono">{key}</code>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-sm text-[var(--text-secondary)]">{value}</span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(key)}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(key)}
                              className="p-1 text-[var(--text-muted)] hover:text-red-400"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-8 mb-6">
            <p className="text-center text-[var(--text-muted)]">No variables defined yet</p>
          </div>
        )}

        {/* Output Variables Section */}
        {outputVariablesArray.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Output Variables (from Collection Runner)</h4>
              <button
                onClick={handleClearOutputs}
                className="px-3 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]"
              >
                Clear Outputs
              </button>
            </div>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">Name</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {outputVariablesArray.map(([key, value]) => (
                    <tr key={key} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-2">
                        <code className="text-sm text-orange-400 font-mono">@{key}</code>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-sm text-[var(--text-secondary)]">{value}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4">
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Variable Replacement Preview</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Input (with variables)</label>
              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Enter text with variables like {{varName}} or {{@outputVar}}"
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono text-sm"
                rows={3}
              />
            </div>
            {previewText && (
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Output (after replacement)</label>
                <div className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] font-mono text-sm whitespace-pre-wrap break-all min-h-[3.5rem]">
                  {previewResult}
                </div>
                {previewResult !== previewText && (
                  <p className="text-xs text-green-400 mt-1">✓ Variables replaced successfully</p>
                )}
                {previewResult === previewText && (
                  <p className="text-xs text-orange-400 mt-1">No variables found in input text</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
