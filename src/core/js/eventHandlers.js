// DOM event handlers and initialization

// Update execute button color to match the HTTP verb
function updateExecuteButtonColor(method) {
  const executeRequestBtn = document.getElementById("executeRequestBtn");
  if (!executeRequestBtn || !method) return;

  // Get the base classes for the button excluding background and text color
  const baseClasses =
    "flex items-center hover:bg-opacity-80 font-bold py-1.5 px-3 rounded";

  // Extract just the background color based on the HTTP method
  let bgColorClass = "";
  switch (method.trim().toUpperCase()) {
    case "GET":
      bgColorClass = "bg-green-600";
      break;
    case "POST":
      bgColorClass = "bg-blue-600";
      break;
    case "PUT":
      bgColorClass = "bg-yellow-500";
      break;
    case "PATCH":
      bgColorClass = "bg-yellow-400";
      break;
    case "DELETE":
      bgColorClass = "bg-red-600";
      break;
    case "HEAD":
      bgColorClass = "bg-purple-600";
      break;
    case "OPTIONS":
      bgColorClass = "bg-gray-500";
      break;
    default:
      bgColorClass = "bg-gray-600";
  }

  // Set the button classes
  executeRequestBtn.className = `${baseClasses} ${bgColorClass} text-white`;
}

// Function to navigate to an endpoint from hash
function navigateToEndpointFromHash() {
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
          // Trigger click on the sidebar link
          endpointLink.click();

          // Also ensure the section is expanded
          const sectionId = generateSectionId(swaggerPath, swaggerMethod);
          const section = document.getElementById(sectionId);
          if (section) {
            // When navigating directly to an endpoint, we should check if there's a saved preference
            const outlineButton = section.querySelector(".outline-btn");
            const contentDiv = section.querySelector(".flex-1");

            if (outlineButton && contentDiv) {
              const content = [...contentDiv.children].slice(1);
              const svg = outlineButton.querySelector("svg");

              // Check if there's a saved preference
              if (
                window.swaggerData &&
                window.swaggerData.info &&
                window.swaggerData.info.title &&
                window.swaggerData.info.version
              ) {
                const apiTitle = window.swaggerData.info.title
                  .toLowerCase()
                  .replace(/\s+/g, "_");
                const apiVersion = window.swaggerData.info.version
                  .toLowerCase()
                  .replace(/\s+/g, "_");
                const savedState = localStorage.getItem(
                  `${apiTitle}_${apiVersion}_outline_expanded_${sectionId}`
                );

                // If there's an explicit preference to expand, or if we're navigating from a hash and no preference exists
                if (savedState === "true" || (hash && !savedState)) {
                  // Remove hidden class from content
                  content.forEach((element) =>
                    element.classList.remove("hidden")
                  );

                  // Rotate arrow to expanded state
                  if (svg) {
                    svg.style.transform = "rotate(90deg)";
                  }
                }
              }
            }
            // Scroll into view with a slight delay to ensure everything is rendered
            setTimeout(() => {
              section.scrollIntoView({ behavior: "smooth" });
            }, 600);
          }

          // Update code snippet section with the current endpoint
          updateCodeSnippetSection(swaggerPath, swaggerMethod);
        }
      }
    }
  }
}

