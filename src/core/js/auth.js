// Authentication module for security schemes

// Configuration from the OpenAPI security schemes
let securityConfig = null;
let hasShownAuthNotification = false; // Flag to track if we've shown the auth notification
let expirationCheckInterval = null; // Interval for checking token expiration
let apiTitle = null; // Store the API title from OpenAPI spec
let apiVersion = null; // Store the API version from OpenAPI spec

// Helper functions
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getAccessTokenKey(schemeKey = "default") {
  if (!apiTitle || !apiVersion) {
    console.warn("API title or version not set, using default storage key");
    return `access_token_${schemeKey}`;
  }
  return `${toSnakeCase(apiTitle)}_${toSnakeCase(
    apiVersion
  )}_access_token_${schemeKey}`;
}

function getBasicAuthKey(schemeKey = "default") {
  if (!apiTitle || !apiVersion) {
    console.warn("API title or version not set, using default storage key");
    return `basic_auth_${schemeKey}`;
  }
  return `${toSnakeCase(apiTitle)}_${toSnakeCase(
    apiVersion
  )}_basic_auth_${schemeKey}`;
}

function getApiKeyKey(schemeKey = "default") {
  if (!apiTitle || !apiVersion) {
    console.warn("API title or version not set, using default storage key");
    return `api_key_${schemeKey}`;
  }
  return `${toSnakeCase(apiTitle)}_${toSnakeCase(
    apiVersion
  )}_api_key_${schemeKey}`;
}

// Core token management functions
function getAccessToken(schemeKey = "default") {
  return localStorage.getItem(getAccessTokenKey(schemeKey));
}

function setAccessToken(token, schemeKey = "default") {
  if (!token) {
    clearAccessToken(schemeKey);
    return;
  }

  // Only check expiration for JWT tokens that we can successfully parse
  // and that actually have an expiration claim
  if (token.includes(".")) {
    const parsedToken = parseJwt(token);
    if (parsedToken && parsedToken.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (parsedToken.exp <= currentTime) {
        window.utils.showToast(
          "Received expired token. Please authenticate again.",
          "error"
        );
        clearAccessToken(schemeKey);
        return;
      }
    }
    // If we can't parse the JWT or it doesn't have exp claim, we'll still store it
    // as it might be a valid token without expiration
  }

  localStorage.setItem(getAccessTokenKey(schemeKey), token);
  updateAuthStatus(schemeKey, true);
  startExpirationCheck();
}

function clearAccessToken(schemeKey = "default") {
  localStorage.removeItem(getAccessTokenKey(schemeKey));
  updateAuthStatus(schemeKey, false);
  hasShownAuthNotification = false;
}

// Basic Auth management functions
function getBasicAuthCredentials(schemeKey = "default") {
  const credentials = localStorage.getItem(getBasicAuthKey(schemeKey));
  return credentials ? JSON.parse(credentials) : null;
}

function setBasicAuthCredentials(username, password, schemeKey = "default") {
  if (!username || !password) {
    clearBasicAuthCredentials(schemeKey);
    return;
  }

  const credentials = { username, password };
  localStorage.setItem(getBasicAuthKey(schemeKey), JSON.stringify(credentials));
  updateAuthStatus(schemeKey, true);
}

function clearBasicAuthCredentials(schemeKey = "default") {
  localStorage.removeItem(getBasicAuthKey(schemeKey));
  updateAuthStatus(schemeKey, false);
  hasShownAuthNotification = false;
}

// API Key management functions
function getApiKey(schemeKey = "default") {
  return localStorage.getItem(getApiKeyKey(schemeKey));
}

function setApiKey(apiKey, schemeKey = "default") {
  if (!apiKey) {
    clearApiKey(schemeKey);
    return;
  }

  localStorage.setItem(getApiKeyKey(schemeKey), apiKey);
  updateAuthStatus(schemeKey, true);
}

function clearApiKey(schemeKey = "default") {
  localStorage.removeItem(getApiKeyKey(schemeKey));
  updateAuthStatus(schemeKey, false);
  hasShownAuthNotification = false;
}

// Auth status management
function updateAuthStatus(schemeKey, isAuthenticated) {
  const statusElement = document.getElementById(`auth-status-${schemeKey}`);
  const buttonElement = document.getElementById(`auth-button-${schemeKey}`);
  if (!buttonElement.classList.contains("text-white")) {
    buttonElement.classList.add("text-white");
  }

  if (statusElement) {
    statusElement.textContent = isAuthenticated
      ? "Authenticated"
      : "Not authenticated";
    statusElement.classList.remove(
      isAuthenticated ? "bg-gray-600" : "bg-green-600"
    );
    statusElement.classList.add(
      isAuthenticated ? "bg-green-600" : "bg-gray-600"
    );
    if (isAuthenticated) {
      statusElement.classList.add("text-white");
    } else {
      statusElement.classList.remove("text-white");
    }
  }
  if (buttonElement) {
    if (securityConfig[schemeKey]?.type === "oauth2") {
      buttonElement.textContent = isAuthenticated ? "Logout" : "Login";
      buttonElement.classList.remove(
        isAuthenticated ? "bg-blue-500" : "bg-red-500"
      );
      buttonElement.classList.remove(
        isAuthenticated ? "hover:bg-blue-700" : "hover:bg-red-700"
      );
      buttonElement.classList.add(
        isAuthenticated ? "bg-red-500" : "bg-blue-500"
      );
      buttonElement.classList.add(
        isAuthenticated ? "hover:bg-red-700" : "hover:bg-blue-700"
      );
    } else {
      buttonElement.textContent = isAuthenticated
        ? "Clear Token"
        : "Authenticate";
    }
  }
  // Update operation security status immediately when auth status changes
  updateOperationSecurityStatus();

  // Update the security scheme dropdown with authentication status indicators
  updateSecuritySchemeDropdown();
}

function updateAuthButtonStates() {
  Object.keys(securityConfig || {}).forEach((key) => {
    const scheme = securityConfig[key];
    let isAuthenticated = false;

    if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic") {
      const credentials = getBasicAuthCredentials(key);
      isAuthenticated = !!(
        credentials &&
        credentials.username &&
        credentials.password
      );
    } else if (scheme.type === "apiKey") {
      const apiKey = getApiKey(key);
      isAuthenticated = !!apiKey;
    } else {
      const token = getAccessToken(key);
      isAuthenticated = !!token && !isTokenExpired(token);
    }

    updateAuthStatus(key, isAuthenticated);
  });

  // Update the security scheme dropdown with authentication status indicators
  updateSecuritySchemeDropdown();
}

// Function to update the security scheme dropdown with authentication status indicators
function updateSecuritySchemeDropdown() {
  const schemeSelect = document.getElementById("security-scheme-select");
  if (!schemeSelect || !securityConfig) return;

  const currentValue = schemeSelect.value;

  // Regenerate options with updated authentication status
  const newOptionsHTML = Object.entries(securityConfig)
    .map(
      ([key, scheme]) =>
        `<option value="${key}">${getSecuritySchemeDisplayName(
          key,
          scheme,
          true
        )}</option>`
    )
    .join("");

  schemeSelect.innerHTML = newOptionsHTML;

  // Restore the previously selected value if it still exists
  if (currentValue && securityConfig[currentValue]) {
    schemeSelect.value = currentValue;
  }
}

