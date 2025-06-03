// Global configuration and state variables

// API Base URL and other state variables
let baseUrl = "https://localhost:7030/";
window.swaggerData = null;
let currentPath = null; // Store the current path
let currentMethod = null; // Store the current method

// Update base URL when Swagger data is loaded
function updateBaseUrl(swagger) {
  if (swagger?.servers?.[0]?.url) {
    baseUrl = swagger.servers[0].url;
  }
}

// Global variable to track current view mode (list or tree)
let viewMode = "list";

function setSwaggerData(data) {
  swaggerData = data;

  // Update the browser tab title with the API name
  if (data && data.info && data.info.title) {
    const originalTitle = "OpenAPI UI";
    document.title = `${data.info.title} - ${originalTitle}`;
  }
}

function setCurrentPath(path) {
  currentPath = path;
}

function setCurrentMethod(method) {
  currentMethod = method;
}

function setViewMode(mode) {
  viewMode = mode;
}

// Export baseUrl for use in other modules
function getBaseUrl() {
  return baseUrl;
}
