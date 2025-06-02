// Functions to load and parse Swagger data
// All dependencies are now loaded globally

// Function to find a matching endpoint from a clean path
function findEndpointFromCleanPath(path, method) {
  if (!swaggerData || !swaggerData.paths) return null;

  // Use the common utility function if available, otherwise fallback
  const cleanPath =
    window.utils && window.utils.createCleanPath
      ? window.utils.createCleanPath(path)
      : path.replace(/[{}]/g, "");

  for (const [swaggerPath, pathObj] of Object.entries(swaggerData.paths)) {
    // Use the common utility function if available, otherwise fallback
    const swaggerCleanPath =
      window.utils && window.utils.createCleanPath
        ? window.utils.createCleanPath(swaggerPath)
        : swaggerPath.replace(/[{}]/g, "");

    if (swaggerCleanPath === cleanPath && pathObj[method]) {
      return [swaggerPath, method];
    }
  }
  return null;
}

// Function to fetch and parse swagger.json
async function loadSwaggerSpec(swaggerJsonUrl) {
  try {
    const response = await fetch(swaggerJsonUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setSwaggerData(data);

    // Dispatch custom event that swagger data has been loaded
    document.dispatchEvent(
      new CustomEvent("swaggerDataLoaded", { detail: data })
    ); // Set API title and version in CollectionRunner
    if (
      data.info &&
      data.info.title &&
      data.info.version &&
      window.collectionRunner
    ) {
      window.collectionRunner.apiTitle = data.info.title;
      window.collectionRunner.apiVersion = data.info.version;
    }

    // Update the base URL with the server URL from Swagger
    if (typeof updateBaseUrl === "function") {
      updateBaseUrl(data);
    } // Initialize security configuration from swagger data
    if (
      window.auth &&
      typeof window.auth.initializeSecurityConfig === "function"
    ) {
      window.auth.initializeSecurityConfig(data);
      window.auth.initAuth();
    }

    buildSidebar();
    buildMainContent();

    // Check for hash in URL
    const hash = window.location.hash;
    if (hash) {
      // Hash format: #method-path (e.g., #get-/api/users)
      const parts = hash.substring(1).split("-");
      if (parts.length >= 2) {
        const method = parts[0];
        const path = parts.slice(1).join("-");
        // Find the matching endpoint using clean path
        const endpoint = findEndpointFromCleanPath(path, method);
        if (endpoint) {
          const [swaggerPath, swaggerMethod] = endpoint;
          const endpointLink = document.querySelector(
            `.endpoint-link[data-path="${swaggerPath}"][data-method="${swaggerMethod}"]`
          );
          if (endpointLink) {
            endpointLink.click();
            return;
          }
        }
      }
    }

    // If no hash or endpoint not found, select the first endpoint
    const firstEndpointLink = document.querySelector(".endpoint-link");
    if (firstEndpointLink) {
      firstEndpointLink.click();
    }
  } catch (error) {
    console.error("Could not load Swagger spec:", error);
    const mainContent = document.getElementById("api-main-content");
    if (mainContent) {
      mainContent.innerHTML =
        '<p class="text-red-500">Error loading API specification. Please check console.</p>';
    }
  }
}

// Function is now globally available