// Token validation functions
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error("Error parsing JWT token:", error);
    return null;
  }
}

function isTokenExpired(token) {
  if (!token) return true;

  // For Bearer tokens that aren't JWTs, assume they're not expired
  if (!token.includes(".")) return false;

  const parsedToken = parseJwt(token);
  // If we can't parse the token or it doesn't have an exp claim,
  // assume it's not expired (might be a valid token without expiration)
  if (!parsedToken || !parsedToken.exp) return false;

  // Get current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  return parsedToken.exp <= currentTime;
}

function getTimeUntilExpiration(token) {
  if (!token) return 0;

  // For Bearer tokens that aren't JWTs, return a large number
  if (!token.includes(".")) return Number.MAX_SAFE_INTEGER;

  const parsedToken = parseJwt(token);
  if (!parsedToken || !parsedToken.exp) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  return parsedToken.exp - currentTime;
}

// Auth action functions
function toggleAuth(schemeKey) {
  const scheme = securityConfig[schemeKey];
  const button = document.getElementById(`auth-button-${schemeKey}`);

  // Prevent multiple rapid clicks
  if (button && button.disabled) {
    return;
  }

  // Temporarily disable button to prevent double-clicks
  if (button) {
    button.disabled = true;
    setTimeout(() => {
      button.disabled = false;
    }, 500);
  }

  if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic") {
    const credentials = getBasicAuthCredentials(schemeKey);
    if (credentials) {
      clearBasicAuthCredentials(schemeKey);
    } else {
      const usernameInput = document.getElementById(
        `auth-username-${schemeKey}`
      );
      const passwordInput = document.getElementById(
        `auth-password-${schemeKey}`
      );
      const username = usernameInput?.value.trim();
      const password = passwordInput?.value.trim();
      if (username && password) {
        setBasicAuthCredentials(username, password, schemeKey);
      }
    }
  } else if (scheme.type === "apiKey") {
    const apiKey = getApiKey(schemeKey);
    if (apiKey) {
      clearApiKey(schemeKey);
    } else {
      const apiKeyInput = document.getElementById(`auth-apikey-${schemeKey}`);
      const apiKeyValue = apiKeyInput?.value.trim();
      if (apiKeyValue) {
        setApiKey(apiKeyValue, schemeKey);
      }
    }
  } else {
    const token = getAccessToken(schemeKey);
    if (token) {
      clearAccessToken(schemeKey);
    } else if (scheme.type === "oauth2" || scheme.type === "openIdConnect") {
      initiateOAuthFlow(schemeKey);
    } else {
      const tokenInput = document.getElementById(`auth-token-${schemeKey}`);
      const token = tokenInput?.value.trim();
      if (token) {
        setAccessToken(token, schemeKey);
      }
    }
  }
}

// Function to start monitoring token expiration
function startExpirationCheck() {
  // Clear any existing interval
  if (expirationCheckInterval) {
    clearInterval(expirationCheckInterval);
  }

  expirationCheckInterval = setInterval(() => {
    Object.keys(securityConfig || {}).forEach((schemeKey) => {
      const token = getAccessToken(schemeKey);
      if (!token) return;

      const timeLeft = getTimeUntilExpiration(token);

      // Show warning when 30 seconds or less remain
      if (timeLeft <= 30 && timeLeft > 0) {
        window.utils.showToast(
          `${schemeKey} session will expire in ${timeLeft} seconds. Please re-authenticate.`,
          "warning",
          10000
        );
      }

      // Clear token if expired
      if (timeLeft <= 0) {
        window.utils.showToast(
          `${schemeKey} session has expired. Please authenticate again.`,
          "error"
        );
        clearAccessToken(schemeKey);
      }
    });
  }, 1000); // Check every second
}

// Helper function to check if a scheme is authenticated
function isSchemeAuthenticated(key, scheme) {
  if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic") {
    const credentials = getBasicAuthCredentials(key);
    return !!(credentials && credentials.username && credentials.password);
  } else if (scheme.type === "apiKey") {
    const apiKey = getApiKey(key);
    return !!apiKey;
  } else {
    const token = getAccessToken(key);
    return !!token && !isTokenExpired(token);
  }
}

// Helper function to generate descriptive display names for security schemes
function getSecuritySchemeDisplayName(
  key,
  scheme,
  includeStatusIndicator = false
) {
  let baseName;
  switch (scheme.type) {
    case "http":
      const httpScheme = scheme.scheme || "http";
      switch (httpScheme.toLowerCase()) {
        case "basic":
          baseName = "Basic Auth";
          break;
        case "bearer":
          baseName = "Bearer Auth";
          break;
        case "digest":
          baseName = "Digest Auth";
          break;
        case "ntlm":
          baseName = "NTLM Auth";
          break;
        default:
          baseName = `${
            httpScheme.charAt(0).toUpperCase() + httpScheme.slice(1)
          } Auth`;
      }
      break;
    case "oauth2":
      baseName = "OAuth2";
      break;
    case "openIdConnect":
      baseName = "OpenID Connect";
      break;
    case "apiKey":
      const location = scheme.in || "unknown";
      const locationName =
        location === "header"
          ? "Header"
          : location === "query"
          ? "Query"
          : location === "cookie"
          ? "Cookie"
          : location.charAt(0).toUpperCase() + location.slice(1);
      baseName = `API Key (${locationName})`;
      break;
    default:
      baseName = `${scheme.type} (${key})`;
  }
  if (includeStatusIndicator && isSchemeAuthenticated(key, scheme)) {
    return `✅ ${baseName}`; // Green bullet using inline CSS
  }
  return baseName;
}

