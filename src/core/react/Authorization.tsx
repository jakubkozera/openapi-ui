import React, { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { credentialPresent, resolveRef, securitySchemes } from "./api";
import {
  authorizationUrl,
  completeAuthorization,
  defaultClientId,
  discoverOidc,
  requestToken,
} from "./oauth";
import { Markdown } from "./ui";
import type { Credentials, Notify, OpenApiDocument, Operation } from "./types";

interface AuthorizationProps {
  spec: OpenApiDocument;
  credentials: Credentials;
  onChange: (credentials: Credentials) => void;
  workspace: string;
  remember: boolean;
  onRemember: (remember: boolean) => void;
  notify: Notify;
  operation?: Operation;
  enabled?: boolean;
  onEnabled: (enabled: boolean) => void;
}

export function Authorization({
  spec,
  credentials,
  onChange,
  workspace,
  remember,
  onRemember,
  notify,
  operation,
  enabled,
  onEnabled,
}: AuthorizationProps) {
  const schemes = Object.entries(securitySchemes(spec));
  const [selected, setSelected] = useState(schemes[0]?.[0] || "");
  const [configs, setConfigs] = useState<Record<string, Record<string, any>>>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [callback, setCallback] = useState("");
  const scheme = resolveRef(securitySchemes(spec)[selected], spec);
  const credential = credentials[selected] || {};
  const config: Record<string, any> = {
    clientId: defaultClientId(scheme),
    ...configs[selected],
  };
  const flowName =
    config.flow || Object.keys(scheme.flows || {})[0] || "authorizationCode";
  const flow = scheme.flows?.[flowName];
  const changeConfig = (patch: Record<string, any>) =>
    setConfigs((previous) => ({
      ...previous,
      [selected]: { ...config, ...patch },
    }));
  const changeCredential = (patch: Record<string, any>) =>
    onChange({ ...credentials, [selected]: { ...credential, ...patch } });
  const oauth = scheme.type === "oauth2" || scheme.type === "openIdConnect";
  const basic = scheme.type === "basic" || scheme.scheme === "basic";

  async function authorize() {
    setBusy(true);
    try {
      const endpoints =
        scheme.type === "openIdConnect"
          ? await discoverOidc(scheme.openIdConnectUrl)
          : flow;
      if (!endpoints) throw new Error("No OAuth flow configured.");
      const values = {
        ...config,
        flow: flowName,
        scope: config.scope ?? Object.keys(endpoints.scopes || {}).join(" "),
      };
      if (["password", "clientCredentials"].includes(flowName))
        changeCredential(await requestToken(endpoints, values));
      else {
        const url = await authorizationUrl(
          endpoints,
          values,
          selected,
          workspace,
        );
        if (window.openapiHost)
          window.open(url, "_blank", "noopener,noreferrer");
        else window.location.assign(url);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error), true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-view">
      <header className="section-heading">
        <h1>Authorization</h1>
        <KeyRound size={22} />
      </header>
      {operation && (
        <div className="security-requirements">
          <strong>{operation.summary || operation.path}</strong>
          <p>
            {operation.security.length
              ? operation.security
                  .map((group) => Object.keys(group).join(" + ") || "Anonymous")
                  .join(" OR ")
              : "No authentication required"}
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={enabled !== false}
              onChange={(event) => onEnabled(event.target.checked)}
            />
            Apply authorization to this request
          </label>
        </div>
      )}
      {!schemes.length ? (
        <p className="empty">
          No security schemes defined in this specification.
        </p>
      ) : (
        <>
          <div className="subtabs" role="tablist" aria-label="Security schemes">
            {schemes.map(([name, value]) => (
              <button
                key={name}
                role="tab"
                aria-selected={name === selected}
                onClick={() => setSelected(name)}
              >
                {name}
                {credentialPresent(
                  resolveRef(value, spec),
                  credentials[name],
                ) && <span className="status-dot" />}
              </button>
            ))}
          </div>
          <div className="auth-form" key={selected}>
            <div className="section-heading">
              <h2>{selected}</h2>
              <span
                className={
                  credentialPresent(scheme, credential) ? "success" : "muted"
                }
              >
                {credentialPresent(scheme, credential)
                  ? "Configured"
                  : "Not configured"}
              </span>
            </div>
            <Markdown>{scheme.description}</Markdown>
            {basic ? (
              <>
                <label>
                  Username
                  <input
                    autoComplete="off"
                    value={credential.username || ""}
                    onChange={(event) =>
                      changeCredential({ username: event.target.value })
                    }
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    autoComplete="off"
                    value={credential.password || ""}
                    onChange={(event) =>
                      changeCredential({ password: event.target.value })
                    }
                  />
                </label>
              </>
            ) : (
              <label>
                {scheme.type === "apiKey"
                  ? `${scheme.name} (${scheme.in})`
                  : "Access token"}
                <input
                  type="password"
                  autoComplete="off"
                  value={credential.token || ""}
                  onChange={(event) =>
                    changeCredential({
                      token: event.target.value,
                      expiresAt: undefined,
                    })
                  }
                />
              </label>
            )}
            {credential.expiresAt && (
              <p className="muted">
                Expires {new Date(credential.expiresAt).toLocaleString()}
              </p>
            )}
            {oauth && (
              <>
                {scheme.flows && (
                  <label>
                    OAuth flow
                    <select
                      value={flowName}
                      onChange={(event) =>
                        changeConfig({ flow: event.target.value })
                      }
                    >
                      {Object.keys(scheme.flows).map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  Client ID
                  <input
                    autoComplete="off"
                    value={config.clientId || ""}
                    onChange={(event) =>
                      changeConfig({ clientId: event.target.value })
                    }
                  />
                </label>
                {["clientCredentials", "password"].includes(flowName) && (
                  <label>
                    Client secret
                    <input
                      type="password"
                      autoComplete="off"
                      value={config.clientSecret || ""}
                      onChange={(event) =>
                        changeConfig({ clientSecret: event.target.value })
                      }
                    />
                  </label>
                )}
                {flowName === "password" && (
                  <>
                    <label>
                      Resource owner username
                      <input
                        value={config.username || ""}
                        onChange={(event) =>
                          changeConfig({ username: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Resource owner password
                      <input
                        type="password"
                        value={config.password || ""}
                        onChange={(event) =>
                          changeConfig({ password: event.target.value })
                        }
                      />
                    </label>
                  </>
                )}
                {!["clientCredentials", "password"].includes(flowName) && (
                  <label>
                    Redirect URI
                    <input
                      value={
                        config.redirectUri ??
                        `${location.origin}${location.pathname}`
                      }
                      onChange={(event) =>
                        changeConfig({ redirectUri: event.target.value })
                      }
                    />
                  </label>
                )}
                <label>
                  Scopes
                  <input
                    value={
                      config.scope ?? Object.keys(flow?.scopes || {}).join(" ")
                    }
                    onChange={(event) =>
                      changeConfig({ scope: event.target.value })
                    }
                  />
                </label>
                <button className="primary" disabled={busy} onClick={authorize}>
                  <KeyRound size={16} />
                  {busy ? "Authorizing..." : "Authorize"}
                </button>
                {window.openapiHost && (
                  <>
                    <label>
                      Callback URL
                      <input
                        value={callback}
                        onChange={(event) => setCallback(event.target.value)}
                      />
                    </label>
                    <button
                      onClick={async () => {
                        try {
                          const result = await completeAuthorization(callback);
                          if (!result || result.workspace !== workspace)
                            throw new Error(
                              "Callback does not match this workspace.",
                            );
                          onChange({
                            ...credentials,
                            [result.scheme]: result.credential,
                          });
                          setCallback("");
                        } catch (error) {
                          notify(
                            error instanceof Error
                              ? error.message
                              : String(error),
                            true,
                          );
                        }
                      }}
                    >
                      Complete authorization
                    </button>
                  </>
                )}
              </>
            )}
            <label className="check-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => onRemember(event.target.checked)}
              />
              Remember credentials on this device
            </label>
            {remember && (
              <p className="warning">
                Credentials are stored unencrypted in browser storage.
              </p>
            )}
            <button
              className="text-button"
              onClick={() => {
                const next = { ...credentials };
                delete next[selected];
                onChange(next);
              }}
            >
              <LogOut size={16} />
              Clear credentials
            </button>
          </div>
        </>
      )}
    </section>
  );
}