// Function to update the code snippet section with endpoint details
function updateCodeSnippetSection(path, method) {
  // Update the snippet method and path display
  const snippetMethodElement = document.querySelector("#snippet-method");
  const snippetPathElement = document.querySelector("#snippet-path");

  if (snippetMethodElement && snippetPathElement) {
    snippetMethodElement.textContent = method.toUpperCase();
    snippetMethodElement.className =
      getMethodClass(method) + " text-white px-2 py-0.5 text-xs rounded mr-2";
    snippetPathElement.textContent = path;
  }

  // If currently viewing code snippet section, regenerate the snippet
  const codeSnippetSection = document.getElementById("code-snippet-section");
  if (codeSnippetSection && codeSnippetSection.classList.contains("active")) {
    setTimeout(() => {
      // Import the module to avoid circular dependency
      if (typeof generateCodeSnippet === "function") {
        generateCodeSnippet();
      }
    }, 100);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadSwaggerSpec("swagger.json");

  // Set up sidebar search functionality
  const sidebarSearch = document.getElementById("sidebar-search");
  if (sidebarSearch) {
    sidebarSearch.addEventListener("input", (e) => {
      filterSidebar(e.target.value);
    });
  }

  // Set up view toggle event listeners
  initViewToggles();

  // Set up execute request button
  initExecuteRequestButton(); // Setup copy to clipboard buttons
  initCopyButtons();

  // Handle hash changes (browser back/forward)
  window.addEventListener("hashchange", navigateToEndpointFromHash);

  // Initialize the vertical menu
  initVerticalMenu();
});

// Initialize the view mode toggle buttons
function initViewToggles() {
  const viewListBtn = document.getElementById("view-list");
  const viewTreeBtn = document.getElementById("view-tree");

  if (viewListBtn && viewTreeBtn) {
    // Initialize the correct button state on page load
    updateViewToggleButtons();

    viewListBtn.addEventListener("click", () => {
      // Always update when clicked, regardless of current state
      setViewMode("list");
      updateViewToggleButtons();
      buildSidebar(); // Rebuild the sidebar with the new view mode
    });

    viewTreeBtn.addEventListener("click", () => {
      // Always update when clicked, regardless of current state
      setViewMode("tree");
      updateViewToggleButtons();
      buildSidebar(); // Rebuild the sidebar with the new view mode
    });
  }
}

// Function to update the active state of view toggle buttons
function updateViewToggleButtons() {
  const viewListBtn = document.getElementById("view-list");
  const viewTreeBtn = document.getElementById("view-tree");

  // Ensure buttons are found before attempting to modify their class lists
  if (viewListBtn && viewTreeBtn) {
    // Explicitly remove 'active-view' from both buttons first
    viewListBtn.classList.remove("active-view");
    viewTreeBtn.classList.remove("active-view");

    // Then, add 'active-view' to the button corresponding to the current viewMode
    if (viewMode === "list") {
      viewListBtn.classList.add("active-view");
    } else if (viewMode === "tree") {
      viewTreeBtn.classList.add("active-view");
    }
  }
}