// Initialize the auth section with security scheme details
function createAuthSection() {
  if (!securityConfig) {
    console.log("Security schemes not configured");
    return;
  }

  const authSection = document.getElementById("auth-section");
  const content = document.querySelector("#auth-section .p-6");
  if (!content) return;

  // Create security scheme selector if multiple schemes exist

  if (Object.keys(securityConfig).length > 1) {
    const schemeSelectorDiv = document.createElement("div");
    schemeSelectorDiv.className = "mb-4";
    schemeSelectorDiv.innerHTML = `
      <label class="block text-sm font-medium text-gray-400 mb-1">Security Scheme</label>
      <select id="security-scheme-select" class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">        ${Object.entries(
        securityConfig
      )
        .map(
          ([key, scheme]) =>
            `<option value="${key}">${getSecuritySchemeDisplayName(
              key,
              scheme,
              true
            )}</option>`
        )
        .join("")}
      </select>
    `;
    content.insertBefore(schemeSelectorDiv, content.firstChild);
  }

  // Create sections for each security scheme
  Object.entries(securityConfig).forEach(([key, scheme]) => {
    const schemeSection = document.createElement("div");
    schemeSection.id = `auth-scheme-${key}`;
    schemeSection.className =
      "auth-scheme-section" +
      (Object.keys(securityConfig).length > 1 ? " hidden" : "");
    if (scheme.type === "oauth2") {
      const supportedFlows = Object.keys(scheme.flows || {});
      const flowNames = {
        implicit: "Implicit Flow",
        authorizationCode: "Authorization Code Flow",
        password: "Resource Owner Password Flow",
        clientCredentials: "Client Credentials Flow",
      };
      const flowDescriptions = supportedFlows
        .map((flow) => flowNames[flow] || flow)
        .join(", ");

      schemeSection.innerHTML = `
        <div class="text-sm text-gray-400 mb-4">This endpoint uses OAuth2 for authentication.${
          supportedFlows.length > 0
            ? ` Supported flows: ${flowDescriptions}`
            : ""
        }</div>
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Status:</span>
            <span id="auth-status-${key}" class="text-sm bg-gray-600 px-2 py-1 rounded">Not authenticated</span>
          </div>
          ${
            supportedFlows.length > 0
              ? `
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Available Flows:</span>
            <span class="text-sm text-gray-300">${flowDescriptions}</span>
          </div>
          `
              : ""
          }
        </div>
        ${
          scheme.flows?.password
            ? `
        <div class="mb-4" id="oauth-password-fields-${key}" style="display: none;">
          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input type="text" id="oauth-username-${key}"
              class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your username">
          </div>          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div class="password-input-container">
              <input type="password" id="oauth-password-${key}"
                class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your password">              <button type="button" class="password-toggle-btn" onclick="window.utils.togglePasswordVisibility('oauth-password-${key}')">
                <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg class="eye-closed" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path>
</svg>
              </button>
            </div>
          </div>
        </div>
        `
            : ""
        }
        ${
          scheme.flows?.clientCredentials
            ? `
        <div class="mb-4" id="oauth-client-fields-${key}" style="display: none;">
          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-400 mb-1">Client ID</label>
            <input type="text" id="oauth-client-id-${key}"
              class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your client ID">
          </div>          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-400 mb-1">Client Secret</label>
            <div class="password-input-container">
              <input type="password" id="oauth-client-secret-${key}"
                class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your client secret">              <button type="button" class="password-toggle-btn" onclick="window.utils.togglePasswordVisibility('oauth-client-secret-${key}')">
                <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg class="eye-closed" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path>
</svg>
              </button>
            </div>
          </div>
        </div>
        `
            : ""
        }
        ${
          supportedFlows.length > 1
            ? `
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1">OAuth2 Flow</label>
          <select id="oauth-flow-select-${key}" class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
            ${supportedFlows
              .map(
                (flow) =>
                  `<option value="${flow}">${flowNames[flow] || flow}</option>`
              )
              .join("")}
          </select>
        </div>
        `
            : ""
        }
        <button id="auth-button-${key}"
          class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm">
          <span>Login</span>
        </button>
        <div id="auth-details-${key}" class="mt-4 space-y-4 hidden">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Authorization URL</label>
            <div id="auth-url-${key}" class="text-sm text-gray-300 break-all bg-gray-700 p-2 rounded"></div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Client ID</label>
            <div id="auth-client-id-${key}" class="text-sm text-gray-300 break-all bg-gray-700 p-2 rounded"></div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Available Scopes</label>
            <div id="auth-scopes-${key}" class="text-sm text-gray-300 break-all bg-gray-700 p-2 rounded"></div>
          </div>
        </div>
      `;
    } else if (
      scheme.type === "http" &&
      scheme.scheme?.toLowerCase() === "bearer"
    ) {
      const bearerFormatText = scheme.bearerFormat
        ? ` (${scheme.bearerFormat})`
        : "";
      schemeSection.innerHTML = `
        <div class="text-sm text-gray-400 mb-4">This endpoint uses Bearer token authentication${bearerFormatText}.</div>
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Status:</span>
            <span id="auth-status-${key}" class="text-sm bg-gray-600 px-2 py-1 rounded">Not authenticated</span>
          </div>
          ${
            scheme.bearerFormat
              ? `
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Format:</span>
            <span class="text-sm text-gray-300">${scheme.bearerFormat}</span>
          </div>
          `
              : ""
          }
        </div>        <div class="mb-4">          <label class="block text-sm font-medium text-gray-400 mb-1">Access Token</label>
          <div class="password-input-container">
            <input type="password" id="auth-token-${key}"
              class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your access token">
            <button type="button" class="password-toggle-btn" onclick="window.utils.togglePasswordVisibility('auth-token-${key}')">
              <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <svg class="eye-closed" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path>
</svg>
            </button>
          </div>
        </div><button id="auth-button-${key}"
          class="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
          <span>Authenticate</span>
        </button>
      `;
    } else if (
      scheme.type === "http" &&
      !["basic", "bearer"].includes(scheme.scheme?.toLowerCase())
    ) {
      // Handle other HTTP authentication schemes (digest, ntlm, negotiate, custom schemes)
      const schemeName = scheme.scheme
        ? scheme.scheme.charAt(0).toUpperCase() +
          scheme.scheme.slice(1).toLowerCase()
        : "Custom";
      schemeSection.innerHTML = `
        <div class="text-sm text-gray-400 mb-4">This endpoint uses ${schemeName} HTTP authentication.</div>
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Status:</span>
            <span id="auth-status-${key}" class="text-sm bg-gray-600 px-2 py-1 rounded">Not authenticated</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Scheme:</span>
            <span class="text-sm text-gray-300">${
              scheme.scheme || "Custom"
            }</span>
          </div>
        </div>        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1">Authentication Value</label>
          <div class="password-input-container">
            <input type="password" id="auth-token-${key}"
              class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your authentication value">
            <button type="button" class="password-toggle-btn" onclick="window.utils.togglePasswordVisibility('auth-token-${key}')">
              <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>              <svg class="eye-closed" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path>
</svg>
            </button>
          </div>
        </div>
        <button id="auth-button-${key}"
          class="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
          <span>Authenticate</span>
        </button>
      `;
    } else if (
      scheme.type === "http" &&
      scheme.scheme?.toLowerCase() === "basic"
    ) {
      schemeSection.innerHTML = `
        <div class="text-sm text-gray-400 mb-4">This endpoint uses Basic authentication (username and password).</div>
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Status:</span>
            <span id="auth-status-${key}" class="text-sm bg-gray-600 px-2 py-1 rounded">Not authenticated</span>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1">Username</label>
          <input type="text" id="auth-username-${key}"
            class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter your username">
        </div>        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <div class="password-input-container">
            <input type="password" id="auth-password-${key}"
              class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password">
            <button type="button" class="password-toggle-btn" onclick="window.utils.togglePasswordVisibility('auth-password-${key}')">
              <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>              <svg class="eye-closed" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path>
</svg>
            </button>
          </div>
        </div>
        <button id="auth-button-${key}"
          class="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
          <span>Authenticate</span>
        </button>
      `;
    } else if (scheme.type === "apiKey") {
      const locationText =
        scheme.in === "header"
          ? "HTTP header"
          : scheme.in === "query"
          ? "query parameter"
          : scheme.in === "cookie"
          ? "cookie"
          : "request";
      const crossOriginWarning =
        scheme.in === "cookie"
          ? `<div class="text-sm text-yellow-400 mb-2 p-2 rounded border border-yellow-600">
          <strong>Note:</strong> For cross-origin requests, browsers prevent setting Cookie headers directly. The API key will be sent as a custom header <code>X-API-Cookie-${scheme.name}</code> instead. Your server needs to check for this header. For same-origin requests, it will be set as a browser cookie.
        </div>`
          : "";

      schemeSection.innerHTML = `
        <div class="text-sm text-gray-400 mb-4">This endpoint uses API Key authentication via ${locationText} "${scheme.name}".</div>
        ${crossOriginWarning}
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Status:</span>
            <span id="auth-status-${key}" class="text-sm bg-gray-600 px-2 py-1 rounded">Not authenticated</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Location:</span>
            <span class="text-sm text-gray-300">${scheme.in}: ${scheme.name}</span>
          </div>
        </div>        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-1">API Key</label>
          <div class="password-input-container">
            <input type="password" id="auth-apikey-${key}"
              class="w-full bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your API key">
            <button type="button" class="password-toggle-btn" onclick="window.utils.togglePasswordVisibility('auth-apikey-${key}')">
              <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>              <svg class="eye-closed" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path>
</svg>
            </button>
          </div>
        </div>
        <button id="auth-button-${key}"
          class="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
          <span>Authenticate</span>
        </button>
      `;
    } else if (scheme.type === "openIdConnect") {
      schemeSection.innerHTML = `
        <div class="text-sm text-gray-400 mb-4">This endpoint uses OpenID Connect for authentication.</div>
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Status:</span>
            <span id="auth-status-${key}" class="text-sm bg-gray-600 px-2 py-1 rounded">Not authenticated</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Discovery URL:</span>
            <span class="text-sm text-gray-300 break-all">${scheme.openIdConnectUrl}</span>
          </div>
        </div>
        <button id="auth-button-${key}"
          class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm">
          <span>Login</span>
        </button>
        <div id="auth-details-${key}" class="mt-4 space-y-4 hidden">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Authorization URL</label>
            <div id="auth-url-${key}" class="text-sm text-gray-300 break-all bg-gray-700 p-2 rounded"></div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Client ID</label>
            <div id="auth-client-id-${key}" class="text-sm text-gray-300 break-all bg-gray-700 p-2 rounded"></div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Available Scopes</label>
            <div id="auth-scopes-${key}" class="text-sm text-gray-300 break-all bg-gray-700 p-2 rounded"></div>
          </div>
        </div>
      `;
    }

    content.appendChild(schemeSection);
  }); // Add event listeners
  Object.entries(securityConfig).forEach(([key, scheme]) => {
    const button = document.getElementById(`auth-button-${key}`);
    if (button) {
      // Remove any existing event listeners to prevent duplicates
      button.replaceWith(button.cloneNode(true));
      const newButton = document.getElementById(`auth-button-${key}`);
      newButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleAuth(key);
      });
    }

    if (scheme.type === "oauth2") {
      // Add OAuth2 flow selector event listener
      const flowSelect = document.getElementById(`oauth-flow-select-${key}`);
      if (flowSelect) {
        flowSelect.addEventListener("change", () => {
          const selectedFlow = flowSelect.value;

          // Hide all flow-specific fields
          const passwordFields = document.getElementById(
            `oauth-password-fields-${key}`
          );
          const clientFields = document.getElementById(
            `oauth-client-fields-${key}`
          );

          if (passwordFields) passwordFields.style.display = "none";
          if (clientFields) clientFields.style.display = "none";

          // Show fields for selected flow
          if (selectedFlow === "password" && passwordFields) {
            passwordFields.style.display = "block";
          } else if (selectedFlow === "clientCredentials" && clientFields) {
            clientFields.style.display = "block";
          }
        });

        // Initialize with first flow
        if (flowSelect.options.length > 0) {
          flowSelect.dispatchEvent(new Event("change"));
        }
      }
    } else if (
      scheme.type === "http" &&
      scheme.scheme?.toLowerCase() === "bearer"
    ) {
      const tokenInput = document.getElementById(`auth-token-${key}`);
      if (tokenInput) {
        // Set any existing token
        const existingToken = getAccessToken(key);
        if (existingToken) {
          tokenInput.value = existingToken;
          updateAuthStatus(key, true);
        }
        // Note: Token is only set when user clicks the "Authenticate" button
        // This prevents conflicts with automatic setting on input change
      }
    } else if (
      scheme.type === "http" &&
      !["basic", "bearer"].includes(scheme.scheme?.toLowerCase())
    ) {
      // Handle other HTTP schemes (digest, ntlm, etc.)
      const tokenInput = document.getElementById(`auth-token-${key}`);
      if (tokenInput) {
        // Set any existing token
        const existingToken = getAccessToken(key);
        if (existingToken) {
          tokenInput.value = existingToken;
          updateAuthStatus(key, true);
        }
        // Note: Token is only set when user clicks the "Authenticate" button
      }
    } else if (
      scheme.type === "http" &&
      scheme.scheme?.toLowerCase() === "basic"
    ) {
      const usernameInput = document.getElementById(`auth-username-${key}`);
      const passwordInput = document.getElementById(`auth-password-${key}`);

      if (usernameInput && passwordInput) {
        // Set any existing credentials
        const existingCredentials = getBasicAuthCredentials(key);
        if (existingCredentials) {
          usernameInput.value = existingCredentials.username;
          passwordInput.value = existingCredentials.password;
          updateAuthStatus(key, true);
        }
        // Note: Credentials are only set when user clicks the "Authenticate" button
      }
    } else if (scheme.type === "apiKey") {
      const apiKeyInput = document.getElementById(`auth-apikey-${key}`);
      if (apiKeyInput) {
        // Set any existing API key
        const existingApiKey = getApiKey(key);
        if (existingApiKey) {
          apiKeyInput.value = existingApiKey;
          updateAuthStatus(key, true);
        }
        // Note: API key is only set when user clicks the "Authenticate" button
      }
    }
  });

  // Set up scheme selector if it exists
  const schemeSelect = document.getElementById("security-scheme-select");
  if (schemeSelect) {
    schemeSelect.addEventListener("change", () => {
      const selectedScheme = schemeSelect.value;
      document.querySelectorAll(".auth-scheme-section").forEach((section) => {
        section.classList.add("hidden");
      });
      document
        .getElementById(`auth-scheme-${selectedScheme}`)
        ?.classList.remove("hidden");
    });

    // Show the first scheme
    document
      .getElementById(`auth-scheme-${schemeSelect.value}`)
      ?.classList.remove("hidden");
  }

  updateAuthButtonStates();
}

