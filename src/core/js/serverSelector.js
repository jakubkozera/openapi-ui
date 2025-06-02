// Server selector functionality for OpenAPI servers property

// Global variables for server management
let currentServerIndex = 0;
let resolvedServerUrls = [];

/**
 * Get storage key for server selection with API prefix
 * @returns {string} Storage key
 */
function getServerStorageKey() {
  if (window.swaggerData?.info?.title && window.swaggerData?.info?.version) {
    const apiTitle = window.swaggerData.info.title
      .toLowerCase()
      .replace(/\s+/g, "_");
    const apiVersion = window.swaggerData.info.version
      .toLowerCase()
      .replace(/\s+/g, "_");
    return `${apiTitle}_${apiVersion}_selected_server_index`;
  }
  return "openapi_ui_selected_server_index";
}

/**
 * Resolve server URL by replacing variables with their values
 * @param {Object} server - Server object from OpenAPI spec
 * @param {Object} variableValues - Values for server variables
 * @returns {string} Resolved URL
 */
function resolveServerUrl(server, variableValues = {}) {
  let url = server.url;

  if (server.variables) {
    Object.entries(server.variables).forEach(([name, variable]) => {
      const value = variableValues[name] || variable.default || "";
      const pattern = new RegExp(`\\{${name}\\}`, "g");
      url = url.replace(pattern, value);
    });
  }

  return url;
}

/**
 * Resolve all server URLs with default variable values
 * @param {Array} servers - Array of server objects
 * @returns {Array} Array of resolved server URLs with metadata
 */
function resolveAllServerUrls(servers) {
  if (!servers || servers.length === 0) {
    return [
      { url: window.location.origin, description: "Current origin", index: 0 },
    ];
  }

  return servers.map((server, index) => {
    const resolvedUrl = resolveServerUrl(server);
    return {
      url: resolvedUrl,
      description: server.description || `Server ${index + 1}`,
      originalServer: server,
      index,
    };
  });
}

/**
 * Update the base URL configuration when server changes
 * @param {number} serverIndex - Index of selected server
 */
function updateSelectedServer(serverIndex) {
  if (serverIndex >= 0 && serverIndex < resolvedServerUrls.length) {
    currentServerIndex = serverIndex;

    // Update the global baseUrl in config.js
    const selectedServer = resolvedServerUrls[serverIndex];
    if (typeof updateBaseUrl === "function") {
      updateBaseUrl({ servers: [{ url: selectedServer.url }] });
    }

    // Update the global baseUrl variable
    if (window.getBaseUrl) {
      window.baseUrl = selectedServer.url;
    }

    // Save selection to localStorage
    localStorage.setItem(getServerStorageKey(), serverIndex.toString());

    // Update UI to reflect the change
    updateServerSelectorUI();

    // Show toast notification
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(
        `Server updated to: ${selectedServer.url}`,
        "success"
      );
    }
  }
}

/**
 * Load saved server selection from localStorage
 */
function loadSavedServerSelection() {
  const savedIndex = localStorage.getItem(getServerStorageKey());
  if (savedIndex !== null) {
    const index = parseInt(savedIndex, 10);
    if (index >= 0 && index < resolvedServerUrls.length) {
      currentServerIndex = index;
      updateSelectedServer(index);
    }
  }
}

/**
 * Create server variable input controls
 * @param {Object} server - Server object with variables
 * @param {number} serverIndex - Index of the server
 * @returns {string} HTML for variable controls
 */
function createServerVariableControls(server, serverIndex) {
  if (!server.variables || Object.keys(server.variables).length === 0) {
    return "";
  }

  let variableHtml =
    '<div class="server-variables mt-2 p-3 bg-gray-50 rounded border">';
  variableHtml +=
    '<div class="text-sm font-medium text-gray-700 mb-2">Server Variables:</div>';

  Object.entries(server.variables).forEach(([name, variable]) => {
    const variableId = `server-var-${serverIndex}-${name}`;
    variableHtml += `<div class="flex items-center mb-2">`;
    variableHtml += `<label for="${variableId}" class="text-xs text-gray-600 w-24">${name}:</label>`;

    if (variable.enum && variable.enum.length > 0) {
      // Dropdown for enum values
      variableHtml += `<select id="${variableId}" class="ml-2 px-2 py-1 text-xs border border-gray-300 rounded flex-1" onchange="updateServerVariable(${serverIndex}, '${name}', this.value)">`;
      variable.enum.forEach((value) => {
        const selected = value === variable.default ? "selected" : "";
        variableHtml += `<option value="${value}" ${selected}>${value}</option>`;
      });
      variableHtml += `</select>`;
    } else {
      // Text input for other values
      variableHtml += `<input type="text" id="${variableId}" value="${
        variable.default || ""
      }" class="ml-2 px-2 py-1 text-xs border border-gray-300 rounded flex-1" onchange="updateServerVariable(${serverIndex}, '${name}', this.value)">`;
    }

    if (variable.description) {
      variableHtml += `<span class="ml-2 text-xs text-gray-500" title="${variable.description}">ⓘ</span>`;
    }
    variableHtml += `</div>`;
  });

  variableHtml += "</div>";
  return variableHtml;
}

