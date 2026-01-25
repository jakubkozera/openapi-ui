import { useState, useMemo } from 'react';
import { useApiStore, useAuthStore, useVariablesStore } from '../store';
import { generateCodeSnippets, buildRequestConfig } from '../utils/codeGenerator';
import { copyToClipboard } from '../utils/helpers';
import { Editor } from '@monaco-editor/react';

type Language = 'curl' | 'javascript' | 'python' | 'csharp' | 'java' | 'php' | 'ruby' | 'go';

const languageMap: Record<Language, string> = {
  curl: 'shell',
  javascript: 'javascript',
  python: 'python',
  csharp: 'csharp',
  java: 'java',
  php: 'php',
  ruby: 'ruby',
  go: 'go',
};

export function CodeSnippets() {
  const { currentOperation, spec, baseUrl } = useApiStore();
  const { getAuthHeaders } = useAuthStore();
  const { replaceVariables } = useVariablesStore();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('curl');
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate snippets
  const snippets = useMemo(() => {
    if (!currentOperation || !spec) return [];

    // Build request config with empty values (user can customize in Try It Out)
    const config = buildRequestConfig(
      currentOperation,
      spec,
      baseUrl,
      {
        pathParams: {},
        queryParams: {},
        headers: {},
        body: '',
      },
      getAuthHeaders()
    );

    // Apply variable replacement
    config.path = replaceVariables(config.path);
    Object.keys(config.pathParams).forEach(key => {
      config.pathParams[key] = replaceVariables(config.pathParams[key]);
    });
    Object.keys(config.queryParams).forEach(key => {
      config.queryParams[key] = replaceVariables(config.queryParams[key]);
    });
    Object.keys(config.headers).forEach(key => {
      config.headers[key] = replaceVariables(config.headers[key]);
    });
    if (config.body) {
      config.body = replaceVariables(config.body);
    }

    return generateCodeSnippets(currentOperation, config);
  }, [currentOperation, spec, baseUrl, getAuthHeaders, replaceVariables]);

  const currentSnippet = snippets.find(s => s.language === selectedLanguage);
  const monacoLanguage = languageMap[selectedLanguage] || 'plaintext';

  const handleCopy = async () => {
    if (currentSnippet) {
      const success = await copyToClipboard(currentSnippet.code);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  if (!currentOperation) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <p className="text-[var(--text-muted)]">No endpoint selected</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Select an endpoint to view code snippets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Code Snippets</h3>
        <p className="text-xs text-[var(--text-muted)]">
          {currentOperation.method.toUpperCase()} {currentOperation.path}
        </p>
      </div>

      {/* Language Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-[var(--border)] overflow-x-auto">
        {snippets.map((snippet) => (
          <button
            key={snippet.language}
            onClick={() => setSelectedLanguage(snippet.language as Language)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              selectedLanguage === snippet.language
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border)]'
            }`}
          >
            {snippet.displayName}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-hidden relative">
        {currentSnippet && (
          <>
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                copySuccess
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {copySuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>

            {/* Monaco Editor */}
            <div className="h-full">
              <Editor
                height="100%"
                language={monacoLanguage}
                value={currentSnippet.code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  lineNumbers: 'on',
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: 'none',
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    useShadows: false,
                  },
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-tertiary)]">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-[var(--text-muted)]">
            <p className="mb-1">These code snippets show basic examples using default values.</p>
            <p>Use the <span className="text-[var(--text-secondary)] font-medium">Try It Out</span> tab to customize parameters, headers, and request body before generating code.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