// Initialize the security configuration from OpenAPI spec
function initializeSecurityConfig(swaggerData) {
  if (
    swaggerData &&
    swaggerData.info &&
    swaggerData.info.title &&
    swaggerData.info.version
  ) {
    apiTitle = swaggerData.info.title;
    apiVersion = swaggerData.info.version;
  }

  if (
    !swaggerData ||
    !swaggerData.components ||
    !swaggerData.components.securitySchemes
  ) {
    console.log("No security schemes found in OpenAPI spec");
    return;
  }

  securityConfig = {}; // Process each security scheme
  Object.entries(swaggerData.components.securitySchemes).forEach(
    ([key, scheme]) => {
      if (
        scheme.type === "oauth2" ||
        scheme.type === "http" || // Support all HTTP schemes
        scheme.type === "apiKey" ||
        scheme.type === "openIdConnect"
      ) {
        securityConfig[key] = scheme; // For OAuth2, extract client ID from scope if available
        if (scheme.type === "oauth2" && scheme.flows?.implicit) {
          const scopeKeys = Object.keys(scheme.flows.implicit.scopes || {});
          if (scopeKeys.length > 0) {
            const firstScope = scopeKeys[0];
            const scopeParts = firstScope.split("/");
            if (scopeParts.length >= 2) {
              scheme.clientId = firstScope.substring(
                0,
                firstScope.lastIndexOf("/")
              );
            }
          }
        }

        // For OpenID Connect, we'll need to fetch the discovery document
        if (scheme.type === "openIdConnect") {
          fetchOpenIdConnectDiscovery(scheme, key);
        }
      }
    }
  );
  createAuthSection();
  updateAuthButtonStates();
}