// Initialize the execute request button
function initExecuteRequestButton() {
  const executeRequestBtn = document.getElementById("executeRequestBtn");
  if (executeRequestBtn) {
    // Set initial button color if method element exists
    const methodElement = document.querySelector("#right-panel-method");
    if (methodElement && methodElement.textContent) {
      updateExecuteButtonColor(currentMethod);
    }

    executeRequestBtn.addEventListener("click", async () => {
      // Show loading overlay
      const loader = document.getElementById("try-it-out-loader");
      loader.classList.remove("hidden");

      const pathElement = document.querySelector("#right-panel-path");
      const methodElement = document.querySelector("#right-panel-method");

      if (!pathElement || !methodElement || !swaggerData) {
        console.error(
          "Missing current path, method, or Swagger data for execution."
        );
        displayActualResponse(
          {
            status: "Error",
            statusText: "Client Error",
            headers: new Headers(),
            body: "Missing current path, method, or Swagger data for execution.",
          },
          true
        );
        return;
      }
      let currentPath = pathElement.textContent;
      const currentMethod = methodElement.textContent.toUpperCase();

      // Update the execute button color based on the HTTP verb
      updateExecuteButtonColor(currentMethod);

      const apiResponseSection = document.getElementById(
        "api-response-section"
      ); // Make sure Monaco editor is initialized
      if (!window.responseBodyEditor) {
        try {
          await window.initMonacoEditor();
        } catch (error) {
          console.error("Error initializing Monaco editor:", error);
        }
      }
      const actualResponseStatusCodeDisplay = document.getElementById(
        "actual-response-status-code-display"
      );
      const actualResponseContentType = document.getElementById(
        "actual-response-content-type"
      );
      if (apiResponseSection) apiResponseSection.classList.remove("hidden");
      if (window.responseBodyEditor) {
        window.responseBodyEditor.setValue("Executing request...");
      }
      if (actualResponseStatusCodeDisplay)
        actualResponseStatusCodeDisplay.textContent = "";
      if (actualResponseContentType) actualResponseContentType.textContent = "";

      // Get parameters and handle path and query parameters separately
      const queryParams = new URLSearchParams();
      const pathParams = new Map();
      const pathParametersContainer = document.getElementById(
        "right-panel-path-parameters-container"
      );
      const queryParametersContainer = document.getElementById(
        "right-panel-query-parameters-container"
      ); // Process path parameters
      if (pathParametersContainer) {
        pathParametersContainer
          .querySelectorAll("input, select, textarea")
          .forEach((input) => {
            if (input.name && input.value) {
              // Apply variable replacement
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              // Store path parameters
              pathParams.set(input.name, processedValue);
            }
          });
      } // Process query parameters
      if (queryParametersContainer) {
        queryParametersContainer
          .querySelectorAll("input, select, textarea")
          .forEach((input) => {
            if (input.name && input.value) {
              if (input.type === "checkbox") {
                // Handle checkbox query parameters
                if (input.checked) {
                  // Apply variable replacement to checkbox values
                  const processedValue = window.replaceVariables
                    ? window.replaceVariables(input.value)
                    : input.value;
                  queryParams.append(input.name, processedValue);
                }
              } else {
                // Handle standard query parameters with variable replacement
                const processedValue = window.replaceVariables
                  ? window.replaceVariables(input.value)
                  : input.value;
                queryParams.append(input.name, processedValue);
              }
            }
          });
      }

      // Replace path parameters in the URL
      pathParams.forEach((value, name) => {
        const paramPattern = new RegExp(`\\{${name}\\}`, "g");
        currentPath = currentPath.replace(paramPattern, value);
      });

      // Add query parameters to URL
      const queryString = queryParams.toString();
      if (queryString) {
        currentPath += `?${queryString}`;
      } // Prepare headers
      const fetchHeaders = new Headers();
      const headersContainer = document.getElementById(
        "right-panel-headers-container"
      );
      if (headersContainer) {
        headersContainer
          .querySelectorAll("input, select, textarea")
          .forEach((input) => {
            if (input.name && input.value) {
              // Apply variable replacement to header values
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              fetchHeaders.append(input.name, processedValue);
            }
          });
      } // Prepare body and Content-Type header
      let requestBody = undefined;
      const requestBodyContentTypeSelect = document.getElementById(
        "right-panel-request-body-content-type-select"
      );
      const selectedContentType = requestBodyContentTypeSelect
        ? requestBodyContentTypeSelect.value
        : null;
      if (selectedContentType === "application/x-www-form-urlencoded") {
        // Handle form-encoded data
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const formData = new URLSearchParams();
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name && input.value) {
              // Apply variable replacement to form field values
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              formData.append(input.name, processedValue);
            }
          });

          requestBody = formData.toString();
        }
        // Always set Content-Type for form-encoded data
        fetchHeaders.append(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
      } else if (selectedContentType === "multipart/form-data") {
        // Handle multipart/form-data
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const formData = new FormData();
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name) {
              if (input.type === "file") {
                // Handle file input
                if (input.files && input.files.length > 0) {
                  formData.append(input.name, input.files[0]);
                }
              } else if (input.value) {
                // Handle regular form fields with variable replacement
                const processedValue = window.replaceVariables
                  ? window.replaceVariables(input.value)
                  : input.value;
                formData.append(input.name, processedValue);
              }
            }
          });

          requestBody = formData;
        }
        // Don't set Content-Type header for multipart/form-data - browser will set it with boundary
      } else {
        // Handle JSON and other content types using Monaco editor
        if (window.requestBodyEditor) {
          requestBody = window.requestBodyEditor.getValue();
          // Apply variable replacement to request body
          if (requestBody && window.replaceVariables) {
            requestBody = window.replaceVariables(requestBody);
          }
        }
        // Set Content-Type for other content types only if there's a body
        if (
          requestBody &&
          requestBodyContentTypeSelect &&
          requestBodyContentTypeSelect.value
        ) {
          fetchHeaders.append(
            "Content-Type",
            requestBodyContentTypeSelect.value
          );
        }
      }

      let fetchOptions = {
        method: currentMethod,
        headers: fetchHeaders,
      };
      if (currentMethod !== "GET" && currentMethod !== "HEAD" && requestBody) {
        fetchOptions.body = requestBody;
      }

      // Get operation security requirements
      let operationSecurity = null;
      if (
        swaggerData &&
        swaggerData.paths &&
        swaggerData.paths[pathElement.textContent] &&
        swaggerData.paths[pathElement.textContent][currentMethod.toLowerCase()]
      ) {
        const operation =
          swaggerData.paths[pathElement.textContent][
            currentMethod.toLowerCase()
          ];
        operationSecurity =
          operation.security !== undefined
            ? operation.security
            : swaggerData.security;
      }

      // Add authorization header if we have a token and auth module is available
      if (
        window.auth &&
        typeof window.auth.addAuthorizationHeader === "function"
      ) {
        fetchOptions = window.auth.addAuthorizationHeader(
          fetchOptions,
          operationSecurity
        );
      }

      // Handle API key query parameters from authentication
      if (fetchOptions.apiKeyParams) {
        const urlObj = new URL(currentPath, window.location.origin);
        Object.entries(fetchOptions.apiKeyParams).forEach(([name, value]) => {
          urlObj.searchParams.append(name, value);
        });
        currentPath = urlObj.pathname + urlObj.search;
      }

      try {
        // Get the base URL from config or swagger spec
        const baseUrl = getBaseUrl();
        // Ensure currentPath starts with /
        if (!currentPath.startsWith("/")) {
          currentPath = "/" + currentPath;
        }
        // Combine base URL with current path, ensuring no double slashes
        const fullUrl = baseUrl.replace(/\/$/, "") + currentPath;
        const startTime = performance.now();
        const response = await fetch(fullUrl, fetchOptions);
        let responseBodyText;
        try {
          responseBodyText = await response.text();
        } catch (textError) {
          responseBodyText = "Unable to read response body";
        }
        const executionTime = Math.round(performance.now() - startTime);

        if (!response.ok) {
          console.warn(
            "API request failed:",
            response.status,
            response.statusText
          );
        }
        displayActualResponse(
          response,
          responseBodyText,
          !response.ok,
          executionTime
        );
      } catch (error) {
        console.error("Error during API request execution:", error);
        displayActualResponse(
          {
            status: 500,
            statusText: error.message || "Network Error",
            headers: new Headers(),
          },
          error.message || "Failed to execute request",
          true
        );
      } finally {
        // Hide loading overlay when request completes (success or error)
        const loader = document.getElementById("try-it-out-loader");
        loader.classList.add("hidden");
      }
    });
  }
}

