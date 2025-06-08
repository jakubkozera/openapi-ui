// Utility functions used across the application

// Get proper HTTP status text
function getStatusText(status) {
  const statusTexts = {
    100: "Continue",
    101: "Switching Protocols",
    200: "Ok",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    422: "Unprocessable Entity",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
  };
  return statusTexts[status] || "Unknown Status";
}

// Helper function for method class names
function getMethodClass(method) {
  // Consistent base class for all method tags
  let baseClass = "font-bold px-1.5 py-0.5 rounded text-xs mr-2"; // Removed text-white, added font-bold
  switch (method.trim().toUpperCase()) {
    case "GET":
      return `text-green-600 ${baseClass}`; // Removed border-green-600
    case "POST":
      return `text-blue-600 ${baseClass}`; // Removed border-blue-600
    case "PUT":
      return `text-yellow-500 ${baseClass}`; // Removed border-yellow-500
    case "PATCH":
      return `text-yellow-400 ${baseClass}`; // Removed border-yellow-400
    case "DELETE":
    case "DEL":
      return `text-red-600 ${baseClass}`; // Removed border-red-600
    default:
      return `text-gray-500 ${baseClass}`; // Removed border-gray-500
  }
}

// Helper function for method hover border class names
function getHoverBorderClass(method) {
  switch (method.trim().toUpperCase()) {
    case "GET":
      return "hover:border-green-600";
    case "POST":
      return "hover:border-blue-600";
    case "PUT":
      return "hover:border-yellow-500";
    case "PATCH":
      return "hover:border-yellow-400";
    case "DELETE":
    case "DEL":
      return "hover:border-red-600";
    default:
      return "hover:border-gray-500";
  }
}

// Helper function to truncate HTTP verbs longer than 5 characters
function truncateHttpVerb(method) {
  if (!method) return "";
  const upperMethod = method.toUpperCase();
  if (upperMethod.length > 5) {
    return upperMethod.substring(0, 3) + "...";
  }
  return upperMethod;
}

// Helper function for method active border class names
function getActiveBorderClass(method) {
  switch (method.trim().toUpperCase()) {
    case "GET":
      return "border-l-green-600";
    case "POST":
      return "border-l-blue-600";
    case "PUT":
      return "border-l-yellow-500";
    case "PATCH":
      return "border-l-yellow-400";
    case "DELETE":
    case "DEL":
      return "border-l-red-600";
    default:
      return "border-l-gray-500";
  }
}

// Generate section ID from path and method
function generateSectionId(path, method) {
  return `operation-${method}-${path.replace(/\//g, "-").replace(/{|}/g, "")}`;
}

// Generic copy to clipboard function
function copyToClipboardText(
  textToCopy,
  notificationText = "Copied to clipboard!"
) {
  if (!textToCopy) return;
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      // Use our centralized toast system
      window.utils.showToast(notificationText, "success");
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      // Use our centralized toast system for error
      window.utils.showToast("Failed to copy!", "error");
    });
}

// Copy text to clipboard from an element
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const text = element.textContent;
  copyToClipboardText(text, "Copied to clipboard!");
}

// Toggle response code sections
function toggleResponseCode(id) {
  const element = document.getElementById(id);
  const arrow = element.previousElementSibling.querySelector("svg");
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
    if (arrow) arrow.classList.add("rotate-90"); // Pointing down
  } else {
    element.classList.add("hidden");
    if (arrow) arrow.classList.remove("rotate-90"); // Pointing right
  }
}