// OpenID Connect discovery function
async function fetchOpenIdConnectDiscovery(scheme, schemeKey) {
  try {
    const response = await fetch(scheme.openIdConnectUrl);
    if (!response.ok) {
      console.error(
        `Failed to fetch OpenID Connect discovery document: ${response.status}`
      );
      return;
    }

    const discoveryDoc = await response.json();

    // Update the scheme with discovered endpoints
    scheme.discoveredEndpoints = {
      authorizationUrl: discoveryDoc.authorization_endpoint,
      tokenUrl: discoveryDoc.token_endpoint,
      scopes: discoveryDoc.scopes_supported || [],
    };

    console.log(
      `OpenID Connect discovery completed for ${schemeKey}:`,
      scheme.discoveredEndpoints
    );
  } catch (error) {
    console.error(
      `Error fetching OpenID Connect discovery document for ${schemeKey}:`,
      error
    );
  }
}

function addAuthorizationHeader(fetchOptions, operationSecurity = null) {
  if (!fetchOptions || !fetchOptions.headers) return fetchOptions;

  // Track if any API key cookies are used
  let hasApiKeyCookies = false;

  // Use operation-specific security or fall back to current operation security or global config
  const securityRequirements = operationSecurity || currentOperationSecurity;

  if (securityRequirements && Array.isArray(securityRequirements)) {
    // Find the first satisfied security requirement (OR logic)
    for (const requirement of securityRequirements) {
      if (isSecurityRequirementSatisfied(requirement)) {
        // Apply all schemes from this satisfied requirement (AND logic)
        const satisfiedSchemes = getSatisfiedSchemes(requirement);

        for (const schemeKey of satisfiedSchemes) {
          const scheme = securityConfig[schemeKey];
          if (!scheme) continue;

          // Check if this scheme uses API key cookies
          if (scheme.type === "apiKey" && scheme.in === "cookie") {
            hasApiKeyCookies = true;
          }

          applySchemeToRequest(fetchOptions, schemeKey, scheme);
        } // Stop after applying the first satisfied requirement
        break;
      }
    }
  }

  // If API key cookies are used, ensure credentials are included in the request
  if (hasApiKeyCookies) {
    fetchOptions.credentials = "include";
  }

  return fetchOptions;
}

// Helper function to apply a single authentication scheme to the request
function applySchemeToRequest(fetchOptions, schemeKey, scheme) {
  if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "bearer") {
    const token = getAccessToken(schemeKey);
    if (token) {
      fetchOptions.headers.append("Authorization", `Bearer ${token}`);
    }
  } else if (scheme.type === "oauth2" || scheme.type === "openIdConnect") {
    const token = getAccessToken(schemeKey);
    if (token) {
      fetchOptions.headers.append("Authorization", `Bearer ${token}`);
    }
  } else if (
    scheme.type === "http" &&
    scheme.scheme?.toLowerCase() === "basic"
  ) {
    const credentials = getBasicAuthCredentials(schemeKey);
    if (credentials && credentials.username && credentials.password) {
      const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
      fetchOptions.headers.append("Authorization", `Basic ${basicAuth}`);
    }
  } else if (
    scheme.type === "http" &&
    scheme.scheme &&
    !["basic", "bearer"].includes(scheme.scheme.toLowerCase())
  ) {
    // Handle other HTTP authentication schemes (digest, ntlm, negotiate, etc.)
    const token = getAccessToken(schemeKey);
    if (token) {
      const schemeName =
        scheme.scheme.charAt(0).toUpperCase() + scheme.scheme.slice(1);
      fetchOptions.headers.append("Authorization", `${schemeName} ${token}`);
    }
  } else if (scheme.type === "apiKey") {
    const apiKey = getApiKey(schemeKey);
    if (apiKey) {
      if (scheme.in === "header") {
        fetchOptions.headers.append(scheme.name, apiKey);
      } else if (scheme.in === "query") {
        // For query parameters, we need to modify the URL
        // This will be handled by the caller who has access to the URL
        fetchOptions.apiKeyParams = fetchOptions.apiKeyParams || {};
        fetchOptions.apiKeyParams[scheme.name] = apiKey;
      } else if (scheme.in === "cookie") {
        // For cross-origin requests, browsers prevent setting Cookie headers directly
        // We'll use a custom header instead that the server can recognize
        fetchOptions.headers.append(`X-API-Cookie-${scheme.name}`, apiKey);

        // Also set the cookie on the local domain for same-origin requests
        document.cookie = `${scheme.name}=${apiKey}; path=/`;

        console.log(
          `Applied API key cookie as custom header: X-API-Cookie-${scheme.name}=${apiKey}`
        );
      }
    }
  }
}

// OAuth handling functions
function handleOAuthResponse() {
  // Check if we have a hash fragment in the URL (token response)
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get("access_token");
    const state = params.get("state");
    const error = params.get("error");
    const storedState = localStorage.getItem("oauth_state");

    // Remove the state from storage
    localStorage.removeItem("oauth_state");

    // Check for errors
    if (error) {
      console.error("OAuth error:", error);
      window.utils.showToast(`Authentication error: ${error}`, "error");
      return;
    }

    // Validate state to prevent CSRF attacks
    if (state !== storedState) {
      console.error("OAuth state mismatch, possible CSRF attack");
      window.utils.showToast(
        "Security error: Invalid state parameter",
        "error"
      );
      return;
    } // Find the OAuth2 or OpenID Connect scheme key
    const oauthSchemeKey = Object.entries(securityConfig || {}).find(
      ([_, scheme]) =>
        scheme.type === "oauth2" || scheme.type === "openIdConnect"
    )?.[0];

    if (oauthSchemeKey && accessToken) {
      // Store the token
      setAccessToken(accessToken, oauthSchemeKey);
      window.utils.showToast("Successfully authenticated", "success");

      // Clean up the URL
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }
}