/**
 * Update server variable value and re-resolve URL
 * @param {number} serverIndex - Index of the server
 * @param {string} variableName - Name of the variable
 * @param {string} value - New value for the variable
 */
function updateServerVariable(serverIndex, variableName, value) {
  if (serverIndex >= 0 && serverIndex < resolvedServerUrls.length) {
    const serverData = resolvedServerUrls[serverIndex];
    const server = serverData.originalServer;

    // Get current variable values from UI
    const variableValues = {};
    if (server.variables) {
      Object.keys(server.variables).forEach((varName) => {
        const input = document.getElementById(
          `server-var-${serverIndex}-${varName}`
        );
        if (input) {
          variableValues[varName] = input.value;
        }
      });
    }

    // Update the specific variable
    variableValues[variableName] = value;

    // Re-resolve the URL
    const newUrl = resolveServerUrl(server, variableValues);

    // Update the resolved URL
    resolvedServerUrls[serverIndex].url = newUrl;

    // If this is the currently selected server, update the base URL
    if (serverIndex === currentServerIndex) {
      updateSelectedServer(serverIndex);
    }

    // Update the display
    updateServerSelectorUI();
  }
}

/**
 * Update the server selector UI to reflect current selection
 */
function updateServerSelectorUI() {
  const serverSelect = document.getElementById("server-selector");
  const serverUrlDisplay = document.getElementById("current-server-url");

  if (serverSelect) {
    serverSelect.value = currentServerIndex.toString();
  }

  if (serverUrlDisplay && resolvedServerUrls[currentServerIndex]) {
    serverUrlDisplay.textContent = resolvedServerUrls[currentServerIndex].url;
  }
}

/**
 * Create and render the server selector UI
 */
function renderServerSelector() {
  if (
    !window.swaggerData ||
    !window.swaggerData.servers ||
    window.swaggerData.servers.length === 0
  ) {
    return; // No servers to display
  }

  // Resolve all server URLs
  resolvedServerUrls = resolveAllServerUrls(window.swaggerData.servers);

  // Find the container for the server selector (add it after the title)
  const mainContent = document.getElementById("api-main-content");
  if (!mainContent) return;

  // Check if server selector already exists
  let serverContainer = document.getElementById("server-selector-container");
  if (!serverContainer) {
    // Create the server selector container
    serverContainer = document.createElement("div");
    serverContainer.id = "server-selector-container";
    serverContainer.className =
      "mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm";

    // Insert after the title
    const title = mainContent.querySelector("h1");
    if (title && title.nextSibling) {
      title.parentNode.insertBefore(serverContainer, title.nextSibling);
    } else if (title) {
      title.parentNode.appendChild(serverContainer);
    } else {
      mainContent.insertBefore(serverContainer, mainContent.firstChild);
    }
  }

  // Build the server selector HTML
  let selectorHtml = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold text-gray-800">API Server</h3>
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span id="current-server-url" class="font-mono">${
          resolvedServerUrls[currentServerIndex]?.url || ""
        }</span>
      </div>
    </div>
  `;

  if (resolvedServerUrls.length > 1) {
    selectorHtml += `
      <div class="flex items-center mb-3">
        <label for="server-selector" class="text-sm font-medium text-gray-700 mr-3">Select Server:</label>
        <select id="server-selector" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" onchange="updateSelectedServer(parseInt(this.value))">
    `;

    resolvedServerUrls.forEach((server, index) => {
      const selected = index === currentServerIndex ? "selected" : "";
      selectorHtml += `<option value="${index}" ${selected}>${server.description} - ${server.url}</option>`;
    });

    selectorHtml += `
        </select>
      </div>
    `;
  }

  // Add server variables if the current server has them
  const currentServer = window.swaggerData.servers[currentServerIndex];
  if (currentServer) {
    selectorHtml += createServerVariableControls(
      currentServer,
      currentServerIndex
    );
  }

  serverContainer.innerHTML = selectorHtml;

  // Load saved selection
  loadSavedServerSelection();
}

/**
 * Initialize the server selector when swagger data is loaded
 */
function initServerSelector() {
  if (window.swaggerData && window.swaggerData.servers) {
    renderServerSelector();
  }
}

// Make functions globally available
window.updateServerVariable = updateServerVariable;
window.updateSelectedServer = updateSelectedServer;

// Export the server selector functionality
window.serverSelector = {
  initServerSelector,
  renderServerSelector,
  updateSelectedServer,
  resolveServerUrl,
  resolveAllServerUrls,
  updateServerVariable,
  getCurrentServerUrl: () =>
    resolvedServerUrls[currentServerIndex]?.url || window.location.origin,
};