// Show a toast notification
function showToast(message, type = "success") {
  // Determine which container to use based on the toast type
  const containerId =
    type === "confirm" ? "confirm-toast-container" : "toast-container";

  // Create toast container if it doesn't exist yet
  let toastContainer = document.getElementById(containerId);
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = containerId;
    // Position confirmation dialogs at the top center, regular toasts at bottom right
    if (type === "confirm") {
      toastContainer.className =
        "fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50";
    } else {
      toastContainer.className =
        "fixed bottom-4 right-4 flex flex-col gap-3 z-50";
    }
    document.body.appendChild(toastContainer);
  }

  // Check if a toast with the same message is already visible in this container
  const existingToast = Array.from(toastContainer.children).find(
    (toast) => toast.querySelector(".toast-message")?.textContent === message
  );

  if (existingToast) {
    return; // Don't show duplicate toasts
  }

  // Create a unique ID for the toast
  const toastId = `toast-${Date.now()}`;

  // Configure icon and colors based on type
  let iconSvg, bgColor, textColor;

  switch (type) {
    case "error":
      iconSvg =
        '<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">' +
        '<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>' +
        "</svg>";
      bgColor = "bg-red-100";
      textColor = "text-red-500";
      break;
    case "warning":
      iconSvg =
        '<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">' +
        '<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>' +
        "</svg>";
      bgColor = "bg-orange-100";
      textColor = "text-orange-500";
      break;
    case "success":
    default:
      iconSvg =
        '<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">' +
        '<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>' +
        "</svg>";
      bgColor = "bg-green-100";
      textColor = "text-green-500";
  }

  // Create toast HTML
  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className =
    "flex items-center w-full max-w-xs p-4 text-gray-700 bg-white rounded-lg shadow-md dark:text-gray-200 transform transition-all duration-300 translate-y-0 opacity-100";
  toast.setAttribute("role", "alert");
  // For confirmation toasts, use a different layout with action buttons
  if (type === "confirm") {
    toast.className =
      "flex flex-col w-full max-w-xs p-4 text-gray-700 bg-white rounded-lg shadow-md dark:text-gray-200 transform transition-all duration-300 translate-y-0 opacity-100";

    iconSvg =
      '<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">' +
      '<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>' +
      "</svg>";
    bgColor = "bg-blue-100";
    textColor = "text-blue-600";

    toast.innerHTML = `
      <div class="flex items-center mb-3">
        <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 ${textColor} ${bgColor} rounded-lg">
          ${iconSvg}
          <span class="sr-only">Confirm icon</span>
        </div>
        <div class="ms-3 text-sm font-medium toast-message text-gray-800">${message}</div>
      </div>
      <div class="flex justify-end gap-2 mt-1">
        <button type="button" class="cancel-action px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
          Cancel
        </button>
        <button type="button" class="confirm-action px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
          Confirm
        </button>
      </div>
    `;

    // Don't auto-close confirmation toasts
    const confirmButton = toast.querySelector(".confirm-action");
    const cancelButton = toast.querySelector(".cancel-action");

    toastContainer.appendChild(toast);

    // Return a promise that resolves when the user makes a choice
    return new Promise((resolve) => {
      confirmButton.addEventListener("click", () => {
        closeToast(toast);
        resolve(true);
      });

      cancelButton.addEventListener("click", () => {
        closeToast(toast);
        resolve(false);
      });
    });
  } else {
    // Regular toast
    toast.innerHTML = `
      <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 ${textColor} ${bgColor} rounded-lg">
        ${iconSvg}
        <span class="sr-only">${type} icon</span>
      </div>
      <div class="ms-3 text-sm font-normal text-gray-800 toast-message">${message}</div>
      <button
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
        aria-label="Close"
      >
        <span class="sr-only">Close</span>
        <svg
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Add click listener to close button
    toast.querySelector("button").addEventListener("click", () => {
      closeToast(toast);
    });

    // Auto-close after 3 seconds
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        closeToast(toast);
      }
    }, 3000);
  }
  // Function to close toast with animation
  function closeToast(toastElement) {
    // Check if it's in the confirm container (top position) or regular container (bottom position)
    const isConfirmToast = toastElement.closest("#confirm-toast-container");

    if (isConfirmToast) {
      toastElement.classList.add("opacity-0", "-translate-y-2"); // Slide up for top positioned toasts
    } else {
      toastElement.classList.add("opacity-0", "translate-y-2"); // Slide down for bottom positioned toasts
    }

    setTimeout(() => {
      toastElement.remove();
    }, 300); // Match the duration in the class
  }
}

/**
 * Format file size in a human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Make formatFileSize available globally
window.formatFileSize = formatFileSize;

// Helper functions for endpoints collapsing/expanding
// Expand an endpoints section with a smooth transition
function expandEndpointsSection(section, arrowElement = null) {
  if (!section) return;

  // Calculate the height needed to display all content
  const sectionHeight = section.scrollHeight;
  section.style.maxHeight = `${sectionHeight}px`;
  section.style.opacity = "1";

  // Rotate arrow if provided
  if (arrowElement) {
    arrowElement.style.transform = "rotate(90deg)";
  }
  // Store state in local storage
  if (
    section.id &&
    window.swaggerData?.info?.title &&
    window.swaggerData?.info?.version
  ) {
    const apiTitle = window.swaggerData.info.title
      .toLowerCase()
      .replace(/\s+/g, "_");
    const apiVersion = window.swaggerData.info.version
      .toLowerCase()
      .replace(/\s+/g, "_");
    localStorage.setItem(
      `${apiTitle}_${apiVersion}_section_expanded_${section.id}`,
      "true"
    );
  }
}

// Collapse an endpoints section with a smooth transition
function collapseEndpointsSection(section, arrowElement = null) {
  if (!section) return;

  section.style.maxHeight = "0";
  section.style.opacity = "0";

  // Rotate arrow back if provided
  if (arrowElement) {
    arrowElement.style.transform = "rotate(0deg)";
  }
  // Store state in local storage
  if (
    section.id &&
    window.swaggerData?.info?.title &&
    window.swaggerData?.info?.version
  ) {
    const apiTitle = window.swaggerData.info.title
      .toLowerCase()
      .replace(/\s+/g, "_");
    const apiVersion = window.swaggerData.info.version
      .toLowerCase()
      .replace(/\s+/g, "_");
    localStorage.setItem(
      `${apiTitle}_${apiVersion}_section_expanded_${section.id}`,
      "false"
    );
  }
}

// Toggle endpoints section visibility
function toggleEndpointsSection(section, arrowElement = null) {
  if (!section) return;

  const isCollapsed = section.style.maxHeight === "0px";

  if (isCollapsed) {
    expandEndpointsSection(section, arrowElement);
  } else {
    collapseEndpointsSection(section, arrowElement);
  }

  return !isCollapsed; // Return new state
}

// Function to create a clean URL-friendly path
function createCleanPath(path) {
  return path.replace(/[{}]/g, ""); // Remove curly braces, keep slashes for proper path structure
}

// Export all utility functions
window.utils = {
  getMethodClass,
  getHoverBorderClass,
  generateSectionId,
  copyToClipboardText,
  copyToClipboard,
  toggleResponseCode,
  showToast,
  getStatusText,
  createCleanPath, // Export the new utility function

  // Get the base URL for API requests
  getBaseUrl: function () {
    // First check for a configured base URL in window.config
    if (window.config && window.config.apiUrl) {
      return window.config.apiUrl;
    }

    // Then check if there's a server defined in the Swagger specification
    if (
      window.swaggerData &&
      window.swaggerData.servers &&
      window.swaggerData.servers.length > 0
    ) {
      return window.swaggerData.servers[0].url;
    }

    // Default to the current location
    return window.location.origin;
  },

  // Password visibility toggle utilities
  createPasswordToggleHTML: function (inputId) {
    return `
      <div class="password-input-container">
        <button type="button" class="password-toggle-btn" onclick="window.utils.togglePasswordVisibility('${inputId}')">
          <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off">
  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.07 18.07 0 0 1 5.06-5.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
  <line x1="1" y1="1" x2="23" y2="23" />
  <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a17.93 17.93 0 0 1-3.95 4.94" />
</svg>

        </button>
      </div>
    `;
  },

  togglePasswordVisibility: function (inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input?.parentElement?.querySelector(
      ".password-toggle-btn"
    );

    if (!input || !toggleBtn) {
      console.warn(
        `Password input or toggle button not found for ID: ${inputId}`
      );
      return;
    }

    if (input.type === "password") {
      input.type = "text";
      toggleBtn.classList.add("password-visible");
    } else {
      input.type = "password";
      toggleBtn.classList.remove("password-visible");
    }
  },

  wrapPasswordInput: function (inputElement) {
    if (!inputElement || inputElement.type !== "password") {
      return;
    }

    // Check if already wrapped
    if (
      inputElement.parentElement?.classList.contains("password-input-container")
    ) {
      return;
    }

    const inputId = inputElement.id;
    if (!inputId) {
      console.warn("Password input must have an ID for toggle functionality");
      return;
    }

    // Create wrapper div
    const wrapper = document.createElement("div");
    wrapper.className = "password-input-container";

    // Insert wrapper before the input
    inputElement.parentNode.insertBefore(wrapper, inputElement);

    // Move input into wrapper
    wrapper.appendChild(inputElement);

    // Create and add toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "password-toggle-btn";
    toggleBtn.onclick = () => window.utils.togglePasswordVisibility(inputId);
    toggleBtn.innerHTML = `
      <svg class="eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      </svg>
      <svg class="eye-closed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.07 18.07 0 0 1 5.06-5.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
        <line stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="1" y1="1" x2="23" y2="23" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.73 5.08A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a17.93 17.93 0 0 1-3.95 4.94" />
      </svg>

    `;

    wrapper.appendChild(toggleBtn);
  },
};
