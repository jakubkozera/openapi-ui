const PENDING_KEY = "openapi-ui:oauth:pending";

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function discoverOidc(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Discovery failed: HTTP ${response.status}`);
  const data = await response.json();
  if (!data.authorization_endpoint || !data.token_endpoint)
    throw new Error("Discovery document is missing OAuth endpoints.");
  return {
    authorizationUrl: data.authorization_endpoint,
    tokenUrl: data.token_endpoint,
    scopes: Object.fromEntries(
      (data.scopes_supported || ["openid"]).map((scope) => [scope, scope]),
    ),
  };
}

export async function requestToken(flow, config) {
  const params = new URLSearchParams({
    grant_type: config.flow === "password" ? "password" : "client_credentials",
    scope: config.scope || "",
    client_id: config.clientId || "",
  });
  if (config.flow === "password") {
    params.set("username", config.username || "");
    params.set("password", config.password || "");
  }
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  if (config.clientSecret)
    headers.Authorization = `Basic ${btoa(`${encodeURIComponent(config.clientId)}:${encodeURIComponent(config.clientSecret)}`)}`;
  return exchangeToken(flow.tokenUrl, params, headers);
}

async function exchangeToken(
  url,
  params,
  headers = { "Content-Type": "application/x-www-form-urlencoded" },
) {
  const response = await fetch(url, { method: "POST", headers, body: params });
  const data = await response.json();
  if (!response.ok || !data.access_token)
    throw new Error(
      data.error_description ||
        data.error ||
        `Token request failed: HTTP ${response.status}`,
    );
  return {
    token: data.access_token,
    expiresAt: data.expires_in
      ? Date.now() + Number(data.expires_in) * 1000
      : undefined,
  };
}

export async function authorizationUrl(
  flow,
  config,
  scheme,
  workspace,
  storage = sessionStorage,
) {
  if (!config.clientId) throw new Error("Client ID is required.");
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
  const url = new URL(flow.authorizationUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid authorization URL.");
  const redirectUri =
    config.redirectUri || `${location.origin}${location.pathname}`;
  const responseType = config.flow === "implicit" ? "token" : "code";
  url.search = new URLSearchParams({
    ...Object.fromEntries(url.searchParams),
    client_id: config.clientId,
    response_type: responseType,
    redirect_uri: redirectUri,
    scope: config.scope || "",
    state,
  }).toString();
  if (responseType === "code") {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(verifier),
    );
    url.searchParams.set("code_challenge", base64url(new Uint8Array(digest)));
    url.searchParams.set("code_challenge_method", "S256");
  }
  storage.setItem(
    PENDING_KEY,
    JSON.stringify({
      state,
      verifier,
      scheme,
      workspace,
      redirectUri,
      clientId: config.clientId,
      tokenUrl: flow.tokenUrl,
      created: Date.now(),
    }),
  );
  return url.href;
}

export async function completeAuthorization(
  callback,
  storage = sessionStorage,
) {
  const url = new URL(callback);
  const params = new URLSearchParams(url.hash.slice(1));
  url.searchParams.forEach((value, name) => params.set(name, value));
  if (
    !params.has("code") &&
    !params.has("access_token") &&
    !params.has("error")
  )
    return null;
  const pending = JSON.parse(storage.getItem(PENDING_KEY) || "null");
  if (
    !pending ||
    !params.get("state") ||
    params.get("state") !== pending.state ||
    Date.now() - pending.created > 600000
  )
    throw new Error(
      "Invalid or expired OAuth state. Start authorization again.",
    );
  storage.removeItem(PENDING_KEY);
  if (params.has("error"))
    throw new Error(params.get("error_description") || params.get("error"));
  const credential = params.has("access_token")
    ? {
        token: params.get("access_token"),
        expiresAt: params.has("expires_in")
          ? Date.now() + Number(params.get("expires_in")) * 1000
          : undefined,
      }
    : await exchangeToken(
        pending.tokenUrl,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: params.get("code"),
          redirect_uri: pending.redirectUri,
          client_id: pending.clientId,
          code_verifier: pending.verifier,
        }),
      );
  return { scheme: pending.scheme, workspace: pending.workspace, credential };
}
