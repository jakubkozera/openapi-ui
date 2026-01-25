import { useState, useMemo } from 'react';
import { useAuthStore } from '../store';
import { parseJwt, isTokenExpired } from '../utils/helpers';
import type { SecurityScheme } from '../types/openapi';

export function Auth() {
  const { securitySchemes, credentials, setCredentials, clearCredentials, isSchemeAuthenticated } = useAuthStore();
  const [selectedScheme, setSelectedScheme] = useState<string>('');

  // Get the first available scheme as default
  const schemeKeys = useMemo(() => Object.keys(securitySchemes), [securitySchemes]);

  // Set default selected scheme
  useMemo(() => {
    if (schemeKeys.length > 0 && !selectedScheme) {
      setSelectedScheme(schemeKeys[0]);
    }
  }, [schemeKeys, selectedScheme]);

  const currentScheme = selectedScheme ? securitySchemes[selectedScheme] : null;
  const currentCredentials = selectedScheme ? credentials[selectedScheme] : null;
  const isAuthenticated = selectedScheme ? isSchemeAuthenticated(selectedScheme) : false;

  if (schemeKeys.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-[var(--text-muted)] text-center">
            No authentication schemes defined in this API specification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-2xl">
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
          Authentication
        </h3>

        {/* Scheme Selector */}
        {schemeKeys.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Security Scheme
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {schemeKeys.map((key) => (
                <option key={key} value={key}>
                  {key} ({securitySchemes[key].type})
                </option>
              ))}
            </select>
          </div>
        )}

        {currentScheme && (
          <div className="space-y-4">
            {/* Scheme Info */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">
                    {selectedScheme}
                  </h4>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Type: {currentScheme.type}
                    {currentScheme.scheme && ` (${currentScheme.scheme})`}
                  </p>
                </div>
                {isAuthenticated && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                    Authenticated
                  </span>
                )}
              </div>
              {currentScheme.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  {currentScheme.description}
                </p>
              )}
            </div>

            {/* HTTP Bearer */}
            {currentScheme.type === 'http' && currentScheme.scheme?.toLowerCase() === 'bearer' && (
              <BearerAuthForm
                currentToken={currentCredentials?.token}
                bearerFormat={currentScheme.bearerFormat}
                onSave={(token) => setCredentials(selectedScheme, { type: 'bearer', token })}
                onClear={() => clearCredentials(selectedScheme)}
              />
            )}

            {/* HTTP Basic */}
            {currentScheme.type === 'http' && currentScheme.scheme?.toLowerCase() === 'basic' && (
              <BasicAuthForm
                currentUsername={currentCredentials?.username}
                currentPassword={currentCredentials?.password}
                onSave={(username, password) => setCredentials(selectedScheme, { type: 'basic', username, password })}
                onClear={() => clearCredentials(selectedScheme)}
              />
            )}

            {/* API Key */}
            {currentScheme.type === 'apiKey' && (
              <ApiKeyAuthForm
                scheme={currentScheme}
                currentApiKey={currentCredentials?.apiKey}
                onSave={(apiKey) => setCredentials(selectedScheme, { type: 'apiKey', apiKey })}
                onClear={() => clearCredentials(selectedScheme)}
              />
            )}

            {/* OAuth2 */}
            {currentScheme.type === 'oauth2' && (
              <OAuth2AuthForm
                scheme={currentScheme}
                currentToken={currentCredentials?.token}
                onSave={(token) => setCredentials(selectedScheme, { type: 'oauth2', token })}
                onClear={() => clearCredentials(selectedScheme)}
              />
            )}

            {/* OpenID Connect */}
            {currentScheme.type === 'openIdConnect' && (
              <OpenIDConnectAuthForm
                scheme={currentScheme}
                currentToken={currentCredentials?.token}
                onSave={(token) => setCredentials(selectedScheme, { type: 'oauth2', token })}
                onClear={() => clearCredentials(selectedScheme)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Bearer Auth Form
function BearerAuthForm({
  currentToken,
  bearerFormat,
  onSave,
  onClear,
}: {
  currentToken?: string;
  bearerFormat?: string;
  onSave: (token: string) => void;
  onClear: () => void;
}) {
  const [token, setToken] = useState(currentToken || '');
  const [showToken, setShowToken] = useState(false);

  // Check if token is JWT and if it's expired
  const tokenInfo = useMemo(() => {
    if (!token) return null;
    try {
      const jwtData = parseJwt(token);
      if (jwtData) {
        const expired = isTokenExpired(token);
        return { ...jwtData, expired };
      }
    } catch (e) {
      // Not a JWT
    }
    return null;
  }, [token]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Token {bearerFormat && `(${bearerFormat})`}
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter bearer token"
            className="w-full px-3 py-2 pr-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {tokenInfo && (
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">JWT Token Information</span>
          </div>
          {tokenInfo.expired && (
            <div className="mb-2 px-2 py-1 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-400">
              This token has expired
            </div>
          )}
          <div className="text-xs text-[var(--text-muted)] space-y-1">
            {tokenInfo.payload.exp && (
              <div>Expires: {new Date(tokenInfo.payload.exp * 1000).toLocaleString()}</div>
            )}
            {tokenInfo.payload.iat && (
              <div>Issued: {new Date(tokenInfo.payload.iat * 1000).toLocaleString()}</div>
            )}
            {tokenInfo.payload.sub && <div>Subject: {tokenInfo.payload.sub}</div>}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onSave(token)}
          disabled={!token}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Token
        </button>
        {currentToken && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// Basic Auth Form
function BasicAuthForm({
  currentUsername,
  currentPassword,
  onSave,
  onClear,
}: {
  currentUsername?: string;
  currentPassword?: string;
  onSave: (username: string, password: string) => void;
  onClear: () => void;
}) {
  const [username, setUsername] = useState(currentUsername || '');
  const [password, setPassword] = useState(currentPassword || '');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3 py-2 pr-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(username, password)}
          disabled={!username || !password}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Credentials
        </button>
        {currentUsername && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// API Key Auth Form
function ApiKeyAuthForm({
  scheme,
  currentApiKey,
  onSave,
  onClear,
}: {
  scheme: SecurityScheme;
  currentApiKey?: string;
  onSave: (apiKey: string) => void;
  onClear: () => void;
}) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded p-3">
        <div className="text-sm text-[var(--text-secondary)] space-y-1">
          <div>Parameter Name: <span className="font-mono text-[var(--text-primary)]">{scheme.name}</span></div>
          <div>Location: <span className="font-mono text-[var(--text-primary)]">{scheme.in}</span></div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key"
            className="w-full px-3 py-2 pr-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(apiKey)}
          disabled={!apiKey}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save API Key
        </button>
        {currentApiKey && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// OAuth2 Auth Form
function OAuth2AuthForm({
  scheme,
  currentToken,
  onSave,
  onClear,
}: {
  scheme: SecurityScheme;
  currentToken?: string;
  onSave: (token: string) => void;
  onClear: () => void;
}) {
  const [token, setToken] = useState(currentToken || '');
  const [showToken, setShowToken] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<string>('');

  const availableFlows = useMemo(() => {
    if (!scheme.flows) return [];
    return Object.keys(scheme.flows);
  }, [scheme.flows]);

  useMemo(() => {
    if (availableFlows.length > 0 && !selectedFlow) {
      setSelectedFlow(availableFlows[0]);
    }
  }, [availableFlows, selectedFlow]);

  const currentFlow = selectedFlow && scheme.flows ? scheme.flows[selectedFlow as keyof typeof scheme.flows] : null;

  return (
    <div className="space-y-4">
      {availableFlows.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            OAuth2 Flow
          </label>
          <select
            value={selectedFlow}
            onChange={(e) => setSelectedFlow(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {availableFlows.map((flow) => (
              <option key={flow} value={flow}>
                {flow}
              </option>
            ))}
          </select>
        </div>
      )}

      {currentFlow && (
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded p-3">
          <div className="text-sm text-[var(--text-secondary)] space-y-1">
            {currentFlow.authorizationUrl && (
              <div className="break-all">
                Auth URL: <span className="font-mono text-xs text-[var(--text-primary)]">{currentFlow.authorizationUrl}</span>
              </div>
            )}
            {currentFlow.tokenUrl && (
              <div className="break-all">
                Token URL: <span className="font-mono text-xs text-[var(--text-primary)]">{currentFlow.tokenUrl}</span>
              </div>
            )}
            {currentFlow.scopes && Object.keys(currentFlow.scopes).length > 0 && (
              <div className="mt-2">
                <div className="font-medium mb-1">Available Scopes:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {Object.entries(currentFlow.scopes).map(([scope, description]) => (
                    <li key={scope}>
                      <span className="font-mono text-[var(--text-primary)]">{scope}</span>
                      {description && `: ${description}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Access Token
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter access token"
            className="w-full px-3 py-2 pr-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Obtain token using the OAuth2 flow URLs above, then paste it here
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(token)}
          disabled={!token}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Token
        </button>
        {currentToken && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// OpenID Connect Auth Form
function OpenIDConnectAuthForm({
  scheme,
  currentToken,
  onSave,
  onClear,
}: {
  scheme: SecurityScheme;
  currentToken?: string;
  onSave: (token: string) => void;
  onClear: () => void;
}) {
  const [token, setToken] = useState(currentToken || '');
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="space-y-4">
      {scheme.openIdConnectUrl && (
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded p-3">
          <div className="text-sm text-[var(--text-secondary)]">
            <div className="break-all">
              Discovery URL: <span className="font-mono text-xs text-[var(--text-primary)]">{scheme.openIdConnectUrl}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          ID Token
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter ID token"
            className="w-full px-3 py-2 pr-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Obtain token through OpenID Connect provider, then paste it here
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(token)}
          disabled={!token}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Token
        </button>
        {currentToken && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