// Individual OAuth2 flow implementations
function initiateImplicitFlow(schemeKey, flow, scheme) {
  // Generate a random state value for security
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("oauth_state", state);

  // Construct the redirect URL
  const redirectUri = window.location.origin + window.location.pathname;

  // Get all available scopes
  const scopesParam = Object.keys(flow.scopes || {}).join(" ");

  // Build the authorization URL with parameters
  const authUrl = new URL(flow.authorizationUrl);
  if (!scheme.clientId) {
    console.error("Client ID not found in OAuth2 configuration");
    return;
  }

  authUrl.searchParams.append("client_id", scheme.clientId);
  authUrl.searchParams.append("response_type", "token");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scopesParam);
  authUrl.searchParams.append("state", state);

  // Redirect to the authorization URL
  window.location.href = authUrl.toString();
}

function initiateAuthorizationCodeFlow(schemeKey, flow, scheme) {
  // Generate a random state and code verifier for PKCE
  const state = Math.random().toString(36).substring(2, 15);
  const codeVerifier = Math.random().toString(36).substring(2, 128);

  localStorage.setItem("oauth_state", state);
  localStorage.setItem("oauth_code_verifier", codeVerifier);

  // Construct the redirect URL
  const redirectUri = window.location.origin + window.location.pathname;

  // Get all available scopes
  const scopesParam = Object.keys(flow.scopes || {}).join(" ");

  // Build the authorization URL with parameters
  const authUrl = new URL(flow.authorizationUrl);
  if (!scheme.clientId) {
    console.error("Client ID not found in OAuth2 configuration");
    return;
  }

  authUrl.searchParams.append("client_id", scheme.clientId);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scopesParam);
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("code_challenge", codeVerifier);
  authUrl.searchParams.append("code_challenge_method", "plain");

  // Redirect to the authorization URL
  window.location.href = authUrl.toString();
}

async function initiatePasswordFlow(schemeKey, flow, scheme) {
  const usernameInput = document.getElementById(`oauth-username-${schemeKey}`);
  const passwordInput = document.getElementById(`oauth-password-${schemeKey}`);

  if (!usernameInput || !passwordInput) {
    console.error("Username or password input not found");
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    window.utils.showToast("Please enter username and password", "error");
    return;
  }

  try {
    const response = await fetch(flow.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        username: username,
        password: password,
        client_id: scheme.clientId || "",
        scope: Object.keys(flow.scopes || {}).join(" "),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.access_token) {
      setAccessToken(data.access_token, schemeKey);
      window.utils.showToast("Successfully authenticated", "success");
    } else {
      throw new Error("No access token received");
    }
  } catch (error) {
    console.error("OAuth2 password flow error:", error);
    window.utils.showToast(`Authentication failed: ${error.message}`, "error");
  }
}

async function initiateClientCredentialsFlow(schemeKey, flow, scheme) {
  const clientIdInput = document.getElementById(`oauth-client-id-${schemeKey}`);
  const clientSecretInput = document.getElementById(
    `oauth-client-secret-${schemeKey}`
  );

  if (!clientIdInput || !clientSecretInput) {
    console.error("Client ID or client secret input not found");
    return;
  }

  const clientId = clientIdInput.value.trim();
  const clientSecret = clientSecretInput.value.trim();

  if (!clientId || !clientSecret) {
    window.utils.showToast("Please enter client ID and client secret", "error");
    return;
  }

  try {
    const response = await fetch(flow.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: Object.keys(flow.scopes || {}).join(" "),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.access_token) {
      setAccessToken(data.access_token, schemeKey);
      window.utils.showToast("Successfully authenticated", "success");
    } else {
      throw new Error("No access token received");
    }
  } catch (error) {
    console.error("OAuth2 client credentials flow error:", error);
    window.utils.showToast(`Authentication failed: ${error.message}`, "error");
  }
}

function initiateOAuthFlow(schemeKey) {
  const scheme = securityConfig[schemeKey];

  if (scheme.type === "oauth2") {
    // Determine which flow to use
    const flowSelect = document.getElementById(
      `oauth-flow-select-${schemeKey}`
    );
    const selectedFlow = flowSelect
      ? flowSelect.value
      : Object.keys(scheme.flows || {})[0];

    if (!selectedFlow || !scheme.flows[selectedFlow]) {
      console.error(
        "OAuth2 flow configuration not found for scheme:",
        schemeKey
      );
      return;
    }

    const flow = scheme.flows[selectedFlow];

    if (selectedFlow === "implicit") {
      initiateImplicitFlow(schemeKey, flow, scheme);
    } else if (selectedFlow === "authorizationCode") {
      initiateAuthorizationCodeFlow(schemeKey, flow, scheme);
    } else if (selectedFlow === "password") {
      initiatePasswordFlow(schemeKey, flow, scheme);
    } else if (selectedFlow === "clientCredentials") {
      initiateClientCredentialsFlow(schemeKey, flow, scheme);
    } else {
      console.error("Unsupported OAuth2 flow:", selectedFlow);
    }
  } else if (scheme.type === "openIdConnect") {
    if (!scheme.discoveredEndpoints) {
      console.error(
        "OpenID Connect endpoints not discovered yet for scheme:",
        schemeKey
      );
      window.utils.showToast(
        "OpenID Connect configuration is still loading. Please try again in a moment.",
        "warning"
      );
      return;
    }

    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("oauth_state", state);

    // Construct the redirect URL
    const redirectUri = window.location.origin + window.location.pathname;

    // Get all available scopes
    const scopesParam = scheme.discoveredEndpoints.scopes.join(" ");

    // Build the authorization URL with parameters
    const authUrl = new URL(scheme.discoveredEndpoints.authorizationUrl);
    if (!scheme.clientId) {
      console.error("Client ID not found in OpenID Connect configuration");
      return;
    }

    authUrl.searchParams.append("client_id", scheme.clientId);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopesParam);
    authUrl.searchParams.append("state", state);

    // Redirect to the authorization URL
    window.location.href = authUrl.toString();
  } else {
    console.error(
      "Unsupported authentication scheme type for OAuth flow:",
      scheme.type
    );
  }
}

function initAuth() {
  // Check existing tokens and validate them
  Object.keys(securityConfig || {}).forEach((schemeKey) => {
    const scheme = securityConfig[schemeKey];

    if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic") {
      // For Basic Auth, just check if credentials exist
      const credentials = getBasicAuthCredentials(schemeKey);
      if (credentials && credentials.username && credentials.password) {
        // Credentials exist, no expiration check needed for Basic Auth
        updateAuthStatus(schemeKey, true);
      }
    } else if (scheme.type === "apiKey") {
      // For API Key, just check if key exists
      const apiKey = getApiKey(schemeKey);
      if (apiKey) {
        // API key exists, no expiration check needed
        updateAuthStatus(schemeKey, true);
      }
    } else {
      // For token-based auth, check for expiration
      const existingToken = getAccessToken(schemeKey);
      if (existingToken) {
        if (isTokenExpired(existingToken)) {
          window.utils.showToast(
            `Previous ${schemeKey} session has expired. Please authenticate again.`,
            "warning"
          );
          clearAccessToken(schemeKey);
        } else {
          startExpirationCheck();
        }
      }
    }
  });

  updateAuthButtonStates();
  handleOAuthResponse();
  startExpirationCheck();
}

// Operation-level security handling
let currentOperationSecurity = null; // Store the current operation's security requirements