// Initialize the vertical menu functionality
function initVerticalMenu() {
  const menuIcons = document.querySelectorAll(".vertical-menu-icon");
  const sections = document.querySelectorAll(".right-panel-section");

  menuIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      // Update active state of icons
      menuIcons.forEach((i) => i.classList.remove("active"));
      icon.classList.add("active"); // Show corresponding section
      const sectionId = icon.dataset.section + "-section";
      sections.forEach((section) => {
        if (section.id === sectionId) {
          section.classList.add("active");
          section.classList.remove("hidden");

          // Special handling for different sections
          if (sectionId === "try-it-out-section") {
            // Hide all collection runner content
            const collectionTabs = document.querySelectorAll(
              ".collection-tab-content"
            );
            collectionTabs.forEach((tab) => tab.classList.add("hidden"));
          } else if (sectionId === "collection-runner-section") {
            // When switching to collection runner, restore the previously active tab
            if (window.collectionRunnerUI) {
              window.collectionRunnerUI.restoreActiveTab();
            } else {
              // Fallback if collectionRunnerUI is not available yet
              document
                .querySelectorAll(".collection-tab-content")
                .forEach((tab) => {
                  if (tab.id === "collection-tab") {
                    tab.classList.remove("hidden");
                  } else {
                    tab.classList.add("hidden");
                  }
                });
              // Also update the tab buttons
              document
                .querySelectorAll(".collection-tab[data-tab]")
                .forEach((btn) => {
                  if (btn.dataset.tab === "collection-tab") {
                    btn.classList.add("active");
                  } else {
                    btn.classList.remove("active");
                  }
                });
            }
          }
        } else {
          section.classList.remove("active");
          section.classList.add("hidden");
        }
      });
    });
  });
}

