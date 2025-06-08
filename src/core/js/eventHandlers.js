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
  loadSwaggerSpec(window.swaggerPath);

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
  if (window.initExecuteRequestButton) {
    window.initExecuteRequestButton();
  } // Setup copy to clipboard buttons
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