// Function to check if a security requirement is satisfied
function isSecurityRequirementSatisfied(requirement) {
  if (!requirement || typeof requirement !== "object") return false;

  // A requirement is an object like { "BearerAuth": [], "ApiKeyHeader": [] }
  // ALL schemes in the requirement must be satisfied (AND logic)
  const schemeKeys = Object.keys(requirement);

  for (const schemeKey of schemeKeys) {
    const scheme = securityConfig[schemeKey];
    if (!scheme) continue;

    let isAuthenticated = false;

    if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic") {
      const credentials = getBasicAuthCredentials(schemeKey);
      isAuthenticated = !!(
        credentials &&
        credentials.username &&
        credentials.password
      );
    } else if (scheme.type === "apiKey") {
      const apiKey = getApiKey(schemeKey);
      isAuthenticated = !!apiKey;
    } else {
      const token = getAccessToken(schemeKey);
      isAuthenticated = !!token && !isTokenExpired(token);
    }

    if (!isAuthenticated) {
      return false; // AND logic - if any scheme is not satisfied, requirement fails
    }
  }

  return schemeKeys.length > 0; // Only satisfied if there were schemes to check
}

// Function to check if any security requirement is satisfied
function isAnySecurityRequirementSatisfied(securityRequirements) {
  if (!securityRequirements || !Array.isArray(securityRequirements))
    return false;

  // Empty security array means no authentication required
  if (securityRequirements.length === 0) return true;

  // OR logic - any requirement being satisfied is enough
  return securityRequirements.some((requirement) =>
    isSecurityRequirementSatisfied(requirement)
  );
}

// Function to get satisfied security schemes for a requirement
function getSatisfiedSchemes(requirement) {
  if (!requirement || typeof requirement !== "object") return [];

  const satisfiedSchemes = [];
  const schemeKeys = Object.keys(requirement);

  for (const schemeKey of schemeKeys) {
    const scheme = securityConfig[schemeKey];
    if (!scheme) continue;

    let isAuthenticated = false;

    if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic") {
      const credentials = getBasicAuthCredentials(schemeKey);
      isAuthenticated = !!(
        credentials &&
        credentials.username &&
        credentials.password
      );
    } else if (scheme.type === "apiKey") {
      const apiKey = getApiKey(schemeKey);
      isAuthenticated = !!apiKey;
    } else {
      const token = getAccessToken(schemeKey);
      isAuthenticated = !!token && !isTokenExpired(token);
    }

    if (isAuthenticated) {
      satisfiedSchemes.push(schemeKey);
    }
  }

  return satisfiedSchemes;
}

// Function to set the current operation's security requirements
function setCurrentOperationSecurity(operationSecurity) {
  currentOperationSecurity = operationSecurity;

  // Auto-select required security scheme if applicable
  autoSelectRequiredScheme(operationSecurity);

  // Update UI to show security status for this operation
  updateOperationSecurityStatus();
}

// Function to automatically select required security scheme in dropdown
function autoSelectRequiredScheme(operationSecurity) {
  const schemeSelect = document.getElementById("security-scheme-select");
  if (
    !schemeSelect ||
    !operationSecurity ||
    !Array.isArray(operationSecurity)
  ) {
    return;
  }

  // Collect all schemes mentioned in the operation security requirements
  const requiredSchemes = new Set();
  const satisfiedSchemes = new Set();

  operationSecurity.forEach((requirement) => {
    Object.keys(requirement).forEach((schemeKey) => {
      if (securityConfig[schemeKey]) {
        requiredSchemes.add(schemeKey);

        // Check if this scheme is currently satisfied
        if (
          isSecurityRequirementSatisfied({
            [schemeKey]: requirement[schemeKey],
          })
        ) {
          satisfiedSchemes.add(schemeKey);
        }
      }
    });
  });

  if (requiredSchemes.size === 0) {
    return; // No schemes to select
  }

  let selectedScheme = null;
  let selectionReason = "";

  // Priority 1: If only one scheme is required across all requirements, select it
  if (requiredSchemes.size === 1) {
    selectedScheme = Array.from(requiredSchemes)[0];
    selectionReason = "single required scheme";
  }
  // Priority 2: If multiple schemes are required but only one is satisfied, select it
  else if (satisfiedSchemes.size === 1) {
    selectedScheme = Array.from(satisfiedSchemes)[0];
    selectionReason = "only satisfied scheme";
  }
  // Priority 3: If multiple schemes are satisfied, select the first one from the first requirement
  else if (satisfiedSchemes.size > 1) {
    // Find the first satisfied scheme in the first security requirement
    for (const requirement of operationSecurity) {
      const requirementSchemes = Object.keys(requirement);
      for (const schemeKey of requirementSchemes) {
        if (satisfiedSchemes.has(schemeKey)) {
          selectedScheme = schemeKey;
          selectionReason = "first satisfied scheme";
          break;
        }
      }
      if (selectedScheme) break;
    }
  }
  // Priority 4: If no schemes are satisfied, select the first scheme from the first requirement
  else {
    const firstRequirement = operationSecurity[0];
    const firstSchemeKey = Object.keys(firstRequirement)[0];
    if (firstSchemeKey && securityConfig[firstSchemeKey]) {
      selectedScheme = firstSchemeKey;
      selectionReason = "first required scheme (not authenticated)";
    }
  }

  // Apply the selection if we found a scheme to select
  if (selectedScheme && schemeSelect.value !== selectedScheme) {
    // Check if the scheme exists in the dropdown
    const option = Array.from(schemeSelect.options).find(
      (opt) => opt.value === selectedScheme
    );
    if (option) {
      schemeSelect.value = selectedScheme;

      // Trigger the change event to update the UI
      schemeSelect.dispatchEvent(new Event("change"));

      // Add visual indicator for auto-selection
      addAutoSelectionIndicator(
        selectedScheme,
        selectionReason,
        requiredSchemes.size
      );
    }
  }
}

// Function to add visual indicator for auto-selection
function addAutoSelectionIndicator(selectedScheme, reason, totalSchemes) {
  // Remove any existing auto-selection indicator
  const existingIndicator = document.getElementById("auto-selection-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }

  // Only show indicator if there were multiple schemes to choose from
  if (totalSchemes <= 1) return;

  const schemeSelect = document.getElementById("security-scheme-select");
  if (!schemeSelect) return;

  const indicator = document.createElement("div");
  indicator.id = "auto-selection-indicator";
  indicator.className =
    "mt-2 p-2 bg-blue-900/5 border border-blue-600 rounded text-xs text-blue-400";
  const robotIcon = `<svg class="w-4 h-4 inline mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
  </svg>`;

  let message = `Auto-selected "${selectedScheme}"`;

  if (reason === "single required scheme") {
    message += " (only scheme required)";
  } else if (reason === "only satisfied scheme") {
    message += " (only authenticated scheme)";
  } else if (reason === "first satisfied scheme") {
    message += " (multiple valid options available)";
  } else if (reason === "first required scheme (not authenticated)") {
    message += " (authentication needed)";
  }

  indicator.innerHTML = robotIcon + message;

  schemeSelect.parentNode.insertBefore(indicator, schemeSelect.nextSibling);

  // Auto-remove the indicator after 5 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.remove();
    }
  }, 5000);
}