// Initialize copy to clipboard buttons
function initCopyButtons() {
  const copyRequestBtn = document.getElementById("copyRequestBtn");
  if (copyRequestBtn) {
    copyRequestBtn.addEventListener("click", () => {
      // This needs to be smarter, collecting all dynamic fields
      const path =
        document.getElementById("right-panel-path")?.textContent || "";
      const method =
        document.getElementById("right-panel-method")?.textContent || "";
      let requestToCopy = `${method} ${path}\n`;

      const headersContainer = document.getElementById(
        "right-panel-headers-container"
      );
      if (headersContainer && headersContainer.children.length > 0) {
        requestToCopy += "Headers:\n";
        headersContainer.querySelectorAll("input").forEach((input) => {
          if (input.name && input.value)
            requestToCopy += `${input.name}: ${input.value}\n`;
        });
      }

      const requestBodyContentTypeSelect = document.getElementById(
        "right-panel-request-body-content-type-select"
      );
      if (
        window.requestBodyEditor && // Check if editor exists
        requestBodyContentTypeSelect &&
        requestBodyContentTypeSelect.value
      ) {
        const bodyValue = window.requestBodyEditor.getValue();
        if (bodyValue) {
          // Check if there is a body to copy
          requestToCopy += `Content-Type: ${requestBodyContentTypeSelect.value}\nBody:\n${bodyValue}`;
        }
      }

      copyToClipboardText(requestToCopy, "Request details copied!");
    });
  }

  const copyActualResponseBtn = document.getElementById(
    "copyActualResponseBtn"
  );
  if (copyActualResponseBtn) {
    copyActualResponseBtn.addEventListener("click", () => {
      const responseText = document.getElementById(
        "actualResponseSample"
      )?.textContent;
      copyToClipboardText(responseText, "Response copied!");
    });
  }
}

// Update execute button color to match the HTTP verb
function updateExecuteButtonColor(method) {
  const executeRequestBtn = document.getElementById("executeRequestBtn");
  if (!executeRequestBtn || !method) return;

  // Get the base classes for the button excluding background and text color
  const baseClasses =
    "flex items-center hover:bg-opacity-80 font-bold py-1.5 px-3.5 rounded text-sm";

  // Extract just the background color based on the HTTP method
  let bgColorClass = "";
  switch (method.trim().toUpperCase()) {
    case "GET":
      bgColorClass = "bg-green-600";
      break;
    case "POST":
      bgColorClass = "bg-blue-600";
      break;
    case "PUT":
      bgColorClass = "bg-yellow-500";
      break;
    case "PATCH":
      bgColorClass = "bg-yellow-400";
      break;
    case "DELETE":
      bgColorClass = "bg-red-600";
      break;
    case "HEAD":
      bgColorClass = "bg-purple-600";
      break;
    case "OPTIONS":
      bgColorClass = "bg-gray-500";
      break;
    default:
      bgColorClass = "bg-gray-600";
  }

  // Set the button classes
  executeRequestBtn.className = `${baseClasses} ${bgColorClass} text-white`;
}

// Export functions globally to be used by other modules
window.updateExecuteButtonColor = updateExecuteButtonColor;
window.navigateToEndpointFromHash = navigateToEndpointFromHash;