// Function to update UI based on operation security status
function updateOperationSecurityStatus() {
  // Update the vertical menu auth icon
  const authIcon = document.querySelector(
    '.vertical-menu-icon[data-section="auth"] svg'
  );
  const authIconPath = authIcon ? authIcon.querySelector("path") : null;
  if (authIconPath) {
    // SVG paths for locked and unlocked icons
    const lockedIconPath =
      "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z";
    const unlockedIconPath =
      "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm2-10V7a4 4 0 10-8 0";

    if (!currentOperationSecurity) {
      // No operation selected, show locked icon
      authIconPath.setAttribute("d", lockedIconPath);
      return;
    }

    // Check if current operation is authorized
    const isAuthorized = isAnySecurityRequirementSatisfied(
      currentOperationSecurity
    );

    // Update icon based on operation authorization status
    if (isAuthorized) {
      authIconPath.setAttribute("d", unlockedIconPath);
    } else {
      authIconPath.setAttribute("d", lockedIconPath);
    }
  }

  if (!currentOperationSecurity) return;

  const authSection = document.getElementById("auth-section");
  if (!authSection) return;

  // Find or create operation security status element
  let statusElement = document.getElementById("operation-security-status");
  if (!statusElement) {
    statusElement = document.createElement("div");
    statusElement.id = "operation-security-status";
    statusElement.className = "mb-4";

    const content = document.querySelector("#auth-section .p-6");
    if (content) {
      content.insertBefore(statusElement, content.firstChild);
    }
  }
  const isAuthorized = isAnySecurityRequirementSatisfied(
    currentOperationSecurity
  );

  // Create the operation-specific security explanation
  const explanation = createOperationSecurityExplanation(
    currentOperationSecurity
  );
  // Add overall status
  let statusHtml = `
    <div class="flex items-center mb-3 p-3 rounded-lg border ${
      isAuthorized
        ? "bg-green-900/5 border-green-600 text-green-400"
        : "bg-red-900/5 border-red-600 text-red-400"
    }">
      <div class="w-3 h-3 rounded-full mr-3 ${
        isAuthorized ? "bg-green-500" : "bg-red-500"
      }"></div>
      <span class="font-medium text-lg flex items-center">
        ${
          isAuthorized
            ? `<svg class="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>Operation authenticated`
            : `<svg class="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
              </svg>Authentication required`
        }
      </span>
    </div>
  `;

  statusHtml += explanation;

  statusElement.innerHTML = statusHtml;
}

// Function to create operation-specific security explanation
function createOperationSecurityExplanation(operationSecurity) {
  if (
    !operationSecurity ||
    !Array.isArray(operationSecurity) ||
    operationSecurity.length === 0
  ) {
    return `<div class="text-sm text-gray-400 mb-4">No authentication required for this operation.</div>`;
  }
  let explanation = `<div class="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">`;
  explanation += `<h4 class="text-sm font-medium text-gray-200 mb-2 flex items-center">
    Authentication Requirements for this Operation:
  </h4>`;

  if (operationSecurity.length === 1) {
    // Single security requirement
    const requirement = operationSecurity[0];
    const schemeKeys = Object.keys(requirement);
    if (schemeKeys.length === 0) {
      explanation += `<div class="text-sm text-green-400 flex items-center">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        No authentication required
      </div>`;
    } else if (schemeKeys.length === 1) {
      explanation += `<div class="text-sm text-gray-300">Requires: <span class="text-blue-400 font-medium">${schemeKeys[0]}</span></div>`;
    } else {
      explanation += `<div class="text-sm text-gray-300">Requires <span class="text-yellow-400 font-medium">ALL</span> of the following:</div>`;
      explanation += `<ul class="list-disc list-inside ml-4 mt-1 text-sm text-gray-300">`;
      schemeKeys.forEach((key) => {
        explanation += `<li><span class="text-blue-400">${key}</span></li>`;
      });
      explanation += `</ul>`;
    }
  } else {
    // Multiple security requirements (OR logic)
    explanation += `<div class="text-sm text-gray-300 mb-2">Choose <span class="text-green-400 font-medium">ONE</span> of the following options:</div>`;

    // Count total available schemes and satisfied ones
    const allSchemes = new Set();
    const allSatisfiedSchemes = new Set();
    operationSecurity.forEach((requirement) => {
      Object.keys(requirement).forEach((key) => {
        allSchemes.add(key);
        if (isSecurityRequirementSatisfied({ [key]: requirement[key] })) {
          allSatisfiedSchemes.add(key);
        }
      });
    }); // Add note about multiple options if applicable
    if (allSchemes.size > 1) {
      explanation += `<div class="text-xs text-blue-400 mb-3 p-2 bg-blue-900/5 rounded border border-blue-600 flex items-start">
        <svg class="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <span>
          ${allSchemes.size} authentication schemes available. 
          ${
            allSatisfiedSchemes.size > 0
              ? `${allSatisfiedSchemes.size} currently authenticated.`
              : "None currently authenticated."
          }
          ${allSchemes.size > 1 ? " Auto-selection may apply." : ""}
        </span>
      </div>`;
    }

    explanation += `<div class="space-y-2">`;
    operationSecurity.forEach((requirement, index) => {
      const schemeKeys = Object.keys(requirement);
      const isSatisfied = isSecurityRequirementSatisfied(requirement);

      explanation += `<div class="flex items-start gap-2 p-2 rounded ${
        isSatisfied ? "bg-green-900/5 border border-green-600" : "bg-gray-700"
      }">`;

      // Status icon
      explanation += `<span class="flex-shrink-0 mt-0.5">
        ${
          isSatisfied
            ? `<svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>`
            : `<svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>`
        }
      </span>`;

      explanation += `<div class="flex-1">`;

      if (schemeKeys.length === 0) {
        explanation += `<span class="text-sm text-green-400">No authentication</span>`;
      } else if (schemeKeys.length === 1) {
        explanation += `<span class="text-sm text-blue-400 font-medium">${schemeKeys[0]}</span>`;
      } else {
        explanation += `<div class="text-sm text-gray-300">`;
        explanation += `<span class="text-yellow-400 font-medium">ALL</span> of: `;
        explanation += schemeKeys
          .map((key) => `<span class="text-blue-400">${key}</span>`)
          .join(" + ");
        explanation += `</div>`;
      }

      explanation += `</div></div>`;
    });

    explanation += `</div>`;
  }

  explanation += `</div>`;
  return explanation;
}

// Export all module functions at the end of the file
window.auth = {
  initializeSecurityConfig,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getBasicAuthCredentials,
  setBasicAuthCredentials,
  clearBasicAuthCredentials,
  getApiKey,
  setApiKey,
  clearApiKey,
  toggleAuth,
  addAuthorizationHeader,
  initAuth,
  createAuthSection,
  parseJwt,
  isTokenExpired,
  getTimeUntilExpiration,
  updateAuthStatus,
  updateAuthButtonStates,
  updateSecuritySchemeDropdown,
  fetchOpenIdConnectDiscovery,
  setCurrentOperationSecurity,
  createOperationSecurityExplanation,
  autoSelectRequiredScheme,
};
