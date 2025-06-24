/* js/config.js */
// Global configuration and state variables

// API Base URL and other state variables
let baseUrl = window.baseUrl;
if (baseUrl === "#base_url#") {
  baseUrl = window.location.origin;
}
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


/* js/themeManager.js */
// Theme Management System
// Supports multiple themes with easy extensibility

class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        name: "Light",
        icon: "sun",
        colors: {
          // Background colors
          "bg-primary": "#ffffff",
          "bg-secondary": "#f9fafb",
          "bg-tertiary": "#f3f4f6",
          "bg-accent": "#e5e7eb",

          // Text colors
          "text-primary": "#111827",
          "text-secondary": "#374151",
          "text-tertiary": "#6b7280",
          "text-quaternary": "#9ca3af",

          // Border colors
          "border-primary": "#e5e7eb",
          "border-secondary": "#d1d5db",
          "border-accent": "#9ca3af",

          // Interactive colors
          "interactive-bg": "#f3f4f6",
          "interactive-bg-hover": "#e5e7eb",
          "interactive-bg-active": "#3b82f6",
          "interactive-text-active": "#ffffff",

          // Sidebar specific
          "sidebar-bg": "#ffffff",
          "sidebar-border": "#e5e7eb",
          "sidebar-text": "#374151",
          "sidebar-text-hover": "#111827",
          "sidebar-bg-hover": "#f3f4f6",
          "sidebar-bg-expanded": "#e5e7eb",

          // Main content
          "main-bg": "#f9fafb",
          "main-text": "#111827",
          "main-text-secondary": "#6b7280", // Components
          "tooltip-bg": "#ffffff",
          "tooltip-text": "#111827",
          "tooltip-border": "#e5e7eb",

          // Shadows and overlays
          "shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.1)",
          "shadow-md": "0 2px 4px rgba(0, 0, 0, 0.1)",
          "shadow-lg": "0 10px 25px rgba(0, 0, 0, 0.15)",
          "shadow-color": "rgba(0, 0, 0, 0.1)",
          "modal-overlay-bg": "rgba(0, 0, 0, 0.3)",

          // Surface colors
          "surface-primary": "#ffffff",
          "surface-secondary": "#f3f4f6",
          "surface-hover": "#f9fafb",
          "content-bg": "#ffffff",

          // Interactive elements
          "interactive-primary": "#3b82f6",
          "focus-ring": "rgba(59, 130, 246, 0.2)",
          "focus-ring-color": "rgba(59, 130, 246, 0.3)",

          // Input elements
          "input-focus-bg": "rgba(59, 130, 246, 0.05)",
          "cell-hover-bg": "rgba(243, 244, 246, 0.8)",

          // Spinner
          "spinner-bg": "rgba(59, 130, 246, 0.25)",

          // Button states
          "button-danger-hover-bg": "rgba(239, 68, 68, 0.1)",

          // Method badge colors remain consistent across themes
          "method-get": "#22c55e",
          "method-post": "#3b82f6",
          "method-put": "#eab308",
          "method-patch": "#f59e0b",
          "method-delete": "#ef4444",
        },
      },
      dark: {
        name: "Dark",
        icon: "moon",
        colors: {
          // Background colors
          "bg-primary": "#1f2937",
          "bg-secondary": "#111827",
          "bg-tertiary": "#374151",
          "bg-accent": "#4b5563",

          // Text colors
          "text-primary": "#f9fafb",
          "text-secondary": "#e5e7eb",
          "text-tertiary": "#d1d5db",
          "text-quaternary": "#9ca3af",

          // Border colors
          "border-primary": "#374151",
          "border-secondary": "#4b5563",
          "border-accent": "#6b7280", // Interactive colors
          "interactive-bg": "#374151",
          "interactive-bg-hover": "#2d3748", // Darker hover for better text visibility
          "interactive-bg-active": "#4a5568", // Greyish instead of blue
          "interactive-text-active": "#f7fafc",

          // Sidebar specific
          "sidebar-bg": "#1f2937",
          "sidebar-border": "#374151",
          "sidebar-text": "#d1d5db",
          "sidebar-text-hover": "#f7fafc",
          "sidebar-bg-hover": "#2d3748", // Darker hover for better contrast
          "sidebar-bg-expanded": "#374151",

          // Main content
          "main-bg": "#111827",
          "main-text": "#f3f4f6",
          "main-text-secondary": "#9ca3af", // Components
          "tooltip-bg": "#1f2937",
          "tooltip-text": "#f3f4f6",
          "tooltip-border": "#374151",

          // Shadows and overlays
          "shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.1)",
          "shadow-md": "0 2px 4px rgba(0, 0, 0, 0.3)",
          "shadow-lg": "0 10px 25px rgba(0, 0, 0, 0.3)",
          "shadow-color": "rgba(0, 0, 0, 0.3)",
          "modal-overlay-bg": "rgba(0, 0, 0, 0.5)",

          // Surface colors
          "surface-primary": "#1f2937",
          "surface-secondary": "#374151",
          "surface-hover": "#111827",
          "content-bg": "#2d3748",

          // Interactive elements
          "interactive-primary": "#3b82f6",
          "focus-ring": "rgba(59, 130, 246, 0.2)",
          "focus-ring-color": "rgba(59, 130, 246, 0.3)",

          // Input elements
          "input-focus-bg": "rgba(59, 130, 246, 0.05)",
          "cell-hover-bg": "rgba(55, 65, 81, 0.3)",

          // Spinner
          "spinner-bg": "rgba(59, 130, 246, 0.25)",

          // Button states
          "button-danger-hover-bg": "rgba(239, 68, 68, 0.1)",

          // Method badge colors remain consistent
          "method-get": "#22c55e",
          "method-post": "#3b82f6",
          "method-put": "#eab308",
          "method-patch": "#f59e0b",
          "method-delete": "#ef4444",
        },
      },
      // Example of how to add more themes - currently commented out
      // Uncomment and customize to add more themes:
      /*
      blue: {
        name: 'Ocean Blue',
        icon: 'water',
        colors: {
          'bg-primary': '#1e3a8a',
          'bg-secondary': '#1e40af',
          'text-primary': '#f8fafc',
          'text-secondary': '#e2e8f0',
          'sidebar-bg': '#1e3a8a',
          'main-bg': '#1e40af',
          // ... add all other color properties
        }
      },
      purple: {
        name: 'Purple Night',
        icon: 'star',
        colors: {
          // Define purple theme colors here
        }
      }
      */
      // More themes can be added by following the pattern above
    };

    this.currentTheme = this.loadTheme();
    this.initializeTheme();
  }

  // Load theme from localStorage or default to 'dark'
  loadTheme() {
    const stored = localStorage.getItem("openapi-ui-theme");
    return stored && this.themes[stored] ? stored : "dark";
  }

  // Save theme to localStorage
  saveTheme(themeName) {
    localStorage.setItem("openapi-ui-theme", themeName);
  }
  // Apply theme by setting CSS custom properties
  applyTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme "${themeName}" not found`);
      return;
    }

    const theme = this.themes[themeName];
    const root = document.documentElement;

    // Set CSS custom properties
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });

    // Update body classes for Tailwind compatibility
    this.updateBodyClasses(themeName);

    // Force style recalculation
    this.forceStyleRefresh();

    this.currentTheme = themeName;
    this.saveTheme(themeName);

    // Dispatch theme change event
    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: themeName, colors: theme.colors },
      })
    );
  }
  // Force style refresh for immediate visual feedback
  forceStyleRefresh() {
    // Add a temporary visual indicator
    const indicator = document.createElement("div");
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: ${this.currentTheme === "light" ? "#3b82f6" : "#f59e0b"};
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      transition: all 0.3s ease;
    `;

    // Temporarily add and remove a class to force repaint
    document.body.classList.add("theme-refresh");
    requestAnimationFrame(() => {
      document.body.classList.remove("theme-refresh");
    });
  }
  // Update body classes based on theme
  updateBodyClasses(themeName) {
    const body = document.body;

    // Remove existing theme classes
    Object.keys(this.themes).forEach((theme) => {
      body.classList.remove(`theme-${theme}`);
    });

    // Add current theme class and data attribute
    body.classList.add(`theme-${themeName}`);
    body.setAttribute("data-theme", themeName);

    // Update Tailwind classes for major elements
    if (themeName === "dark") {
      body.className = body.className.replace("bg-gray-100", "bg-gray-900");

      // Update sidebar
      const sidebar = document.getElementById("left-sidebar");
      if (sidebar) {
        sidebar.className = sidebar.className
          .replace("bg-white", "bg-gray-800")
          .replace("border-gray-200", "border-gray-700");
      }

      // Update main content
      const mainContent = document.getElementById("api-main-content");
      if (mainContent) {
        mainContent.className = mainContent.className
          .replace("bg-white", "bg-gray-900")
          .replace("bg-gray-100", "bg-gray-900");
      }
    } else {
      // Light theme
      body.className = body.className.replace("bg-gray-900", "bg-gray-100");

      // Update sidebar
      const sidebar = document.getElementById("left-sidebar");
      if (sidebar) {
        sidebar.className = sidebar.className
          .replace("bg-gray-800", "bg-white")
          .replace("border-gray-700", "border-gray-200");
      }

      // Update main content
      const mainContent = document.getElementById("api-main-content");
      if (mainContent) {
        mainContent.className = mainContent.className.replace(
          "bg-gray-900",
          "bg-gray-100"
        );
      }
    }
  }

  // Get list of available themes
  getAvailableThemes() {
    return Object.keys(this.themes).map((key) => ({
      key,
      name: this.themes[key].name,
      icon: this.themes[key].icon,
    }));
  }

  // Get current theme info
  getCurrentTheme() {
    return {
      key: this.currentTheme,
      ...this.themes[this.currentTheme],
    };
  }

  // Cycle to next theme (for simple toggle)
  cycleTheme() {
    const themeKeys = Object.keys(this.themes);
    const currentIndex = themeKeys.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];

    this.applyTheme(nextTheme);
    return nextTheme;
  }
  // Initialize theme system
  initializeTheme() {
    this.applyTheme(this.currentTheme);

    // Ensure DOM is ready before creating toggle
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.createThemeToggle();
      });
    } else {
      // DOM is already ready
      this.createThemeToggle();
    }
  }

  // Create theme toggle button
  createThemeToggle() {
    const footerContainer = document.querySelector(
      "#left-sidebar .p-4.border-t.border-gray-700"
    );
    if (!footerContainer) return;

    // Replace the existing content with theme toggle
    footerContainer.innerHTML = `
      <div class="flex items-center justify-between">
        <button id="theme-toggle" class="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200 p-2 rounded-md hover:bg-gray-400" title="Switch theme">
          <svg id="theme-icon" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${this.getThemeIcon(this.currentTheme)}
          </svg>
          <span id="theme-name">${
            this.themes[this.currentTheme].name
          } Theme</span>
        </button>
      </div>
    `;

    // Add click event listener
    const toggleButton = document.getElementById("theme-toggle");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        const newTheme = this.cycleTheme();
        this.updateToggleUI();

        // Show toast notification
        if (window.utils && window.utils.showToast) {
          window.utils.showToast(
            `Switched to ${this.themes[newTheme].name} theme`,
            "success"
          );
        }
      });
    }
  }

  // Update toggle button UI
  updateToggleUI() {
    const themeIcon = document.getElementById("theme-icon");
    const themeName = document.getElementById("theme-name");

    if (themeIcon) {
      themeIcon.innerHTML = this.getThemeIcon(this.currentTheme);
    }

    if (themeName) {
      themeName.textContent = `${this.themes[this.currentTheme].name} Theme`;
    }
  }

  // Get SVG icon for theme
  getThemeIcon(themeName) {
    const icons = {
      light: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`,
      dark: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`,
      blue: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />`,
    };

    return icons[themeName] || icons.dark;
  }

  // Add a new theme (for future extensibility)
  addTheme(key, themeConfig) {
    if (this.themes[key]) {
      console.warn(
        `Theme "${key}" already exists. Use updateTheme() to modify.`
      );
      return;
    }

    this.themes[key] = themeConfig;
  }

  // Update an existing theme
  updateTheme(key, themeConfig) {
    if (!this.themes[key]) {
      console.warn(`Theme "${key}" not found. Use addTheme() to create.`);
      return;
    }

    this.themes[key] = { ...this.themes[key], ...themeConfig };

    // Reapply if it's the current theme
    if (this.currentTheme === key) {
      this.applyTheme(key);
    }
  }
}

// Initialize theme manager when DOM is loaded
function initThemeManager() {
  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        window.themeManager = new ThemeManager();
      });
    } else {
      // DOM is already ready
      window.themeManager = new ThemeManager();
    }
  }
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ThemeManager, initThemeManager };
}


/* js/utils.js */
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


/* js/markdownRenderer.js */
/**
 * Markdown Renderer Utility
 * Converts Markdown text to HTML with proper sanitization
 */

class MarkdownRenderer {
  constructor() {
    // Initialize the renderer
  }
  /**
   * Convert Markdown to HTML
   * @param {string} markdownText - The markdown text to convert
   * @returns {string} - HTML string
   */
  render(markdownText) {
    if (!markdownText || typeof markdownText !== "string") {
      return "";
    }

    let html = markdownText;

    // Normalize line endings (convert \r\n to \n)
    html = html.replace(/\r\n/g, "\n");

    // Convert headers
    html = html.replace(
      /^### (.*$)/gm,
      '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gm,
      '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-3">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gm,
      '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-3">$1</h1>'
    );

    // Convert code blocks FIRST (before any other backtick processing)
    html = html.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? ` data-language="${lang}"` : "";
      return `<pre class="bg-gray-50 border border-gray-200 rounded-md p-3 my-3 overflow-x-auto"><code class="text-sm font-mono text-gray-800"${language}>${this.escapeHtml(
        code.trim()
      )}</code></pre>`;
    });

    // Convert inline code AFTER code blocks
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>'
    );

    // Convert bold text
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );
    html = html.replace(
      /__(.*?)__/g,
      '<strong class="font-semibold">$1</strong>'
    );

    // Convert italic text
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Convert links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert unordered lists
    html = html.replace(
      /^[\s]*[-\*\+][\s]+(.*$)/gm,
      '<li class="ml-4 list-disc">$1</li>'
    );
    html = html.replace(
      /(<li[^>]*>.*<\/li>)/s,
      '<ul class="my-2 space-y-1">$1</ul>'
    );

    // Convert ordered lists
    html = html.replace(
      /^[\s]*\d+\.[\s]+(.*$)/gm,
      '<li class="ml-4 list-decimal">$1</li>'
    );
    html = html.replace(
      /(<li[^>]*class="[^"]*list-decimal[^"]*"[^>]*>.*<\/li>)/s,
      '<ol class="my-2 space-y-1">$1</ol>'
    );

    // Convert line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-gray-700 mb-4">');

    // Convert blockquotes
    html = html.replace(
      /^> (.*$)/gm,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>'
    );

    // Convert horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-300">');

    // Wrap in paragraph if not already wrapped
    if (html && !html.trim().startsWith("<")) {
      html = `<p class="text-gray-700 mb-4">${html}</p>`;
    }

    return html;
  }

  /**
   * Escape HTML characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sanitize HTML content
   * @param {string} html - HTML to sanitize
   * @returns {string} - Sanitized HTML
   */
  sanitize(html) {
    // Create a temporary element to parse HTML
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Remove script tags and event handlers
    const scripts = temp.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    // Remove potentially dangerous attributes
    const allElements = temp.querySelectorAll("*");
    allElements.forEach((element) => {
      // Remove event handlers
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("on")) {
          element.removeAttribute(attr.name);
        }
      });

      // Remove javascript: links
      if (element.href && element.href.startsWith("javascript:")) {
        element.removeAttribute("href");
      }
    });

    return temp.innerHTML;
  }

  /**
   * Render and sanitize markdown content
   * @param {string} markdownText - The markdown text to convert
   * @returns {string} - Safe HTML string
   */
  renderSafe(markdownText) {
    const html = this.render(markdownText);
    return this.sanitize(html);
  }
}

// Create a global instance
window.markdownRenderer = new MarkdownRenderer();

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = MarkdownRenderer;
}


/* js/tooltip.js */
// Custom tooltip handlers

function positionTooltipNextToElement(element) {
  const tooltip = document.getElementById("custom-tooltip");
  const rect = element.getBoundingClientRect();

  // Ensure the tooltip is in the correct DOM position
  if (!document.body.contains(tooltip)) {
    document.body.appendChild(tooltip);
  }

  // Make tooltip visible but not yet positioned to calculate its dimensions
  tooltip.style.visibility = "hidden";
  tooltip.classList.remove("hidden");

  // Get the tooltip dimensions
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;

  // Position always right next to the element (not far right in the screen)
  const left = rect.right + 8;
  const top = rect.top + rect.height / 2 - tooltipHeight / 2;

  // Position the tooltip
  tooltip.style.position = "fixed";
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  // Check if tooltip would go off-screen
  const rightEdge = left + tooltipWidth;
  const bottomEdge = top + tooltipHeight;

  if (rightEdge > window.innerWidth - 20) {
    // If too close to the right edge, position it to the left of the element
    tooltip.style.left = `${rect.left - tooltipWidth - 8}px`;
    tooltip.classList.add("tooltip-left");
    tooltip.classList.remove("tooltip-above");
  } else {
    tooltip.classList.remove("tooltip-left", "tooltip-above");
  }

  if (bottomEdge > window.innerHeight - 20) {
    // If too close to the bottom, adjust vertically
    tooltip.style.top = `${window.innerHeight - tooltipHeight - 20}px`;
  }

  // Make tooltip visible again
  tooltip.style.visibility = "visible";
}

function handleTooltipMouseEnter(e) {
  const tooltip = document.getElementById("custom-tooltip");

  // Set content before positioning
  tooltip.textContent = e.currentTarget.dataset.tooltip;

  // Position and show the tooltip
  positionTooltipNextToElement(e.currentTarget);
  tooltip.classList.add("visible");

  // Keep tooltip properly positioned during scroll
  const handleScroll = () => {
    if (tooltip.classList.contains("visible")) {
      positionTooltipNextToElement(e.currentTarget);
    }
  };

  // Add scroll listener temporarily
  window.addEventListener("scroll", handleScroll);

  // Store the handler so we can remove it on mouseleave
  e.currentTarget._scrollHandler = handleScroll;
}

function handleTooltipMouseLeave(e) {
  const tooltip = document.getElementById("custom-tooltip");
  tooltip.classList.add("hidden");
  tooltip.classList.remove("visible", "tooltip-left", "tooltip-above");

  // Remove scroll handler if it exists
  if (e.currentTarget._scrollHandler) {
    window.removeEventListener("scroll", e.currentTarget._scrollHandler);
    e.currentTarget._scrollHandler = null;
  }
}

// All functions are now globally available


/* js/monacoSetup.js */
// Monaco Editor setup and initialization
let monacoEditor = null;
let monacoLoaderPromise = null;
const MONACO_VERSION = "0.43.0";
const MONACO_CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${MONACO_VERSION}/min`;

// Function to get Monaco theme based on current app theme
function getMonacoThemeForCurrentTheme() {
  if (!window.themeManager) return "vs-dark"; // Default fallback

  const currentTheme = window.themeManager.getCurrentTheme();
  return currentTheme.key === "light" ? "vs" : "vs-dark";
}

// Function to update all Monaco editor themes
function updateAllMonacoEditorThemes() {
  const monacoTheme = getMonacoThemeForCurrentTheme();

  // Update main code snippet editor
  if (monacoEditor) {
    monaco.editor.setTheme(monacoTheme);
  }

  // Update request body editor
  if (window.requestBodyEditor) {
    window.requestBodyEditor.updateOptions({ theme: monacoTheme });
  }

  // Update response body editor
  if (window.responseBodyEditor) {
    window.responseBodyEditor.updateOptions({ theme: monacoTheme });
  }

  // Update API client editor
  if (window.apiClientGeneration && window.apiClientGeneration.getEditor) {
    const apiClientEditor = window.apiClientGeneration.getEditor();
    if (apiClientEditor) {
      apiClientEditor.updateOptions({ theme: monacoTheme });
    }
  }
}

// Set up theme change listener
function setupMonacoThemeListener() {
  window.addEventListener("themeChanged", () => {
    updateAllMonacoEditorThemes();
  });
}

// Initialize Monaco loader once
function initMonacoLoader() {
  if (monacoLoaderPromise) return monacoLoaderPromise;

  // Clean up any existing AMD loader
  if (window.require) {
    delete window.require;
  }

  monacoLoaderPromise = new Promise((resolve, reject) => {
    try {
      // Create a new script element for the loader
      const loaderScript = document.createElement("script");
      loaderScript.src = `${MONACO_CDN_BASE}/vs/loader.min.js`;

      loaderScript.onload = () => {
        // Configure AMD loader
        window.require.config({
          paths: { vs: `${MONACO_CDN_BASE}/vs` },
        });

        // Set up Monaco environment
        window.MonacoEnvironment = {
          getWorkerUrl: function (workerId, label) {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(
              `self.MonacoEnvironment = { baseUrl: '${MONACO_CDN_BASE}' };` +
                `importScripts('${MONACO_CDN_BASE}/vs/base/worker/workerMain.js');`
            )}`;
          },
        };

        resolve();
      };

      loaderScript.onerror = () => {
        reject(new Error("Failed to load Monaco Editor script"));
      };

      document.head.appendChild(loaderScript);
    } catch (err) {
      reject(err);
    }
  });

  return monacoLoaderPromise;
}

// Function to create and initialize Monaco Editor
async function createMonacoEditor(containerId, options = {}) {
  // Do not return existing editor, allow multiple editors
  // if (monacoEditor) return monacoEditor;

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container element not found: ${containerId}`);
  }

  try {
    // Initialize and wait for loader
    await initMonacoLoader();

    // Load Monaco Editor
    await new Promise((resolve) => {
      window.require(["vs/editor/editor.main"], resolve);
    });
    const defaultEditorOptions = {
      value: "// Select a language to see the code snippet",
      language: "javascript",
      theme: getMonacoThemeForCurrentTheme(),
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      renderLineHighlight: "none",
      lineNumbers: "on",
      readOnly: true,
      fixedOverflowWidgets: true,
      // Disable built-in hover to use our custom variable popover
      hover: {
        enabled: false,
      },
    };

    const finalOptions = { ...defaultEditorOptions, ...options }; // Create editor instance
    const editor = monaco.editor.create(container, finalOptions);

    // Store the main editor instance globally if it's for the primary code snippets
    if (containerId === "monaco-editor-container") {
      monacoEditor = editor;
    }

    // Initialize variable highlighting for this editor
    if (
      window.monacoVariableHighlighting &&
      typeof window.monacoVariableHighlighting.initializeForEditor ===
        "function"
    ) {
      window.monacoVariableHighlighting.initializeForEditor(editor);
    }

    return editor; // Return the newly created editor instance
  } catch (err) {
    console.error("Error creating Monaco Editor:", err);
    throw err;
  }
}

// Get the current editor instance
function getMonacoEditor() {
  return monacoEditor;
}

// Export the functions
window.monacoSetup = {
  createMonacoEditor,
  getMonacoEditor, // This will return the main snippet editor
  updateAllMonacoEditorThemes,
  setupMonacoThemeListener,
  getMonacoThemeForCurrentTheme,
};


/* js/codeSnippets.js */
// Code Snippets Generator for API Documentation
// Supports generating code snippets for API requests in various languages

/**
 * Generates code snippets for API requests in different programming languages
 */
class CodeSnippetGenerator {
  constructor() {
    this.supportedLanguages = {
      curl: {
        name: "cURL",
        formatter: this.generateCurlSnippet.bind(this),
      },
      javascript: {
        name: "JS/TS (Fetch)",
        formatter: this.generateJavaScriptSnippet.bind(this),
      },
      python: {
        name: "Python (requests)",
        formatter: this.generatePythonSnippet.bind(this),
      },
      csharp: {
        name: "C# (HttpClient)",
        formatter: this.generateCSharpSnippet.bind(this),
      },
      java: {
        name: "Java (OkHttp)",
        formatter: this.generateJavaSnippet.bind(this),
      },
    };
  }

  /**
   * Get list of supported languages
   * @returns {Array} Array of language objects with id and name
   */
  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages).map((key) => ({
      id: key,
      name: this.supportedLanguages[key].name,
    }));
  }

  /**
   * Generate code snippet based on request details and selected language
   * @param {string} language The language to generate code for
   * @param {string} method The HTTP method
   * @param {string} path The API path
   * @param {string} requestBody The request body as a string (JSON)
   * @param {Object} headers The request headers
   * @returns {string} The generated code snippet
   */
  generateSnippet(language, method, path, requestBody, headers = {}) {
    if (!this.supportedLanguages[language]) {
      return `// Language '${language}' is not supported yet.`;
    }

    // Ensure we include Content-Type header if we have a request body
    if (requestBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const requestDetails = {
      method: method,
      url: `${window.location.origin}${path}`,
      headers: headers,
      body: requestBody,
    };

    return this.supportedLanguages[language].formatter(requestDetails);
  }

  /**
   * Generate cURL code snippet
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated cURL snippet
   */
  generateCurlSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let curl = `curl -X ${method.toUpperCase()} "${url}"`;

    // Add headers
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (value) {
          curl += ` \\\n  -H "${key}: ${value}"`;
        } else {
          curl += ` \\\n  -H "${key}:"`;
        }
      }
    }

    // Add request body if present
    if (body) {
      const escapedBody = body.replace(/'/g, "'\\''");
      curl += ` \\\n  -d '${escapedBody}'`;
    }

    return curl;
  }

  /**
   * Generate JavaScript code snippet using Fetch API
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated JavaScript snippet
   */
  generateJavaScriptSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    const options = {
      method: method.toUpperCase(),
      headers: headers,
    };

    if (body) {
      options.body = body;
    }

    return `fetch("${url}", ${JSON.stringify(options, null, 2)})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  }

  /**
   * Generate Python code snippet using requests library
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated Python snippet
   */
  generatePythonSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let snippet = `import requests

url = "${url}"`;

    if (headers && Object.keys(headers).length > 0) {
      snippet += `\nheaders = ${JSON.stringify(headers, null, 2)}`;
    } else {
      snippet += `\nheaders = {}`;
    }

    if (body) {
      snippet += `\n\ndata = ${body}`;
    }

    snippet += `\n\nresponse = requests.${method.toLowerCase()}(url${
      body ? ", json=data" : ""
    }${headers && Object.keys(headers).length > 0 ? ", headers=headers" : ""})
print(response.json())`;

    return snippet;
  }

  /**
   * Generate C# code snippet using HttpClient
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated C# snippet
   */
  generateCSharpSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let csharpCode = "";
    csharpCode += `// Create HttpClient instance\n`;
    csharpCode += `using var client = new HttpClient();\n\n`;

    // Add headers
    if (headers && Object.keys(headers).length > 0) {
      csharpCode += `// Set request headers\n`;
      for (const [key, value] of Object.entries(headers)) {
        if (value) {
          csharpCode += `client.DefaultRequestHeaders.Add("${key}", "${value}");\n`;
        } else {
          csharpCode += `client.DefaultRequestHeaders.Add("${key}", "");\n`;
        }
      }
      csharpCode += "\n";
    }

    csharpCode += `try\n{\n`;
    csharpCode += `    var requestUri = new Uri("${url}");\n`;
    csharpCode += `    HttpResponseMessage response;\n\n`;

    switch (method.toUpperCase()) {
      case "GET":
        csharpCode += `    // Send GET request\n`;
        csharpCode += `    response = await client.GetAsync(requestUri);\n`;
        break;
      case "DELETE":
        csharpCode += `    // Send DELETE request\n`;
        csharpCode += `    response = await client.DeleteAsync(requestUri);\n`;
        break;
      case "POST":
      case "PUT":
      case "PATCH":
        const methodName =
          method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
        csharpCode += `    // Create request content\n`;
        if (body) {
          csharpCode += `    var json = @"${body.replace(/"/g, '""')}";\n`;
          csharpCode += `    var content = new StringContent(json, Encoding.UTF8, "application/json");\n\n`;
        } else {
          csharpCode += `    var content = new StringContent("", Encoding.UTF8, "application/json");\n\n`;
        }
        if (method.toUpperCase() === "PATCH") {
          csharpCode += `    // Send PATCH request (requires HttpMethod.Patch)\n`;
          csharpCode += `    var request = new HttpRequestMessage(new HttpMethod("PATCH"), requestUri) { Content = content };\n`;
          csharpCode += `    response = await client.SendAsync(request);\n`;
        } else {
          csharpCode += `    // Send ${methodName} request\n`;
          csharpCode += `    response = await client.${methodName}Async(requestUri, content);\n`;
        }
        break;
      default:
        csharpCode += `    // Send custom request\n`;
        csharpCode += `    var request = new HttpRequestMessage(new HttpMethod("${method.toUpperCase()}"), requestUri);\n`;
        csharpCode += `    response = await client.SendAsync(request);\n`;
    }

    csharpCode += `\n    // Ensure the request was successful\n`;
    csharpCode += `    response.EnsureSuccessStatusCode();\n\n`;
    csharpCode += `    // Read response content\n`;
    csharpCode += `    var responseContent = await response.Content.ReadAsStringAsync();\n`;
    csharpCode += `    Console.WriteLine(responseContent);\n`;
    csharpCode += `}\ncatch (HttpRequestException e)\n{\n`;
    csharpCode += `    Console.WriteLine($"Request error: {e.Message}");\n`;
    csharpCode += `}\n`;

    return csharpCode;
  }

  /**
   * Generate Java code snippet using OkHttp
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated Java snippet
   */
  generateJavaSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let code = `OkHttpClient client = new OkHttpClient();

MediaType mediaType = MediaType.parse("application/json");`;

    if (body) {
      code += `\nRequestBody body = RequestBody.create(mediaType, ${JSON.stringify(
        body
      )});`;
    }

    code += `\n\nRequest.Builder requestBuilder = new Request.Builder()
  .url("${url}")`;

    if (headers && Object.keys(headers).length > 0) {
      for (const [key, value] of Object.entries(headers)) {
        if (value) {
          code += `\n  .addHeader("${key}", "${value}")`;
        } else {
          code += `\n  .addHeader("${key}", "")`;
        }
      }
    }

    code += `\n  .method("${method.toUpperCase()}", ${body ? "body" : "null"});
    
Request request = requestBuilder.build();
Response response = client.newCall(request).execute();
System.out.println(response.body().string());`;

    return code;
  }
}

// Initialize everything properly at the end of the file
document.addEventListener("DOMContentLoaded", () => {
  // Initialize code snippet generator
  window.codeSnippetGenerator = new CodeSnippetGenerator();

  // Initialize code snippet functionality
  initCodeSnippetFunctionality();
});


/* js/codeSnippetTabs.js */
// Code Snippet Tabs functionality

/**
 * Initialize code snippet tabs functionality
 */
function initCodeSnippetTabs() {
  const tabButtons = document.querySelectorAll(".code-snippet-tab[data-tab]");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tab;
      switchCodeSnippetTab(tabId);
    });
  });
}

/**
 * Switch to the specified code snippet tab
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchCodeSnippetTab(tabId) {
  const tabButtons = document.querySelectorAll(".code-snippet-tab[data-tab]");
  const tabContents = document.querySelectorAll(".code-snippet-tab-content");

  // Update button states
  tabButtons.forEach((button) => {
    if (button.dataset.tab === tabId) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
  // Update content visibility with fade effect
  tabContents.forEach((content) => {
    if (content.id === tabId) {
      content.classList.remove("hidden");

      // If switching to snippets tab and Monaco editor exists, layout it
      if (tabId === "snippets-tab" && window.monacoSetup) {
        setTimeout(() => {
          const monacoEditor = window.monacoSetup.getMonacoEditor();
          if (monacoEditor) {
            monacoEditor.layout();
          }

          // Regenerate code snippet if needed
          if (typeof window.generateCodeSnippet === "function") {
            window.generateCodeSnippet();
          }
        }, 100);
      } // If switching to API clients tab, trigger initialization
      if (tabId === "api-clients-tab") {
        setTimeout(() => {
          // Initialize API client generation if not already done
          if (
            typeof window.initApiClientGeneration === "function" &&
            !window.apiClientGeneration
          ) {
            window.apiClientGeneration = window.initApiClientGeneration();
          } else if (
            window.apiClientGeneration &&
            window.apiClientGeneration.initApiClientEditor
          ) {
            // If already initialized, just ensure the editor is properly laid out
            const apiClientEditor = document.getElementById(
              "api-client-monaco-editor"
            );
            if (apiClientEditor && window.monaco) {
              // Find and layout the API client editor
              const editors = window.monaco.editor.getEditors();
              editors.forEach((editor) => {
                const container = editor.getContainerDomNode();
                if (
                  container &&
                  container.closest("#api-client-monaco-editor")
                ) {
                  editor.layout();
                }
              });
            }
          }
        }, 100);
      }
    } else {
      content.classList.add("hidden");
    }
  });
}

// Make functions globally available
window.initCodeSnippetTabs = initCodeSnippetTabs;
window.switchCodeSnippetTab = switchCodeSnippetTab;

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCodeSnippetTabs);
} else {
  initCodeSnippetTabs();
}


/* js/codeApiGenerators/csharpApiClientGenerator.js */
// C# API Client Generator for openapi-ui
class CSharpApiGenerator {
  constructor(options = {}) {
    this.swagger = null;
    this.options = {
      usePascalCase: true,
      useFields: false,
      useNullableTypes: false,
      addJsonPropertyAttributes: false,
      useJsonPropertyName: false,
      generateImmutableClasses: false,
      useRecordTypes: false,
      useReadonlyLists: false,
      useFileScopedNamespaces: false,
      usePrimaryConstructors: false,
      ...options,
    };
  }

  async loadFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.swagger = await response.json();
      return this.swagger;
    } catch (error) {
      throw new Error(`Error loading from URL: ${error.message}`);
    }
  }

  loadFromJson(jsonString) {
    try {
      this.swagger = JSON.parse(jsonString);
      return this.swagger;
    } catch (error) {
      throw new Error(`JSON parsing error: ${error.message}`);
    }
  }

  loadFromSwaggerData(swaggerData) {
    if (!swaggerData) {
      throw new Error("No swagger data provided");
    }
    this.swagger = swaggerData;
    return this.swagger;
  }

  // New method to load from global window object
  loadFromWindow() {
    if (!window.swaggerData) {
      throw new Error("No swagger data found in window.swaggerData");
    }
    this.swagger = window.swaggerData;
    return this.swagger;
  }
  generateClient(namespace = "ApiClient", className = "ApiClient") {
    if (!this.swagger) {
      throw new Error("No loaded specification");
    }

    const models = this.generateModels(namespace);
    const interfaces = this.generateInterfaces(namespace);
    const client = this.generateClientClass(namespace, className);

    return { client, models, interfaces };
  }
  generateModels(namespace) {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.ComponentModel.DataAnnotations;\n`; // Add appropriate JSON library using statement based on options
    if (this.options.useJsonPropertyName) {
      code += `using System.Text.Json.Serialization;\n`;
    } else if (this.options.addJsonPropertyAttributes) {
      code += `using Newtonsoft.Json;\n`;
    }

    // Use file scoped namespace if enabled
    if (this.options.useFileScopedNamespaces) {
      code += `\nnamespace ${namespace}.Models;\n\n`;
    } else {
      code += `\nnamespace ${namespace}.Models\n{\n`;
    }

    if (this.swagger.components && this.swagger.components.schemas) {
      for (const [name, schema] of Object.entries(
        this.swagger.components.schemas
      )) {
        code += this.generateModelClass(name, schema);
      }
    }

    // Close namespace if not using file scoped
    if (!this.options.useFileScopedNamespaces) {
      code += `}\n`;
    }

    return code;
  }
  generateModelClass(name, schema) {
    // Use record types if enabled and not generating immutable classes
    if (this.options.useRecordTypes && !this.options.generateImmutableClasses) {
      return this.generateRecordClass(name, schema);
    }

    const className = this.options.usePascalCase
      ? this.toPascalCase(name)
      : name;

    // Generate primary constructor if enabled
    if (this.options.usePrimaryConstructors && schema.properties) {
      return this.generatePrimaryConstructorClass(name, schema);
    }

    // Determine indentation based on namespace style
    const indent = this.options.useFileScopedNamespaces ? "" : "    ";

    let code = `${indent}public class ${className}\n${indent}{\n`;
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const csharpType = this.mapToCSharpType(propSchema);
        const isRequired =
          schema.required && schema.required.includes(propName);

        // Apply nullable types option
        const finalType =
          this.options.useNullableTypes &&
          !isRequired &&
          !csharpType.includes("?") &&
          !csharpType.startsWith("List<")
            ? `${csharpType}?`
            : csharpType;

        // Property or field name
        const memberName = this.options.usePascalCase
          ? this.toPascalCase(propName)
          : propName;

        // Add JSON attributes if enabled
        if (this.options.addJsonPropertyAttributes) {
          code += `${indent}    [JsonProperty("${propName}")]\n`;
        } else if (this.options.useJsonPropertyName) {
          code += `${indent}    [JsonPropertyName("${propName}")]\n`;
        }

        // Add required attribute
        if (isRequired) {
          code += `${indent}    [Required]\n`;
        }

        // Generate field or property
        if (this.options.useFields) {
          code += `${indent}    public ${finalType} ${memberName};\n\n`;
        } else if (this.options.generateImmutableClasses) {
          code += `${indent}    public ${finalType} ${memberName} { get; init; }\n\n`;
        } else {
          code += `${indent}    public ${finalType} ${memberName} { get; set; }\n\n`;
        }
      }
    }

    code += `${indent}}\n\n`;
    return code;
  }
  generateRecordClass(name, schema) {
    const className = this.options.usePascalCase
      ? this.toPascalCase(name)
      : name;
    let parameters = [];

    // Determine indentation based on namespace style
    const indent = this.options.useFileScopedNamespaces ? "" : "    ";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const csharpType = this.mapToCSharpType(propSchema);
        const isRequired =
          schema.required && schema.required.includes(propName);

        // Apply nullable types option
        const finalType =
          this.options.useNullableTypes &&
          !isRequired &&
          !csharpType.includes("?") &&
          !csharpType.startsWith("List<")
            ? `${csharpType}?`
            : csharpType;

        const memberName = this.options.usePascalCase
          ? this.toPascalCase(propName)
          : propName;

        let paramStr = `${finalType} ${memberName}`;
        if (!isRequired && this.options.useNullableTypes) {
          paramStr += " = null";
        }

        parameters.push(paramStr);
      }
    }

    let code = `${indent}public record ${className}(\n`;
    code += parameters.map((p) => `${indent}    ${p}`).join(",\n");
    code += `\n${indent});\n\n`;

    return code;
  }
  generatePrimaryConstructorClass(name, schema) {
    const className = this.options.usePascalCase
      ? this.toPascalCase(name)
      : name;

    // Determine indentation based on namespace style
    const indent = this.options.useFileScopedNamespaces ? "" : "    ";

    let constructorParams = [];
    let propertyCode = "";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const csharpType = this.mapToCSharpType(propSchema);
        const isRequired =
          schema.required && schema.required.includes(propName);

        // Apply nullable types option
        const finalType =
          this.options.useNullableTypes &&
          !isRequired &&
          !csharpType.includes("?") &&
          !csharpType.startsWith("List<")
            ? `${csharpType}?`
            : csharpType;

        // Property or field name
        const memberName = this.options.usePascalCase
          ? this.toPascalCase(propName)
          : propName;

        // Add to constructor parameters
        let paramStr = `${finalType} ${
          memberName.charAt(0).toLowerCase() + memberName.slice(1)
        }`;
        if (!isRequired && this.options.useNullableTypes) {
          paramStr += " = null";
        }
        constructorParams.push(paramStr);

        // Add JSON attributes if enabled
        if (this.options.addJsonPropertyAttributes) {
          propertyCode += `${indent}    [JsonProperty("${propName}")]\n`;
        } else if (this.options.useJsonPropertyName) {
          propertyCode += `${indent}    [JsonPropertyName("${propName}")]\n`;
        }

        // Add required attribute
        if (isRequired) {
          propertyCode += `${indent}    [Required]\n`;
        }

        // Generate property that maps to constructor parameter
        if (this.options.useFields) {
          propertyCode += `${indent}    public ${finalType} ${memberName} = ${
            memberName.charAt(0).toLowerCase() + memberName.slice(1)
          };\n\n`;
        } else if (this.options.generateImmutableClasses) {
          propertyCode += `${indent}    public ${finalType} ${memberName} { get; init; } = ${
            memberName.charAt(0).toLowerCase() + memberName.slice(1)
          };\n\n`;
        } else {
          propertyCode += `${indent}    public ${finalType} ${memberName} { get; set; } = ${
            memberName.charAt(0).toLowerCase() + memberName.slice(1)
          };\n\n`;
        }
      }
    }

    // Generate class with primary constructor
    let code = `${indent}public class ${className}(\n`;
    code += constructorParams.map((p) => `${indent}    ${p}`).join(",\n");
    code += `\n${indent})\n${indent}{\n`;
    code += propertyCode;
    code += `${indent}}\n\n`;

    return code;
  }
  generateInterfaces(namespace) {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.Threading.Tasks;\nusing ${namespace}.Models;\n\n`;

    // Use file scoped namespace if enabled
    if (this.options.useFileScopedNamespaces) {
      code += `namespace ${namespace}.Interfaces;\n\n`;
      code += `public interface IApiClient\n{\n`;
    } else {
      code += `namespace ${namespace}.Interfaces\n{\n`;
      code += `    public interface IApiClient\n    {\n`;
    }

    if (this.swagger.paths) {
      const indent = this.options.useFileScopedNamespaces ? "    " : "        ";
      for (const [path, methods] of Object.entries(this.swagger.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
          if (typeof operation === "object" && method !== "parameters") {
            const methodSignature = this.generateMethodSignature(
              operation,
              method,
              path
            );
            code += `${indent}${methodSignature};\n`;
          }
        }
      }
    }

    // Close interface and namespace if not using file scoped
    if (this.options.useFileScopedNamespaces) {
      code += `}\n`;
    } else {
      code += `    }\n}\n`;
    }

    return code;
  }
  generateClientClass(namespace, className) {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.Net.Http;\nusing System.Text;\nusing System.Threading.Tasks;\nusing Newtonsoft.Json;\nusing ${namespace}.Models;\nusing ${namespace}.Interfaces;\n\n`;

    // Use file scoped namespace if enabled
    if (this.options.useFileScopedNamespaces) {
      code += `namespace ${namespace};\n\n`;
    } else {
      code += `namespace ${namespace}\n{\n`;
    }

    const indent = this.options.useFileScopedNamespaces ? "    " : "        ";
    const classIndent = this.options.useFileScopedNamespaces ? "" : "    ";

    // Generate primary constructor if enabled
    if (this.options.usePrimaryConstructors) {
      code += `public class ${className}(\n`;
      code += `    HttpClient httpClient,\n`;
      code += `    string baseUrl\n`;
      code += `) : IApiClient\n{\n`;
      code += `${indent}private readonly HttpClient _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));\n`;
      code += `${indent}private readonly string _baseUrl = baseUrl?.TrimEnd('/') ?? throw new ArgumentNullException(nameof(baseUrl));\n\n`;
    } else {
      code += `${classIndent}public class ${className} : IApiClient\n${classIndent}{\n`;
      code += `${indent}private readonly HttpClient _httpClient;\n`;
      code += `${indent}private readonly string _baseUrl;\n\n`;

      code += `${indent}public ${className}(HttpClient httpClient, string baseUrl)\n${indent}{\n`;
      code += `${indent}    _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));\n`;
      code += `${indent}    _baseUrl = baseUrl?.TrimEnd('/') ?? throw new ArgumentNullException(nameof(baseUrl));\n`;
      code += `${indent}}\n\n`;
    }

    if (this.swagger.paths) {
      for (const [path, methods] of Object.entries(this.swagger.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
          if (typeof operation === "object" && method !== "parameters") {
            code += this.generateMethod(path, method, operation);
          }
        }
      }
    }

    code += `${indent}private async Task<T> SendRequestAsync<T>(string url, HttpMethod method, object content = null)\n${indent}{\n`;
    code += `${indent}    var request = new HttpRequestMessage(method, url);\n\n`;
    code += `${indent}    if (content != null)\n${indent}    {\n`;
    code += `${indent}        var json = JsonConvert.SerializeObject(content);\n`;
    code += `${indent}        request.Content = new StringContent(json, Encoding.UTF8, "application/json");\n`;
    code += `${indent}    }\n\n`;
    code += `${indent}    var response = await _httpClient.SendAsync(request);\n`;
    code += `${indent}    response.EnsureSuccessStatusCode();\n\n`;
    code += `${indent}    var responseContent = await response.Content.ReadAsStringAsync();\n`;
    code += `${indent}    return JsonConvert.DeserializeObject<T>(responseContent);\n`;
    code += `${indent}}\n\n`;

    code += `${indent}private async Task SendRequestAsync(string url, HttpMethod method, object content = null)\n${indent}{\n`;
    code += `${indent}    var request = new HttpRequestMessage(method, url);\n\n`;
    code += `${indent}    if (content != null)\n${indent}    {\n`;
    code += `${indent}        var json = JsonConvert.SerializeObject(content);\n`;
    code += `${indent}        request.Content = new StringContent(json, Encoding.UTF8, "application/json");\n`;
    code += `${indent}    }\n\n`;
    code += `${indent}    var response = await _httpClient.SendAsync(request);\n`;
    code += `${indent}    response.EnsureSuccessStatusCode();\n`;
    code += `${indent}}\n`;

    // Close class and namespace if not using file scoped
    if (this.options.useFileScopedNamespaces) {
      code += `}\n`;
    } else {
      code += `    }\n}\n`;
    }

    return code;
  }
  generateMethod(path, httpMethod, operation) {
    const methodName =
      operation.operationId || this.generateMethodName(path, httpMethod);
    const returnType = this.getReturnType(operation);
    const parameters = this.getMethodParameters(operation);
    const pathWithParams = this.buildPathWithParameters(path, operation);

    const indent = this.options.useFileScopedNamespaces ? "    " : "        ";
    const bodyIndent = this.options.useFileScopedNamespaces
      ? "        "
      : "            ";

    let code = `${indent}public async Task${returnType} ${methodName}(${parameters})\n${indent}{\n`;
    code += `${bodyIndent}var url = $"{{_baseUrl}}${pathWithParams}";\n`;

    if (
      httpMethod.toLowerCase() === "get" ||
      httpMethod.toLowerCase() === "delete"
    ) {
      if (returnType === "") {
        code += `${bodyIndent}await SendRequestAsync(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )});\n`;
      } else {
        code += `${bodyIndent}return await SendRequestAsync${returnType}(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )});\n`;
      }
    } else {
      const requestBody = this.getRequestBodyParam(operation);
      if (returnType === "") {
        code += `${bodyIndent}await SendRequestAsync(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )}${requestBody ? `, ${requestBody}` : ""});\n`;
      } else {
        code += `${bodyIndent}return await SendRequestAsync${returnType}(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )}${requestBody ? `, ${requestBody}` : ""});\n`;
      }
    }

    code += `${indent}}\n\n`;
    return code;
  }
  generateMethodSignature(operation, httpMethod, path = "") {
    const methodName =
      operation.operationId || this.generateMethodName(path, httpMethod);
    const returnType = this.getReturnType(operation);
    const parameters = this.getMethodParameters(operation);

    return `Task${returnType} ${methodName}(${parameters})`;
  }

  getReturnType(operation) {
    if (!operation.responses || !operation.responses["200"]) {
      return "";
    }

    const response = operation.responses["200"];
    if (response.content && response.content["application/json"]) {
      const schema = response.content["application/json"].schema;
      if (schema) {
        const type = this.mapToCSharpType(schema);
        return `<${type}>`;
      }
    }

    return "";
  }

  getMethodParameters(operation) {
    let params = [];

    if (operation.parameters) {
      for (const param of operation.parameters) {
        const csharpType = this.mapToCSharpType(
          param.schema || { type: "string" }
        );
        params.push(`${csharpType} ${param.name}`);
      }
    }

    if (operation.requestBody) {
      const content = operation.requestBody.content;
      if (content && content["application/json"]) {
        const schema = content["application/json"].schema;
        const type = this.mapToCSharpType(schema);
        params.push(`${type} requestBody`);
      }
    }

    return params.join(", ");
  }

  getRequestBodyParam(operation) {
    if (operation.requestBody) {
      return "requestBody";
    }
    return null;
  }

  buildPathWithParameters(path, operation) {
    let result = path;

    if (operation.parameters) {
      // Zamień path parameters
      for (const param of operation.parameters) {
        if (param.in === "path") {
          result = result.replace(`{${param.name}}`, `{${param.name}}`);
        }
      }

      // Dodaj query parameters
      const queryParams = operation.parameters.filter((p) => p.in === "query");
      if (queryParams.length > 0) {
        const queryString = queryParams
          .map((p) => `${p.name}={${p.name}}`)
          .join("&");
        result += `?${queryString}`;
      }
    }

    return result;
  }
  mapToCSharpType(schema) {
    if (!schema) return "object";

    if (schema.$ref) {
      const refName = schema.$ref.split("/").pop();
      return this.options.usePascalCase ? this.toPascalCase(refName) : refName;
    }

    if (schema.type === "array") {
      const itemType = this.mapToCSharpType(schema.items);
      if (this.options.useReadonlyLists) {
        return `IReadOnlyList<${itemType}>`;
      }
      return `List<${itemType}>`;
    }

    switch (schema.type) {
      case "integer":
        return schema.format === "int64" ? "long" : "int";
      case "number":
        return schema.format === "float" ? "float" : "double";
      case "string":
        if (schema.format === "date-time") return "DateTime";
        if (schema.format === "date") return "DateTime";
        return "string";
      case "boolean":
        return "bool";
      case "object":
        return "object";
      default:
        return "object";
    }
  }
  generateMethodName(path, method) {
    // Clean up the path: remove parameters, clean slashes and hyphens, and create meaningful name
    let cleanPath = path
      .replace(/[{}]/g, "") // Remove parameter brackets
      .replace(/[\/\-]/g, "_") // Replace slashes and hyphens with underscores
      .replace(/^_+|_+$/g, "") // Remove leading and trailing underscores
      .replace(/_+/g, "_"); // Replace multiple underscores with single one

    // If no path or just underscores, use a generic name
    if (!cleanPath || cleanPath === "_") {
      cleanPath = "Resource";
    }

    // Create method name: HTTP method + cleaned path
    const methodPart = this.capitalizeFirst(method);
    const pathPart = cleanPath
      .split("_")
      .map((part) => this.capitalizeFirst(part))
      .join("");

    return `${methodPart}${pathPart}`;
  }

  toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Method to update options after construction
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }
}

// Make the generator available globally
window.CSharpApiGenerator = CSharpApiGenerator;

// Convenience function to create a generator with window data and options
window.createCSharpApiGenerator = function (options = {}) {
  // Get current options from options manager if available
  if (window.getApiClientOptions && !Object.keys(options).length) {
    options = window.getApiClientOptions("csharp");
  }

  const generator = new CSharpApiGenerator(options);
  if (window.swaggerData) {
    generator.loadFromWindow();
  }
  return generator;
};


/* js/codeApiGenerators/javascriptApiClientGenerator.js */
// JavaScript API Client Generator for openapi-ui
class JavaScriptApiGenerator {
  constructor(options = {}) {
    this.swagger = null;
    this.options = {
      useESModules: true,
      useAsyncAwait: true,
      httpClient: "fetch", // "fetch" or "axios"
      generateTypeScript: false,
      generateClassesForModels: true,
      throwErrors: true,
      includeJSDoc: true,
      ...options,
    };
  }

  async loadFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.swagger = await response.json();
      return this.swagger;
    } catch (error) {
      throw new Error(`Error loading from URL: ${error.message}`);
    }
  }

  loadFromJson(jsonString) {
    try {
      this.swagger = JSON.parse(jsonString);
      return this.swagger;
    } catch (error) {
      throw new Error(`Error parsing JSON: ${error.message}`);
    }
  }

  loadFromSwaggerData(swaggerData) {
    if (!swaggerData) {
      throw new Error("Swagger data is required");
    }
    this.swagger = swaggerData;
    return this.swagger;
  }

  // Load from global window object
  loadFromWindow() {
    if (!window.swaggerData) {
      throw new Error("No swagger data found in window object");
    }
    this.swagger = window.swaggerData;
    return this.swagger;
  }

  generateClient(moduleName = "ApiClient", className = "ApiClient") {
    if (!this.swagger) {
      throw new Error("No Swagger data loaded");
    }

    const models = this.generateModels();
    const client = this.generateClientClass(moduleName, className);
    const types = this.options.generateTypeScript
      ? this.generateTypeDefinitions()
      : null;

    return {
      client,
      models,
      types,
    };
  }

  generateModels() {
    if (!this.swagger.components || !this.swagger.components.schemas) {
      return this.options.useESModules
        ? "// No models to generate\nexport {};"
        : "// No models to generate";
    }

    let code = "";

    if (this.options.includeJSDoc) {
      code += "/**\n * Generated data models\n */\n\n";
    }

    const schemas = this.swagger.components.schemas;
    const modelClasses = [];

    for (const [name, schema] of Object.entries(schemas)) {
      if (this.options.generateClassesForModels) {
        modelClasses.push(this.generateModelClass(name, schema));
      } else {
        modelClasses.push(this.generateModelFactory(name, schema));
      }
    }

    code += modelClasses.join("\n\n");

    if (this.options.useESModules) {
      const exportNames = Object.keys(schemas).map((name) =>
        this.toPascalCase(name)
      );
      code += `\n\nexport { ${exportNames.join(", ")} };`;
    }

    return code;
  }
  generateModelClass(name, schema) {
    const className = this.toPascalCase(name);
    let code = "";

    if (this.options.includeJSDoc) {
      code += `/**\n * ${schema.description || `${className} model`}\n */\n`;
    }

    code += `class ${className} {\n`;

    // Constructor
    code += "  constructor(data = {}) {\n";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const jsType = this.mapToJavaScriptType(propSchema);
        const defaultValue = this.getDefaultValue(propSchema);

        if (this.options.includeJSDoc) {
          code += `    /** @type {${jsType}} */\n`;
        }

        code += `    this.${propName} = data.${propName}`;
        if (defaultValue !== undefined) {
          code += ` !== undefined ? data.${propName} : ${defaultValue}`;
        }
        code += ";\n";
      }
    }

    code += "  }\n\n";

    // toJSON method
    code += "  toJSON() {\n";
    code += "    return {\n";

    if (schema.properties) {
      for (const propName of Object.keys(schema.properties)) {
        code += `      ${propName}: this.${propName},\n`;
      }
    }

    code += "    };\n";
    code += "  }\n";

    // fromJSON static method
    code += `\n  static fromJSON(data) {\n`;
    code += `    return new ${className}(data);\n`;
    code += "  }\n";

    code += "}";

    return code;
  }
  generateModelFactory(name, schema) {
    const factoryName = this.toCamelCase(name);
    let code = "";

    if (this.options.includeJSDoc) {
      code += `/**\n * Creates a ${factoryName} object\n`;
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(
          schema.properties
        )) {
          const jsType = this.mapToJavaScriptType(propSchema);
          code += ` * @param {Object} data - The data object\n`;
          code += ` * @param {${jsType}} [data.${propName}] - ${
            propSchema.description || propName
          }\n`;
        }
      }
      code += ` * @returns {Object} ${factoryName} object\n */\n`;
    }

    code += `function create${factoryName}(data = {}) {\n`;
    code += "  return {\n";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const defaultValue = this.getDefaultValue(propSchema);
        code += `    ${propName}: data.${propName}`;
        if (defaultValue !== undefined) {
          code += ` !== undefined ? data.${propName} : ${defaultValue}`;
        }
        code += ",\n";
      }
    }

    code += "  };\n";
    code += "}";

    return code;
  }

  generateClientClass(moduleName, className) {
    const baseUrl = this.getBaseUrl();
    let code = ""; // Imports
    if (this.options.useESModules) {
      code += "import * as Models from './models.js';\n";
      if (this.options.httpClient === "axios") {
        code += "import axios from 'axios';\n";
      }
      code += "\n";
    } else {
      if (this.options.httpClient === "axios") {
        code +=
          "// Note: This code requires axios to be available globally or via require()\n";
        code += "// Install with: npm install axios\n\n";
      }
    }

    if (this.options.includeJSDoc) {
      code += `/**\n * ${this.swagger.info?.title || moduleName} API Client\n`;
      if (this.swagger.info?.description) {
        code += ` * ${this.swagger.info.description}\n`;
      }
      code += ` */\n`;
    }

    code += `class ${className} {\n`;

    // Constructor
    if (this.options.includeJSDoc) {
      code += "  /**\n   * Creates an instance of the API client\n";
      code += "   * @param {Object} config - Configuration options\n";
      code += "   * @param {string} [config.baseUrl] - Base URL for the API\n";
      code +=
        "   * @param {Object} [config.defaultHeaders] - Default headers for all requests\n";
      code += "   */\n";
    }

    code += "  constructor(config = {}) {\n";
    code += `    this.baseUrl = config.baseUrl || '${baseUrl}';\n`;
    code += "    this.defaultHeaders = config.defaultHeaders || {};\n";
    code += "  }\n\n";

    // Request method
    code += this.generateRequestMethod();

    // Generate API methods
    if (this.swagger.paths) {
      for (const [path, pathItem] of Object.entries(this.swagger.paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (
            [
              "get",
              "post",
              "put",
              "delete",
              "patch",
              "head",
              "options",
            ].includes(method)
          ) {
            code += this.generateMethod(path, method, operation);
          }
        }
      }
    }

    code += "}";

    // Export
    if (this.options.useESModules) {
      code += `\n\nexport default ${className};`;
    } else {
      code += `\n\nif (typeof module !== 'undefined' && module.exports) {\n`;
      code += `  module.exports = ${className};\n`;
      code += "} else if (typeof window !== 'undefined') {\n";
      code += `  window.${className} = ${className};\n`;
      code += "}";
    }

    return code;
  }
  generateRequestMethod() {
    let code = "";

    if (this.options.includeJSDoc) {
      code += "  /**\n   * Makes an HTTP request\n";
      code += "   * @param {string} path - The API path\n";
      code += "   * @param {Object} options - Request options\n";
      code += "   * @returns {Promise<any>} The response data\n";
      code += "   */\n";
    }

    if (this.options.useAsyncAwait) {
      code += "  async request(path, options = {}) {\n";
    } else {
      code += "  request(path, options = {}) {\n";
    }

    code += "    const url = `${this.baseUrl}${path}`;\n";
    code +=
      "    const headers = { ...this.defaultHeaders, ...options.headers };\n\n";

    if (this.options.httpClient === "fetch") {
      code += this.generateFetchCode();
    } else if (this.options.httpClient === "axios") {
      code += this.generateAxiosCode();
    }

    code += "  }\n\n";

    return code;
  }

  generateFetchCode() {
    let code = "";

    code += "    const fetchOptions = {\n";
    code += "      method: options.method || 'GET',\n";
    code += "      headers,\n";
    code += "      ...options\n";
    code += "    };\n\n";

    if (this.options.useAsyncAwait) {
      code += "    try {\n";
      code += "      const response = await fetch(url, fetchOptions);\n\n";

      if (this.options.throwErrors) {
        code += "      if (!response.ok) {\n";
        code +=
          "        throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n";
        code += "      }\n\n";
      }

      code +=
        "      const contentType = response.headers.get('content-type');\n";
      code +=
        "      if (contentType && contentType.includes('application/json')) {\n";
      code += "        return await response.json();\n";
      code += "      }\n";
      code += "      return await response.text();\n";
      code += "    } catch (error) {\n";
      if (this.options.throwErrors) {
        code += "      throw error;\n";
      } else {
        code += "      return { error: error.message };\n";
      }
      code += "    }\n";
    } else {
      code += "    return fetch(url, fetchOptions)\n";
      code += "      .then(response => {\n";
      if (this.options.throwErrors) {
        code += "        if (!response.ok) {\n";
        code +=
          "          throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n";
        code += "        }\n";
      }
      code +=
        "        const contentType = response.headers.get('content-type');\n";
      code +=
        "        if (contentType && contentType.includes('application/json')) {\n";
      code += "          return response.json();\n";
      code += "        }\n";
      code += "        return response.text();\n";
      code += "      })";
      if (!this.options.throwErrors) {
        code += "\n      .catch(error => ({ error: error.message }))";
      }
      code += ";\n";
    }

    return code;
  }

  generateAxiosCode() {
    let code = "";

    code += "    const axiosConfig = {\n";
    code += "      method: options.method || 'GET',\n";
    code += "      url,\n";
    code += "      headers,\n";
    code += "      ...options\n";
    code += "    };\n\n";

    if (this.options.useAsyncAwait) {
      code += "    try {\n";
      code += "      const response = await axios(axiosConfig);\n";
      code += "      return response.data;\n";
      code += "    } catch (error) {\n";
      if (this.options.throwErrors) {
        code += "      if (error.response) {\n";
        code +=
          "        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);\n";
        code += "      }\n";
        code += "      throw error;\n";
      } else {
        code += "      return { error: error.message };\n";
      }
      code += "    }\n";
    } else {
      code += "    return axios(axiosConfig)\n";
      code += "      .then(response => response.data)";
      if (!this.options.throwErrors) {
        code += "\n      .catch(error => ({ error: error.message }))";
      }
      code += ";\n";
    }

    return code;
  }

  generateMethod(path, httpMethod, operation) {
    const methodName = this.generateMethodName(path, httpMethod);
    let code = "";

    if (this.options.includeJSDoc) {
      code += "  /**\n";
      code += `   * ${
        operation.summary || `${httpMethod.toUpperCase()} ${path}`
      }\n`;
      if (operation.description) {
        code += `   * ${operation.description}\n`;
      } // Parameters
      const params = this.getMethodParameters(operation);
      params.forEach((param) => {
        const paramType = this.mapToJavaScriptType(param.schema || param);
        const paramName = this.toCamelCase(param.name);
        code += `   * @param {${paramType}} ${paramName} - ${
          param.description || param.name
        }\n`;
      });

      const returnType = this.getReturnType(operation);
      code += `   * @returns {Promise<${returnType}>} The response data\n`;
      code += "   */\n";
    }

    const signature = this.generateMethodSignature(operation, httpMethod, path);

    if (this.options.useAsyncAwait) {
      code += `  async ${signature} {\n`;
    } else {
      code += `  ${signature} {\n`;
    }

    // Build request options
    code += "    const options = {\n";
    code += `      method: '${httpMethod.toUpperCase()}',\n`;
    code += "      headers: {}\n";
    code += "    };\n\n";

    // Handle request body
    const requestBodyParam = this.getRequestBodyParam(operation);
    if (requestBodyParam) {
      code += "    if (data !== undefined) {\n";
      code += "      options.headers['Content-Type'] = 'application/json';\n";
      code += "      options.body = JSON.stringify(data);\n";
      code += "    }\n\n";
    }

    // Build path with parameters
    const pathWithParams = this.buildPathWithParameters(path, operation);
    code += `    const apiPath = \`${pathWithParams}\`;\n\n`; // Handle query parameters
    const queryParams = this.getQueryParameters(operation);
    if (queryParams.length > 0) {
      code += "    const searchParams = new URLSearchParams();\n";
      queryParams.forEach((param) => {
        const paramName = this.toCamelCase(param.name);
        code += `    if (${paramName} !== undefined) {\n`;
        code += `      searchParams.append('${param.name}', ${paramName});\n`;
        code += "    }\n";
      });
      code += "    const queryString = searchParams.toString();\n";
      code +=
        "    const finalPath = queryString ? `${apiPath}?${queryString}` : apiPath;\n\n";
      code += this.options.useAsyncAwait
        ? "    return await this.request(finalPath, options);\n"
        : "    return this.request(finalPath, options);\n";
    } else {
      code += this.options.useAsyncAwait
        ? "    return await this.request(apiPath, options);\n"
        : "    return this.request(apiPath, options);\n";
    }

    code += "  }\n\n";

    return code;
  }

  generateMethodSignature(operation, httpMethod, path) {
    const methodName = this.generateMethodName(path, httpMethod);
    const params = this.getMethodParameters(operation);
    const requestBodyParam = this.getRequestBodyParam(operation);

    let paramList = []; // Path parameters
    const pathParams = params.filter((p) => p.in === "path");
    pathParams.forEach((param) => {
      const paramName = this.toCamelCase(param.name);
      paramList.push(paramName);
    });

    // Query parameters
    const queryParams = params.filter((p) => p.in === "query");
    queryParams.forEach((param) => {
      const paramName = this.toCamelCase(param.name);
      paramList.push(paramName);
    });

    // Request body
    if (requestBodyParam) {
      paramList.push("data");
    }

    return `${methodName}(${paramList.join(", ")})`;
  }

  getReturnType(operation) {
    if (!operation.responses) return "any";

    const successResponse =
      operation.responses["200"] ||
      operation.responses["201"] ||
      operation.responses["default"];
    if (!successResponse) return "any";

    if (
      successResponse.content &&
      successResponse.content["application/json"]
    ) {
      const schema = successResponse.content["application/json"].schema;
      return this.mapToJavaScriptType(schema);
    }

    return "any";
  }

  getMethodParameters(operation) {
    return operation.parameters || [];
  }

  getQueryParameters(operation) {
    const params = this.getMethodParameters(operation);
    return params.filter((p) => p.in === "query");
  }

  getRequestBodyParam(operation) {
    return operation.requestBody ? operation.requestBody : null;
  }
  buildPathWithParameters(path, operation) {
    let result = path;
    const pathParams = this.getMethodParameters(operation).filter(
      (p) => p.in === "path"
    );
    pathParams.forEach((param) => {
      const paramName = this.toCamelCase(param.name);
      result = result.replace(`{${param.name}}`, `\${${paramName}}`);
    });

    return result;
  }

  mapToJavaScriptType(schema) {
    if (!schema) return "any";

    switch (schema.type) {
      case "integer":
      case "number":
        return "number";
      case "string":
        return "string";
      case "boolean":
        return "boolean";
      case "array":
        const itemType = this.mapToJavaScriptType(schema.items);
        return `${itemType}[]`;
      case "object":
        if (schema.properties) {
          return "Object";
        }
        return "any";
      default:
        if (schema.$ref) {
          const refName = schema.$ref.split("/").pop();
          return this.toPascalCase(refName);
        }
        return "any";
    }
  }

  getDefaultValue(schema) {
    if (schema.default !== undefined) {
      if (typeof schema.default === "string") {
        return `"${schema.default}"`;
      }
      return schema.default;
    }

    switch (schema.type) {
      case "string":
        return '""';
      case "number":
      case "integer":
        return "0";
      case "boolean":
        return "false";
      case "array":
        return "[]";
      case "object":
        return "{}";
      default:
        return "null";
    }
  }
  generateMethodName(path, method) {
    // Remove path parameters and clean up
    let name = path.replace(/\{[^}]+\}/g, "").replace(/[^a-zA-Z0-9]/g, "_");

    // Remove leading/trailing underscores
    name = name.replace(/^_+|_+$/g, "");

    // Always convert to camelCase for method names
    name = this.toCamelCase(name);

    // Prefix with HTTP method
    const methodPrefix = method.toLowerCase();
    return methodPrefix + this.capitalizeFirst(name);
  }

  getBaseUrl() {
    if (this.swagger.servers && this.swagger.servers.length > 0) {
      return this.swagger.servers[0].url;
    }
    return "";
  }

  generateTypeDefinitions() {
    if (!this.options.generateTypeScript) return null;

    let code = "// TypeScript type definitions\n\n";

    if (this.swagger.components && this.swagger.components.schemas) {
      for (const [name, schema] of Object.entries(
        this.swagger.components.schemas
      )) {
        code += this.generateTypeDefinition(name, schema);
        code += "\n\n";
      }
    }

    return code;
  }
  generateTypeDefinition(name, schema) {
    const typeName = this.toPascalCase(name);
    let code = `export interface ${typeName} {\n`;

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const isRequired =
          schema.required && schema.required.includes(propName);
        const tsType = this.mapToTypeScriptType(propSchema);
        const optional = isRequired ? "" : "?";

        if (propSchema.description) {
          code += `  /** ${propSchema.description} */\n`;
        }
        code += `  ${propName}${optional}: ${tsType};\n`;
      }
    }

    code += "}";
    return code;
  }

  mapToTypeScriptType(schema) {
    if (!schema) return "any";

    switch (schema.type) {
      case "integer":
      case "number":
        return "number";
      case "string":
        return "string";
      case "boolean":
        return "boolean";
      case "array":
        const itemType = this.mapToTypeScriptType(schema.items);
        return `${itemType}[]`;
      case "object":
        return "object";
      default:
        if (schema.$ref) {
          const refName = schema.$ref.split("/").pop();
          return this.toPascalCase(refName);
        }
        return "any";
    }
  }
  toCamelCase(str) {
    // Handle PascalCase to camelCase conversion
    if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    }

    // Convert underscore_separated or dash-separated strings to camelCase
    return str
      .split(/[_-]+/)
      .map((word, index) => {
        if (index === 0) {
          // First word stays lowercase
          return word.toLowerCase();
        }
        // Subsequent words get capitalized
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  }

  toPascalCase(str) {
    // Handle already PascalCase strings
    if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
      return str;
    }

    // Convert underscore_separated or dash-separated strings to PascalCase
    return str
      .split(/[_-]+/)
      .map((word) => {
        // All words get capitalized for PascalCase
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Method to update options after construction
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }
}

// Make the generator available globally
window.JavaScriptApiGenerator = JavaScriptApiGenerator;

// Convenience function to create a generator with window data and options
window.createJavaScriptApiGenerator = function (options = {}) {
  // Get current options from options manager if available
  if (window.getApiClientOptions && !Object.keys(options).length) {
    options = window.getApiClientOptions("javascript");
  }

  const generator = new JavaScriptApiGenerator(options);
  if (window.swaggerData) {
    generator.loadFromWindow();
  }
  return generator;
};


/* js/apiClientOptions.js */
// API Client Options Manager
class ApiClientOptionsManager {
  constructor() {
    this.languages = {
      csharp: {
        hasOptions: true,
        defaultOptions: {
          usePascalCase: true,
          useFields: false,
          useNullableTypes: false,
          addJsonPropertyAttributes: false,
          useJsonPropertyName: false,
          generateImmutableClasses: false,
          useRecordTypes: false,
          useReadonlyLists: false,
          useFileScopedNamespaces: false,
          usePrimaryConstructors: false,
        },
      },
      javascript: {
        hasOptions: true,
        defaultOptions: {
          useESModules: true,
          useAsyncAwait: true,
          httpClient: "fetch", // "fetch" or "axios"
          generateTypeScript: "false", // "false" for JavaScript, "true" for TypeScript
          generateClassesForModels: true,
          throwErrors: true,
          includeJSDoc: true,
        },
      },
    };

    this.currentOptions = {};
    this.currentLanguage = null;

    this.initEventHandlers();
  }

  initEventHandlers() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.bindEvents());
    } else {
      this.bindEvents();
    }
  }

  bindEvents() {
    // Options button click
    const optionsBtn = document.getElementById("apiClientOptionsBtn");
    if (optionsBtn) {
      optionsBtn.addEventListener("click", () => this.openOptionsModal());
    }

    // Close modal button
    const closeBtn = document.getElementById("closeOptionsModal");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeOptionsModal());
    }

    // Save options button
    const saveBtn = document.getElementById("saveOptionsBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveOptions());
    }

    // Reset options button
    const resetBtn = document.getElementById("resetOptionsBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetOptions());
    }

    // Close modal when clicking outside
    const modal = document.getElementById("apiClientOptionsModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeOptionsModal();
        }
      });
    }

    // Language dropdown change
    const languageSelect = document.getElementById("apiClientLanguageSelect");
    if (languageSelect) {
      languageSelect.addEventListener("change", (e) => {
        this.handleLanguageChange(e.target.value);
      });

      // Initialize with current selection
      this.handleLanguageChange(languageSelect.value);
    }
  }

  handleLanguageChange(language) {
    this.currentLanguage = language;
    const optionsBtn = document.getElementById("apiClientOptionsBtn");

    if (optionsBtn) {
      if (this.languages[language] && this.languages[language].hasOptions) {
        optionsBtn.classList.remove("hidden");
      } else {
        optionsBtn.classList.add("hidden");
      }
    }

    // Load saved options for this language
    this.loadOptionsForLanguage(language);
  }

  openOptionsModal() {
    const modal = document.getElementById("apiClientOptionsModal");
    if (modal) {
      this.populateModal();
      modal.classList.remove("hidden");
    }
  }

  closeOptionsModal() {
    const modal = document.getElementById("apiClientOptionsModal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }
  populateModal() {
    if (!this.currentLanguage || !this.languages[this.currentLanguage]) {
      return;
    }

    // Hide all language options
    const allLanguageOptions = document.querySelectorAll(".language-options");
    allLanguageOptions.forEach((element) => {
      element.classList.add("hidden");
    });

    // Show options for current language
    const currentLanguageOptions = document.getElementById(
      `${this.currentLanguage}Options`
    );
    if (currentLanguageOptions) {
      currentLanguageOptions.classList.remove("hidden");
    }
    const options = this.getOptionsForLanguage(this.currentLanguage); // Populate form elements (checkboxes and dropdowns)
    Object.entries(options).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = value;
        } else if (element.tagName === "SELECT") {
          // Special handling for generateTypeScript in JavaScript language
          if (
            key === "generateTypeScript" &&
            this.currentLanguage === "javascript"
          ) {
            // Convert boolean to string for dropdown
            element.value =
              value === true || value === "true" ? "true" : "false";
          } else {
            element.value = value;
          }
        }
      }
    }); // Update modal title
    const title = document.querySelector("#apiClientOptionsModal h2");
    if (title) {
      const languageName =
        this.currentLanguage === "javascript"
          ? "JS/TS"
          : this.currentLanguage.charAt(0).toUpperCase() +
            this.currentLanguage.slice(1);
      title.textContent = `${languageName} Generation Options`;
    }
  }
  saveOptions() {
    if (!this.currentLanguage) return;

    const options = {};
    const languageConfig = this.languages[this.currentLanguage];
    if (languageConfig && languageConfig.defaultOptions) {
      Object.keys(languageConfig.defaultOptions).forEach((key) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === "checkbox") {
            options[key] = element.checked;
          } else if (element.tagName === "SELECT") {
            // For generateTypeScript specifically, store as string to maintain dropdown state
            if (
              key === "generateTypeScript" &&
              this.currentLanguage === "javascript"
            ) {
              options[key] = element.value; // Keep as string ("true" or "false")
            } else {
              options[key] = element.value;
            }
          }
        }
      });
    }

    // Save to localStorage with proper key prefix
    this.saveOptionsForLanguage(this.currentLanguage, options);
    this.currentOptions = options;

    this.closeOptionsModal(); // Show feedback using toast
    if (window.showToast) {
      const languageName =
        this.currentLanguage === "javascript"
          ? "JS/TS"
          : this.currentLanguage.charAt(0).toUpperCase() +
            this.currentLanguage.slice(1);
      window.showToast(`${languageName} generation options saved.`, "success");
    }
  }

  resetOptions() {
    if (!this.currentLanguage || !this.languages[this.currentLanguage]) {
      return;
    }
    const defaultOptions = this.languages[this.currentLanguage].defaultOptions;

    // Reset form elements to defaults
    Object.entries(defaultOptions).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = value;
        } else if (element.tagName === "SELECT") {
          element.value = value;
        }
      }
    }); // Show feedback using toast
    if (window.showToast) {
      const languageName =
        this.currentLanguage === "javascript"
          ? "JS/TS"
          : this.currentLanguage.charAt(0).toUpperCase() +
            this.currentLanguage.slice(1);
      window.showToast(
        `${languageName} generation options in modal reset to defaults.`,
        "info"
      );
    } else {
      console.log(
        `${this.currentLanguage} generation options in modal reset to defaults (toast unavailable)`
      );
    }
  }
  getOptionsForLanguage(language) {
    if (!this.languages[language]) {
      return {};
    }

    // Try to load from localStorage first
    const saved = this.loadOptionsForLanguage(language);
    let options;
    if (saved) {
      options = saved;
    } else {
      // Fall back to defaults
      options = { ...this.languages[language].defaultOptions };
    }

    // Convert generateTypeScript string to boolean for JavaScript language
    if (language === "javascript" && options.generateTypeScript !== undefined) {
      options.generateTypeScript =
        options.generateTypeScript === "true" ||
        options.generateTypeScript === true;
    }

    return options;
  }

  loadOptionsForLanguage(language) {
    if (!window.swaggerData || !window.swaggerData.info) {
      return null;
    }

    const storageKey = this.getStorageKey(language);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const options = JSON.parse(saved);
        this.currentOptions = options;
        return options;
      } catch (e) {
        console.warn("Failed to parse saved options:", e);
      }
    }

    // Return defaults if nothing saved
    if (this.languages[language] && this.languages[language].defaultOptions) {
      this.currentOptions = { ...this.languages[language].defaultOptions };
      return this.currentOptions;
    }

    return null;
  }

  saveOptionsForLanguage(language, options) {
    if (!window.swaggerData || !window.swaggerData.info) {
      console.warn("No swagger data available for storage key generation");
      return;
    }

    const storageKey = this.getStorageKey(language);
    localStorage.setItem(storageKey, JSON.stringify(options));
  }

  getStorageKey(language) {
    if (!window.swaggerData || !window.swaggerData.info) {
      return `api_client_options_${language}`;
    }

    const info = window.swaggerData.info;
    const title = (info.title || "api")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const version = (info.version || "1").replace(/[^a-z0-9]/g, "_");

    return `${title}_${version}_api_client_options_${language}`;
  }

  getCurrentOptions() {
    return this.currentOptions || {};
  }
}

// Initialize the options manager
window.apiClientOptionsManager = new ApiClientOptionsManager();

// Make it available globally for other modules
window.getApiClientOptions = function (language) {
  if (window.apiClientOptionsManager) {
    return window.apiClientOptionsManager.getOptionsForLanguage(
      language || "csharp"
    );
  }
  return {};
};


/* js/apiClientGeneration.js */
// API Client Generation functionality

/**
 * Initialize API client generation functionality
 */
function initApiClientGeneration() {
  const languageSelect = document.getElementById("apiClientLanguageSelect");
  const generateBtn = document.getElementById("generateApiClientBtn");
  const fileTabsContainer = document.getElementById("api-client-file-tabs");

  let apiClientEditor = null;
  let generatedFiles = {};
  let fileModels = {}; // Monaco editor models for each file
  let activeFile = null;
  let copyButton = null; // Variable to hold the new copy button

  // Initialize Monaco editor for API client
  function initApiClientEditor() {
    const container = document.getElementById("api-client-monaco-editor");
    if (!container || !window.monaco) {
      console.log("Monaco or container not available for API client editor");
      return;
    } // Create a new editor instance for API client
    apiClientEditor = window.monaco.editor.create(container, {
      value: "// Select a language and generate API client...",
      language: "csharp",
      theme: window.monacoSetup?.getMonacoThemeForCurrentTheme() || "vs-dark",
      readOnly: true,
      minimap: { enabled: false },
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });

    return apiClientEditor;
  }
  // Generate API client based on selected language
  function generateApiClient() {
    const language = languageSelect.value;

    if (!window.swaggerData) {
      showError("No API specification loaded");
      return;
    }

    try {
      if (language === "csharp") {
        generateCSharpClient();
      } else if (language === "javascript") {
        generateJavaScriptClient();
      } else {
        showError("Unsupported language: " + language);
      }
    } catch (error) {
      showError("Error generating API client: " + error.message);
    }
  }
  // Generate C# API client
  function generateCSharpClient() {
    try {
      const generator = window.createCSharpApiGenerator();

      // Get API info for namespacing
      const apiInfo = window.swaggerData.info || {};
      const namespace = (apiInfo.title || "ApiClient").replace(
        /[^a-zA-Z0-9]/g,
        ""
      );
      const className = namespace + "Client";

      const result = generator.generateClient(namespace, className);

      generatedFiles = {
        "Models.cs": result.models,
        "IApiClient.cs": result.interfaces,
        "ApiClient.cs": result.client,
      };

      // Create Monaco models for each file
      createFileModels();

      // Create file tabs
      createFileTabs();

      // Show the first file by default
      const firstFile = Object.keys(generatedFiles)[0];
      if (firstFile) {
        switchToFile(firstFile);
      }
      showSuccess("API client generated successfully!");
    } catch (error) {
      showError("Error generating C# client: " + error.message);
    }
  }
  // Generate JavaScript API client
  function generateJavaScriptClient() {
    try {
      if (typeof window.createJavaScriptApiGenerator !== "function") {
        throw new Error(
          "JavaScriptApiGenerator not loaded. Please check if the JavaScript generator file is properly included."
        );
      }

      const generator = window.createJavaScriptApiGenerator();

      // Get API info for class name
      const apiInfo = window.swaggerData.info || {};
      const apiTitle = apiInfo.title || "Api";
      const moduleName = apiTitle.replace(/[^a-zA-Z0-9]/g, "");
      const className = moduleName + "Client";

      const result = generator.generateClient(moduleName, className);

      const fileExtension = generator.options.generateTypeScript ? "ts" : "js";

      generatedFiles = {};

      // Add main client file
      generatedFiles[`${className}.${fileExtension}`] = result.client;

      // Add models file
      generatedFiles[`models.${fileExtension}`] = result.models;

      // Add TypeScript definitions if generated
      if (result.types) {
        generatedFiles["types.d.ts"] = result.types;
      }

      // Create Monaco models for each file
      createFileModels();

      // Create file tabs
      createFileTabs();

      // Show the first file by default
      const firstFile = Object.keys(generatedFiles)[0];
      if (firstFile) {
        switchToFile(firstFile);
      }

      showSuccess("JS/TS API client generated successfully!");
    } catch (error) {
      showError("Error generating JS/TS client: " + error.message);
    }
  }

  // Create Monaco editor models for each generated file
  function createFileModels() {
    // Dispose existing models
    Object.values(fileModels).forEach((model) => {
      if (model && !model.isDisposed()) {
        model.dispose();
      }
    });
    fileModels = {};

    // Create new models for each file
    Object.entries(generatedFiles).forEach(([fileName, content]) => {
      const language = getLanguageFromFileName(fileName);
      const uri = window.monaco.Uri.parse(`file:///${fileName}`);

      // Check if model already exists
      let model = window.monaco.editor.getModel(uri);
      if (model) {
        model.dispose();
      }

      // Create new model
      model = window.monaco.editor.createModel(content, language, uri);
      fileModels[fileName] = model;
    });
  }

  // Create file tabs UI
  function createFileTabs() {
    if (!fileTabsContainer) return;

    // Clear existing tabs and button
    fileTabsContainer.innerHTML = "";

    const tabsDiv = document.createElement("div");
    tabsDiv.className = "flex"; // Allow tabs to sit left

    Object.keys(generatedFiles).forEach((fileName) => {
      const tab = createFileTab(fileName);
      tabsDiv.appendChild(tab);
    });
    fileTabsContainer.appendChild(tabsDiv);

    // Add new copy button to the fileTabsContainer
    if (Object.keys(generatedFiles).length > 0) {
      if (!copyButton) {
        copyButton = document.createElement("button");
        copyButton.id = "newCopyApiClientBtn";
        copyButton.className =
          "flex items-center px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"; // Tailwind classes for styling
        copyButton.innerHTML =
          '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copy';
        copyButton.addEventListener("click", copyCurrentFile);
      }
      fileTabsContainer.appendChild(copyButton);
    } else {
      // If no files, ensure button is not shown and add placeholder
      if (copyButton) {
        copyButton.remove();
        copyButton = null;
      }
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "file-tabs-empty";
      emptyMessage.textContent = "Generate API client to see files";
      fileTabsContainer.appendChild(emptyMessage);
    }
  }

  // Create a single file tab element
  function createFileTab(fileName) {
    const tab = document.createElement("div");
    tab.className = "file-tab";
    tab.dataset.fileName = fileName;

    // File icon
    const icon = document.createElement("div");
    icon.className = `file-icon ${getFileIconClass(fileName)}`;
    tab.appendChild(icon);

    // File name
    const nameSpan = document.createElement("span");
    nameSpan.className = "file-name";
    nameSpan.textContent = fileName;
    tab.appendChild(nameSpan);

    // Click handler for tab switching
    tab.addEventListener("click", () => {
      switchToFile(fileName);
    });

    return tab;
  }

  // Get CSS class for file icon based on file extension
  function getFileIconClass(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "cs":
        return "cs";
      case "js":
        return "js";
      case "ts":
        return "ts";
      default:
        return "default";
    }
  }

  // Switch to a specific file
  function switchToFile(fileName) {
    if (!apiClientEditor || !fileModels[fileName]) {
      return;
    }

    // Update active file
    activeFile = fileName;

    // Update tab appearance
    updateActiveTab(fileName);

    // Switch Monaco editor model
    apiClientEditor.setModel(fileModels[fileName]);

    // Set focus on editor
    apiClientEditor.focus();
  }

  // Update active tab styling
  function updateActiveTab(activeFileName) {
    if (!fileTabsContainer) return;

    // Remove active class from all tabs
    const tabs = fileTabsContainer.querySelectorAll(".file-tab");
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    // Add active class to current tab
    const activeTab = fileTabsContainer.querySelector(
      `[data-file-name="${activeFileName}"]`
    );
    if (activeTab) {
      activeTab.classList.add("active");
    }
  }

  // Get Monaco language from file name
  function getLanguageFromFileName(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "cs":
        return "csharp";
      case "js":
        return "javascript";
      case "ts":
        return "typescript";
      case "py":
        return "python";
      case "java":
        return "java";
      default:
        return "text";
    }
  }

  // Copy current file content to clipboard
  function copyCurrentFile() {
    if (!apiClientEditor || !activeFile) {
      showError("No content to copy");
      return;
    }

    const content = apiClientEditor.getValue();
    navigator.clipboard
      .writeText(content)
      .then(() => {
        // Show a toast message instead of changing button label
        if (window.showToast) {
          window.showToast(
            `Copied ${activeFile} contents to clipboard`,
            "success"
          );
        }
      })
      .catch((err) => {
        showError("Failed to copy to clipboard");
      });
  }

  // Show success message
  function showSuccess(message) {
    if (window.showToast) {
      window.showToast(message, "success");
    } else {
      // If toast function isn't available, log to console instead of using alert
      console.log(`Success: ${message} (toast unavailable)`);
    }
    // Remove visual feedback that changes button text and background
    // const originalText = generateBtn.textContent;
    // generateBtn.textContent = "Generated!";
    // generateBtn.classList.add("bg-green-700");
    // setTimeout(() => {
    //   generateBtn.textContent = originalText;
    //   generateBtn.classList.remove("bg-green-700");
    // }, 2000);
  }

  // Show error message
  function showError(message) {
    if (window.showToast) {
      window.showToast(message, "error");
    } else {
      // If toast function isn't available, log to console and alert
      console.error(
        `API Client Generation Error: ${message} (toast unavailable)`
      );
      alert(message); // Keep alert for errors if toast is unavailable, as errors are more critical
    }
  }
  // Event listeners
  if (generateBtn) {
    generateBtn.addEventListener("click", generateApiClient);
  }

  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      // Clear previous files when language changes
      generatedFiles = {};
      fileModels = {};
      activeFile = null;

      // Clear file tabs and remove copy button
      if (fileTabsContainer) {
        fileTabsContainer.innerHTML = ""; // Clear everything
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "file-tabs-empty";
        emptyMessage.textContent = "Generate API client to see files";
        fileTabsContainer.appendChild(emptyMessage);
        if (copyButton) {
          copyButton.remove();
          copyButton = null;
        }
      }

      // Reset editor
      if (apiClientEditor) {
        apiClientEditor.setValue(
          "// Select a language and generate API client..."
        );
      }
    });
  }
  // Initialize editor when called
  initApiClientEditor();
  return {
    generateApiClient,
    initApiClientEditor,
    switchToFile,
    getEditor: () => apiClientEditor,
  };
}

// Make available globally
window.initApiClientGeneration = initApiClientGeneration;

// Initialize when Monaco is ready and DOM is loaded
function tryInitApiClient() {
  if (window.monaco && document.getElementById("api-client-monaco-editor")) {
    window.apiClientGeneration = initApiClientGeneration();
  } else {
    // Retry after Monaco loads
    setTimeout(tryInitApiClient, 100);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", tryInitApiClient);
} else {
  tryInitApiClient();
}


/* js/serverSelector.js */
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


/* js/apiLoader.js */
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


/* js/exampleGenerator.js */
// Schema example generation functions

// Generate validation-compliant example from schema
function generateValidExampleFromSchema(
  schema,
  components,
  indent = 0,
  visited = new Set()
) {
  if (!schema) return {};

  let resolvedSchema = schema;
  if (schema.$ref) {
    // Prevent infinite recursion with circular references
    if (visited.has(schema.$ref)) {
      return null;
    }
    visited.add(schema.$ref);

    const refPath = schema.$ref.split("/").slice(1); // Remove #
    resolvedSchema = refPath.reduce(
      (acc, part) => acc && acc[part],
      swaggerData // Use swaggerData instead of components to properly resolve references
    );
    if (!resolvedSchema) {
      return { error: `Could not resolve $ref: ${schema.$ref}` };
    }
  }

  // Use provided example if available
  if (resolvedSchema.example !== undefined) {
    return resolvedSchema.example;
  }
  // Use default value if available
  if (resolvedSchema.default !== undefined) {
    return resolvedSchema.default;
  }

  // Handle type as array (OpenAPI 3.1 JSON Schema compatibility)
  let schemaType = resolvedSchema.type;
  if (Array.isArray(resolvedSchema.type) && resolvedSchema.type.length > 0) {
    // Use first non-null type
    schemaType = resolvedSchema.type.find(type => type !== "null") || resolvedSchema.type[0];
  }

  if (schemaType === "object" && resolvedSchema.properties) {
    const example = {};
    const required = resolvedSchema.required || [];

    // Generate required fields first
    for (const propName of required) {
      if (resolvedSchema.properties[propName] && indent < 5) {
        const value = generateValidExampleFromSchema(
          resolvedSchema.properties[propName],
          components,
          indent + 1,
          new Set(visited)
        );
        if (value !== null) {
          example[propName] = value;
        }
      }
    } // Add all optional fields for completeness
    const optionalProps = Object.keys(resolvedSchema.properties).filter(
      (prop) => !required.includes(prop)
    );

    for (const propName of optionalProps) {
      if (indent < 5) {
        const value = generateValidExampleFromSchema(
          resolvedSchema.properties[propName],
          components,
          indent + 1,
          new Set(visited)
        );
        if (value !== null) {
          example[propName] = value;
        }
      }
    }    return example;
  } else if (schemaType === "array" && resolvedSchema.items) {
    if (indent < 5) {
      const itemExample = generateValidExampleFromSchema(
        resolvedSchema.items,
        components,
        indent + 1,
        new Set(visited)
      );
      return itemExample !== null ? [itemExample] : [];
    } else {
      return [];
    }
  } else {
    return generateValidPrimitiveExample(resolvedSchema);
  }
}

// Helper function to generate example from schema (backward compatibility)
function generateExampleFromSchema(schema, components, indent = 0) {
  return generateValidExampleFromSchema(schema, components, indent);
}

function generateValidPrimitiveExample(schema) {
  // Use provided example if available
  if (schema.example !== undefined) return schema.example;

  // Use default value if available
  if (schema.default !== undefined) return schema.default;
  // Handle enums first
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  // Handle type as array (OpenAPI 3.1 JSON Schema compatibility)
  let schemaType = schema.type;
  if (Array.isArray(schema.type) && schema.type.length > 0) {
    // Use first non-null type
    schemaType = schema.type.find(type => type !== "null") || schema.type[0];
  }

  switch (schemaType) {
    case "string":
      return generateValidStringExample(schema);
    case "integer":
      return generateValidIntegerExample(schema);
    case "number":
      return generateValidNumberExample(schema);
    case "boolean":
      return schema.default !== undefined ? schema.default : true;
    case "array":
      if (schema.items) {
        const itemExample = generateValidPrimitiveExample(schema.items);
        return [itemExample];
      }
      return [];
    case "object":
      if (schema.properties) {
        const objExample = {};
        const required = schema.required || [];

        // Only add required properties for primitive objects
        for (const propName of required) {
          if (schema.properties[propName]) {
            objExample[propName] = generateValidPrimitiveExample(
              schema.properties[propName]
            );
          }
        }
        return objExample;
      }
      if (schema.additionalProperties === true) {
        return { key: "value" };
      }
      return {};
    default:
      return null;
  }
}

function generateValidStringExample(schema) {
  // Handle format-specific examples
  if (schema.format) {
    switch (schema.format) {
      case "email":
        return "user@example.com";
      case "date":
        return "2025-06-01";
      case "date-time":
        return "2025-06-01T10:30:00Z";
      case "uri":
      case "url":
        return "https://example.com";
      case "uuid":
        return "123e4567-e89b-12d3-a456-426614174000";
      case "binary":
        return "base64EncodedData";
      case "byte":
        return "U3dhZ2dlciByb2Nrcw==";
      case "password":
        return "P@ssW0rd*";
      default:
        break;
    }
  }

  // Handle pattern validation
  if (schema.pattern) {
    return generateStringFromPattern(schema.pattern);
  }

  // Generate string based on length constraints
  let baseString = "example";

  if (schema.minLength) {
    // Ensure minimum length
    while (baseString.length < schema.minLength) {
      baseString += "Text";
    }
  }

  if (schema.maxLength) {
    // Ensure maximum length
    if (baseString.length > schema.maxLength) {
      baseString = baseString.substring(0, schema.maxLength);
    }
  }

  return baseString;
}

function generateValidIntegerExample(schema) {
  let value = 1; // Default positive integer

  // Respect minimum constraint
  if (schema.minimum !== undefined) {
    value = Math.max(value, schema.minimum);
    if (schema.exclusiveMinimum) {
      value = Math.max(value, schema.minimum + 1);
    }
  }

  // Respect maximum constraint
  if (schema.maximum !== undefined) {
    value = Math.min(value, schema.maximum);
    if (schema.exclusiveMaximum) {
      value = Math.min(value, schema.maximum - 1);
    }
  }

  // Handle multipleOf constraint
  if (schema.multipleOf) {
    value = Math.ceil(value / schema.multipleOf) * schema.multipleOf;
  }

  return Math.floor(value);
}

function generateValidNumberExample(schema) {
  let value = 1.0; // Default positive number

  // Respect minimum constraint
  if (schema.minimum !== undefined) {
    value = Math.max(value, schema.minimum);
    if (schema.exclusiveMinimum) {
      value = Math.max(value, schema.minimum + 0.1);
    }
  }

  // Respect maximum constraint
  if (schema.maximum !== undefined) {
    value = Math.min(value, schema.maximum);
    if (schema.exclusiveMaximum) {
      value = Math.min(value, schema.maximum - 0.1);
    }
  }

  // Handle multipleOf constraint
  if (schema.multipleOf) {
    value = Math.ceil(value / schema.multipleOf) * schema.multipleOf;
  }

  return value;
}

function generateStringFromPattern(pattern) {
  // Simple pattern-to-example mapping for common patterns
  const patternExamples = {
    "^[0-9a-fA-F]{24}$": "507f1f77bcf86cd799439011",
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$": "Password123",
    "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$": "user@example.com",
    "^https?://": "https://example.com",
    "^[A-Z]{2,3}$": "USD",
    "^\\d{4}-\\d{2}-\\d{2}$": "2025-06-01",
    "^\\+?[1-9]\\d{1,14}$": "+1234567890",
  };

  // Check for exact pattern matches
  for (const [regex, example] of Object.entries(patternExamples)) {
    if (pattern === regex) {
      return example;
    }
  }

  // For other patterns, try to generate a reasonable example
  if (pattern.includes("[0-9]") || pattern.includes("\\d")) {
    return "123456";
  }
  if (pattern.includes("[a-zA-Z]")) {
    return "example";
  }
  if (pattern.includes("@")) {
    return "user@example.com";
  }

  // Default fallback
  return "validString";
}

function generatePrimitiveExample(propSchema, components, indent) {
  // Fallback to the new validation-compliant generator
  return generateValidPrimitiveExample(propSchema);
}

// Main function to generate compliant request body examples
function generateRequestBodyExample(operation, swaggerSpec) {
  if (!operation.requestBody || !operation.requestBody.content) {
    return null;
  }

  const content = operation.requestBody.content;
  const contentTypes = Object.keys(content);

  if (contentTypes.length === 0) {
    return null;
  }

  // Prefer JSON content type
  let selectedContentType =
    contentTypes.find((ct) => ct.includes("json")) || contentTypes[0];
  const selectedContent = content[selectedContentType];

  if (!selectedContent.schema) {
    return null;
  }

  // Generate the example
  const example = generateValidExampleFromSchema(
    selectedContent.schema,
    swaggerSpec.components,
    0
  );

  return {
    contentType: selectedContentType,
    example: example,
  };
}

// Utility function to validate if a value matches schema constraints
function validateAgainstSchema(value, schema, swaggerSpec) {
  try {
    // This is a basic validation - you could integrate with a proper JSON Schema validator
    return validateValue(value, schema, swaggerSpec.components);
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

function validateValue(value, schema, components, path = "") {
  let resolvedSchema = schema;

  // Resolve $ref
  if (schema.$ref) {
    const refPath = schema.$ref.split("/").slice(1);
    resolvedSchema = refPath.reduce((acc, part) => acc && acc[part], {
      components,
    });
  }

  const errors = [];

  // Check required fields for objects
  if (resolvedSchema.type === "object" && resolvedSchema.required) {
    for (const requiredField of resolvedSchema.required) {
      if (value[requiredField] === undefined) {
        errors.push(`Missing required field: ${path}.${requiredField}`);
      }
    }
  }

  // Check type
  if (resolvedSchema.type) {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (
      actualType !== resolvedSchema.type &&
      !(resolvedSchema.type === "integer" && actualType === "number")
    ) {
      errors.push(
        `Type mismatch at ${path}: expected ${resolvedSchema.type}, got ${actualType}`
      );
    }
  }

  // Check string constraints
  if (resolvedSchema.type === "string" && typeof value === "string") {
    if (resolvedSchema.minLength && value.length < resolvedSchema.minLength) {
      errors.push(
        `String too short at ${path}: minimum length ${resolvedSchema.minLength}`
      );
    }
    if (resolvedSchema.maxLength && value.length > resolvedSchema.maxLength) {
      errors.push(
        `String too long at ${path}: maximum length ${resolvedSchema.maxLength}`
      );
    }
    if (
      resolvedSchema.pattern &&
      !new RegExp(resolvedSchema.pattern).test(value)
    ) {
      errors.push(
        `String pattern mismatch at ${path}: must match ${resolvedSchema.pattern}`
      );
    }
    if (resolvedSchema.enum && !resolvedSchema.enum.includes(value)) {
      errors.push(
        `Invalid enum value at ${path}: must be one of ${resolvedSchema.enum.join(
          ", "
        )}`
      );
    }
  }

  // Check number constraints
  if (
    (resolvedSchema.type === "number" || resolvedSchema.type === "integer") &&
    typeof value === "number"
  ) {
    if (
      resolvedSchema.minimum !== undefined &&
      value < resolvedSchema.minimum
    ) {
      errors.push(
        `Number too small at ${path}: minimum ${resolvedSchema.minimum}`
      );
    }
    if (
      resolvedSchema.maximum !== undefined &&
      value > resolvedSchema.maximum
    ) {
      errors.push(
        `Number too large at ${path}: maximum ${resolvedSchema.maximum}`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

// Functions are now globally available


/* js/httpVerbFilter.js */
// HTTP Verb Filter functionality
let httpVerbsPopupVisible = false;
let selectedVerbs = new Set(); // Track selected HTTP verbs

// Function to extract all HTTP verbs from the loaded OpenAPI spec
function extractAvailableHttpVerbs() {
  const availableVerbs = new Set(); // If data isn't available, use fallback methods
  if (!window.swaggerData) {
    console.error("swaggerData is not available, using fallback methods");

    // Fallback to common HTTP methods - apiLoader.js will handle the actual loading
    return ["GET", "POST", "PUT", "DELETE", "PATCH"];
  }

  if (!window.swaggerData.paths) {
    console.error("swaggerData.paths is not available:", window.swaggerData);
    // Add some default methods for testing
    return ["GET", "POST", "PUT", "DELETE", "PATCH"];
  }
  const paths = window.swaggerData.paths;

  // Iterate through all paths and methods
  for (const path in paths) {
    for (const method in paths[path]) {
      // Convert to uppercase (GET, POST, etc.)
      availableVerbs.add(method.toUpperCase());
    }
  }

  const result = Array.from(availableVerbs).sort();
  return result;
}

// Load selected verbs from localStorage
function loadSelectedVerbs() {
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";

  const savedVerbs = localStorage.getItem(`${apiPrefix}_selected_http_verbs`);
  if (savedVerbs) {
    try {
      const parsedVerbs = JSON.parse(savedVerbs);
      selectedVerbs = new Set(parsedVerbs);
    } catch (e) {
      console.error("Error parsing saved HTTP verbs:", e);
      selectedVerbs = new Set();
    }
  } else {
    selectedVerbs = new Set();
  }
}

// Save selected verbs to localStorage
function saveSelectedVerbs() {
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";

  localStorage.setItem(
    `${apiPrefix}_selected_http_verbs`,
    JSON.stringify(Array.from(selectedVerbs))
  );
}

// Toggle individual HTTP verb selection
function toggleVerb(verbPill) {
  const verb = verbPill.dataset.verb.toLowerCase();

  // Toggle selection state
  if (selectedVerbs.has(verb)) {
    selectedVerbs.delete(verb);
    verbPill.classList.remove("selected");
  } else {
    selectedVerbs.add(verb);
    verbPill.classList.add("selected");
  }

  // If any verbs are selected, ALL should not be selected
  const allPill = document.querySelector(".http-verb-pill.all");
  if (allPill) {
    if (selectedVerbs.size > 0) {
      allPill.classList.remove("selected");
    } else {
      allPill.classList.add("selected");
    }
  }
}

// Toggle all verbs on/off
function toggleAllVerbs(allPill) {
  const verbPills = document.querySelectorAll(".http-verb-pill:not(.all)");

  // If we're selecting ALL (which means deselecting all individual verbs)
  if (!allPill.classList.contains("selected")) {
    // Clear all selections and select the ALL pill
    selectedVerbs.clear();
    allPill.classList.add("selected");

    // Deselect all other pills
    verbPills.forEach((pill) => {
      pill.classList.remove("selected");
    });
  }
}

// Clear all selected verbs
function clearAllVerbs() {
  selectedVerbs.clear();

  // Update UI to show ALL selected
  const allPill = document.querySelector(".http-verb-pill.all");
  const verbPills = document.querySelectorAll(".http-verb-pill:not(.all)");

  if (allPill) {
    allPill.classList.add("selected");
  }

  verbPills.forEach((pill) => {
    pill.classList.remove("selected");
  });
  // Clear from localStorage as well
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";
  localStorage.removeItem(`${apiPrefix}_selected_http_verbs`);

  // Reset the filter button state
  updateFilterButtonState();
}

// Apply the current verb filter selection
function applyVerbFilters() {
  // Save selected verbs to localStorage
  saveSelectedVerbs();

  // Apply filtering
  filterSidebarByHttpVerbs();

  // Force opacity update on all expanded containers to ensure endpoints are visible
  setTimeout(() => {
    document
      .querySelectorAll(".endpoints-container.expanded")
      .forEach((container) => {
        // This forces a repaint of the container, ensuring opacity is applied
        container.style.opacity = "1";
        container.style.visibility = "visible";
      });
  }, 50);

  // Close the popup
  toggleHttpVerbsPopup();
}

// Function to populate the HTTP verbs popup with pills
function populateHttpVerbsPopup() {
  const popup = document.getElementById("http-verbs-popup");

  if (!popup) {
    console.error("HTTP verbs popup element not found!");
    return;
  }

  // Load saved selections
  loadSelectedVerbs();

  // Ensure we have a valid selectedVerbs set
  if (!selectedVerbs) {
    selectedVerbs = new Set();
  }

  const verbs = extractAvailableHttpVerbs();
  const pillsContainer = popup.querySelector(".http-verb-pills-container");

  if (!pillsContainer) {
    console.error("Pills container not found!");
    return;
  }

  // Clear previous content
  pillsContainer.innerHTML = "";
  // Add "ALL" pill
  const allPill = document.createElement("button");
  allPill.className = `http-verb-pill all ${
    selectedVerbs.size === 0 ? "selected" : ""
  }`;
  allPill.textContent = "ALL";
  allPill.dataset.verb = "all";

  allPill.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAllVerbs(allPill);
  });

  pillsContainer.appendChild(allPill);

  // Add each available HTTP verb as a pill
  verbs.forEach((verb) => {
    const verbPill = document.createElement("button");
    verbPill.dataset.verb = verb.toLowerCase();

    // Check if this verb is currently selected
    const isSelected = selectedVerbs.has(verb.toLowerCase());

    // Assign color class based on the HTTP verb
    verbPill.className = `http-verb-pill ${verb.toLowerCase()} ${
      isSelected ? "selected" : ""
    }`;
    verbPill.textContent = verb;

    verbPill.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVerb(verbPill);
    });

    pillsContainer.appendChild(verbPill);
  });

  // Set up clear and apply buttons
  const clearButton = document.getElementById("clear-verb-filters");
  const applyButton = document.getElementById("apply-verb-filters");

  if (clearButton) {
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      clearAllVerbs();
    });
  }

  if (applyButton) {
    applyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      applyVerbFilters();
    });
  }
}

// Function to toggle the HTTP verbs popup
function toggleHttpVerbsPopup() {
  const popup = document.getElementById("http-verbs-popup");

  if (!popup) return;

  httpVerbsPopupVisible = !httpVerbsPopupVisible;

  if (httpVerbsPopupVisible) {
    popup.classList.remove("hidden");
    populateHttpVerbsPopup();
  } else {
    popup.classList.add("hidden");
  }
}

// Function to filter sidebar by multiple HTTP verbs
function filterSidebarByHttpVerbs() {
  // Get all endpoint links
  const endpointLinks = document.querySelectorAll(".endpoint-link");

  // Get current search term
  const searchInput = document.getElementById("sidebar-search");
  const currentSearchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  // Update filter button state
  updateFilterButtonState();

  // If no verbs are selected (ALL is active), reset filtering but respect search term
  if (selectedVerbs.size === 0) {
    // Remove any stored verb filter since we're clearing filters
    const apiPrefix =
      window.swaggerData?.info?.title && window.swaggerData?.info?.version
        ? `${window.swaggerData.info.title
            .toLowerCase()
            .replace(/\s+/g, "_")}_${window.swaggerData.info.version
            .toLowerCase()
            .replace(/\s+/g, "_")}`
        : "openapi_ui_default";
    localStorage.removeItem(`${apiPrefix}_selected_http_verbs`);

    if (currentSearchTerm) {
      // Reapply search filter without verb filter
      filterSidebar(currentSearchTerm);
    } else {
      // Show all endpoints if no search term
      endpointLinks.forEach((link) => {
        link.style.display = "";
      });

      // Make sure all tags with visible endpoints are expanded
      const tagSections = document.querySelectorAll(
        "#api-navigation > div.mt-2"
      );
      tagSections.forEach((tagSection) => {
        tagSection.style.display = "";
        const endpointsContainer = tagSection.querySelector(
          ".endpoints-container"
        );
        if (endpointsContainer) {
          // Add the expanded class to set opacity to 1
          endpointsContainer.classList.add("expanded");
          endpointsContainer.style.maxHeight =
            endpointsContainer.scrollHeight + 50 + "px";

          // Also rotate the arrow to show the section is expanded
          const arrow = tagSection.querySelector("svg.sidebar-arrow");
          if (arrow) arrow.classList.add("rotate-90");
        }
      });
    }
    return;
  }

  // Show only endpoints matching both any selected HTTP verbs and search term if present
  endpointLinks.forEach((link) => {
    const method = link.dataset.method.toLowerCase();
    const path = link.dataset.path ? link.dataset.path.toLowerCase() : "";
    const methodBadgeText = link.querySelector("span")
      ? link.querySelector("span").textContent
      : "";
    const summary = link.textContent
      .replace(methodBadgeText, "")
      .trim()
      .toLowerCase();

    const matchesVerb = selectedVerbs.has(method);
    const matchesSearch =
      !currentSearchTerm ||
      path.includes(currentSearchTerm) ||
      summary.includes(currentSearchTerm) ||
      method.includes(currentSearchTerm);

    if (matchesVerb && matchesSearch) {
      link.style.display = "";
    } else {
      link.style.display = "none";
    }
  });

  // For each tag section, check if it has any visible endpoints
  const tagSections = document.querySelectorAll("#api-navigation > div.mt-2");
  tagSections.forEach((tagSection) => {
    const endpointsContainer = tagSection.querySelector(".endpoints-container");
    const visibleEndpoints = endpointsContainer
      ? Array.from(
          endpointsContainer.querySelectorAll(".endpoint-link")
        ).filter((link) => link.style.display !== "none")
      : [];

    if (visibleEndpoints.length > 0) {
      tagSection.style.display = "";
      // Expand the section to show visible endpoints
      if (endpointsContainer) {
        endpointsContainer.classList.add("expanded");
        const arrow = tagSection.querySelector("svg.sidebar-arrow");
        if (arrow) arrow.classList.add("rotate-90");
        endpointsContainer.style.maxHeight =
          endpointsContainer.scrollHeight + 50 + "px";
      }
    } else {
      tagSection.style.display = "none";
    }
  });
}

// Initialize HTTP verb filter
function initHttpVerbFilter() {
  const filterButton = document.getElementById("http-verb-filter");
  const popup = document.getElementById("http-verbs-popup");
  const searchInput = document.getElementById("sidebar-search");

  if (filterButton) {
    // Set tooltip for the filter button
    filterButton.title = "Filter by HTTP methods";

    filterButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleHttpVerbsPopup();
    });

    // Update icon color to show active state
    updateFilterButtonState();
  }

  // Handle search input to ensure HTTP verb filtering is preserved
  if (searchInput) {
    const originalInputHandler = searchInput.oninput;

    searchInput.addEventListener("input", function (e) {
      // Call the original handler if it exists
      if (typeof originalInputHandler === "function") {
        originalInputHandler.call(this, e);
      }

      // Reapply verb filters if they exist, after search filtering
      if (selectedVerbs.size > 0) {
        setTimeout(() => {
          filterSidebarByHttpVerbs();
        }, 50);
      }
    });
  }

  // Close popup when clicking outside
  document.addEventListener("click", (e) => {
    if (
      httpVerbsPopupVisible &&
      !popup.contains(e.target) &&
      e.target.id !== "http-verb-filter"
    ) {
      httpVerbsPopupVisible = false;
      popup.classList.add("hidden");
    }
  });

  // Set up the clear and apply buttons
  const clearButton = document.getElementById("clear-verb-filters");
  const applyButton = document.getElementById("apply-verb-filters");

  if (clearButton) {
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      clearAllVerbs();
    });
  }

  if (applyButton) {
    applyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      applyVerbFilters();
    });
  }

  // Load any saved preferences
  loadSelectedVerbs();
  if (selectedVerbs.size > 0) {
    filterSidebarByHttpVerbs();
  }
}

// Update the filter button to show an active state when filter is applied
function updateFilterButtonState() {
  const filterButton = document.getElementById("http-verb-filter");
  if (!filterButton) return;

  // Find the SVG inside the filter button
  const filterIcon = filterButton.querySelector("svg");

  // Find the counter badge
  const counterBadge = document.getElementById("filter-counter");

  if (selectedVerbs.size > 0) {
    // Active state - change color and style
    filterButton.classList.add("text-blue-600");
    filterButton.classList.remove("text-gray-400");

    // Add active class for styling
    filterButton.classList.add("active");

    // Make the icon slightly bolder when active
    if (filterIcon) {
      filterIcon.setAttribute("stroke-width", "2.5");

      // Add a slight animation - rotate icon slightly
      filterIcon.style.transform = "rotate(-5deg)";
    }

    // Show the counter badge with the number of filters
    if (counterBadge) {
      counterBadge.textContent = selectedVerbs.size;
      counterBadge.classList.remove("hidden");
    }

    // Set the title to include the active filter list
    const verbsList = Array.from(selectedVerbs)
      .map((v) => v.toUpperCase())
      .join(", ");
    filterButton.title = `Filtering by ${verbsList}`;
  } else {
    // Inactive state - restore default appearance
    filterButton.classList.remove("text-blue-600");
    filterButton.classList.add("text-gray-400");
    filterButton.classList.remove("active");

    // Restore normal stroke width and remove rotation
    if (filterIcon) {
      filterIcon.setAttribute("stroke-width", "2");
      filterIcon.style.transform = "rotate(0deg)";
    }

    // Hide the counter badge
    if (counterBadge) {
      counterBadge.classList.add("hidden");
    }

    filterButton.title = "Filter by HTTP methods";
  }
}

// Initialize http verb filter
function attemptFilterInit() {
  // Listen for the custom event that indicates Swagger data is loaded
  document.addEventListener("swaggerDataLoaded", function (event) {
    initHttpVerbFilter();
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Try to initialize if data is already loaded
  if (window.swaggerData) {
    initHttpVerbFilter();
  } else {
    // Wait for swagger data to be loaded
    attemptFilterInit();
  }
});


/* js/sidebarHandler.js */
// Function to filter sidebar navigation based on search term
function filterSidebar(searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const navigation = document.getElementById("api-navigation");
  if (!navigation) return;
  // Check if there are active HTTP verb filters (now using multi-select)
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";

  // Get selected HTTP verbs from local storage
  let activeVerbFilters = [];
  const savedVerbs = localStorage.getItem(`${apiPrefix}_selected_http_verbs`);
  if (savedVerbs) {
    try {
      activeVerbFilters = JSON.parse(savedVerbs);
    } catch (e) {
      console.error("Error parsing saved HTTP verbs:", e);
      activeVerbFilters = [];
    }
  }

  const tagSections = navigation.querySelectorAll("#api-navigation > div.mt-2");

  tagSections.forEach((tagSection) => {
    const tagHeader = tagSection.querySelector("a");
    const tagNameElement = tagHeader
      ? tagHeader.querySelector("span:first-child")
      : null;
    const tagName = tagNameElement
      ? tagNameElement.textContent.toLowerCase()
      : "";
    const endpointsContainer = tagSection.querySelector(".endpoints-container");
    const endpointLinks = endpointsContainer
      ? endpointsContainer.querySelectorAll(".endpoint-link")
      : [];
    const arrow = tagHeader ? tagHeader.querySelector("svg") : null;

    if (!endpointsContainer) return; // Safety check

    if (lowerSearchTerm === "") {
      tagSection.style.display = "";
      if (endpointsContainer) {
        endpointsContainer.style.maxHeight = null; // Reset max-height
        endpointsContainer.classList.remove("expanded"); // Collapse using class
      }
      if (tagHeader) tagHeader.classList.remove("bg-gray-200");
      if (arrow) arrow.classList.remove("rotate-90");

      // If we have verb filters but no search term, still apply verb filtering
      if (activeVerbFilters.length > 0) {
        endpointLinks.forEach((link) => {
          const method = link.dataset.method
            ? link.dataset.method.toLowerCase()
            : "";
          const matchesVerbFilter = activeVerbFilters.includes(method);
          link.style.display = matchesVerbFilter ? "" : "none";
        });

        // Check if any endpoints are visible
        const visibleEndpoints = Array.from(endpointLinks).filter(
          (link) => link.style.display !== "none"
        );
        if (visibleEndpoints.length > 0) {
          // Expand this section
          endpointsContainer.classList.add("expanded");
          if (arrow) arrow.classList.add("rotate-90");
          endpointsContainer.style.maxHeight =
            endpointsContainer.scrollHeight + 50 + "px";
        }
      } else {
        // No verb filters and no search, show all
        endpointLinks.forEach((link) => (link.style.display = ""));
      }
    } else {
      let atLeastOneEndpointVisibleInTag = false;
      endpointLinks.forEach((link) => {
        const method = link.dataset.method
          ? link.dataset.method.toLowerCase()
          : "";
        const path = link.dataset.path ? link.dataset.path.toLowerCase() : "";
        const methodBadgeText = link.querySelector("span")
          ? link.querySelector("span").textContent
          : "";
        const summary = link.textContent
          .replace(methodBadgeText, "")
          .trim()
          .toLowerCase();

        // Check if the endpoint matches both search term and active verb filters (if any)
        const matchesSearch =
          method.includes(lowerSearchTerm) ||
          path.includes(lowerSearchTerm) ||
          summary.includes(lowerSearchTerm);

        // With multiple verb filters, check if method is in the list of active filters
        const matchesVerbFilter =
          activeVerbFilters.length === 0 || activeVerbFilters.includes(method);

        if (matchesSearch && matchesVerbFilter) {
          link.style.display = "";
          atLeastOneEndpointVisibleInTag = true;
        } else {
          link.style.display = "none";
        }
      });

      if (tagName.includes(lowerSearchTerm) || atLeastOneEndpointVisibleInTag) {
        tagSection.style.display = "";
        if (endpointsContainer) {
          // Expanding due to search
          endpointsContainer.style.maxHeight =
            endpointsContainer.scrollHeight + "px";
          endpointsContainer.classList.add("expanded"); // Expand using class
        }
        if (tagHeader) tagHeader.classList.add("bg-gray-200");
        if (arrow) arrow.classList.add("rotate-90");
      } else {
        tagSection.style.display = "none";
        if (endpointsContainer) {
          endpointsContainer.style.maxHeight = null; // Reset max-height
          endpointsContainer.classList.remove("expanded"); // Collapse if tag section is hidden
        }
        // Ensure styling is reset if tag section is hidden by search
        if (tagHeader) tagHeader.classList.remove("bg-gray-200");
        if (arrow) arrow.classList.remove("rotate-90");
      }
    }
  });
}

// Function to build the sidebar
function buildSidebar() {
  if (!swaggerData || !swaggerData.paths) return;

  const navigation = document.getElementById("api-navigation");
  if (!navigation) return;
  navigation.innerHTML = ""; // Clear existing sidebar

  const tagsOrder = swaggerData.tags
    ? swaggerData.tags.map((tag) => tag.name)
    : [];
  const pathsByTag = {};

  // Group paths by their first tag
  for (const path in swaggerData.paths) {
    for (const method in swaggerData.paths[path]) {
      const operation = swaggerData.paths[path][method];
      const tag =
        operation.tags && operation.tags.length > 0
          ? operation.tags[0]
          : "default";

      if (!pathsByTag[tag]) {
        pathsByTag[tag] = [];
      }
      pathsByTag[tag].push({
        path,
        method,
        summary: operation.summary || path,
      });
    }
  }

  // Maintain the order of tags as specified in swagger.json, then add any untagged
  const sortedTags = [...tagsOrder];
  for (const tag in pathsByTag) {
    if (!sortedTags.includes(tag)) {
      sortedTags.push(tag);
    }
  }

  sortedTags.forEach((tag) => {
    if (!pathsByTag[tag] || pathsByTag[tag].length === 0) return;

    const tagSection = document.createElement("div");
    tagSection.className = "mt-2";

    const tagHeader = document.createElement("a");
    tagHeader.href = "#";
    tagHeader.className =
      "tag-header flex items-center px-6 py-3 text-gray-700 ;"; // Removed bg-gray-200 for non-active
    const sectionCount = pathsByTag[tag].length;
    tagHeader.innerHTML = `
            <div class="flex items-center flex-grow">
              <span class="ml-1">${tag}</span>
              <span class="endpoint-count ml-2">${sectionCount}</span>
            </div>
            <span class="ml-auto">
                <svg class="w-4 h-4 text-gray-400 transform sidebar-arrow" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
            </span>
        `;
    const endpointsContainer = document.createElement("div");
    endpointsContainer.className = "endpoints-container pl-3 pr-4 py-1";
    // Ensure it starts collapsed with explicit style
    endpointsContainer.style.maxHeight = "0px";
    tagHeader.addEventListener("click", (e) => {
      e.preventDefault();
      const arrow = tagHeader.querySelector("svg");

      if (endpointsContainer.classList.contains("expanded")) {
        // Collapsing
        endpointsContainer.classList.remove("expanded");
        tagHeader.classList.remove("bg-gray-200");
        if (arrow) arrow.classList.remove("rotate-90");
        // Set a specific height of 0 to ensure collapse
        endpointsContainer.style.maxHeight = "0px";
      } else {
        // Expanding
        endpointsContainer.classList.add("expanded");
        tagHeader.classList.add("bg-gray-200");
        if (arrow) arrow.classList.add("rotate-90");
        // Set max-height explicitly to content height + buffer
        const contentHeight = endpointsContainer.scrollHeight;
        endpointsContainer.style.maxHeight = `${contentHeight + 50}px`;
      }
    });

    // Populate endpoints container based on view mode
    if (viewMode === "list") {
      // List view (original implementation)
      buildListView(pathsByTag[tag], endpointsContainer);
    } else {
      // Tree view (hierarchical implementation)
      buildTreeView(pathsByTag[tag], endpointsContainer);
    }

    tagSection.appendChild(tagHeader);
    tagSection.appendChild(endpointsContainer);
    navigation.appendChild(tagSection);
  });
}

// Functions are now globally available


/* js/sidebarToggle.js */
// Module to handle opening/closing sidebars on small screens with enhanced animations
function initSidebarToggle() {
  const leftSidebar = document.getElementById("left-sidebar");
  const rightSidebar = document.getElementById("right-sidebar");
  const openLeftBtn = document.getElementById("open-left-sidebar");
  const toggleRightBtn = document.getElementById("toggle-right-sidebar");

  // Create backdrop element for mobile
  const backdrop = document.createElement("div");
  backdrop.className = "sidebar-backdrop";
  backdrop.id = "sidebar-backdrop";
  document.body.appendChild(backdrop);

  // Function to close any open sidebar
  function closeSidebars() {
    if (leftSidebar && leftSidebar.classList.contains("translate-x-0")) {
      leftSidebar.classList.add("-translate-x-full");
      leftSidebar.classList.remove("translate-x-0");
    }
    if (rightSidebar && rightSidebar.classList.contains("translate-x-0")) {
      rightSidebar.classList.add("translate-x-full");
      rightSidebar.classList.remove("translate-x-0");
      // Reset right sidebar toggle button
      if (toggleRightBtn) {
        const iconPath = toggleRightBtn.querySelector("#toggle-right-icon");
        if (iconPath) {
          iconPath.setAttribute("d", "M13 10V3L4 14h7v7l9-11h-7z");
        }
        toggleRightBtn.classList.remove("expanded");
      }
    }
    backdrop.classList.remove("active");
    document.body.classList.remove("sidebar-open");
  }

  // Left sidebar toggle
  openLeftBtn?.addEventListener("click", () => {
    const isOpen = leftSidebar.classList.contains("translate-x-0");

    if (isOpen) {
      closeSidebars();
    } else {
      // Close right sidebar if open
      if (rightSidebar && rightSidebar.classList.contains("translate-x-0")) {
        closeSidebars();
      }

      leftSidebar.classList.remove("-translate-x-full");
      leftSidebar.classList.add("translate-x-0");
      backdrop.classList.add("active");
      document.body.classList.add("sidebar-open");
    }
  });

  // Right sidebar toggle
  toggleRightBtn?.addEventListener("click", () => {
    const isOpen = rightSidebar.classList.contains("translate-x-0");
    const iconPath = toggleRightBtn.querySelector("#toggle-right-icon");

    if (isOpen) {
      closeSidebars();
    } else {
      // Close left sidebar if open
      if (leftSidebar && leftSidebar.classList.contains("translate-x-0")) {
        closeSidebars();
      }

      // Open right sidebar
      rightSidebar.classList.remove("translate-x-full");
      rightSidebar.classList.add("translate-x-0");
      backdrop.classList.add("active");
      document.body.classList.add("sidebar-open");

      // Update toggle button icon and state
      if (iconPath) {
        iconPath.setAttribute("d", "M6 18L18 6M6 6l12 12");
      }
      toggleRightBtn.classList.add("expanded");
    }
  });

  // Close sidebars when clicking backdrop
  backdrop.addEventListener("click", closeSidebars);

  // Close sidebars on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSidebars();
    }
  });

  // Close sidebars when screen becomes large enough
  const mediaQuery = window.matchMedia("(min-width: 1280px)");
  function handleScreenChange(e) {
    if (e.matches) {
      // Screen is large, remove mobile classes and backdrop
      closeSidebars();
    }
  }
  mediaQuery.addEventListener("change", handleScreenChange);
}

// Initialize toggle handlers: if DOM already loaded, call directly
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSidebarToggle);
} else {
  initSidebarToggle();
}


/* js/sidebarExpand.js */
// Enhanced sidebar functionality - ensures endpoints sections collapse and expand properly
document.addEventListener("DOMContentLoaded", function () {
  // Find all existing endpoint containers and ensure they are expanded by default
  const allEndpointContainers = document.querySelectorAll(
    ".endpoints-container"
  );
  allEndpointContainers.forEach((container) => {
    // Ensure all containers are expanded
    container.classList.add("expanded");
    const contentHeight = container.scrollHeight;
    container.style.maxHeight = `${contentHeight + 50}px`;

    // Make sure arrow is rotated and header has active class
    const header = container.previousElementSibling;
    if (header) {
      header.classList.add("bg-gray-200");
      const arrow = header.querySelector("svg.sidebar-arrow");
      if (arrow) {
        arrow.classList.add("rotate-90");
      }
    }
  });

  // Listen for clicks on tag headers that might not have been properly initialized
  // This is a safety measure for dynamic content that might be added later
  document.addEventListener("click", function (e) {
    // Check if the click was directly on the SVG arrow (not handled by main click handler)
    if (
      e.target.closest("svg.sidebar-arrow") ||
      (e.target.closest("path") && e.target.closest("svg.sidebar-arrow"))
    ) {
      const targetHeader = e.target.closest("a");
      if (targetHeader) {
        const targetContainer = targetHeader.parentElement.querySelector(
          ".endpoints-container"
        );
        if (targetContainer) {
          e.stopPropagation(); // Prevent any double-handling

          const isExpanded = targetContainer.classList.contains("expanded");
          setTimeout(() => {
            // Add a small delay to let the main handler finish first
            if (isExpanded && targetContainer.style.maxHeight !== "0px") {
              // Ensure it's properly collapsed if the class indicates it should be
              targetContainer.style.maxHeight = "0px";
            } else if (
              !isExpanded &&
              targetContainer.style.maxHeight === "0px"
            ) {
              // Ensure it's properly expanded if the class indicates it should be
              targetContainer.style.maxHeight = `${
                targetContainer.scrollHeight + 50
              }px`;
            }
          }, 50);
        }
      }
    }
  });
});


/* js/mainContentBuilder.js */
// Functions to build main content area

// Helper function to render description with markdown support
function renderDescriptionWithMarkdown(description) {
  if (!description) return "";

  if (
    window.markdownRenderer &&
    typeof window.markdownRenderer.renderSafe === "function"
  ) {
    try {
      const rendered = window.markdownRenderer.renderSafe(description);
      return rendered;
    } catch (error) {
      return `<p class="text-gray-700 mb-4">${description}</p>`;
    }
  } else {
    return `<p class="text-gray-700 mb-4">${description}</p>`;
  }
}

// Helper function to format type names, especially for arrays
function formatTypeDisplay(schema) {
  // Use the enhanced version if available, fallback to basic version
  if (window.formatTypeDisplayWithPopovers) {
    return window.formatTypeDisplayWithPopovers(schema);
  }

  // Fallback implementation for when popovers aren't loaded
  if (!schema || !schema.type) return "unknown";

  if (schema.type === "array" && schema.items) {
    let itemType = "unknown";

    if (schema.items.type) {
      // Direct type
      itemType = schema.items.type;
    } else if (schema.items.$ref) {
      // Reference to custom schema - extract the type name from the $ref
      const refParts = schema.items.$ref.split("/");
      itemType = refParts[refParts.length - 1]; // Get the last part after the last '/'
    }

    return `${itemType}[]`;
  }

  // Handle direct schema references
  if (schema.$ref) {
    const refParts = schema.$ref.split("/");
    const typeName = refParts[refParts.length - 1];
    return typeName;
  }

  return schema.type;
}

// Helper function to build detailed schema information
function buildSchemaDetails(schema, components) {
  if (!schema) return "";

  let resolvedSchema = schema;
  if (schema.$ref) {
    const refPath = schema.$ref.split("/").slice(1); // Remove #
    resolvedSchema = refPath.reduce(
      (acc, part) => acc && acc[part],
      swaggerData // Use swaggerData to properly resolve references
    );
    if (!resolvedSchema) {
      return `<p class="text-sm text-red-500">Could not resolve schema reference: ${schema.$ref}</p>`;
    }
  }
  if (!resolvedSchema.properties && resolvedSchema.type !== "object") {
    // For primitive types, show basic type information
    let typeInfo = `<div class="text-sm text-gray-600">
      <span class="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">${formatTypeDisplay(
        resolvedSchema
      )}</span>`;

    if (resolvedSchema.format) {
      typeInfo += ` <span class="text-gray-500">(${resolvedSchema.format})</span>`;
    }

    if (resolvedSchema.description) {
      typeInfo += `<p class="mt-1 text-gray-700">${resolvedSchema.description}</p>`;
    }

    // Add validation rules for primitive types
    const validationRules = [];
    if (resolvedSchema.minLength !== undefined)
      validationRules.push(`min length: ${resolvedSchema.minLength}`);
    if (resolvedSchema.maxLength !== undefined)
      validationRules.push(`max length: ${resolvedSchema.maxLength}`);
    if (resolvedSchema.minimum !== undefined)
      validationRules.push(`minimum: ${resolvedSchema.minimum}`);
    if (resolvedSchema.maximum !== undefined)
      validationRules.push(`maximum: ${resolvedSchema.maximum}`);
    if (resolvedSchema.pattern)
      validationRules.push(
        `pattern: <code class="text-xs bg-gray-200 px-1 rounded font-mono">${resolvedSchema.pattern}</code>`
      );
    if (resolvedSchema.enum)
      validationRules.push(`allowed values: ${resolvedSchema.enum.join(", ")}`);
    if (resolvedSchema.default !== undefined)
      validationRules.push(`default: ${resolvedSchema.default}`);

    if (validationRules.length > 0) {
      typeInfo += `<div class="mt-2 text-xs text-gray-500">
        <div class="font-medium mb-1">Validation:</div>
        <ul class="list-disc list-inside space-y-1">
          ${validationRules.map((rule) => `<li>${rule}</li>`).join("")}
        </ul>
      </div>`;
    }

    typeInfo += `</div>`;
    return typeInfo;
  }

  if (!resolvedSchema.properties) {
    return `<p class="text-sm text-gray-500">No properties defined for this schema.</p>`;
  }

  const requiredFields = resolvedSchema.required || [];
  const propertyCount = Object.keys(resolvedSchema.properties).length;
  let schemaHTML = `
    <div class="mb-4">
      <h4 class="param-section-header text-gray-700 font-semibold mb-2 text-lg">
        Schema Properties <span class="endpoint-count ml-2">${propertyCount}</span>
      </h4>
      <div class="bg-gray-50 border border-gray-200 rounded-md param-section-path">
  `;

  Object.entries(resolvedSchema.properties).forEach(
    ([propName, propSchema]) => {
      const isRequired = requiredFields.includes(propName);

      // Resolve property schema if it's a reference
      let resolvedPropSchema = propSchema;
      if (propSchema.$ref) {
        const refPath = propSchema.$ref.split("/").slice(1);
        resolvedPropSchema = refPath.reduce(
          (acc, part) => acc && acc[part],
          swaggerData
        );
      }

      schemaHTML += `
      <div class="p-4 border-b border-gray-200 last:border-b-0">
        <div class="flex items-start">
          <div class="w-1/3">
            <span class="text-sm font-medium text-gray-700">${propName}</span>
            ${
              isRequired
                ? '<span class="text-xs text-red-500 ml-1">required</span>'
                : ""
            }          </div>          <div class="w-2/3">
            <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">
              ${formatTypeDisplay(resolvedPropSchema)}${
        resolvedPropSchema?.format ? `(${resolvedPropSchema.format})` : ""
      }
            </code><br>`;
      // Add description
      if (resolvedPropSchema?.description) {
        schemaHTML += `<span class="text-sm text-gray-700">${resolvedPropSchema.description}</span><br>`;
      }

      // Add validation rules
      const validationRules = [];
      if (resolvedPropSchema?.minLength !== undefined)
        validationRules.push(`min length: ${resolvedPropSchema.minLength}`);
      if (resolvedPropSchema?.maxLength !== undefined)
        validationRules.push(`max length: ${resolvedPropSchema.maxLength}`);
      if (resolvedPropSchema?.minimum !== undefined)
        validationRules.push(`minimum: ${resolvedPropSchema.minimum}`);
      if (resolvedPropSchema?.maximum !== undefined)
        validationRules.push(`maximum: ${resolvedPropSchema.maximum}`);
      if (resolvedPropSchema?.pattern)
        validationRules.push(
          `pattern: <code class="text-xs bg-gray-200 px-1 rounded font-mono">${resolvedPropSchema.pattern}</code>`
        );
      if (resolvedPropSchema?.enum) {
        validationRules.push(
          `allowed values: ${resolvedPropSchema.enum.join(", ")}`
        );
      }
      if (resolvedPropSchema?.default !== undefined) {
        validationRules.push(
          `default: ${JSON.stringify(resolvedPropSchema.default)}`
        );
      }

      // Handle array items
      if (resolvedPropSchema?.type === "array" && resolvedPropSchema.items) {
        if (resolvedPropSchema.items.type) {
          validationRules.push(`array of: ${resolvedPropSchema.items.type}`);
        }
        if (resolvedPropSchema.items.enum) {
          validationRules.push(
            `item values: ${resolvedPropSchema.items.enum.join(", ")}`
          );
        }
      }

      if (validationRules.length > 0) {
        schemaHTML += `
              <div class="text-xs text-gray-500 mt-1">
                <div class="font-medium mb-1">Validation:</div>
                <ul class="list-disc list-inside space-y-1">
                  ${validationRules.map((rule) => `<li>${rule}</li>`).join("")}
                </ul>
              </div>
            `;
      }
      schemaHTML += `
          </div>
        </div>
      </div>
    `;
    }
  );

  schemaHTML += `
      </div>
    </div>
  `;

  return schemaHTML;
}

// Function to build the main content area
function buildMainContent() {
  if (!swaggerData || !swaggerData.paths) return;
  const mainContent = document.getElementById("api-main-content");
  if (!mainContent) return;
  mainContent.innerHTML = ""; // Clear existing content
  // Count total endpoints
  let totalEndpoints = 0;
  for (const path in swaggerData.paths) {
    totalEndpoints += Object.keys(swaggerData.paths[path]).length;
  }

  mainContent.innerHTML = `
    <h1 class="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-between">
      <div class="flex items-center">
        ${swaggerData.info.title} 
        <span class="text-lg text-gray-500">${swaggerData.info.version}</span>
        <span class="endpoint-count endpoint-count-title">${totalEndpoints} endpoints</span>
      </div>
    </h1>`;
  // Re-initialize auth button after content is rebuilt
  if (window.auth && typeof window.auth.initAuth === "function") {
    window.auth.initAuth();
  }

  // Initialize server selector after content is rebuilt
  if (
    window.serverSelector &&
    typeof window.serverSelector.initServerSelector === "function"
  ) {
    window.serverSelector.initServerSelector();
  }
  if (swaggerData.info.description) {
    mainContent.innerHTML += `<p class="text-gray-700 mb-8">${swaggerData.info.description}</p>`;
  }

  // Add contact and license information if available
  let contactLicenseHtml = "";

  if (swaggerData.info.contact || swaggerData.info.license) {
    contactLicenseHtml += '<div class="flex flex-wrap gap-6 mb-8 text-sm">';

    // Add contact information
    if (swaggerData.info.contact) {
      const contact = swaggerData.info.contact;
      contactLicenseHtml += '<div class="flex items-center text-gray-600">';
      contactLicenseHtml +=
        '<svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
      contactLicenseHtml +=
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>';
      contactLicenseHtml += "</svg>";
      contactLicenseHtml += '<span class="font-medium mr-1">Contact: </span>';

      if (contact.name) {
        if (contact.url) {
          contactLicenseHtml += `<a href="${contact.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline mr-1">${contact.name}</a>`;
        } else {
          contactLicenseHtml += `<span class="mr-1">${contact.name}</span>`;
        }
      }

      if (contact.email) {
        if (contact.name) contactLicenseHtml += " • ";
        contactLicenseHtml += `<a href="mailto:${contact.email}" class="ml-1 text-blue-600 hover:text-blue-800 hover:underline">${contact.email}</a>`;
      }

      contactLicenseHtml += "</div>";
    }

    // Add license information
    if (swaggerData.info.license) {
      const license = swaggerData.info.license;
      contactLicenseHtml += '<div class="flex items-center text-gray-600">';
      contactLicenseHtml +=
        '<svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
      contactLicenseHtml +=
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>';
      contactLicenseHtml += "</svg>";
      contactLicenseHtml += '<span class="font-medium mr-1">License: </span>';

      if (license.url) {
        contactLicenseHtml += `<a href="${license.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline">${license.name}</a>`;
      } else {
        contactLicenseHtml += `<span>${license.name}</span>`;
      }

      contactLicenseHtml += "</div>";
    }

    contactLicenseHtml += "</div>";
    mainContent.innerHTML += contactLicenseHtml;
  }

  // Group paths by their first tag
  const tagsOrder = swaggerData.tags
    ? swaggerData.tags.map((tag) => tag.name)
    : [];
  const pathsByTag = {};

  // Group paths by their first tag
  for (const path in swaggerData.paths) {
    for (const method in swaggerData.paths[path]) {
      const operation = swaggerData.paths[path][method];
      const tag =
        operation.tags && operation.tags.length > 0
          ? operation.tags[0]
          : "default";

      if (!pathsByTag[tag]) {
        pathsByTag[tag] = [];
      }
      pathsByTag[tag].push({ path, method, operation });
    }
  }

  // Maintain the order of tags as specified in swagger.json, then add any untagged
  const sortedTags = [...tagsOrder];
  for (const tag in pathsByTag) {
    if (!sortedTags.includes(tag)) {
      sortedTags.push(tag);
    }
  }

  // Render each tag section
  sortedTags.forEach((tag) => {
    if (!pathsByTag[tag] || pathsByTag[tag].length === 0) return; // Create a container for the entire tag section
    const tagContainer = document.createElement("div");
    tagContainer.className = "mb-8";
    mainContent.appendChild(tagContainer);

    // Add tag section header with click functionality
    const tagHeader = document.createElement("div");
    tagHeader.className =
      "endpoints-section-header text-xl font-bold text-gray-700 mb-6 mt-8 pb-2 border-b border-gray-200 flex items-center cursor-pointer select-none";
    const sectionCount = pathsByTag[tag].length;
    tagHeader.innerHTML = `
      <div class="flex items-center flex-grow">
        <svg class="w-5 h-5 mr-2 transform transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        ${tag}
        <span class="endpoint-count">${sectionCount} endpoint${
      sectionCount !== 1 ? "s" : ""
    }</span>
      </div>
    `;
    tagContainer.appendChild(tagHeader); // Create a container for the endpoints
    const endpointsContainer = document.createElement("div");
    endpointsContainer.className = "endpoints-section";
    // Start expanded by default

    tagContainer.appendChild(endpointsContainer); // Add click handler to toggle section
    tagHeader.addEventListener("click", () => {
      toggleEndpointsSection(endpointsContainer, arrow);
    });

    // Set initial arrow state to expanded
    const arrow = tagHeader.querySelector("svg");
    if (arrow) {
      arrow.style.transform = "rotate(90deg)";
    }

    // Add endpoints for this tag
    pathsByTag[tag].forEach(({ path, method, operation }) => {
      const sectionId = generateSectionId(path, method);
      const section = document.createElement("section");
      section.id = sectionId;
      const methodBorderClass = `method-border-${method.toLowerCase()}`;
      const methodShadowClass = `method-shadow-${method.toLowerCase()}`;
      section.className = `main-content-section mb-5 p-3 bg-white flex items-start gap-4 border-l-4 ${methodBorderClass} ${methodShadowClass}`;
      endpointsContainer.appendChild(section);

      const authSchemes =
        operation.security !== undefined
          ? operation.security
          : swaggerData.security;
      const authIcon =
        authSchemes && authSchemes.length > 0
          ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-900 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>`
          : "";

      let sectionHTML = `
        <div class="flex-1">
          <div class="flex items-center mb-1">
          <div class="favorite-heart-container flex" data-path="${path}" data-method="${method}"></div>

            <button class="outline-btn ${getMethodButtonClass(method).replace(
              "bg-",
              "border-"
            )} text-sm flex items-center w-full  py-1 px-1 pr-0 mr-1 rounded" data-path="${path}" data-method="${method}">                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                </svg>                 ${authIcon}
            <span class="text-lg font-mono text-gray-700 ml-1">${path}</span>           
              </button>

              <div class="ml-auto flex gap-2 items-center">
              <button class="main-try-it-out-btn ${getMethodButtonClass(
                method
              )} text-sm flex items-center font-bold py-1 px-3 rounded hover:text-white border shadow transition" data-path="${path}" data-method="${method}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5l14 7-14 7V5z" />
                </svg>
                ${method.toUpperCase()}
              </button>              
            </div>
          </div>
          ${
            operation.summary
              ? `<p class="text-gray-600 mb-2 text-sm mt-2">${operation.summary}</p>`
              : ""
          }          <div class="endpoint-content hidden">
            ${renderDescriptionWithMarkdown(operation.description)}
            `; // Add parameters sections
      if (operation.parameters && operation.parameters.length > 0) {
        const pathParams = operation.parameters.filter((p) => p.in === "path");
        const queryParams = operation.parameters.filter(
          (p) => p.in === "query"
        );
        const otherParams = operation.parameters.filter(
          (p) => p.in !== "path" && p.in !== "query"
        );

        // Add parameters sections
        if (pathParams.length > 0) {
          sectionHTML += buildParametersSection("Path Parameters", pathParams);
        }

        if (queryParams.length > 0) {
          sectionHTML += buildParametersSection(
            "Query Parameters",
            queryParams
          );
        }

        if (otherParams.length > 0) {
          sectionHTML += buildParametersSection("Headers", otherParams);
        }
      }

      // Add request body section if exists
      if (operation.requestBody) {
        sectionHTML += buildRequestBodySection(operation, sectionId);
      }

      // Add responses section
      sectionHTML += buildResponsesSection(operation, sectionId);

      sectionHTML += `</div></div>`;
      section.insertAdjacentHTML("beforeend", sectionHTML); // Add event listeners for this section
      addMainContentEventListeners(section); // Add request body handlers if there's a request body
      if (operation.requestBody) {
        addRequestBodyHandlers(operation, sectionId);
      }

      // Add response handlers for dropdown functionality
      addResponseHandlers(operation, sectionId); // Calculate proper height after all content has been added
      endpointsContainer.style.opacity = "1"; // Set opacity immediately
      recalculateEndpointContainerHeight(endpointsContainer);
    });
  });
  // Add scroll-to-top button as the last element of the main section
  const scrollToTopButton = document.createElement("button");
  scrollToTopButton.id = "scroll-to-top";
  scrollToTopButton.className = "scroll-to-top";
  scrollToTopButton.setAttribute("data-tooltip", "Scroll to top");
  scrollToTopButton.setAttribute("aria-label", "Scroll to top");
  scrollToTopButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  `;

  mainContent.appendChild(scrollToTopButton);

  // Re-initialize scroll-to-top functionality after button is created
  if (window.ScrollToTop) {
    new ScrollToTop();
  }
}

// Add event listeners to try it out buttons and other elements in the main content
function addMainContentEventListeners(section) {
  // Add favorite heart icon if favorites module is available
  const favoriteContainer = section.querySelector(".favorite-heart-container");
  if (favoriteContainer && window.favorites) {
    const path = favoriteContainer.dataset.path;
    const method = favoriteContainer.dataset.method;

    if (path && method) {
      const heartIcon = window.favorites.createFavoriteHeartIcon(path, method);
      favoriteContainer.appendChild(heartIcon);
    }
  }

  // Add event listener for the outline button
  const outlineButton = section.querySelector(".outline-btn");
  if (outlineButton) {
    const contentDiv = section.querySelector(".flex-1");

    // Check saved state in localStorage during initialization
    const sectionId = section.id;
    if (
      sectionId &&
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
      ); // If there's a saved state and it's "true", expand the section
      if (savedState === "true") {
        const endpointContent = contentDiv.querySelector(".endpoint-content");
        endpointContent.classList.remove("hidden");

        const svg = outlineButton.querySelector("svg");
        if (svg) {
          svg.style.transform = "rotate(90deg)";
        }
      }
    }
    outlineButton.addEventListener("click", function () {
      const endpointContent = contentDiv.querySelector(".endpoint-content");
      const isHidden = endpointContent.classList.contains("hidden");

      if (isHidden) {
        endpointContent.classList.remove("hidden");
        // Add slide-in animation class
        endpointContent.classList.add("slide-in");
        // Remove animation class after animation completes
        setTimeout(() => {
          endpointContent.classList.remove("slide-in");
        }, 300);
      } else {
        endpointContent.classList.add("hidden");
      }

      const svg = this.querySelector("svg");
      if (svg) {
        // Rotate the arrow when toggled
        svg.style.transform = isHidden ? "rotate(90deg)" : "rotate(0deg)";
      } // Store state in local storage
      const sectionId = section.id;
      if (
        sectionId &&
        window.swaggerData &&
        window.swaggerData.info &&
        window.swaggerData.info.title &&
        window.swaggerData.info.version
      ) {
        // Follow the instruction to use snake_case and prefix with API title and version
        const apiTitle = window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_");
        const apiVersion = window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_");
        localStorage.setItem(
          `${apiTitle}_${apiVersion}_outline_expanded_${sectionId}`,
          isHidden ? "true" : "false"
        );
        // Only update URL hash when expanding (not when collapsing)
        if (isHidden) {
          // Get the path and method from either favoriteContainer or try-it-out button
          const favoriteContainer = section.querySelector(
            ".favorite-heart-container"
          );
          const tryItOutButton = section.querySelector(".main-try-it-out-btn");

          let path, method;

          if (favoriteContainer) {
            path = favoriteContainer.dataset.path;
            method = favoriteContainer.dataset.method;
          } else if (tryItOutButton) {
            path = tryItOutButton.dataset.path;
            method = tryItOutButton.dataset.method;
          } else {
            // Try to extract from section ID if needed
            const sectionIdParts = sectionId.split("-");
            if (sectionIdParts.length >= 2) {
              method = sectionIdParts[0];
              path = sectionIdParts.slice(1).join("-");
            }
          }

          if (path && method && window.utils && window.utils.createCleanPath) {
            // Update URL hash without triggering scroll
            const hash = `#${method.toLowerCase()}-${window.utils.createCleanPath(
              path
            )}`;
            history.replaceState(null, "", hash);
          }
        }
      } // Recalculate height after content change
      const endpointsContainer = section.closest(".endpoints-section");
      recalculateEndpointContainerHeight(endpointsContainer);
    });
  }

  // Add event listener for response section toggles
  const responseHeaders = section.querySelectorAll(".response-header");
  responseHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const targetId = this.dataset.target;
      const contentDiv = document.getElementById(targetId);
      const arrow = this.querySelector("svg");

      if (contentDiv) {
        contentDiv.classList.toggle("hidden");
        if (arrow) {
          arrow.style.transform = contentDiv.classList.contains("hidden")
            ? "rotate(0deg)"
            : "rotate(90deg)";
        }
      }
      // Recalculate height after response section toggle
      const endpointsContainer = section.closest(".endpoints-section");
      recalculateEndpointContainerHeight(endpointsContainer);
    });
  });
  // Add event listener for the "Try it out" button in the main content
  const tryItOutButton = section.querySelector(".main-try-it-out-btn");
  if (tryItOutButton) {
    tryItOutButton.addEventListener("click", function () {
      // Ensure right sidebar opens on small screens if hidden
      const rightSidebar = document.getElementById("right-sidebar");
      const toggleRightBtn = document.getElementById("toggle-right-sidebar");
      if (
        rightSidebar &&
        toggleRightBtn &&
        rightSidebar.classList.contains("translate-x-full")
      ) {
        toggleRightBtn.click();
      }

      // Hide collection runner content when switching to try-it-out
      const collectionRunnerSection = document.getElementById(
        "collection-runner-section"
      );
      if (collectionRunnerSection) {
        collectionRunnerSection.classList.remove("active");
        collectionRunnerSection.classList.add("hidden");

        // Also hide any collection runner tabs
        document.querySelectorAll(".collection-tab-content").forEach((tab) => {
          tab.classList.add("hidden");
        });
      } // Show try-it-out section
      const tryItOutSection = document.getElementById("try-it-out-section");
      if (tryItOutSection) {
        tryItOutSection.classList.add("active");
        tryItOutSection.classList.remove("hidden");
      }

      const path = this.dataset.path;
      const method = this.dataset.method;

      // Find the corresponding sidebar link
      const sidebarLinkSelector = `.endpoint-link[data-path="${path}"][data-method="${method}"]`;
      const sidebarLink = document.querySelector(sidebarLinkSelector);

      if (sidebarLink) {
        sidebarLink.click(); // This will handle updating the right panel and highlighting
      } else {
        console.warn(
          `Could not find sidebar link for ${method} ${path} to simulate click. Updating right panel directly.`
        );

        // Also update URL hash here
        if (window.utils && window.utils.createCleanPath) {
          const hash = `#${method.toLowerCase()}-${window.utils.createCleanPath(
            path
          )}`;
          history.replaceState(null, "", hash);
        }
        // Import the module here to avoid circular dependency
        import("./rightPanel.js").then((module) => {
          module.updateRightPanelDynamically(path, method);
        });
      }
    });
  }
}

// Add request body dropdown handling
function addRequestBodyHandlers(operation, sectionId) {
  // Add event listener for the request body dropdown after section is added to DOM
  if (
    operation.requestBody &&
    Object.keys(operation.requestBody.content).length > 0
  ) {
    const requestBodyIdBase = `request-body-${sectionId}`;
    const selectElement = document.getElementById(
      `${requestBodyIdBase}-content-type-select`
    );
    const exampleElement = document.getElementById(
      `${requestBodyIdBase}-example`
    );
    const containerElement = document.getElementById(
      `${requestBodyIdBase}-container`
    );
    if (selectElement && exampleElement && containerElement) {
      // Check if it's a select element (multiple content types) or div (single content type)
      const isSelectElement = selectElement.tagName.toLowerCase() === "select";

      if (isSelectElement) {
        // Set 'application/json' as default if available for select elements
        const contentTypes = Object.keys(operation.requestBody.content);
        if (contentTypes.includes("application/json")) {
          selectElement.value = "application/json";
        }
      }

      const updateRequestBodyExample = () => {
        // Get selected content type - from value for select, from data-value for div
        const selectedContentType = isSelectElement
          ? selectElement.value
          : selectElement.getAttribute("data-value");

        // Only show examples for JSON content types
        const isJsonContentType =
          selectedContentType === "application/json" ||
          selectedContentType?.includes("json");

        if (
          operation.requestBody.content[selectedContentType] &&
          operation.requestBody.content[selectedContentType].schema
        ) {
          const schema =
            operation.requestBody.content[selectedContentType].schema;

          // Update schema details
          const schemaDetailsElement = document.getElementById(
            `${requestBodyIdBase}-schema-details`
          );
          if (schemaDetailsElement) {
            schemaDetailsElement.innerHTML = buildSchemaDetails(
              schema,
              swaggerData.components
            );
          }

          // Only generate and show examples for JSON content types
          if (isJsonContentType) {
            // Generate example
            const example = generateExampleFromSchema(
              schema,
              swaggerData.components
            );

            // Check if we have a meaningful example to display
            let hasValidExample = false;
            if (example !== null && example !== undefined) {
              if (typeof example === "object") {
                // For objects, check if it has properties and isn't just an error
                if (Array.isArray(example)) {
                  hasValidExample = example.length > 0;
                } else if (example.error) {
                  hasValidExample = false; // Don't show error objects
                } else {
                  hasValidExample = Object.keys(example).length > 0;
                }
              } else {
                // For primitive values, always show
                hasValidExample = true;
              }
            }

            if (hasValidExample) {
              exampleElement.textContent = JSON.stringify(example, null, 2);
              containerElement.style.display = "block";
            } else {
              containerElement.style.display = "none";
            }
          } else {
            // Hide example container for non-JSON content types
            containerElement.style.display = "none";
          }
        } else {
          // Hide containers if no schema available
          const schemaDetailsElement = document.getElementById(
            `${requestBodyIdBase}-schema-details`
          );
          if (schemaDetailsElement) {
            schemaDetailsElement.innerHTML = `<p class="text-sm text-gray-500">No schema information available.</p>`;
          }
          containerElement.style.display = "none";
        }
      };

      // Only add change event listener for select elements
      if (isSelectElement) {
        selectElement.addEventListener("change", updateRequestBodyExample);
        // Set initial example for the first content type
        if (selectElement.options.length > 0) {
          // Ensure there are options before trying to update
          updateRequestBodyExample();
        }
      } else {
        // For div elements (single content type), just call updateRequestBodyExample once
        updateRequestBodyExample();
      }
    } else {
      console.warn(
        `Could not find select, example, or container element for ${requestBodyIdBase}`
      );
    }
  }
}

// Add response dropdown handling
function addResponseHandlers(operation, sectionId) {
  // Add event listeners for response dropdowns after section is added to DOM
  if (!operation.responses) return;

  for (const statusCode in operation.responses) {
    const response = operation.responses[statusCode];
    if (!response.content) continue;

    const contentTypes = Object.keys(response.content);
    if (contentTypes.length === 0) continue;

    const responseId = `response-${sectionId}-${statusCode}`;
    const selectElement = document.getElementById(
      `${responseId}-content-type-select`
    );
    const exampleElement = document.getElementById(`${responseId}-example`);
    const containerElement = document.getElementById(`${responseId}-container`);
    if (selectElement && exampleElement && containerElement) {
      // Check if it's a select element (multiple content types) or div (single content type)
      const isSelectElement = selectElement.tagName.toLowerCase() === "select";

      if (isSelectElement) {
        // Set 'application/json' as default if available for select elements
        if (contentTypes.includes("application/json")) {
          selectElement.value = "application/json";
        }
      }

      const updateResponseExample = () => {
        // Get selected content type - from value for select, from data-value for div
        const selectedContentType = isSelectElement
          ? selectElement.value
          : selectElement.getAttribute("data-value");
        if (
          response.content[selectedContentType] &&
          response.content[selectedContentType].schema
        ) {
          const schema = response.content[selectedContentType].schema;
          try {
            const example = window.generateExampleFromSchema
              ? window.generateExampleFromSchema(schema, swaggerData.components)
              : { message: "Example not available - schema preview disabled" };

            // Check if we have a meaningful example to display
            let hasValidExample = false;
            if (example !== null && example !== undefined) {
              if (typeof example === "object") {
                // For objects, check if it has properties and isn't just an error
                if (Array.isArray(example)) {
                  hasValidExample = example.length > 0;
                } else if (example.error) {
                  hasValidExample = false; // Don't show error objects
                } else {
                  hasValidExample = Object.keys(example).length > 0;
                }
              } else {
                // For primitive values, always show
                hasValidExample = true;
              }
            }

            if (hasValidExample) {
              exampleElement.textContent = JSON.stringify(example, null, 2);
              containerElement.style.display = "block";
            } else {
              containerElement.style.display = "none";
            }
          } catch (error) {
            exampleElement.textContent = `Error generating example: ${error.message}`;
            exampleElement.className =
              "text-sm text-red-500 whitespace-pre-wrap break-all";
            containerElement.style.display = "block";
          }
        } else {
          // Hide container if no schema available
          containerElement.style.display = "none";
        }
      };

      // Only add change event listener for select elements
      if (isSelectElement) {
        selectElement.addEventListener("change", updateResponseExample);
        // Set initial example for the first content type
        if (selectElement.options.length > 0) {
          updateResponseExample();
        }
      } else {
        // For div elements (single content type), just call updateResponseExample once
        updateResponseExample();
      }
    } else {
      console.warn(
        `Could not find select, example, or container element for ${responseId}`
      );
    }
  }
}

// Helper function to get button classes based on HTTP method
function getMethodButtonClass(method) {
  const lowerMethod = method.toLowerCase();
  switch (lowerMethod) {
    case "post":
      return "text-blue-500 border-blue-500 hover:bg-blue-500";
    case "get":
      return "text-green-500 border-green-500 hover:bg-green-500";
    case "put":
    case "patch":
      return "text-yellow-500 border-yellow-500 hover:bg-yellow-500";
    case "delete":
      return "text-red-500 border-red-500 hover:bg-red-500";
    case "options":
    case "head":
      return "text-gray-500 border-gray-500 hover:bg-gray-500 ";
    default:
      return "text-blue-500 border-blue-500 hover:bg-blue-500"; // Default to blue
  }
}

// Build parameters section HTML
function buildParametersSection(title, params) {
  let sectionHTML = `
    <div class="mb-4">
        <h3 class="param-section-header text-gray-700 font-semibold mb-2 text-lg">
            ${title} <span class="endpoint-count ml-2">${params.length}</span>
        </h3>
        <div class="bg-gray-50 border border-gray-200 rounded-md param-section-path">
  `;

  params.forEach((param) => {
    // Build validation rules for this parameter
    const validationRules = [];
    if (param.schema) {
      if (param.schema.minLength !== undefined)
        validationRules.push(`min length: ${param.schema.minLength}`);
      if (param.schema.maxLength !== undefined)
        validationRules.push(`max length: ${param.schema.maxLength}`);
      if (param.schema.minimum !== undefined)
        validationRules.push(`minimum: ${param.schema.minimum}`);
      if (param.schema.maximum !== undefined)
        validationRules.push(`maximum: ${param.schema.maximum}`);
      if (param.schema.pattern)
        validationRules.push(
          `pattern: <code class="text-xs bg-gray-200 px-1 rounded font-mono">${param.schema.pattern}</code>`
        );
      if (param.schema.enum) {
        validationRules.push(`allowed values: ${param.schema.enum.join(", ")}`);
      }
      if (param.schema.default !== undefined) {
        validationRules.push(
          `default: ${JSON.stringify(param.schema.default)}`
        );
      }

      // Handle array items
      if (param.schema.type === "array" && param.schema.items) {
        if (param.schema.items.type) {
          validationRules.push(`array of: ${param.schema.items.type}`);
        }
        if (param.schema.items.enum) {
          validationRules.push(
            `item values: ${param.schema.items.enum.join(", ")}`
          );
        }
      }
    }

    sectionHTML += `
      <div class="p-4 border-b border-gray-200 last:border-b-0">
          <div class="flex items-start">
              <div class="w-1/3">
                  <span class="text-sm font-medium text-gray-700">${
                    param.name
                  }</span>
                  ${
                    param.required
                      ? '<span class="text-xs text-red-500 ml-1">required</span>'
                      : ""
                  }              </div>              <div class="w-2/3">
                  <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${
                    param.schema ? formatTypeDisplay(param.schema) : ""
                  }${
      param.schema && param.schema.format ? "(" + param.schema.format + ")" : ""
    }</code><br>
                  <span class="text-sm text-gray-700">${
                    param.description || ""
                  }</span>`;

    // Add validation rules if any exist
    if (validationRules.length > 0) {
      sectionHTML += `
                  <div class="text-xs text-gray-500 mt-2">
                    <div class="font-medium mb-1">Validation:</div>
                    <ul class="list-disc list-inside space-y-1">
                      ${validationRules
                        .map((rule) => `<li>${rule}</li>`)
                        .join("")}
                    </ul>
                  </div>`;
    }

    sectionHTML += `
              </div>
          </div>
      </div>
    `;
  });

  sectionHTML += `</div></div>`;
  return sectionHTML;
}

// Build request body section HTML
function buildRequestBodySection(operation, sectionId) {
  const requestBodyIdBase = `request-body-${sectionId}`;
  let sectionHTML = `
    <div class="mb-6">
        <h3 class="text-gray-700 font-semibold mb-2 text-lg">Request Body</h3>
  `;

  const contentTypes = Object.keys(operation.requestBody.content);
  if (contentTypes.length > 0) {
    sectionHTML += `
      <div class="flex items-center mb-4">`;

    if (contentTypes.length === 1) {
      // If only one content type, show as a styled div instead of select
      const contentType = contentTypes[0];
      sectionHTML += `
          <div id="${requestBodyIdBase}-content-type-select" class="bg-gray-200 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1 mr-2" data-value="${contentType}">${contentType}</div>`;
    } else {
      // Multiple content types, show as select dropdown
      sectionHTML += `
          <select id="${requestBodyIdBase}-content-type-select" class="bg-gray-200 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">`;

      contentTypes.forEach((contentType) => {
        sectionHTML += `<option value="${contentType}">${contentType}</option>`;
      });

      sectionHTML += `
          </select>`;
    }

    sectionHTML += `
          ${
            operation.requestBody.required
              ? '<span class="text-xs text-red-500">required</span>'
              : ""
          }
      </div>
      
      <!-- Schema Details Section -->
      <div class="mb-4" id="${requestBodyIdBase}-schema-details">
        <!-- Schema details will be populated here -->
      </div>
      
      <!-- Request Body Example Section -->
      <div class="bg-gray-50 border border-gray-200 rounded-md p-4" id="${requestBodyIdBase}-container" style="display: none;">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Example Request Body</h4>
          <pre id="${requestBodyIdBase}-example" class="text-sm text-gray-700 whitespace-pre-wrap break-all"></pre>
      </div>
    `;
  } else {
    sectionHTML += `<p class="text-sm text-gray-500">No request body definition found.</p>`;
  }
  sectionHTML += `</div>`;
  return sectionHTML;
}

// Build responses section HTML
function buildResponsesSection(operation, sectionId) {
  if (!sectionId) return ""; // Guard against undefined sectionId

  let sectionHTML = `
    <div class="mb-6">
      <h3 class="text-gray-700 font-semibold mb-4 text-lg">Responses</h3>
  `;
  for (const statusCode in operation.responses) {
    const response = operation.responses[statusCode];
    const responseId = `response-${sectionId}-${statusCode}`;
    const responseColor = statusCode.startsWith("2")
      ? "green"
      : statusCode.startsWith("3")
      ? "yellow"
      : "red";
    const responseDescription =
      response.description || window.utils.getStatusText(statusCode);

    // Check if there's any expandable content
    let hasExpandableContent = false;
    const contentTypes = response.content ? Object.keys(response.content) : [];

    if (contentTypes.length > 0) {
      // Check if any content type has a schema
      for (const contentType of contentTypes) {
        if (response.content[contentType].schema) {
          hasExpandableContent = true;
          break;
        }
      }
    }

    // Build the response header with conditional chevron and clickability
    const headerClasses = hasExpandableContent
      ? `flex items-center w-full bg-${responseColor}-100 text-${responseColor}-800 p-3 rounded-md cursor-pointer response-header`
      : `flex items-center w-full bg-${responseColor}-100 text-${responseColor}-800 p-3 rounded-md response-header-empty`;

    const dataTarget = hasExpandableContent
      ? ` data-target="${responseId}"`
      : "";

    sectionHTML += `
      <div class="mb-2">
        <div class="${headerClasses}"${dataTarget}>`;

    // Only add chevron icon if there's expandable content
    if (hasExpandableContent) {
      sectionHTML += `
          <svg class="h-5 w-5 mr-2 transform transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>`;
    }

    sectionHTML += `
          <span class="font-mono">${statusCode}</span>
          <span class="ml-2 text-sm">${responseDescription}</span>
        </div>`;

    // Only add expandable content div if there's content to show
    if (hasExpandableContent) {
      sectionHTML += `
        <div id="${responseId}" class="hidden mt-2 pl-4">`; // Add dropdown for content types if there are multiple or any with schema      if (contentTypes.length > 0) {
      sectionHTML += `
          <div class="flex items-center mb-2">`;

      if (contentTypes.length === 1) {
        // If only one content type, show as a styled div instead of select
        const contentType = contentTypes[0];
        sectionHTML += `
            <div id="${responseId}-content-type-select" class="bg-gray-200 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1 mr-2" data-value="${contentType}">${contentType}</div>`;
      } else {
        // Multiple content types, show as select dropdown
        sectionHTML += `
            <select id="${responseId}-content-type-select" class="bg-gray-200 border border-gray-300 text-gray-700 text-xs rounded px-2 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">`;

        contentTypes.forEach((contentType) => {
          const isSelected =
            contentType === "application/json" ? " selected" : "";
          sectionHTML += `<option value="${contentType}"${isSelected}>${contentType}</option>`;
        });

        sectionHTML += `
            </select>`;
      }

      sectionHTML += `
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-md p-4" id="${responseId}-container" style="display: none;">
            <pre id="${responseId}-example" class="text-sm text-gray-700 whitespace-pre-wrap break-all"></pre>
          </div>`;

      sectionHTML += `
        </div>`;
    }
    sectionHTML += `
      </div>`;
  }

  sectionHTML += `</div>`;
  return sectionHTML;
}

// Helper function to safely render markdown with fallback
function renderDescription(description) {
  if (!description) {
    return "";
  }

  // Check if markdown renderer is available
  if (
    window.markdownRenderer &&
    typeof window.markdownRenderer.renderSafe === "function"
  ) {
    try {
      const rendered = window.markdownRenderer.renderSafe(description);
      return rendered;
    } catch (error) {
      return `<p class="text-gray-700 mb-4">${description}</p>`;
    }
  } else {
    return `<p class="text-gray-700 mb-4">${description}</p>`;
  }
}

// Utility function to toggle endpoints section
function toggleEndpointsSection(endpointsContainer, arrow) {
  const isCollapsed = endpointsContainer.style.maxHeight === "0px";

  if (isCollapsed) {
    // Set max-height to a large enough value to show all content
    const sectionHeight = endpointsContainer.scrollHeight + 50;
    endpointsContainer.style.maxHeight = `${sectionHeight}px`;
    endpointsContainer.style.opacity = "1";
    arrow.style.transform = "rotate(90deg)";
  } else {
    endpointsContainer.style.maxHeight = "0";
    endpointsContainer.style.opacity = "0";
    arrow.style.transform = "rotate(0deg)";
  }
}

// Utility function to recalculate and update endpoint container height
function recalculateEndpointContainerHeight(endpointsContainer) {
  if (!endpointsContainer) return;

  // Use requestAnimationFrame to ensure DOM updates are complete before measuring
  requestAnimationFrame(() => {
    const sectionHeight = endpointsContainer.scrollHeight + 50; // Add buffer for safety
    endpointsContainer.style.maxHeight = `${sectionHeight}px`;
  });
}

// Export functions to global scope
window.buildMainContent = buildMainContent;
window.addMainContentEventListeners = addMainContentEventListeners;
window.addRequestBodyHandlers = addRequestBodyHandlers;
window.addResponseHandlers = addResponseHandlers;
window.buildParametersSection = buildParametersSection;
window.buildRequestBodySection = buildRequestBodySection;
window.buildResponsesSection = buildResponsesSection;
window.buildSchemaDetails = buildSchemaDetails;
window.formatTypeDisplay = formatTypeDisplay;
window.toggleEndpointsSection = toggleEndpointsSection;
window.recalculateEndpointContainerHeight = recalculateEndpointContainerHeight;


/* js/rightPanel.js */
// Right panel and API interaction functionality

function switchTab(tabId) {
  const requestTab = document.getElementById("request-tab");
  const responseTab = document.getElementById("response-tab");
  const requestContent = document.getElementById("request-content");
  const responseContent = document.getElementById("response-content");

  if (!requestTab || !responseTab || !requestContent || !responseContent) {
    return;
  }

  // Store the currently active content
  const currentActiveContent =
    tabId === "request" ? responseContent : requestContent;
  const newActiveContent =
    tabId === "request" ? requestContent : responseContent;

  // Apply fade-out animation to current tab if it's active
  if (currentActiveContent.classList.contains("active")) {
    currentActiveContent.style.opacity = "0";

    // Use setTimeout to allow animation to complete before switching
    setTimeout(() => {
      // Switch tabs after fade-out
      if (tabId === "request") {
        requestTab.classList.add("active");
        requestTab.classList.remove("inactive");
        responseTab.classList.add("inactive");
        responseTab.classList.remove("active");
        responseContent.classList.add("hidden");
        responseContent.classList.remove("active");

        // Show request content with fade-in
        requestContent.classList.remove("hidden");
        requestContent.classList.add("active");
        // Force reflow to ensure transition applies
        void requestContent.offsetWidth;
        requestContent.style.opacity = "1";
      } else {
        // Similar logic for response tab
        responseTab.classList.add("active");
        responseTab.classList.remove("inactive");
        requestTab.classList.add("inactive");
        requestTab.classList.remove("active");
        requestContent.classList.add("hidden");
        requestContent.classList.remove("active");

        // Show response content with fade-in
        responseContent.classList.remove("hidden");
        responseContent.classList.add("active");
        // Force reflow to ensure transition applies
        void responseContent.offsetWidth;
        responseContent.style.opacity = "1";
      }

      // Ensure the collection action buttons are set up when switching to request tab
      if (tabId === "request" && window.collectionRunnerUI) {
        // Check if we're viewing a collection request by checking for currentRequestId
        if (window.collectionRunnerUI.currentRequestId) {
          window.collectionRunnerUI.setupTryItOutActionButtons(
            true,
            window.collectionRunnerUI.currentRequestId
          );
        } else {
          window.collectionRunnerUI.setupTryItOutActionButtons(false);
        }
      }
    }, 300);
  } else {
    // No fade needed, just switch immediately
    if (tabId === "request") {
      requestTab.classList.add("active");
      requestTab.classList.remove("inactive");
      responseTab.classList.add("inactive");
      responseTab.classList.remove("active");
      requestContent.classList.remove("hidden");
      requestContent.classList.add("active");
      requestContent.style.opacity = "1";
      responseContent.classList.add("hidden");
      responseContent.classList.remove("active");

      // Handle collection runner UI actions
      if (window.collectionRunnerUI) {
        if (window.collectionRunnerUI.currentRequestId) {
          window.collectionRunnerUI.setupTryItOutActionButtons(
            true,
            window.collectionRunnerUI.currentRequestId
          );
        } else {
          window.collectionRunnerUI.setupTryItOutActionButtons(false);
        }
      }
    } else {
      responseTab.classList.add("active");
      responseTab.classList.remove("inactive");
      requestTab.classList.add("inactive");
      requestTab.classList.remove("active");
      responseContent.classList.remove("hidden");
      responseContent.classList.add("active");
      responseContent.style.opacity = "1";
      requestContent.classList.add("hidden");
      requestContent.classList.remove("active");
    }
  }
}

// Update right panel with endpoint-specific data
async function updateRightPanelDynamically(path, method) {
  // Ensure Monaco editors are initialized before proceeding
  if (window.initMonacoEditor) {
    try {
      await window.initMonacoEditor();
    } catch (error) {
      console.error("Error initializing Monaco editors:", error);
    }
  } else {
    console.error(
      "initMonacoEditor function is not defined on window. Monaco editors may not initialize correctly."
    );
  }

  if (
    !swaggerData ||
    !swaggerData.paths[path] ||
    !swaggerData.paths[path][method]
  ) {
    console.error(`Endpoint not found in Swagger: ${method} ${path}`);
    return;
  }

  // Reset tabs to initial state
  const tabsContainer = document.getElementById("try-it-out-tabs");
  if (tabsContainer) {
    tabsContainer.classList.add("hidden");
    tabsContainer.classList.remove("visible", "response-available");
  }

  // Show the request content by default and initialize tabs
  const requestContent = document.getElementById("request-content");
  const responseContent = document.getElementById("response-content");
  if (requestContent && responseContent) {
    // Show request content, hide response content
    requestContent.classList.remove("hidden");
    requestContent.classList.add("active");
    responseContent.classList.add("hidden");
    responseContent.classList.remove("active");

    // Make sure we're on the request tab
    switchTab("request");
  }

  // Setup the collection action buttons
  if (window.collectionRunnerUI) {
    window.collectionRunnerUI.setupTryItOutActionButtons(false);
  }
  // Show Try it out section by default
  const tryItOutSection = document.getElementById("try-it-out-section");
  const codeSnippetSection = document.getElementById("code-snippet-section");
  const authSection = document.getElementById("auth-section");

  if (tryItOutSection) {
    tryItOutSection.classList.remove("hidden");
    tryItOutSection.classList.add("active");
  }
  if (codeSnippetSection) {
    codeSnippetSection.classList.add("hidden");
    codeSnippetSection.classList.remove("active");
  }
  if (authSection) {
    authSection.classList.add("hidden");
    authSection.classList.remove("active");
  }

  // Hide collection runner section and all its tab content when switching endpoints
  const collectionRunnerSection = document.getElementById(
    "collection-runner-section"
  );
  if (collectionRunnerSection) {
    collectionRunnerSection.classList.add("hidden");
    collectionRunnerSection.classList.remove("active");
  }
  // Hide all collection runner tab content to prevent tabs from previous endpoint showing
  document.querySelectorAll(".collection-tab-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  // Hide variables section when switching endpoints
  const variablesSection = document.getElementById("variables-section");
  if (variablesSection) {
    variablesSection.classList.add("hidden");
    variablesSection.classList.remove("active");
  }

  // Make sure the vertical menu icon for try it out is active
  const verticalMenuIcons = document.querySelectorAll(".vertical-menu-icon");
  verticalMenuIcons.forEach((icon) => {
    icon.classList.remove("active");
    if (icon.dataset.section === "try-it-out") {
      icon.classList.add("active");
    }
  });

  // Store the current path and method globally
  setCurrentPath(path);
  setCurrentMethod(method);

  const operation = swaggerData.paths[path][method];

  // Set current operation security for auth system
  if (
    window.auth &&
    typeof window.auth.setCurrentOperationSecurity === "function"
  ) {
    const operationSecurity =
      operation.security !== undefined
        ? operation.security
        : swaggerData.security;
    window.auth.setCurrentOperationSecurity(operationSecurity);
  }

  // Update the header (method and path display)
  const methodElement = document.querySelector("#right-panel-method");
  const pathElement = document.querySelector("#right-panel-path");

  // Also update the snippet section elements
  const snippetMethodElement = document.querySelector("#snippet-method");
  const snippetPathElement = document.querySelector("#snippet-path");
  if (methodElement && pathElement) {
    methodElement.textContent = method.toUpperCase();
    methodElement.className = " text-white ml-1 rounded";
    pathElement.textContent = path;

    // Update execute button color based on the HTTP verb
    if (window.updateExecuteButtonColor) {
      window.updateExecuteButtonColor(method);
    }
  }

  if (snippetMethodElement && snippetPathElement) {
    snippetMethodElement.textContent = method.toUpperCase();
    snippetMethodElement.className =
      getMethodClass(method) + " text-white px-2 py-0.5 text-xs rounded mr-2";
    snippetPathElement.textContent = path;
  }

  // --- BEGIN "Try it out" DYNAMIC INPUTS ---
  // Get containers for dynamic inputs
  const pathParametersSection = document.getElementById(
    "right-panel-path-parameters-section"
  );
  const pathParametersContainer = document.getElementById(
    "right-panel-path-parameters-container"
  );
  const queryParametersSection = document.getElementById(
    "right-panel-query-parameters-section"
  );
  const queryParametersContainer = document.getElementById(
    "right-panel-query-parameters-container"
  );
  const headersSection = document.getElementById("right-panel-headers-section");
  const headersContainer = document.getElementById(
    "right-panel-headers-container"
  );
  const requestBodySection = document.getElementById(
    "right-panel-request-body-section"
  );
  const requestBodyContentTypeSelect = document.getElementById(
    "right-panel-request-body-content-type-select"
  );
  const requestBodyEditorDiv = document.getElementById(
    "right-panel-request-body-editor"
  );
  const requestBodyRequiredSpan = document.getElementById(
    "right-panel-request-body-required"
  );

  // Clear previous dynamic content
  pathParametersContainer.innerHTML = "";
  queryParametersContainer.innerHTML = "";
  headersContainer.innerHTML = "";
  // Clear Monaco editor content if it exists
  if (window.requestBodyEditor) {
    window.requestBodyEditor.setValue("");
  }
  requestBodyContentTypeSelect.innerHTML = "";

  // Hide sections by default
  pathParametersSection.classList.add("hidden");
  queryParametersSection.classList.add("hidden");
  headersSection.classList.add("hidden");
  requestBodySection.classList.add("hidden");

  if (!operation) return;
  // Define common classes for inputs and selects
  const inputClasses =
    "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClasses = "w-1/3 text-sm font-medium text-gray-300 pr-1";

  // Common function to create parameter div
  const createParameterDiv = (param, container) => {
    const paramDiv = document.createElement("div");
    paramDiv.classList.add("mb-1", "flex", "items-center", "gap-1");

    const labelWrapper = document.createElement("div");
    labelWrapper.className = "flex items-center h-7 " + labelClasses;
    const label = document.createElement("div");
    label.className = "flex items-center w-full justify-between";
    label.innerHTML = `<span class="font-bold">${param.name}${
      param.required ? '<span class="text-red-400 ml-0.5">*</span>' : ""
    }</span> <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${
      window.formatTypeDisplay
        ? window.formatTypeDisplay(param.schema)
        : param.schema.type
    }</code>`;

    labelWrapper.appendChild(label);
    paramDiv.appendChild(labelWrapper);

    // Add parameter info
    if (param.description) {
      label.title = param.description;
    }

    let input;
    if (param.schema.enum) {
      input = document.createElement("select");
      input.className = inputClasses;
      param.schema.enum.forEach((enumValue) => {
        const option = document.createElement("option");
        option.value = enumValue;
        option.textContent = enumValue;
        input.appendChild(option);
      });
      if (param.schema.default) {
        input.value = param.schema.default;
      }
    } else if (param.schema.type === "boolean") {
      input = document.createElement("select");
      input.className = inputClasses;
      ["true", "false"].forEach((val) => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val;
        input.appendChild(option);
      });
      if (typeof param.schema.default === "boolean") {
        input.value = param.schema.default.toString();
      } else {
        input.value = "false";
      }
    } else {
      input = document.createElement("input");
      input.type = param.schema.type === "integer" ? "number" : "text";
      input.className = inputClasses;
      if (param.schema.default) {
        input.value = param.schema.default;
      }
    }
    input.name = param.name;
    input.dataset.paramIn = param.in;
    input.placeholder = param.description || "";
    if (param.required) {
      input.required = true;
    }

    // Add input change listener for variable detection
    input.addEventListener("input", () => {
      if (window.highlightVariablePlaceholders) {
        window.highlightVariablePlaceholders(input);
      }
    });

    paramDiv.appendChild(input);
    container.appendChild(paramDiv);
  };

  // Populate Parameters
  if (operation.parameters && operation.parameters.length > 0) {
    const queryParams = operation.parameters.filter((p) => p.in === "query");
    const pathParams = operation.parameters.filter((p) => p.in === "path");
    const headerParams = operation.parameters.filter((p) => p.in === "header");

    // Process path parameters
    if (pathParams.length > 0) {
      // Show path parameters section
      pathParametersSection.classList.remove("hidden");
      pathParametersContainer.innerHTML = ""; // Clear previous
      // Add count to path parameters header
      const pathParamHeader = document.querySelector(
        "#right-panel-path-parameters-section h3"
      );
      pathParamHeader.innerHTML = `Path Parameters <span class="endpoint-count ml-2">${pathParams.length}</span>`;

      // Add path parameters
      pathParams.forEach((param) => {
        createParameterDiv(param, pathParametersContainer);
      });
    } else {
      pathParametersSection.classList.add("hidden");
    }

    // Process query parameters
    if (queryParams.length > 0) {
      // Show query parameters section
      queryParametersSection.classList.remove("hidden");
      queryParametersContainer.innerHTML = ""; // Clear previous
      // Add count to query parameters header
      const queryParamHeader = document.querySelector(
        "#right-panel-query-parameters-section h3"
      );
      queryParamHeader.innerHTML = `Query Parameters <span class="endpoint-count ml-2">${queryParams.length}</span>`;

      // Add query parameters
      queryParams.forEach((param) => {
        createParameterDiv(param, queryParametersContainer);
      });
    } else {
      queryParametersSection.classList.add("hidden");
    }

    // Process headers
    if (headerParams.length > 0) {
      headersSection.classList.remove("hidden");
      headersContainer.innerHTML = ""; // Clear previous
      headerParams.forEach((param) => {
        createParameterDiv(param, headersContainer);
      });
    } else {
      headersSection.classList.add("hidden");
    }
  }

  // Process request body
  if (
    operation.requestBody &&
    operation.requestBody.content &&
    requestBodySection &&
    requestBodyContentTypeSelect &&
    requestBodyEditorDiv &&
    requestBodyRequiredSpan
  ) {
    requestBodySection.classList.remove("hidden");
    const contentTypes = Object.keys(operation.requestBody.content);

    contentTypes.forEach((contentType) => {
      const option = document.createElement("option");
      option.value = contentType;
      option.textContent = contentType;
      requestBodyContentTypeSelect.appendChild(option);
    });

    // Set 'application/json' as default if available
    if (contentTypes.includes("application/json")) {
      requestBodyContentTypeSelect.value = "application/json";
    }

    if (operation.requestBody.required) {
      requestBodyRequiredSpan.classList.remove("hidden");
    } else {
      requestBodyRequiredSpan.classList.add("hidden");
    }
    const updateRequestBodyDetails = () => {
      const selectedContentType = requestBodyContentTypeSelect.value;
      const schemaInfo = operation.requestBody.content[selectedContentType];

      if (
        selectedContentType === "application/x-www-form-urlencoded" ||
        selectedContentType === "multipart/form-data"
      ) {
        // Hide Monaco editor and show form fields for form-encoded content
        if (requestBodyEditorDiv) {
          requestBodyEditorDiv.style.display = "none";
        }

        // Create or show form fields container
        let formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (!formFieldsContainer) {
          formFieldsContainer = document.createElement("div");
          formFieldsContainer.id = "form-fields-container";
          formFieldsContainer.className = "space-y-2";
          requestBodyEditorDiv.parentNode.insertBefore(
            formFieldsContainer,
            requestBodyEditorDiv.nextSibling
          );
        }

        // Clear previous form fields
        formFieldsContainer.innerHTML = "";
        formFieldsContainer.style.display = "block";

        // Set data attribute to track content type for later use
        formFieldsContainer.setAttribute(
          "data-content-type",
          selectedContentType
        );

        // Resolve schema reference if needed
        let resolvedSchema = schemaInfo.schema;
        if (schemaInfo.schema && schemaInfo.schema.$ref) {
          const refPath = schemaInfo.schema.$ref.split("/").slice(1); // Remove #
          resolvedSchema = refPath.reduce(
            (acc, part) => acc && acc[part],
            window.swaggerData // Use swaggerData to properly resolve references
          );
        }

        if (resolvedSchema && resolvedSchema.properties) {
          // Create form fields based on schema properties
          Object.entries(resolvedSchema.properties).forEach(
            ([fieldName, fieldSchema]) => {
              const fieldDiv = document.createElement("div");
              fieldDiv.className = "mb-2 flex items-center gap-2";

              const labelWrapper = document.createElement("div");
              labelWrapper.className =
                "w-1/3 text-sm font-medium text-gray-300 pr-1";

              const label = document.createElement("div");
              label.className = "flex items-center w-full justify-between";

              const isRequired =
                resolvedSchema.required &&
                resolvedSchema.required.includes(fieldName);
              label.className = "flex items-center w-full justify-between";
              label.innerHTML = `<span class="font-bold">${fieldName}${
                isRequired ? '<span class="text-red-400 ml-0.5">*</span>' : ""
              }</span> <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${
                window.formatTypeDisplay
                  ? window.formatTypeDisplay(fieldSchema)
                  : fieldSchema.type
              }</code>`;
              labelWrapper.appendChild(label);

              let input;
              // Check if this is a file field for multipart/form-data
              const isFileField =
                selectedContentType === "multipart/form-data" &&
                fieldSchema.type === "string" &&
                fieldSchema.format === "binary";

              if (isFileField) {
                // Create file input for binary fields in multipart forms
                input = document.createElement("input");
                input.type = "file";
                input.className =
                  "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700";

                // Add accept attribute based on description if available
                if (fieldSchema.description) {
                  const desc = fieldSchema.description.toLowerCase();
                  if (desc.includes("pdf")) {
                    input.accept = input.accept
                      ? input.accept + ",.pdf"
                      : ".pdf";
                  }
                  if (
                    desc.includes("image") ||
                    desc.includes("png") ||
                    desc.includes("jpeg") ||
                    desc.includes("jpg")
                  ) {
                    input.accept = input.accept
                      ? input.accept + ",.png,.jpg,.jpeg"
                      : ".png,.jpg,.jpeg";
                  }
                }
              } else if (fieldSchema.enum) {
                input = document.createElement("select");
                input.className =
                  "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                fieldSchema.enum.forEach((enumValue) => {
                  const option = document.createElement("option");
                  option.value = enumValue;
                  option.textContent = enumValue;
                  input.appendChild(option);
                });
                if (fieldSchema.default) {
                  input.value = fieldSchema.default;
                }
              } else if (fieldSchema.type === "boolean") {
                input = document.createElement("select");
                input.className =
                  "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                ["true", "false"].forEach((val) => {
                  const option = document.createElement("option");
                  option.value = val;
                  option.textContent = val;
                  input.appendChild(option);
                });
                if (typeof fieldSchema.default === "boolean") {
                  input.value = fieldSchema.default.toString();
                } else {
                  input.value = "false";
                }
              } else {
                input = document.createElement("input");
                input.type =
                  fieldSchema.type === "integer"
                    ? "number"
                    : fieldSchema.type === "password"
                    ? "password"
                    : "text";
                input.className =
                  "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                if (fieldSchema.default) {
                  input.value = fieldSchema.default;
                }
              }

              input.name = fieldName;
              if (!isFileField) {
                input.placeholder =
                  fieldSchema.description || fieldSchema.example || "";
              }
              if (isRequired) {
                input.required = true;
              }

              // Add input change listener for variable detection (except for file inputs)
              if (!isFileField) {
                input.addEventListener("input", () => {
                  if (window.highlightVariablePlaceholders) {
                    window.highlightVariablePlaceholders(input);
                  }
                });
              }

              fieldDiv.appendChild(labelWrapper);
              fieldDiv.appendChild(input);

              formFieldsContainer.appendChild(fieldDiv);
            }
          );
        }
      } else {
        // Show Monaco editor for JSON and other content types
        if (requestBodyEditorDiv) {
          requestBodyEditorDiv.style.display = "block";
        }

        // Hide form fields container
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (formFieldsContainer) {
          formFieldsContainer.style.display = "none";
        }

        if (schemaInfo && schemaInfo.schema) {
          // Get the example as a JavaScript object
          const example = generateExampleFromSchema(
            schemaInfo.schema,
            swaggerData.components
          );
          if (window.requestBodyEditor) {
            window.requestBodyEditor.setValue(JSON.stringify(example, null, 2));
          }
        } else {
          if (window.requestBodyEditor) {
            window.requestBodyEditor.setValue("");
          }
          console.warn(
            `No schema example available for ${selectedContentType}.`
          );
        }
      }
    };

    requestBodyContentTypeSelect.addEventListener(
      "change",
      updateRequestBodyDetails
    );
    if (contentTypes.length > 0) {
      updateRequestBodyDetails(); // Initial population
    }
  } else {
    requestBodySection.classList.add("hidden");
  }

  // Hide the request payload section as we're now using the interactive request body section
  const requestPayloadDiv = document.getElementById("request-payload-section");
  if (requestPayloadDiv) {
    requestPayloadDiv.classList.add("hidden");
  }

  // Clear previous actual response display
  const apiResponseSection = document.getElementById("api-response-section");
  if (apiResponseSection) apiResponseSection.classList.add("hidden"); // Hide until execute

  const actualResponseSamplePre = document.getElementById(
    "actualResponseSample"
  );
  if (window.responseBodyEditor) {
    window.responseBodyEditor.setValue("");
  }

  const actualResponseStatusCodeDisplay = document.getElementById(
    "actual-response-status-code-display"
  );
  if (actualResponseStatusCodeDisplay)
    actualResponseStatusCodeDisplay.textContent = "";

  const actualResponseContentType = document.getElementById(
    "actual-response-content-type"
  );
  if (actualResponseContentType) actualResponseContentType.textContent = "";
}

// Function to display actual API response
function displayActualResponse(
  response,
  responseBodyText,
  error = false,
  executionTime = 0
) {
  const responseContent = document.getElementById("response-content");
  const actualResponseStatusCodeDisplay = document.getElementById(
    "actual-response-status-code-display"
  );
  const actualResponseContentType = document.getElementById(
    "actual-response-content-type"
  );
  const executionTimeDisplay = document.getElementById(
    "response-execution-time"
  );
  const tabsContainer = document.getElementById("try-it-out-tabs");
  const responseBodyContainer = document.getElementById("actualResponseSample");

  // Show both tabs after response is received
  if (tabsContainer) {
    tabsContainer.classList.remove("hidden");
    tabsContainer.classList.add("visible", "response-available");
  }

  // Show the API response section
  const apiResponseSection = document.getElementById("api-response-section");
  if (apiResponseSection) {
    apiResponseSection.classList.remove("hidden");
    apiResponseSection.classList.add("block");
  }

  // Switch to response tab
  switchTab("response");

  // Show the response content
  if (responseContent) {
    responseContent.classList.remove("hidden");
  }
  // Update status code display
  if (actualResponseStatusCodeDisplay) {
    actualResponseStatusCodeDisplay.textContent = `${response.status} ${
      response.statusText || ""
    }`;
    actualResponseStatusCodeDisplay.className = `py-1 px-3 rounded text-sm font-semibold ${
      error || !String(response.status).startsWith("2")
        ? "bg-red-500 text-white"
        : "bg-green-500 text-white"
    }`;
  }

  // Update execution time display
  if (executionTimeDisplay) {
    executionTimeDisplay.textContent = `${executionTime}ms`;
  }

  // Update content type display
  const contentTypeHeader =
    response.headers?.get("Content-Type") || "application/octet-stream";
  if (actualResponseContentType) {
    actualResponseContentType.textContent = contentTypeHeader;
  }

  // Process response body
  let displayValue = responseBodyText || "";
  let language = "text";

  if (contentTypeHeader.includes("application/json")) {
    try {
      const jsonBody = JSON.parse(responseBodyText);
      displayValue = JSON.stringify(jsonBody, null, 2);
      language = "json";
    } catch (e) {
      console.warn("Failed to parse JSON response", e);
    }
  }

  // Create or update the response editor
  try {
    if (!window.responseBodyEditor) {
      // Create new editor if it doesn't exist
      window.monacoSetup
        .createMonacoEditor("actualResponseSample", {
          language,
          value: displayValue,
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: "off",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        })
        .then((editor) => {
          window.responseBodyEditor = editor;
          setupResponseEditor(responseBodyContainer);
        });
    } else {
      // Update existing editor
      const model = window.responseBodyEditor.getModel();
      monaco.editor.setModelLanguage(model, language);
      window.responseBodyEditor.setValue(displayValue);
      setupResponseEditor(responseBodyContainer);
    }
  } catch (err) {
    console.error("Error displaying response:", err);
    // Fallback to plain text display
    if (responseBodyContainer) {
      responseBodyContainer.innerHTML = `<pre class="text-sm text-gray-300 p-4">${displayValue}</pre>`;
    }
  }

  // Update response headers
  const responseHeadersContainer = document.getElementById("response-headers");
  if (responseHeadersContainer) {
    let headersHtml = "";
    response.headers?.forEach((value, name) => {
      headersHtml += `<div><strong>${name}:</strong> ${value}</div>`;
    });
    responseHeadersContainer.innerHTML = headersHtml;
  }
}

// Helper function to setup response editor container
function setupResponseEditor(container) {
  if (!container) return;

  container.style.display = "block";
  container.classList.remove("hidden");

  // Give the editor time to layout properly
  setTimeout(() => {
    if (window.responseBodyEditor) {
      window.responseBodyEditor.layout();
    }
  }, 100);
}


/* js/viewModes.js */
// Functions for handling different view modes (list/tree)

// Function to parse a path into segments
function parsePathSegments(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  // Split by '/' but keep path parameters intact
  const segments = [];
  let currentSegment = "";
  let insideParam = false;

  for (let i = 0; i < cleanPath.length; i++) {
    const char = cleanPath[i];

    if (char === "{") {
      insideParam = true;
      currentSegment += char;
    } else if (char === "}") {
      insideParam = false;
      currentSegment += char;
    } else if (char === "/" && !insideParam) {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = "";
      }
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

// Function to build a tree structure from operations
function buildEndpointTree(operations) {
  const tree = {};

  operations.forEach((op) => {
    const segments = parsePathSegments(op.path);
    let currentNode = tree;

    segments.forEach((segment, index) => {
      if (!currentNode[segment]) {
        currentNode[segment] = {
          methods: {},
          children: {},
        };
      }

      if (index === segments.length - 1) {
        currentNode[segment].methods[op.method] = op;
      }

      currentNode = currentNode[segment].children;
    });
  });

  return tree;
}

// Function to build the list view (original implementation)
function buildListView(operations, container) {
  operations.forEach((op) => {
    const endpointDiv = createEndpointElement(op);
    container.appendChild(endpointDiv);
  });
}

// Use the common createCleanPath function from utils.js

// Function to create an endpoint element
function createEndpointElement(op) {
  const endpointDiv = document.createElement("div");
  endpointDiv.className =
    "endpoint endpoint-link bg-opacity-50 pr-2 pl-0 py-2 text-sm mb-2 cursor-pointer border-l-[3px] border-transparent";
  endpointDiv.dataset.path = op.path;
  endpointDiv.dataset.method = op.method;
  endpointDiv.dataset.tooltip = `${op.method.toUpperCase()} ${op.path}`;

  // Apply the method-specific text color and hover border color
  const methodClass = getMethodClass(op.method);
  const hoverBorderClass = getHoverBorderClass(op.method);

  if (hoverBorderClass) {
    endpointDiv.classList.add(hoverBorderClass);
  }

  endpointDiv.innerHTML = `
    <div class="flex items-center w-full">
        <span class="${methodClass} method-badge w-[20%] text-right flex-shrink-0">${
    op.method.length > 5
      ? op.method.substring(0, 3).toUpperCase()
      : op.method.toUpperCase()
  }</span>
        <span class="w-[80%] truncate text-left pl-1">${op.summary}</span>
    </div>
  `;

  // Add event listeners
  endpointDiv.addEventListener("mouseenter", handleTooltipMouseEnter);
  endpointDiv.addEventListener("mouseleave", handleTooltipMouseLeave);

  endpointDiv.addEventListener("click", function () {
    // Remove active class from all other endpoint links
    document
      .querySelectorAll(".endpoint-link")
      .forEach((link) => link.classList.remove("bg-blue-100", "text-blue-800"));
    // Add active class to the clicked link
    this.classList.add("bg-blue-100", "text-blue-800");

    const sectionId = generateSectionId(op.path, op.method);
    const section = document.getElementById(sectionId);
    if (section) {
      const endpointsContainer = section.closest(".endpoints-section");

      endpointsContainer.style.opacity = "1";
      // scoll after 400ms
      setTimeout(() => {
        section.scrollIntoView({ behavior: "smooth" });
      }, 50);

      const isCollapsed = endpointsContainer.style.maxHeight === "0px";

      if (isCollapsed) {
        const endpointsContainerHeader =
          endpointsContainer.previousElementSibling;
        endpointsContainerHeader.click();
      }
    }

    const endpointContent = section.querySelector(".endpoint-content");
    if (endpointContent.classList.contains("hidden")) {
      const outlineButton = section.querySelector(".outline-btn");
      outlineButton.click();
    }

    // Ensure right sidebar is expanded on mobile
    const rightSidebar = document.getElementById("right-sidebar");
    if (rightSidebar && rightSidebar.classList.contains("translate-x-full")) {
      const toggleRightBtn = document.getElementById("toggle-right-sidebar");
      if (toggleRightBtn) {
        toggleRightBtn.click();
      }
    } // Update right panel and ensure it's visible
    updateRightPanelDynamically(op.path, op.method);

    // Update code snippet section too
    if (typeof updateCodeSnippetSection === "function") {
      updateCodeSnippetSection(op.path, op.method);
    }

    // Update URL hash without triggering scroll
    const hash = `#${op.method.toLowerCase()}-${window.utils.createCleanPath(
      op.path
    )}`;
    history.replaceState(null, "", hash);
  });

  return endpointDiv;
}

// Function to render the endpoint tree
function renderEndpointTree(tree, container, basePath = "") {
  // Helper function to handle endpoint click
  function handleEndpointClick(op, method) {
    return function () {
      // Remove active class from all endpoint links
      document
        .querySelectorAll(".endpoint-link")
        .forEach((link) =>
          link.classList.remove("bg-blue-100", "text-blue-800")
        );
      this.classList.add("bg-blue-100", "text-blue-800");

      const sectionId = generateSectionId(op.path, method);
      const section = document.getElementById(sectionId);
      if (section) {
        const endpointsContainer = section.closest(".endpoints-section");

        endpointsContainer.style.opacity = "1";
        section.scrollIntoView({ behavior: "smooth" });

        // Expand the outline
        const outlineButton = section.querySelector(".outline-btn");
        const contentDiv = section.querySelector(".flex-1");
        if (outlineButton && contentDiv) {
          const content = [...contentDiv.children].slice(1);
          const svg = outlineButton.querySelector("svg");

          // Check if there's a saved preference to expand this endpoint
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

            // Only expand if saved preference is specifically "true"
            if (savedState === "true") {
              // Remove hidden class from content
              content.forEach((element) => element.classList.remove("hidden"));

              // Rotate arrow to expanded state
              if (svg) {
                svg.style.transform = "rotate(90deg)";
              }
            }
          }
        }
      }

      updateRightPanelDynamically(op.path, method);

      // Update code snippet section too
      if (typeof updateCodeSnippetSection === "function") {
        updateCodeSnippetSection(op.path, method);
      } // Update URL hash without triggering scroll
      const hash = `#${method.toLowerCase()}-${window.utils.createCleanPath(
        op.path
      )}`;
      history.replaceState(null, "", hash);
    };
  }

  Object.keys(tree).forEach((segment) => {
    const node = tree[segment];
    const currentPath = basePath + "/" + segment;

    // Create segment container
    const segmentContainer = document.createElement("div");
    segmentContainer.className = "path-segment";

    // If there are methods for this segment, show them
    const methods = Object.keys(node.methods);
    if (methods.length > 0) {
      // Check if there's only one method for this path
      if (methods.length === 1) {
        // For a single method, display it on the same line as the segment
        const method = methods[0];
        const op = node.methods[method];
        // Create the endpoint element with segment name inline
        const endpointEl = document.createElement("div");
        endpointEl.className =
          "endpoint endpoint-link bg-opacity-50 px-2 py-2 text-sm rounded-md mb-2 cursor-pointer flex items-center justify-between";
        endpointEl.dataset.path = op.path;
        endpointEl.dataset.method = method;
        // Store tooltip data for custom tooltip
        endpointEl.dataset.tooltip = `${op.path} ${method.toUpperCase()}`; // Create wrapper div for flexbox layout
        const wrapperDiv = document.createElement("div");
        wrapperDiv.className = "flex items-center w-full";

        // Create method badge for the left side, taking 15% of space
        const methodBadge = document.createElement("span");
        methodBadge.className = `method-badge ${getMethodClass(
          method
        )} w-[15%] text-right`;
        methodBadge.textContent = method.toUpperCase();
        wrapperDiv.appendChild(methodBadge);

        // Add segment name (path) on the right, taking 85% of space
        const pathText = document.createElement("span");
        pathText.className = "w-[85%] text-left truncate";
        pathText.textContent = segment;
        wrapperDiv.appendChild(pathText);

        // Add the wrapper to the endpoint element
        endpointEl.appendChild(wrapperDiv);

        // Add mouse event listeners for custom tooltip
        endpointEl.addEventListener("mouseenter", handleTooltipMouseEnter);
        endpointEl.addEventListener("mouseleave", handleTooltipMouseLeave); // Add click event
        endpointEl.addEventListener("click", handleEndpointClick(op, method));

        segmentContainer.appendChild(endpointEl);
      } else {
        // For multiple methods, show segment name as a folder label first
        const segmentLabel = document.createElement("div");
        segmentLabel.className = "font-medium text-gray-700 mb-1";
        segmentLabel.textContent = segment;
        segmentContainer.appendChild(segmentLabel);

        // Container for all method endpoints
        const methodsContainer = document.createElement("div");
        methodsContainer.className = "methods-container pl-2";

        // For each HTTP method, create a clickable element on its own line
        methods.forEach((method) => {
          const op = node.methods[method];

          // Create method endpoint container (one per line)
          const methodContainer = document.createElement("div");
          methodContainer.className = "method-container";

          // Create method badge
          const methodBadge = document.createElement("span");
          methodBadge.className = `method-badge ${getMethodClass(method)}`;
          methodBadge.textContent = method.toUpperCase();

          // Create the endpoint element
          const endpointEl = document.createElement("div");
          endpointEl.className =
            "endpoint endpoint-link bg-opacity-50 px-2 py-1 text-sm rounded-md mb-1 cursor-pointer flex items-center justify-between";
          endpointEl.dataset.path = op.path;
          endpointEl.dataset.method = method;
          // Store tooltip data for custom tooltip
          endpointEl.dataset.tooltip = `${method.toUpperCase()} ${op.path}`; // Create wrapper div for flexbox layout
          const wrapperDiv = document.createElement("div");
          wrapperDiv.className = "flex items-center w-full";

          // Add method badge on the left, taking 15% of space
          methodBadge.className = `${methodBadge.className} w-[15%] text-right`;
          wrapperDiv.appendChild(methodBadge);

          // Add segment name (path) on the right, taking 85% of space
          const pathText = document.createElement("span");
          pathText.className = "w-[85%] text-left truncate";
          pathText.textContent = segment;
          wrapperDiv.appendChild(pathText);

          // Add the wrapper to the endpoint element
          endpointEl.appendChild(wrapperDiv);

          // Add mouse event listeners for custom tooltip
          endpointEl.addEventListener("mouseenter", handleTooltipMouseEnter);
          endpointEl.addEventListener("mouseleave", handleTooltipMouseLeave); // Add click event
          endpointEl.addEventListener("click", handleEndpointClick(op, method));

          // Add to method container and then to methods container
          methodContainer.appendChild(endpointEl);
          methodsContainer.appendChild(methodContainer);
        });

        // Add all method endpoints to segment container
        segmentContainer.appendChild(methodsContainer);
      }
    } else {
      // Just show the segment name as a folder
      const segmentLabel = document.createElement("div");
      segmentLabel.className = "font-medium text-gray-700";
      segmentLabel.textContent = segment;
      segmentContainer.appendChild(segmentLabel);
    }

    // Add segment container to parent container
    container.appendChild(segmentContainer);

    // If there are children, recursively render them
    if (Object.keys(node.children).length > 0) {
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-container";
      renderEndpointTree(node.children, childrenContainer, currentPath);
      container.appendChild(childrenContainer);
    }
  });
}

// Function to build the tree view (hierarchical implementation)
function buildTreeView(operations, container) {
  // Create a tree structure from the operations
  const tree = buildEndpointTree(operations);

  // Render the tree
  renderEndpointTree(tree, container);
}

// Functions are now globally available


/* js/auth.js */
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
  }, 5000); // Check 5 seconds
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


/* js/favorites.js */
// Favorites functionality for API endpoints
/**
 * This module adds a favorites feature to the API documentation:
 * - Adds heart icons next to HTTP verb buttons in the main content
 * - Allows users to save favorite endpoints to localStorage
 * - Creates a favorites section at the top of the documentation
 * - Adds a favorites section to the left navigation sidebar
 * - Loads/saves favorites based on the API title
 */

// Store for tracking favorite endpoints
let favoriteEndpoints = [];

// Function to load favorites from localStorage
function loadFavorites() {
  try {
    const apiPrefix =
      window.swaggerData?.info?.title && window.swaggerData?.info?.version
        ? `${window.swaggerData.info.title
            .toLowerCase()
            .replace(/\s+/g, "_")}_${window.swaggerData.info.version
            .toLowerCase()
            .replace(/\s+/g, "_")}`
        : "openapi_ui_default";

    const savedFavorites = localStorage.getItem(`${apiPrefix}_favorites`);
    if (savedFavorites) {
      favoriteEndpoints = JSON.parse(savedFavorites);
    }
  } catch (error) {
    console.error("Error loading favorites:", error);
    favoriteEndpoints = [];
  }
}

// Function to save favorites to localStorage
function saveFavorites() {
  try {
    const apiPrefix =
      window.swaggerData?.info?.title && window.swaggerData?.info?.version
        ? `${window.swaggerData.info.title
            .toLowerCase()
            .replace(/\s+/g, "_")}_${window.swaggerData.info.version
            .toLowerCase()
            .replace(/\s+/g, "_")}`
        : "openapi_ui_default";

    localStorage.setItem(
      `${apiPrefix}_favorites`,
      JSON.stringify(favoriteEndpoints)
    );
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
}

// Function to toggle favorite status for an endpoint
function toggleFavorite(path, method) {
  const index = favoriteEndpoints.findIndex(
    (fav) => fav.path === path && fav.method === method
  );

  // If found, remove it (unfavorite)
  if (index !== -1) {
    favoriteEndpoints.splice(index, 1);
  } else {
    // Add the endpoint to favorites with summary from DOM
    // Find the operation in swagger data
    const operation = swaggerData?.paths?.[path]?.[method.toLowerCase()];
    const summary = operation?.summary || path;

    favoriteEndpoints.push({ path, method, summary });
  }

  // Save updated favorites to localStorage
  saveFavorites();

  // Update UI
  updateFavoritesUI();
  updateFavoriteSectionInMainContent();

  return index === -1; // Return true if added, false if removed
}

// Check if an endpoint is favorited
function isFavorite(path, method) {
  return favoriteEndpoints.some(
    (fav) => fav.path === path && fav.method === method
  );
}

// Create heart icon element
function createFavoriteHeartIcon(path, method, size = 5) {
  const heartIcon = document.createElement("button");
  const isFav = isFavorite(path, method);

  heartIcon.className = `favorite-heart-icon text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200`;
  heartIcon.dataset.path = path;
  heartIcon.dataset.method = method;
  heartIcon.dataset.tooltip = isFav
    ? "Remove from favorites"
    : "Add to favorites";

  // Set the SVG with appropriate fill based on favorite status
  heartIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-${size} w-${size}" 
         viewBox="0 0 20 20" fill="${isFav ? "currentColor" : "none"}" 
         stroke="currentColor" stroke-width="1.5">
      <path fill-rule="${isFav ? "evenodd" : "nonzero"}" 
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
            clip-rule="${isFav ? "evenodd" : "nonzero"}"
            class="${isFav ? "text-red-500" : ""}"/>
    </svg>
  `;
  // Add click event listener
  heartIcon.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering parent element clicks

    const isNowFavorite = toggleFavorite(path, method);

    // Use the existing updateFavoritesUI to handle all updates consistently
    // This ensures all icons are updated the same way
    updateFavoritesUI();
  });

  return heartIcon;
}

// Update all favorite heart icons in the UI
function updateFavoritesUI() {
  document.querySelectorAll(`.favorite-heart-icon`).forEach((icon) => {
    const path = icon.dataset.path;
    const method = icon.dataset.method;

    if (!path || !method) {
      console.warn("Found heart icon without path or method attributes", icon);
      return;
    }

    const isFav = isFavorite(path, method);

    // Make sure the SVG element exists
    const svg = icon.querySelector("svg");
    if (svg) {
      svg.setAttribute("fill", isFav ? "currentColor" : "none");
    }

    // Make sure the path element exists
    const pathElement = icon.querySelector("path");
    if (pathElement) {
      pathElement.classList.toggle("text-red-500", isFav);
    }

    icon.dataset.tooltip = isFav ? "Remove from favorites" : "Add to favorites";
  });
}

// Create favorites section for the main content
function createFavoritesSection() {
  if (favoriteEndpoints.length === 0) {
    return "";
  }

  const mainContent = document.getElementById("api-main-content");
  if (!mainContent) return "";

  const favoritesContainer = document.createElement("div");
  favoritesContainer.id = "favorites-section";
  favoritesContainer.className = "mb-8 p-6 bg-white shadow-lg";

  // Create favorites header
  const header = document.createElement("div");
  header.className =
    "text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center";
  header.innerHTML = `
    <div class="flex items-center flex-grow">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
      </svg>
      Favorites
      <span class="endpoint-count endpoint-count-title ml-2">${
        favoriteEndpoints.length
      } endpoint${favoriteEndpoints.length !== 1 ? "s" : ""}</span>
    </div>
  `;

  favoritesContainer.appendChild(header);

  // Create favorites content
  const content = document.createElement("div");
  content.className = "space-y-2";

  favoriteEndpoints.forEach((fav) => {
    const endpoint = document.createElement("div");
    endpoint.className = "flex items-center justify-between p-2 rounded";

    // Method badge
    const methodClass = getMethodColor(fav.method);

    endpoint.innerHTML = `
      <div class="flex items-center">
        <span class="px-2 py-1 text-xs font-medium rounded ${methodClass} text-white mr-2">${fav.method.toUpperCase()}</span>
        <span class="font-mono text-sm">${fav.path}</span>
      </div>
    `;

    // Add heart icon for removal
    const heartIcon = createFavoriteHeartIcon(fav.path, fav.method, 4);
    heartIcon.classList.add("ml-2");
    endpoint.appendChild(heartIcon); // Add click handler to navigate to endpoint
    endpoint.addEventListener("click", function (e) {
      if (e.target.closest(".favorite-heart-icon")) return; // Don't navigate if clicking the heart

      // Update URL hash without triggering scroll
      if (window.utils && window.utils.createCleanPath) {
        const hash = `#${fav.method.toLowerCase()}-${window.utils.createCleanPath(
          fav.path
        )}`;
        history.replaceState(null, "", hash);
      }

      // Find the corresponding section in the document
      const sectionId = generateSectionId(fav.path, fav.method);
      const section = document.getElementById(sectionId);

      if (section) {
        // Expand the parent section if collapsed
        const endpointsContainer = section.closest(".endpoints-section");
        if (endpointsContainer) {
          endpointsContainer.style.opacity = "1";
          if (endpointsContainer.style.maxHeight === "0px") {
            const tagHeader = endpointsContainer.previousElementSibling;
            if (tagHeader) tagHeader.click(); // Click to expand
          }
        }

        // Scroll to the section
        section.scrollIntoView({ behavior: "smooth" });

        // Expand the endpoint if it's collapsed
        const outlineButton = section.querySelector(".outline-btn");
        const contentDiv = section.querySelector(".flex-1");

        if (outlineButton && contentDiv) {
          const content = [...contentDiv.children].slice(1);
          if (content[0] && content[0].classList.contains("hidden")) {
            outlineButton.click();
          }
        }
      }
    });

    content.appendChild(endpoint);
  });

  favoritesContainer.appendChild(content);
  return favoritesContainer;
}

// Update or create favorites section in main content
function updateFavoriteSectionInMainContent() {
  // Remove existing favorites section if it exists
  const existingSection = document.getElementById("favorites-section");
  if (existingSection) {
    existingSection.remove();
  }

  // If we have favorites, create a new section
  if (favoriteEndpoints.length > 0) {
    const favoritesSection = createFavoritesSection();
    const mainContent = document.getElementById("api-main-content");

    // Insert favorites at the top, right after the main heading
    if (mainContent) {
      const firstChild = mainContent.firstElementChild;
      if (firstChild) {
        mainContent.insertBefore(favoritesSection, firstChild.nextSibling);
      } else {
        mainContent.appendChild(favoritesSection);
      }
    }
  }

  // Update the sidebar favorites too
  updateFavoritesInSidebar();
}

// Add favorites section to sidebar
function updateFavoritesInSidebar() {
  const navigation = document.getElementById("api-navigation");
  if (!navigation) return;

  // Remove existing favorites section
  const existingFavSection = navigation.querySelector(
    ".favorites-sidebar-section"
  );
  if (existingFavSection) {
    existingFavSection.remove();
  }

  // If no favorites, exit
  if (favoriteEndpoints.length === 0) {
    return;
  }

  // Create new favorites section
  const favSection = document.createElement("div");
  favSection.className = "mt-2 favorites-sidebar-section";

  // Create header
  const favHeader = document.createElement("a");
  favHeader.href = "#";
  favHeader.className =
    "flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 bg-gray-600";
  favHeader.innerHTML = `
    <div class="flex items-center flex-grow">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
      </svg>
      <span>Favorites</span>
      <span class="endpoint-count ml-2">${favoriteEndpoints.length}</span>
    </div>
    <span class="ml-auto">
      <svg class="w-4 h-4 text-gray-400 transform sidebar-arrow rotate-90" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </span>
  `;

  // Create endpoints container
  const endpointsContainer = document.createElement("div");
  endpointsContainer.className = "endpoints-container expanded pl-3 pr-4 py-1";
  endpointsContainer.style.maxHeight = "1000px"; // Ensure it's expanded

  // Add favorites to container
  favoriteEndpoints.forEach((fav) => {
    const endpoint = document.createElement("div");
    endpoint.className =
      "endpoint endpoint-link bg-opacity-50 pr-2 pl-0 py-2 text-sm mb-2 cursor-pointer border-l-[3px] border-transparent";
    endpoint.dataset.path = fav.path;
    endpoint.dataset.method = fav.method;
    endpoint.dataset.tooltip = `${fav.method.toUpperCase()} ${fav.path}`;

    // Apply the method-specific text color
    const methodClass = getMethodClass(fav.method);

    endpoint.innerHTML = `
      <div class="flex items-center w-full">
        <span class="method-badge ${methodClass} w-[20%] text-right flex-shrink-0">${fav.method.toUpperCase()}</span>
        <span class="w-[65%] truncate text-left pl-1">${
          fav.summary || fav.path
        }</span>
        <button class="favorite-heart-icon w-[15%] text-right focus:outline-none" data-path="${
          fav.path
        }" data-method="${fav.method}" data-tooltip="Remove from favorites">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    // Add click event listener for navigation
    endpoint.addEventListener("click", function (e) {
      if (e.target.closest(".favorite-heart-icon")) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(fav.path, fav.method);
        return;
      }

      // Remove active class from all other endpoint links
      document
        .querySelectorAll(".endpoint-link")
        .forEach((link) =>
          link.classList.remove("bg-blue-100", "text-blue-800")
        );

      // Add active class to clicked link
      this.classList.add("bg-blue-100", "text-blue-800");

      // Find section and scroll to it
      const sectionId = generateSectionId(fav.path, fav.method);
      const section = document.getElementById(sectionId);

      if (section) {
        const endpointsContainer = section.closest(".endpoints-section");
        if (endpointsContainer) {
          endpointsContainer.style.opacity = "1";
          section.scrollIntoView({ behavior: "smooth" });

          // Expand the outline
          const outlineButton = section.querySelector(".outline-btn");
          if (outlineButton) outlineButton.click();
        }
      }

      // Update right panel
      if (typeof updateRightPanelDynamically === "function") {
        updateRightPanelDynamically(fav.path, fav.method);
      }

      // Update code snippet section
      if (typeof updateCodeSnippetSection === "function") {
        updateCodeSnippetSection(fav.path, fav.method);
      }

      // Update URL hash
      const hash = `#${fav.method.toLowerCase()}-${window.utils.createCleanPath(
        fav.path
      )}`;
      history.replaceState(null, "", hash);
    });

    endpointsContainer.appendChild(endpoint);
  });

  // Add toggling behavior to header
  favHeader.addEventListener("click", (e) => {
    e.preventDefault();
    const arrow = favHeader.querySelector("svg.sidebar-arrow");

    if (endpointsContainer.classList.contains("expanded")) {
      // Collapse
      endpointsContainer.classList.remove("expanded");
      favHeader.classList.remove("bg-gray-200");
      if (arrow) arrow.classList.remove("rotate-90");
      endpointsContainer.style.maxHeight = "0px";
    } else {
      // Expand
      endpointsContainer.classList.add("expanded");
      favHeader.classList.add("bg-gray-200");
      if (arrow) arrow.classList.add("rotate-90");
      const contentHeight = endpointsContainer.scrollHeight;
      endpointsContainer.style.maxHeight = `${contentHeight + 50}px`;
    }
  });

  // Append to navigation
  favSection.appendChild(favHeader);
  favSection.appendChild(endpointsContainer);

  // Insert at the top of the navigation
  navigation.insertBefore(favSection, navigation.firstChild);
}

// Helper function to get method color class
function getMethodColor(method) {
  const lowerMethod = method.toLowerCase();
  switch (lowerMethod) {
    case "get":
      return "bg-green-600";
    case "post":
      return "bg-blue-600";
    case "put":
      return "bg-yellow-600";
    case "patch":
      return "bg-yellow-500";
    case "delete":
      return "bg-red-600";
    case "options":
    case "head":
      return "bg-gray-600";
    default:
      return "bg-gray-600";
  }
}

// Helper function to get method class for sidebar
function getMethodClass(method) {
  const lowerMethod = method.toLowerCase();
  switch (lowerMethod) {
    case "get":
      return "text-green-600";
    case "post":
      return "text-blue-600";
    case "put":
      return "text-yellow-600";
    case "patch":
      return "text-yellow-500";
    case "delete":
      return "text-red-600";
    case "options":
    case "head":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
}

// Helper function from the app - copied here to avoid circular dependency
function generateSectionId(path, method) {
  return `${method.toLowerCase()}-${createFavoritePathIdentifier(path)}`;
}

// Helper function to create clean path for IDs
// Using the shared createCleanPath from utils.js
// For favorites, we need to modify the path differently - replacing slashes with hyphens
function createFavoritePathIdentifier(path) {
  return window.utils
    .createCleanPath(path)
    .replace(/\//g, "-")
    .replace(/^-|-$/g, "");
}

// Initialize favorites functionality
function initFavorites() {
  // Load favorites from localStorage
  loadFavorites();

  // Add favorites section to main content and sidebar
  updateFavoriteSectionInMainContent();

  // Update all heart icons to reflect favorite state
  // Use a longer timeout to ensure all heart icons are in the DOM before updating them
  setTimeout(() => {
    updateFavoritesUI();
  }, 300);
}

// Listen for swaggerDataLoaded event to initialize favorites
document.addEventListener("swaggerDataLoaded", function () {
  // Initialize after a small delay to ensure DOM is ready
  setTimeout(() => {
    initFavorites();
  }, 100);
});

// Export functions for use in other modules
window.favorites = {
  toggleFavorite,
  isFavorite,
  createFavoriteHeartIcon,
  updateFavoritesUI,
};


/* js/variables.js */
// Variables management functionality

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Global variables store
window.variablesStore = {
  variables: new Map(),
  outputVariables: new Map(), // Store for output variables ({{@variableName}})
  storageKey: null,
  outputStorageKey: null,
  // Initialize storage key based on loaded API spec
  initializeStorageKey() {
    if (window.swaggerData && window.swaggerData.info) {
      const title = (window.swaggerData.info.title || "api")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const version = (window.swaggerData.info.version || "1.0.0")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      this.storageKey = `${title}_${version}_variables`;
      this.outputStorageKey = `${title}_${version}_output_variables`;
      this.loadFromStorage();
      this.updateUI(); // Update UI after loading variables
    }
  }, // Load variables from localStorage
  loadFromStorage() {
    if (!this.storageKey) return;

    try {
      // Load regular variables
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.variables.clear();
        Object.entries(data).forEach(([key, value]) => {
          this.variables.set(key, value);
        });
      }

      // Load output variables
      if (this.outputStorageKey) {
        const outputStored = localStorage.getItem(this.outputStorageKey);
        if (outputStored) {
          const outputData = JSON.parse(outputStored);
          this.outputVariables.clear();
          Object.entries(outputData).forEach(([key, value]) => {
            this.outputVariables.set(key, value);
          });
        }
      }
    } catch (error) {
      console.error("Error loading variables from storage:", error);
    }
  },
  // Save variables to localStorage
  saveToStorage() {
    if (!this.storageKey) return;

    try {
      // Save regular variables
      const data = Object.fromEntries(this.variables);
      localStorage.setItem(this.storageKey, JSON.stringify(data));

      // Save output variables
      if (this.outputStorageKey) {
        const outputData = Object.fromEntries(this.outputVariables);
        localStorage.setItem(this.outputStorageKey, JSON.stringify(outputData));
      }
    } catch (error) {
      console.error("Error saving variables to storage:", error);
    }
  },

  // Add or update a variable
  set(name, value) {
    this.variables.set(name, value);
    this.saveToStorage();
    this.updateUI();
  },
  // Get a variable value
  get(name) {
    return this.variables.get(name);
  },

  // Get an output variable value
  getOutput(name) {
    return this.outputVariables.get(name);
  },

  // Set an output variable
  setOutput(name, value) {
    this.outputVariables.set(name, value);
    this.saveToStorage();
    this.updateUI();
  },

  // Delete a variable
  delete(name) {
    this.variables.delete(name);
    this.saveToStorage();
    this.updateUI();
  },
  // Clear all variables
  clear() {
    this.variables.clear();
    this.outputVariables.clear();
    this.saveToStorage();
    this.updateUI();
  },
  // Get all variables as object
  getAll() {
    return Object.fromEntries(this.variables);
  },
  // Update UI display
  updateUI() {
    if (typeof window.updateVariablesUI === "function") {
      window.updateVariablesUI();
    }

    // Update Monaco editors variable highlighting
    this.updateAllMonacoEditors();
  },
  // Update variable highlighting in all Monaco editors
  updateAllMonacoEditors() {
    if (window.monacoVariableHighlighting) {
      window.monacoVariableHighlighting.updateVariableHighlighting();
    }
  },
};

// Variable replacement functionality
window.replaceVariables = function (text) {
  if (!text || typeof text !== "string") return text;

  // Replace {{@variableName}} with output variable values first
  text = text.replace(/\{\{@([^}]+)\}\}/g, (match, variableName) => {
    const value = window.variablesStore.getOutput(variableName.trim());
    return value !== undefined ? value : match;
  });

  // Replace {{variableName}} with regular variable values
  text = text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const cleanName = variableName.trim();
    // Skip if this is an output variable pattern (starts with @)
    if (cleanName.startsWith("@")) {
      return match; // Leave unchanged if it wasn't processed by the first replacement
    }
    const value = window.variablesStore.get(cleanName);
    return value !== undefined ? value : match;
  });

  return text;
};

// UI Management
window.updateVariablesUI = function () {
  const container = document.getElementById("variables-container");
  const emptyState = document.getElementById("variables-empty-state");
  const countSpan = document.getElementById("variables-count");
  const clearBtn = document.getElementById("clear-variables-btn");
  const saveBtn = document.getElementById("save-variables-btn");

  if (!container) return;

  const variables = window.variablesStore.getAll();
  const variableCount = Object.keys(variables).length;

  // Update count
  if (countSpan) {
    countSpan.textContent = variableCount;
  }
  // Show/hide buttons
  if (clearBtn) {
    clearBtn.style.display = variableCount > 0 ? "block" : "none";
  }
  // Hide save button on UI refresh (will be shown when variables are modified)
  if (saveBtn) {
    saveBtn.style.display = "none";
  }

  // Clear existing content except empty state
  Array.from(container.children).forEach((child) => {
    if (child.id !== "variables-empty-state") {
      child.remove();
    }
  });

  if (variableCount === 0) {
    if (emptyState) {
      emptyState.style.display = "block";
    }
    return;
  }
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = "none";
  }

  // Create table structure
  const table = document.createElement("div");
  table.className = "variables-table";

  // Create table header
  const header = document.createElement("div");
  header.className = "variables-table-header";
  header.innerHTML = `
    <div class="variables-table-header-cell">Name</div>
    <div class="variables-table-header-cell">Value</div>
    <div class="variables-table-header-cell">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </div>
  `;
  table.appendChild(header);

  // Create variable items
  Object.entries(variables).forEach(([name, value]) => {
    const item = createVariableItem(name, value);
    table.appendChild(item);
  });

  container.appendChild(table);
};

function createVariableItem(name, value) {
  const item = document.createElement("div");
  item.className = "variable-item";
  item.dataset.variableName = name;
  item.dataset.originalName = name;

  item.innerHTML = `
    <div class="variable-cell">
      <input type="text" class="variable-input name-input" value="${escapeHtml(
        name
      )}" placeholder="Variable name" data-original-value="${escapeHtml(name)}">
    </div>
    <div class="variable-cell">
      <input type="text" class="variable-input value-input" value="${escapeHtml(
        value
      )}" placeholder="Variable value" data-original-value="${escapeHtml(
    value
  )}">
    </div>
    <div class="variable-cell">
      <div class="variable-actions">
        <button class="variable-action-btn delete" title="Delete variable">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  const deleteBtn = item.querySelector(".delete");
  deleteBtn.addEventListener("click", () => deleteVariable(name));

  // Add input change listeners to mark as modified
  const nameInput = item.querySelector(".name-input");
  const valueInput = item.querySelector(".value-input");

  [nameInput, valueInput].forEach((input) => {
    input.addEventListener("input", () => {
      markVariableAsModified(item);
      showSaveButton();
    });
  });

  return item;
}

// Helper function to mark a variable as modified
function markVariableAsModified(item) {
  item.classList.add("modified");
  const nameInput = item.querySelector(".name-input");
  const valueInput = item.querySelector(".value-input");

  // Check if values have changed from original
  const nameChanged = nameInput.value !== nameInput.dataset.originalValue;
  const valueChanged = valueInput.value !== valueInput.dataset.originalValue;

  if (nameChanged || valueChanged) {
    item.classList.add("modified");
  } else {
    item.classList.remove("modified");
  }
}

// Helper function to show save button
function showSaveButton() {
  const saveBtn = document.getElementById("save-variables-btn");
  if (saveBtn) {
    saveBtn.style.display = "block";
  }
}

// Helper function to hide save button
function hideSaveButton() {
  const saveBtn = document.getElementById("save-variables-btn");
  if (saveBtn) {
    saveBtn.style.display = "none";
  }
}

// Function to save all variables
function saveAllVariables() {
  const container = document.getElementById("variables-container");
  if (!container) return;

  const items = container.querySelectorAll(".variable-item");
  const newVariables = new Map();
  let hasErrors = false;

  items.forEach((item) => {
    const nameInput = item.querySelector(".name-input");
    const valueInput = item.querySelector(".value-input");
    const originalName = item.dataset.originalName;

    const newName = nameInput.value.trim();
    const newValue = valueInput.value.trim();

    if (!newName) {
      nameInput.style.borderColor = "#ef4444";
      hasErrors = true;
      return;
    } else {
      nameInput.style.borderColor = "";
    }

    // Check for duplicate names
    if (newVariables.has(newName)) {
      nameInput.style.borderColor = "#ef4444";
      hasErrors = true;
      return;
    }

    newVariables.set(newName, newValue);
  });
  if (hasErrors) {
    window.utils.showToast(
      "Please fix errors: ensure all variables have unique, non-empty names.",
      "error"
    );
    return;
  }
  // Clear existing variables and set new ones
  window.variablesStore.variables.clear();
  newVariables.forEach((value, name) => {
    window.variablesStore.variables.set(name, value);
  });

  window.variablesStore.saveToStorage();

  // Update original values for all inputs to prevent showing as modified
  items.forEach((item) => {
    const nameInput = item.querySelector(".name-input");
    const valueInput = item.querySelector(".value-input");
    nameInput.dataset.originalValue = nameInput.value;
    valueInput.dataset.originalValue = valueInput.value;
    item.classList.remove("modified");
    item.dataset.originalName = nameInput.value;
  });

  window.variablesStore.updateUI();
  hideSaveButton();

  // Show success message
  window.utils.showToast("Variables saved successfully", "success");
}

function deleteVariable(name) {
  window.utils
    .showToast(
      `Are you sure you want to delete the variable "${name}"?`,
      "confirm"
    )
    .then((confirmed) => {
      if (confirmed) {
        window.variablesStore.delete(name);
        window.utils.showToast(
          `Variable "${name}" deleted successfully`,
          "success"
        );
      }
    });
}

function addNewVariable() {
  const container = document.getElementById("variables-container");
  if (!container) return;

  // Check if we need to create the table structure first
  let table = container.querySelector(".variables-table");
  if (!table) {
    const emptyState = document.getElementById("variables-empty-state");
    if (emptyState) {
      emptyState.style.display = "none";
    }

    // Create table structure
    table = document.createElement("div");
    table.className = "variables-table";

    // Create table header
    const header = document.createElement("div");
    header.className = "variables-table-header";
    header.innerHTML = `
      <div class="variables-table-header-cell">Name</div>
      <div class="variables-table-header-cell">Value</div>
      <div class="variables-table-header-cell">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
    `;
    table.appendChild(header);
    container.appendChild(table);
  }

  // Create a new empty variable item
  const item = createVariableItem("", "");
  table.appendChild(item);

  // Focus on the name input
  const nameInput = item.querySelector(".name-input");
  nameInput.focus();
  // Show save button
  showSaveButton();
}

// Enhanced input handling for variable placeholders
window.setupVariablePlaceholderHandling = function () {
  // Add event listeners to input fields to detect variable placeholders
  const inputSelectors = [
    "#right-panel-path-parameters-container input",
    "#right-panel-query-parameters-container input",
    "#right-panel-headers-container input",
    "#right-panel-path-parameters-container textarea",
    "#right-panel-query-parameters-container textarea",
    "#right-panel-headers-container textarea",
  ];

  inputSelectors.forEach((selector) => {
    document.addEventListener("input", (e) => {
      if (e.target.matches(selector)) {
        highlightVariablePlaceholders(e.target);
      }
    });

    document.addEventListener("focus", (e) => {
      if (e.target.matches(selector)) {
        showVariableSuggestions(e.target);
      }
    });

    // Check existing inputs on page load
    document.querySelectorAll(selector).forEach((input) => {
      highlightVariablePlaceholders(input);
    });
  });
};

function highlightVariablePlaceholders(input) {
  const value = input.value;
  const hasVariables = /\{\{[^}]+\}\}/.test(value);

  if (hasVariables) {
    input.classList.add("has-variables");
    // Remove simple tooltip and use popover instead
    input.removeAttribute("title"); // Add variable count and status to input
    const variables = value.match(/\{\{([^}]+)\}\}/g) || [];
    const definedCount = variables.filter((varMatch) => {
      const varName = varMatch.replace(/\{\{|\}\}/g, "").trim();
      const isOutputVar = varName.startsWith("@");
      const cleanName = isOutputVar ? varName.substring(1) : varName;

      if (isOutputVar) {
        // Check if output parameter is defined in collection
        return (
          window.monacoVariableHighlighting &&
          window.monacoVariableHighlighting.isOutputParameterDefinedInCollection(
            cleanName
          )
        );
      } else {
        return window.variablesStore.get(cleanName) !== undefined;
      }
    }).length;

    const totalCount = variables.length;
    const hasUndefined = definedCount < totalCount;

    // Add data attributes for CSS styling
    input.dataset.variableCount = totalCount;
    input.dataset.definedCount = definedCount;
    input.dataset.hasUndefined = hasUndefined;

    // Set up popover for this input if not already done
    setupVariablePopover(input);
  } else {
    input.classList.remove("has-variables");
    input.removeAttribute("title");
    // Remove data attributes
    delete input.dataset.variableCount;
    delete input.dataset.definedCount;
    delete input.dataset.hasUndefined;
    // Remove popover if no variables
    removeVariablePopover(input);
  }

  // Update Monaco editors if variables are detected or removed
  if (window.monacoVariableHighlighting) {
    window.monacoVariableHighlighting.updateVariableHighlighting();
  }
}

// Expose function globally
window.highlightVariablePlaceholders = highlightVariablePlaceholders;

function showVariableSuggestions(input) {
  // Remove any existing suggestions
  const existingSuggestions = document.querySelector(".variable-suggestions");
  if (existingSuggestions) {
    existingSuggestions.remove();
  }

  const variables = window.variablesStore.getAll();
  const variableNames = Object.keys(variables);

  if (variableNames.length === 0) return;

  // Create suggestions dropdown
  const suggestions = document.createElement("div");
  suggestions.className = "variable-suggestions";
  suggestions.innerHTML = `
    <div class="variable-suggestions-header">Available Variables:</div>
    ${variableNames
      .map(
        (name) =>
          `<div class="variable-suggestion-item" data-variable="${escapeHtml(
            name
          )}">
        <span class="variable-suggestion-name">{{${escapeHtml(name)}}}</span>
        <span class="variable-suggestion-value">${escapeHtml(
          variables[name]
        )}</span>
      </div>`
      )
      .join("")}
  `;

  // Position the suggestions
  const rect = input.getBoundingClientRect();
  suggestions.style.position = "fixed";
  suggestions.style.top = rect.bottom + 5 + "px";
  suggestions.style.left = rect.left + "px";
  suggestions.style.width = Math.max(300, rect.width) + "px";
  suggestions.style.zIndex = "1001";

  document.body.appendChild(suggestions);

  // Add click handlers for suggestions
  suggestions.querySelectorAll(".variable-suggestion-item").forEach((item) => {
    item.addEventListener("click", () => {
      const variableName = item.dataset.variable;
      const cursorPos = input.selectionStart;
      const currentValue = input.value;
      const newValue =
        currentValue.slice(0, cursorPos) +
        `{{${variableName}}}` +
        currentValue.slice(input.selectionEnd);
      input.value = newValue;
      input.focus();

      // Position cursor after the inserted variable
      const newPos = cursorPos + `{{${variableName}}}`.length;
      input.setSelectionRange(newPos, newPos);

      highlightVariablePlaceholders(input);
      suggestions.remove();
    });
  });

  // Remove suggestions when clicking elsewhere
  const removeSuggestions = (e) => {
    if (!suggestions.contains(e.target) && e.target !== input) {
      suggestions.remove();
      document.removeEventListener("click", removeSuggestions);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", removeSuggestions);
  }, 100);
}

// Variable popover functionality
function setupVariablePopover(input) {
  // Avoid setting up multiple popovers for the same input
  if (input.dataset.popoverSetup === "true") return;

  input.dataset.popoverSetup = "true";

  let hideTimeout;

  // Add hover event listeners
  input.addEventListener("mouseenter", (e) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    showVariablePopover(e.target);
  });

  input.addEventListener("mouseleave", (e) => {
    hideTimeout = setTimeout(() => {
      // Check if mouse is over the popover
      const popover = e.target._variablePopover;
      if (popover && !popover.matches(":hover")) {
        hideVariablePopover(e.target);
      }
    }, 300);
  });

  // Also show popover on focus
  input.addEventListener("focus", (e) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    showVariablePopover(e.target);
  });

  input.addEventListener("blur", (e) => {
    hideTimeout = setTimeout(() => {
      hideVariablePopover(e.target);
    }, 200);
  });

  // Handle clicking outside popover
  document.addEventListener("click", (e) => {
    if (
      input._variablePopover &&
      !input._variablePopover.contains(e.target) &&
      e.target !== input
    ) {
      hideVariablePopover(input);
    }
  });
}

function removeVariablePopover(input) {
  input.dataset.popoverSetup = "false";
  // Remove any existing popover
  const existingPopover = document.getElementById(
    `popover-${input.name || "unnamed"}`
  );
  if (existingPopover) {
    existingPopover.remove();
  }
}

function showVariablePopover(input) {
  const value = input.value;
  const variables = value.match(/\{\{([^}]+)\}\}/g) || [];

  if (variables.length === 0) return;

  // Remove any existing popovers for this input
  hideVariablePopover(input);

  // Create popover
  const popover = document.createElement("div");
  const popoverId = `popover-${input.name || "unnamed"}`;
  popover.id = popoverId;
  popover.className = "variable-popover dark";
  popover.setAttribute("role", "tooltip");
  // Check which variables exist and which don't
  const variableResults = variables.map((varMatch) => {
    const varName = varMatch.replace(/\{\{|\}\}/g, "").trim();
    const isOutputVar = varName.startsWith("@");
    const cleanName = isOutputVar ? varName.substring(1) : varName;

    let varValue, exists, jsonPath;
    if (isOutputVar) {
      // For output variables, check if defined in collection and get JSON path
      exists =
        window.monacoVariableHighlighting &&
        window.monacoVariableHighlighting.isOutputParameterDefinedInCollection(
          cleanName
        );
      varValue = window.variablesStore.getOutput(cleanName);
      jsonPath =
        window.monacoVariableHighlighting &&
        window.monacoVariableHighlighting.getOutputParameterJsonPath(cleanName);
    } else {
      // For regular variables
      varValue = window.variablesStore.get(cleanName);
      exists = varValue !== undefined;
      jsonPath = null;
    }

    return {
      name: cleanName,
      originalName: varName,
      value: varValue,
      exists: exists,
      placeholder: varMatch,
      isOutputVar: isOutputVar,
      jsonPath: jsonPath,
    };
  });

  // Build popover content
  let headerText = "Variable Placeholder";
  if (variables.length > 1) {
    headerText = "Variable Placeholders";
  }

  let contentHtml = "";
  let hasUndefinedVars = false;

  variableResults.forEach((varResult, index) => {
    const isLastItem = index === variableResults.length - 1;

    if (varResult.exists) {
      contentHtml += `
        <div class="variable-item-section">
          <div class="variable-item-content">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="variable-status-badge defined">
                <svg class="variable-action-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                Defined
              </span>
            </div>            <div class="variable-detail">
              <div class="variable-name-display">${escapeHtml(
                varResult.placeholder
              )}</div>
              ${
                varResult.isOutputVar
                  ? varResult.jsonPath
                    ? `<div class="variable-value-display">JSON Path: ${escapeHtml(
                        varResult.jsonPath
                      )}</div>`
                    : '<div class="variable-value-display text-gray-500">JSON Path not available</div>'
                  : `<div class="variable-value-display">${escapeHtml(
                      varResult.value
                    )}</div>`
              }
              <p class="variable-description">${
                varResult.isOutputVar
                  ? "This output parameter will be substituted during request execution."
                  : "This variable will be substituted during request execution."
              }</p>
            </div>
          </div>
        </div>
      `;
    } else {
      hasUndefinedVars = true;
      contentHtml += `
        <div class="variable-item-section">
          <div class="variable-item-content">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="variable-status-badge undefined">
                <svg class="variable-action-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                Undefined
              </span>
            </div>            <div class="variable-detail">
              <div class="variable-name-display">${escapeHtml(
                varResult.placeholder
              )}</div>
              <p class="variable-description">${
                varResult.isOutputVar
                  ? "This output parameter is not defined in any request in the collection. Add it to a request's output parameters to define it."
                  : "This variable is not defined and needs to be created."
              }</p>
            </div>
          </div>
        </div>
      `;
    }
  });
  // No action buttons for undefined variables
  popover.innerHTML = `
    <div class="variable-popover-header">
      <svg class="variable-popover-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd"></path>
      </svg>
      <h3>${headerText}</h3>
    </div>
    <div class="variable-popover-content">
      ${contentHtml}
    </div>
  `; // Add hover events to keep popover visible when hovering over it
  popover.addEventListener("mouseenter", () => {
    popover.dataset.hovering = "true";
  });

  popover.addEventListener("mouseleave", () => {
    popover.dataset.hovering = "false";
    // Hide popover when mouse leaves if input also doesn't have focus
    setTimeout(() => {
      if (
        popover.dataset.hovering === "false" &&
        document.activeElement !== input &&
        !input.matches(":hover")
      ) {
        hideVariablePopover(input);
      }
    }, 100);
  });

  // Position the popover
  document.body.appendChild(popover);
  positionVariablePopover(input, popover);

  // Show the popover
  setTimeout(() => {
    popover.classList.add("visible");
  }, 10);

  // Store reference to popover on input
  input._variablePopover = popover;
}

function hideVariablePopover(input) {
  if (input._variablePopover) {
    input._variablePopover.classList.remove("visible");
    setTimeout(() => {
      if (input._variablePopover && input._variablePopover.parentNode) {
        input._variablePopover.parentNode.removeChild(input._variablePopover);
      }
      input._variablePopover = null;
    }, 300);
  }
}

function positionVariablePopover(input, popover) {
  const inputRect = input.getBoundingClientRect();

  // Default position: below the input
  let top = inputRect.bottom + 12;
  let left = inputRect.left;

  // Check popover dimensions after adding to DOM
  const popoverRect = popover.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust horizontal position if needed
  if (left + popoverRect.width > viewportWidth - 20) {
    left = Math.max(20, viewportWidth - popoverRect.width - 20);
  }

  // Keep popover within left boundary
  if (left < 20) {
    left = 20;
  }

  // Adjust vertical position if needed
  if (top + popoverRect.height > viewportHeight - 20) {
    // Position above the input instead
    top = inputRect.top - popoverRect.height - 12;
  }

  // Ensure popover doesn't go above viewport
  if (top < 20) {
    // If there's not enough space above or below, center vertically
    top = Math.max(20, (viewportHeight - popoverRect.height) / 2);
  }

  popover.style.position = "fixed";
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
  popover.style.zIndex = "1000";
}

// Initialize variables functionality
window.initVariables = function () {
  // Set up event listeners
  const addBtn = document.getElementById("add-variable-btn");
  const clearBtn = document.getElementById("clear-variables-btn");
  const saveBtn = document.getElementById("save-variables-btn");

  if (addBtn) {
    addBtn.addEventListener("click", addNewVariable);
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      window.utils
        .showToast("Are you sure you want to delete all variables?", "confirm")
        .then((confirmed) => {
          if (confirmed) {
            window.variablesStore.clear();
            hideSaveButton();
            window.utils.showToast(
              "All variables cleared successfully",
              "success"
            );
          }
        });
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", saveAllVariables);
  }

  // Try to initialize storage key if swagger data is already available
  if (window.swaggerData) {
    window.variablesStore.initializeStorageKey();
  }

  // Initial UI update
  window.updateVariablesUI();
  window.setupVariablePlaceholderHandling();
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.initVariables);
} else {
  window.initVariables();
}

// Listen for swagger data changes to reinitialize storage key
document.addEventListener("swaggerDataLoaded", () => {
  window.variablesStore.initializeStorageKey();
});

// Monaco Editor Variable Highlighting Functions
window.monacoVariableHighlighting = {
  editors: new Map(), // Track multiple editors with their decorations
  hoverProvider: null,
  lastMousePosition: { x: 0, y: 0 }, // Track mouse position for hover positioning

  // Initialize variable highlighting for a Monaco editor
  initializeForEditor(editor) {
    if (!editor || !window.monaco) return;

    // Skip if already initialized for this editor
    if (this.editors.has(editor)) return;

    const editorData = {
      editor: editor,
      decorationsCollection: editor.createDecorationsCollection([]),
    };

    this.editors.set(editor, editorData);

    // Set up mouse tracking for this editor
    this.setupMouseTracking(editor);

    // Set up content change listener
    editor.onDidChangeModelContent(() => {
      this.updateVariableHighlightingForEditor(editor);
    });

    // Set up disposal listener
    editor.onDidDispose(() => {
      this.disposeEditor(editor);
    }); // Set up custom hover events for this editor
    this.setupCustomHoverEvents(editor);

    // Initial highlighting
    this.updateVariableHighlightingForEditor(editor);
  },
  // Set up mouse tracking for an editor
  setupMouseTracking(editor) {
    const editorDomNode = editor.getDomNode();
    if (!editorDomNode) return;

    editorDomNode.addEventListener("mousemove", (e) => {
      this.lastMousePosition = { x: e.clientX, y: e.clientY };
    });
  }, // Find all variable patterns in the editor content
  findVariables(content) {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const varName = match[1].trim();
      const isOutputVar = varName.startsWith("@");
      const cleanName = isOutputVar ? varName.substring(1) : varName;

      let isDefined, value, jsonPath;
      if (isOutputVar) {
        // Check if output parameter is defined in any collection request
        const isDefinedInCollection =
          this.isOutputParameterDefinedInCollection(cleanName);
        const hasValue =
          window.variablesStore.getOutput(cleanName) !== undefined;

        // Get the JSON path for this output parameter
        jsonPath = this.getOutputParameterJsonPath(cleanName);

        isDefined = isDefinedInCollection;
        value = hasValue
          ? window.variablesStore.getOutput(cleanName)
          : undefined;
      } else {
        isDefined = window.variablesStore.get(cleanName) !== undefined;
        value = isDefined ? window.variablesStore.get(cleanName) : undefined;
        jsonPath = null; // Regular variables don't have JSON paths
      }

      variables.push({
        match: match[0],
        name: cleanName,
        originalName: varName, // Keep track of the original name with @ prefix
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        isDefined: isDefined,
        isOutputVar: isOutputVar,
        value: value,
        jsonPath: jsonPath, // Add JSON path for output variables
        hasValue: isOutputVar
          ? window.variablesStore.getOutput(cleanName) !== undefined
          : isDefined,
      });
    }
    return variables;
  },
  // Check if an output parameter is defined in any request in the collection
  isOutputParameterDefinedInCollection(parameterName) {
    // Check if we have access to the collection runner
    if (
      !window.CollectionRunner ||
      !window.collectionRunnerUI ||
      !window.collectionRunnerUI.collectionRunner
    ) {
      return false;
    }

    const collection = window.collectionRunnerUI.collectionRunner.collection;
    if (!collection || !Array.isArray(collection)) {
      return false;
    }

    // Check if any request in the collection has this output parameter defined
    return collection.some((request) => {
      if (
        !request.outputParameters ||
        !Array.isArray(request.outputParameters)
      ) {
        return false;
      }
      return request.outputParameters.some(
        (param) => param.name === parameterName
      );
    });
  },

  // Get the JSON path for an output parameter from the collection
  getOutputParameterJsonPath(parameterName) {
    // Check if we have access to the collection runner
    if (
      !window.CollectionRunner ||
      !window.collectionRunnerUI ||
      !window.collectionRunnerUI.collectionRunner
    ) {
      return null;
    }

    const collection = window.collectionRunnerUI.collectionRunner.collection;
    if (!collection || !Array.isArray(collection)) {
      return null;
    }

    // Find the output parameter in any request in the collection
    for (const request of collection) {
      if (request.outputParameters && Array.isArray(request.outputParameters)) {
        const param = request.outputParameters.find(
          (p) => p.name === parameterName
        );
        if (param) {
          return param.jsonPath;
        }
      }
    }

    return null;
  },

  // Convert string index to Monaco position
  indexToPosition(content, index) {
    const lines = content.substring(0, index).split("\n");
    const lineNumber = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { lineNumber, column };
  },
  // Update variable highlighting in the current editor
  updateVariableHighlighting() {
    // Update all tracked editors
    for (const [editor, editorData] of this.editors) {
      this.updateVariableHighlightingForEditor(editor);
    }
  },

  // Update variable highlighting for a specific editor
  updateVariableHighlightingForEditor(editor) {
    const editorData = this.editors.get(editor);
    if (!editorData || !editorData.decorationsCollection) return;

    const model = editor.getModel();
    if (!model) return;

    const content = model.getValue();
    const variables = this.findVariables(content); // Create decorations for each variable
    const decorations = variables.map((variable) => {
      const startPos = this.indexToPosition(content, variable.startIndex);
      const endPos = this.indexToPosition(content, variable.endIndex); // Determine the CSS class based on variable type and definition status
      let inlineClassName = "";
      if (variable.isOutputVar) {
        if (variable.isDefined && variable.hasValue) {
          // Output parameter is defined in collection AND has a value from a previous run
          inlineClassName = "monaco-output-variable-defined";
        } else if (variable.isDefined) {
          // Output parameter is defined in collection but doesn't have a value yet
          inlineClassName = "monaco-output-variable-ready";
        } else {
          // Output parameter is not defined anywhere
          inlineClassName = "monaco-output-variable-undefined";
        }
      } else {
        inlineClassName = variable.isDefined
          ? "monaco-variable-defined"
          : "monaco-variable-undefined";
      }

      return {
        range: new monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column
        ),
        options: {
          inlineClassName: inlineClassName,
          hoverMessage: {
            value: this.getVariableHoverMessage(variable),
          },
        },
      };
    }); // Update decorations
    editorData.decorationsCollection.set(decorations);
  },
  // Generate hover message for a variable
  getVariableHoverMessage(variable) {
    if (variable.isOutputVar) {
      if (variable.isDefined && variable.hasValue) {
        const jsonPathInfo = variable.jsonPath
          ? `\n\nJSON Path: \`${variable.jsonPath}\``
          : "";
        return `**Output Variable: ${variable.name}**${jsonPathInfo}\n\nThis output parameter was extracted from a previous request response and will be substituted during request execution.`;
      } else if (variable.isDefined) {
        const jsonPathInfo = variable.jsonPath
          ? `\n\nJSON Path: \`${variable.jsonPath}\``
          : "";
        return `**Output Variable: ${variable.name}**${jsonPathInfo}\n\n📋 This output parameter is defined in the collection but doesn't have a value yet.\n\nIt will be populated when the associated request runs and extracts data from the response.`;
      } else {
        return `**Output Variable: ${variable.name}**\n\n⚠️ This output parameter is not defined in any request in the collection.\n\nAdd it to a request's output parameters to define it.`;
      }
    } else {
      if (variable.isDefined) {
        return `**Variable: ${variable.name}**\n\nValue: \`${variable.value}\`\n\nThis variable will be substituted during request execution.`;
      } else {
        return `**Variable: ${variable.name}**\n\n⚠️ This variable is not defined.\n\nPlease add it in the Variables panel.`;
      }
    }
  }, // Set up custom hover handling for Monaco editors (using our custom popover)
  setupHoverProvider() {
    // No longer using Monaco's built-in hover provider
    // Instead, we'll handle mouse events directly on decorations

    // Set up mouse event listeners for each editor
    for (const [editor] of this.editors) {
      this.setupCustomHoverEvents(editor);
    }
  },

  // Set up custom hover events for a specific editor
  setupCustomHoverEvents(editor) {
    const editorData = this.editors.get(editor);
    if (!editorData || editorData.hoverEventsSetup) return;

    const editorDomNode = editor.getDomNode();
    if (!editorDomNode) return;

    let hoverTimeout;
    let currentPopover = null; // Mouse move handler to detect hover over variables
    const handleMouseMove = (e) => {
      clearTimeout(hoverTimeout);

      hoverTimeout = setTimeout(() => {
        // Get the target at mouse position
        const target = editor.getTargetAtClientPoint(e.clientX, e.clientY);
        if (!target || !target.position) return;

        const model = editor.getModel();
        if (!model) return;

        const content = model.getValue();
        const offset = model.getOffsetAt(target.position);

        // Find if cursor is over a variable
        const variables = this.findVariables(content);
        const variable = variables.find(
          (v) => offset >= v.startIndex && offset <= v.endIndex
        );

        if (variable) {
          // Show our custom popover
          this.showMonacoVariablePopover(editor, variable, e);
        } else {
          // Hide popover if not over a variable
          this.hideMonacoVariablePopover();
        }
      }, 300); // Delay to prevent too frequent updates
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      clearTimeout(hoverTimeout);
      setTimeout(() => {
        this.hideMonacoVariablePopover();
      }, 100);
    };

    // Add event listeners
    editorDomNode.addEventListener("mousemove", handleMouseMove);
    editorDomNode.addEventListener("mouseleave", handleMouseLeave);

    // Mark this editor as having hover events setup
    editorData.hoverEventsSetup = true;
    editorData.hoverEventHandlers = {
      handleMouseMove,
      handleMouseLeave,
    };
  }, // Show custom popover for Monaco editor variables
  showMonacoVariablePopover(editor, variable, mouseEvent) {
    // Hide any existing popover first
    this.hideMonacoVariablePopover();

    // Create popover using the same styling as input field popovers
    const popover = document.createElement("div");
    popover.id = "monaco-variable-popover";
    popover.className = "variable-popover dark";
    popover.setAttribute("role", "tooltip"); // Build popover content using the same format as input popovers
    const varResult = {
      name: variable.name,
      value: variable.value,
      exists: variable.isDefined,
      hasValue: variable.hasValue,
      placeholder: variable.match,
    };
    let contentHtml = "";
    if (varResult.exists) {
      const variableTypeLabel = variable.isOutputVar
        ? "Output Variable"
        : "Variable";

      let statusBadgeClass, statusIcon, statusMessage;
      if (variable.isOutputVar) {
        if (variable.hasValue) {
          statusBadgeClass = "output-defined";
          statusIcon = `<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>`;
          statusMessage =
            "This output parameter has been extracted from a previous request response and will be substituted during request execution.";
        } else {
          statusBadgeClass = "output-ready";
          statusIcon = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>`;
          statusMessage =
            "This output parameter is defined in the collection but doesn't have a value yet. It will be populated when the associated request runs and extracts data from the response.";
        }
      } else {
        statusBadgeClass = "defined";
        statusIcon = `<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>`;
        statusMessage =
          "This variable will be substituted during request execution.";
      }

      contentHtml = `
        <div class="variable-item-section">
          <div class="variable-item-content">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="variable-status-badge ${statusBadgeClass}">
                <svg class="variable-action-icon" fill="currentColor" viewBox="0 0 20 20">
                  ${statusIcon}
                </svg>
                ${variableTypeLabel}
              </span>
            </div>            <div class="variable-detail">
              <div class="variable-name-display">${escapeHtml(
                varResult.placeholder
              )}</div>
              ${
                variable.isOutputVar
                  ? variable.jsonPath
                    ? `<div class="variable-value-display">JSON Path: ${escapeHtml(
                        variable.jsonPath
                      )}</div>`
                    : '<div class="variable-value-display text-gray-500">JSON Path not available</div>'
                  : variable.hasValue
                  ? `<div class="variable-value-display">${escapeHtml(
                      varResult.value
                    )}</div>`
                  : '<div class="variable-value-display text-gray-500">No value yet</div>'
              }
              <p class="variable-description">${statusMessage}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      const variableTypeLabel = variable.isOutputVar
        ? "Output Variable"
        : "Variable";
      const undefinedMessage = variable.isOutputVar
        ? "This output parameter is not defined in any request in the collection. Add it to a request's output parameters to define it."
        : "This variable is not defined and needs to be created.";

      contentHtml = `
        <div class="variable-item-section">
          <div class="variable-item-content">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="variable-status-badge undefined">
                <svg class="variable-action-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                Undefined ${variableTypeLabel}
              </span>
            </div>
            <div class="variable-detail">
              <div class="variable-name-display">${escapeHtml(
                varResult.placeholder
              )}</div>
              <p class="variable-description">${undefinedMessage}</p>
            </div>
          </div>
        </div>
      `;
    }

    popover.innerHTML = `
      <div class="variable-popover-header">
        <svg class="variable-popover-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd"></path>
        </svg>
        <h3>Variable Placeholder</h3>
      </div>
      <div class="variable-popover-content">
        ${contentHtml}
      </div>
    `;

    // Add hover events to keep popover visible
    popover.addEventListener("mouseenter", () => {
      popover.dataset.hovering = "true";
    });

    popover.addEventListener("mouseleave", () => {
      popover.dataset.hovering = "false";
      setTimeout(() => {
        if (popover.dataset.hovering === "false") {
          this.hideMonacoVariablePopover();
        }
      }, 100);
    });

    // Position the popover relative to the variable position in the editor
    document.body.appendChild(popover);
    this.positionMonacoVariablePopover(editor, variable, popover, mouseEvent);

    // Show the popover with animation
    setTimeout(() => {
      popover.classList.add("visible");
    }, 10);

    // Store reference
    this.currentMonacoPopover = popover;
  },

  // Hide custom Monaco popover
  hideMonacoVariablePopover() {
    if (this.currentMonacoPopover) {
      this.currentMonacoPopover.classList.remove("visible");
      setTimeout(() => {
        if (this.currentMonacoPopover && this.currentMonacoPopover.parentNode) {
          this.currentMonacoPopover.parentNode.removeChild(
            this.currentMonacoPopover
          );
        }
        this.currentMonacoPopover = null;
      }, 300);
    }
  },

  // Position Monaco popover near the variable
  positionMonacoVariablePopover(editor, variable, popover, mouseEvent) {
    const editorDomNode = editor.getDomNode();
    if (!editorDomNode) return;

    const editorRect = editorDomNode.getBoundingClientRect();

    // Try to get the exact position of the variable in the editor
    const model = editor.getModel();
    const content = model.getValue();
    const startPos = this.indexToPosition(content, variable.startIndex);

    const variablePosition = editor.getScrolledVisiblePosition({
      lineNumber: startPos.lineNumber,
      column: startPos.column,
    });

    let left, top;

    if (variablePosition) {
      // Use variable position if available
      left = editorRect.left + variablePosition.left;
      top = editorRect.top + variablePosition.top + 25; // Below the variable
    } else {
      // Fallback to mouse position
      left = mouseEvent.clientX;
      top = mouseEvent.clientY + 20;
    }

    // Get popover dimensions after adding to DOM
    const popoverRect = popover.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if needed
    if (left + popoverRect.width > viewportWidth - 20) {
      left = Math.max(20, viewportWidth - popoverRect.width - 20);
    }
    if (left < 20) {
      left = 20;
    }

    // Adjust vertical position if needed
    if (top + popoverRect.height > viewportHeight - 20) {
      // Position above instead
      if (variablePosition) {
        top = editorRect.top + variablePosition.top - popoverRect.height - 5;
      } else {
        top = mouseEvent.clientY - popoverRect.height - 10;
      }
    }
    if (top < 20) {
      top = 20;
    }

    popover.style.position = "fixed";
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.style.zIndex = "1000";
  },
  // Dispose a specific editor
  disposeEditor(editor) {
    const editorData = this.editors.get(editor);
    if (editorData) {
      // Clean up decorations
      if (editorData.decorationsCollection) {
        editorData.decorationsCollection.clear();
      }

      // Clean up hover event listeners
      if (editorData.hoverEventHandlers) {
        const editorDomNode = editor.getDomNode();
        if (editorDomNode) {
          editorDomNode.removeEventListener(
            "mousemove",
            editorData.hoverEventHandlers.handleMouseMove
          );
          editorDomNode.removeEventListener(
            "mouseleave",
            editorData.hoverEventHandlers.handleMouseLeave
          );
        }
      }
    }
    this.editors.delete(editor);
  }, // Clean up when editor is disposed
  dispose() {
    // Hide any current Monaco popover
    this.hideMonacoVariablePopover();

    // Clean up all editors
    for (const [editor, editorData] of this.editors) {
      if (editorData.decorationsCollection) {
        editorData.decorationsCollection.clear();
      }

      // Clean up hover event listeners
      if (editorData.hoverEventHandlers) {
        const editorDomNode = editor.getDomNode();
        if (editorDomNode) {
          editorDomNode.removeEventListener(
            "mousemove",
            editorData.hoverEventHandlers.handleMouseMove
          );
          editorDomNode.removeEventListener(
            "mouseleave",
            editorData.hoverEventHandlers.handleMouseLeave
          );
        }
      }
    }
    this.editors.clear();

    // Clean up hover provider (if any)
    if (this.hoverProvider) {
      this.hoverProvider.dispose();
      this.hoverProvider = null;
    }

    // Clean up hover observer (if any)
    if (this.hoverObserver) {
      this.hoverObserver.disconnect();
      this.hoverObserver = null;
    }
  },
};


/* js/rightPanelHandlers.js */
// Right panel event handlers

// Helper function to map language to Monaco language ID
function getMonacoLanguage(language) {
  const langMap = {
    curl: "shell",
    javascript: "javascript",
    python: "python",
    csharp: "csharp",
    java: "java",
  };
  return langMap[language] || "plaintext";
}

// Function to generate code snippet based on selected language
window.generateCodeSnippet = function () {
  const snippetLanguageSelect = document.getElementById("snippetLanguagePanel");
  const monacoEditor = window.monacoSetup.getMonacoEditor(); // Assumes monacoSetup is on window

  if (!snippetLanguageSelect || !monacoEditor || !window.codeSnippetGenerator) {
    console.error("generateCodeSnippet: Required components not initialized");
    return;
  }

  const selectedLanguage = snippetLanguageSelect.value;
  // Get method and path from visible spans
  const currentMethod =
    document.getElementById("snippet-method")?.textContent || "GET";
  const currentPath =
    document.getElementById("snippet-path")?.textContent || "/api";

  // Get headers from the endpoint configuration in Swagger
  const headers = {};
  // Ensure swaggerData is global, e.g., window.swaggerData
  if (
    window.swaggerData &&
    window.swaggerData.paths[currentPath] &&
    window.swaggerData.paths[currentPath][currentMethod.toLowerCase()]
  ) {
    const operation =
      window.swaggerData.paths[currentPath][currentMethod.toLowerCase()];

    // Extract headers from parameters
    if (operation.parameters) {
      operation.parameters.forEach((param) => {
        if (param.in === "header" && param.schema) {
          // Use default value if available, otherwise just set the header name
          headers[param.name] = param.schema.default || "";
        }
      });
    }
  }

  // Get request body from the current operation
  let requestBody = null;
  if (
    window.swaggerData &&
    window.swaggerData.paths[currentPath] &&
    window.swaggerData.paths[currentPath][currentMethod.toLowerCase()]
  ) {
    const operation =
      window.swaggerData.paths[currentPath][currentMethod.toLowerCase()];

    // If operation has a request body, generate an example from the schema
    if (operation.requestBody && operation.requestBody.content) {
      // Get the first content type as default
      const contentType = Object.keys(operation.requestBody.content)[0];
      if (contentType && operation.requestBody.content[contentType].schema) {
        const schema = operation.requestBody.content[contentType].schema;
        // Generate example JSON from schema
        try {
          // Ensure generateExampleFromSchema is global, e.g., window.generateExampleFromSchema
          const exampleObj = window.generateExampleFromSchema(
            schema,
            window.swaggerData.components
          );
          // Always stringify the object
          requestBody = JSON.stringify(exampleObj, null, 2);
        } catch (error) {
          console.error("Error generating example from schema:", error);
        }
      }
    }
  }

  const code = window.codeSnippetGenerator.generateSnippet(
    selectedLanguage,
    currentMethod,
    currentPath,
    requestBody,
    headers
  );

  monacoEditor.setValue(code);
  monacoEditor.updateOptions({
    language: getMonacoLanguage(selectedLanguage),
  });
};

// Flag to track if Monaco editors have been initialized
let monacoEditorsInitialized = false;
let monacoInitializationPromise = null; // Added to manage concurrent initializations

// Helper function to update layout of Monaco editors
function updateMonacoLayout() {
  const mainEditor = window.monacoSetup.getMonacoEditor();
  if (mainEditor) {
    mainEditor.layout();
  }

  // Layout request body editor if visible
  const requestBodyEditorContainer = document.getElementById(
    "right-panel-request-body-editor"
  );
  if (
    window.requestBodyEditor &&
    requestBodyEditorContainer &&
    requestBodyEditorContainer.offsetParent !== null
  ) {
    window.requestBodyEditor.layout();
  }

  // Layout response body editor if visible
  const responseBodyEditorContainer = document.getElementById(
    "actualResponseSample"
  );
  if (
    window.responseBodyEditor &&
    responseBodyEditorContainer &&
    responseBodyEditorContainer.offsetParent !== null
  ) {
    window.responseBodyEditor.layout();
  }
}

// Function to initialize Monaco Editor
window.initMonacoEditor = async function () {
  if (monacoEditorsInitialized) {
    updateMonacoLayout();
    return;
  }

  if (monacoInitializationPromise) {
    await monacoInitializationPromise;
    // After waiting, re-call to check status or use the initialized editors
    // This ensures that if this call was a "waiter", it proceeds correctly
    // once the actual initialization is done or has failed.
    await window.initMonacoEditor();
    return;
  }

  monacoInitializationPromise = (async () => {
    try {
      // Initialize the main code snippet editor
      if (!window.monacoSetup.getMonacoEditor()) {
        await window.monacoSetup.createMonacoEditor("monaco-editor-container", {
          // Options specific to the main snippet editor, if any, otherwise defaults are used.
        });
      }

      // Initialize the request body editor
      const requestBodyEditorContainer = document.getElementById(
        "right-panel-request-body-editor"
      );
      if (requestBodyEditorContainer && !window.requestBodyEditor) {
        window.requestBodyEditor = await window.monacoSetup.createMonacoEditor(
          "right-panel-request-body-editor",
          {
            language: "json",
            value:
              "{\n  // Request body will be populated based on the selected operation and content type.\n}",
            readOnly: false,
            minimap: { enabled: false }, // Changed to false to hide minimap
            lineNumbers: "off", // Added to hide line numbers
          }
        );
      } else if (!requestBodyEditorContainer) {
        console.warn(
          "Request body editor container 'right-panel-request-body-editor' not found. Skipping request body editor creation."
        );
      }

      // Initialize the response body editor
      const responseBodyEditorContainer = document.getElementById(
        "actualResponseSample"
      );
      if (responseBodyEditorContainer && !window.responseBodyEditor) {
        window.responseBodyEditor = await window.monacoSetup.createMonacoEditor(
          "actualResponseSample",
          {
            language: "json",
            value: "",
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: "off",
          }
        );
      }

      monacoEditorsInitialized = true; // Set flag after successful initialization

      // Initial layout update
      updateMonacoLayout();

      // Trigger initial code generation if a language is selected
      const snippetLanguageSelect = document.getElementById(
        "snippetLanguagePanel"
      );
      if (snippetLanguageSelect && snippetLanguageSelect.value) {
        window.generateCodeSnippet(); // Call global version
      }
    } catch (e) {
      console.error("Error during Monaco Editor initialization:", e);
      monacoEditorsInitialized = false; // Ensure flag is false on error
      throw e; // Re-throw to allow calling function to handle
    } finally {
      monacoInitializationPromise = null; // Clear the promise to allow future attempts
    }
  })();

  try {
    await monacoInitializationPromise;
  } catch (error) {
    console.error("Error waiting for Monaco initialization:", error);
    throw error;
  }
};

// Function to initialize code snippet functionality
window.initCodeSnippetFunctionality = function () {
  const snippetLanguageSelect = document.getElementById("snippetLanguagePanel");
  const copySnippetBtn = document.getElementById("copySnippetBtn");

  if (!window.codeSnippetGenerator) {
    console.error("Code snippet generator not initialized");
    return;
  }

  if (snippetLanguageSelect) {
    // Clear existing options
    snippetLanguageSelect.innerHTML = "";

    // Add language options
    const languages = window.codeSnippetGenerator.getSupportedLanguages();
    languages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.id;
      option.textContent = lang.name;
      snippetLanguageSelect.appendChild(option);
    });

    // Handle language change
    snippetLanguageSelect.addEventListener(
      "change",
      window.generateCodeSnippet
    ); // Call global version
  }

  // Initialize Monaco Editor only after DOM is fully loaded
  // This ensures that the DOM elements for editors exist.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initMonacoEditor); // Call global version
  } else {
    window.initMonacoEditor(); // Call global version
  }

  // Initialize copy button
  if (copySnippetBtn) {
    copySnippetBtn.addEventListener("click", () => {
      const monacoEditor = window.monacoSetup.getMonacoEditor();
      if (monacoEditor) {
        const code = monacoEditor.getValue();
        navigator.clipboard
          .writeText(code)
          .then(() => {
            // Show feedback using toast notification
            if (window.utils && typeof window.utils.showToast === "function") {
              window.utils.showToast("Copied to clipboard!", "success");
            }
          })
          .catch((err) => {
            if (window.utils && typeof window.utils.showToast === "function") {
              window.utils.showToast("Failed to copy to clipboard", "error");
            }
            console.error("Failed to copy code: ", err);
          });
      }
    });
  }
};

// Function to handle section visibility
window.handleSectionVisibility = function (sectionId) {
  const sections = document.querySelectorAll(".right-panel-section");
  sections.forEach((section) => {
    const isActiveSection = section.id === `${sectionId}-section`;
    section.classList.toggle("active", isActiveSection);

    if (isActiveSection && sectionId === "code-snippet") {
      // If editors are initialized, update layout and regenerate snippet.
      // Do NOT call initMonacoEditor() here.
      if (monacoEditorsInitialized) {
        setTimeout(() => {
          updateMonacoLayout();
          // Regenerate code snippet as context might have changed or it's the first time viewing
          const snippetLanguageSelect = document.getElementById(
            "snippetLanguagePanel"
          );
          if (snippetLanguageSelect && snippetLanguageSelect.value) {
            window.generateCodeSnippet(); // Call global version
          }
        }, 100); // Delay to ensure section is visible and CSS transitions are complete
      }
      // If editors are not yet initialized, initMonacoEditor will be called
      // by initCodeSnippetFunctionality when the DOM is ready.
      // No explicit call to initMonacoEditor is needed or desired here.
    }
  });
};

// Attach click handlers to menu icons
window.initVerticalMenu = function () {
  document.querySelectorAll(".vertical-menu-icon").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const icons = document.querySelectorAll(".vertical-menu-icon");
      icons.forEach((i) => i.classList.remove("active"));
      e.currentTarget.classList.add("active");

      const section = e.currentTarget.getAttribute("data-section");
      window.handleSectionVisibility(section); // Call global version
    });
  });
};

// Initialize vertical menu when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.initVerticalMenu);
} else {
  window.initVerticalMenu();
}


/* js/responseDetailsHandler.js */
// Response details handler

// Variable to store response timing
let requestStartTime = 0;
let requestEndTime = 0;

// Start timing a request
function startTiming() {
  requestStartTime = performance.now();
}

// End timing a request
function endTiming() {
  requestEndTime = performance.now();
  return Math.round(requestEndTime - requestStartTime);
}

// Format headers for display
function formatHeaders(headers) {
  let formatted = "";
  headers.forEach((value, name) => {
    formatted += `<div class="text-sm border-b border-gray-600 last:border-0">
            <span class="font-semibold text-gray-300">${name}:</span> 
            <span class="text-gray-400">${value}</span>
        </div>`;
  });
  return formatted;
}

// Toggle response details visibility
function toggleResponseDetails() {
  const content = document.getElementById("response-details-content");
  const arrow = document.getElementById("response-details-arrow");
  if (content && arrow) {
    content.classList.toggle("hidden");
    arrow.classList.toggle("rotate-90");
  }
}

// Update response details with new data
function updateResponseDetails(response, executionTime) {
  // Update execution time
  const timeSpan = document.getElementById("response-execution-time");
  if (timeSpan) {
    timeSpan.textContent = `${executionTime}ms`;
  }

  // Update headers in the details section
  const headersList = document.getElementById("response-headers");
  if (headersList && response.headers) {
    headersList.innerHTML = formatHeaders(response.headers);
  }
}

// Initialize response details handlers
function initResponseDetailsHandlers() {
  const button = document.getElementById("response-details-button");
  if (button) {
    button.addEventListener("click", toggleResponseDetails);
  }
}

// Export functions
window.responseDetails = {
  startTiming,
  endTiming,
  updateResponseDetails,
  initResponseDetailsHandlers,
};


/* js/executeButtonHandler.js */
// Initialize the execute request button

// Helper function to detect if a response is a file download
function isFileResponse(contentDisposition, contentType, requestPath) {
  // Check for explicit content-disposition header
  if (contentDisposition && contentDisposition.includes("attachment")) {
    return true;
  }

  // Check for file-like content types
  const fileContentTypes = [
    "application/octet-stream",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-7z-compressed",
  ];

  // Check for binary content types
  if (
    fileContentTypes.some((type) => contentType.toLowerCase().includes(type))
  ) {
    return true;
  }

  // Check for media content types
  if (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/")
  ) {
    return true;
  }

  // Check for text/plain with file-like patterns in the request path
  if (contentType.includes("text/plain")) {
    // Look for file extensions or download-related patterns in the path
    const fileExtensionPattern =
      /\.(txt|log|csv|json|xml|yaml|yml|md|sql|sh|bat|ps1)$/i;
    const downloadPattern = /(download|export|file|document|report)/i;

    if (
      fileExtensionPattern.test(requestPath) ||
      downloadPattern.test(requestPath)
    ) {
      return true;
    }
  }

  // Check for other document/text formats that might be downloadable
  if (
    contentType.includes("text/csv") ||
    (contentType.includes("application/json") &&
      requestPath.includes("export")) ||
    (contentType.includes("application/xml") && requestPath.includes("export"))
  ) {
    return true;
  }

  return false;
}

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
        const response = await fetch(fullUrl, fetchOptions); // Check if response is a file download
        const contentDisposition = response.headers.get("content-disposition");
        const contentType = response.headers.get("content-type") || "";
        debugger;
        let downloadData = null;
        let responseBodyText;

        // Enhanced file download detection
        const isFileDownload = isFileResponse(
          contentDisposition,
          contentType,
          currentPath
        );
        if (isFileDownload) {
          // Handle file download
          try {
            const blob = await response.blob();

            // Extract filename from content-disposition header or generate one
            let filename = "download";
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(
                /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
              );
              if (filenameMatch) {
                filename = filenameMatch[1].replace(/['"]/g, "");
              } else {
                // Try filename* format (RFC 5987)
                const filenameStarMatch = contentDisposition.match(
                  /filename\*=UTF-8''([^;\n]*)/
                );
                if (filenameStarMatch) {
                  filename = decodeURIComponent(filenameStarMatch[1]);
                }
              }
            } else {
              // Generate filename based on content-type and timestamp
              const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .slice(0, -5);
              if (contentType.includes("text/plain")) {
                filename = `response-${timestamp}.txt`;
              } else if (contentType.includes("application/json")) {
                filename = `response-${timestamp}.json`;
              } else if (contentType.includes("application/xml")) {
                filename = `response-${timestamp}.xml`;
              } else if (contentType.includes("text/csv")) {
                filename = `response-${timestamp}.csv`;
              } else if (contentType.includes("application/pdf")) {
                filename = `response-${timestamp}.pdf`;
              } else if (contentType.startsWith("image/")) {
                const ext = contentType.split("/")[1] || "img";
                filename = `response-${timestamp}.${ext}`;
              } else {
                // Extract extension from path or use generic
                const pathMatch = currentPath.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                const ext = pathMatch ? pathMatch[1] : "bin";
                filename = `response-${timestamp}.${ext}`;
              }
            }

            downloadData = {
              blob: blob,
              filename: filename,
              size: blob.size,
              type:
                blob.type ||
                response.headers.get("content-type") ||
                "application/octet-stream",
            };

            // Trigger automatic download
            const downloadUrl = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");
            downloadLink.href = downloadUrl;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(downloadUrl);

            // Show success toast
            window.utils.showToast(
              `File "${filename}" downloaded successfully`,
              "success"
            );

            responseBodyText = `File downloaded: ${filename}`;
          } catch (blobError) {
            console.error("Error processing file download:", blobError);
            responseBodyText = "Error processing file download";
          }
        } else {
          // Handle regular response
          try {
            responseBodyText = await response.text();
          } catch (textError) {
            responseBodyText = "Unable to read response body";
          }
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
          executionTime,
          downloadData
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

// Export the function
window.initExecuteRequestButton = initExecuteRequestButton;


/* js/responseDisplayHandler.js */
// Function to display actual API response
function displayActualResponse(
  response,
  responseBodyText,
  error = false,
  executionTime = 0,
  downloadData = null
) {
  const responseContent = document.getElementById("response-content");
  const actualResponseStatusCodeDisplay = document.getElementById(
    "actual-response-status-code-display"
  );
  const tabsContainer = document.getElementById("try-it-out-tabs");
  const responseBodyContainer = document.getElementById("actualResponseSample");
  const timeSpan = document.getElementById("response-execution-time");
  const headersList = document.getElementById("response-headers");

  // Show both tabs after response is received
  if (tabsContainer) {
    tabsContainer.classList.remove("hidden");
    tabsContainer.classList.add("visible", "response-available");
  }

  // Show the response content
  if (responseContent) {
    responseContent.classList.remove("hidden");
  }

  // Get proper status text
  const statusText = window.utils.getStatusText(response.status);

  // Update status code display and button style
  if (actualResponseStatusCodeDisplay) {
    actualResponseStatusCodeDisplay.textContent = `${response.status} ${statusText}`;
  } // Update button style and reattach click handler
  const responseDetailsBtn = document.getElementById("response-details-button");
  if (responseDetailsBtn) {
    // Determine color based on status code (same logic as response headers)
    const statusStr = String(response.status);
    const responseColor = statusStr.startsWith("2")
      ? "green"
      : statusStr.startsWith("3")
      ? "yellow"
      : "red";

    // Check if there are any response headers
    const hasHeaders = response.headers && response.headers.keys().next().value;

    // Only show arrow if there are headers
    const arrowHtml = hasHeaders
      ? `<svg id="response-details-arrow" class="h-5 w-5 mr-2 transform transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
      </svg>`
      : "";

    const buttonHtml = `${arrowHtml}<div class="flex items-center justify-between w-full">
        <span id="actual-response-status-code-display" class="text-sm font-medium">${response.status} ${statusText}</span>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span id="response-execution-time" class="text-sm">${executionTime}ms</span>
        </div>
      </div>
    `;
    responseDetailsBtn.innerHTML = buttonHtml;
    responseDetailsBtn.className = `flex items-center w-full bg-${responseColor}-100 text-${responseColor}-800 py-2 px-3 rounded-md response-details-button`;

    // Remove old listeners and add new one
    const newResponseDetailsBtn = responseDetailsBtn.cloneNode(true);
    responseDetailsBtn.parentNode.replaceChild(
      newResponseDetailsBtn,
      responseDetailsBtn
    );

    // Only add click handler if there are headers
    if (hasHeaders) {
      newResponseDetailsBtn.addEventListener("click", () => {
        const content = document.getElementById("response-details-content");
        const arrow = document.getElementById("response-details-arrow");
        if (content && arrow) {
          content.classList.toggle("hidden");
          arrow.classList.toggle("rotate-90");
        }
      });
    }
  }

  // Update execution time
  if (timeSpan) {
    timeSpan.textContent = `${executionTime}ms`;
  }

  // Update response headers
  if (headersList && response.headers) {
    let formattedHeaders = "";
    response.headers.forEach((value, name) => {
      formattedHeaders += `<div class="border-b border-gray-600 last:border-0">
        <span class="font-semibold text-gray-300">${name}:</span> 
        <span class="text-gray-400">${value}</span>
      </div>`;
    });
    headersList.innerHTML = formattedHeaders;
  } // Process response body
  let displayValue = responseBodyText || "";
  let language = "text";

  // Hide/show copy button based on whether it's a file download
  const copyActualResponseBtn = document.getElementById(
    "copyActualResponseBtn"
  );
  if (copyActualResponseBtn) {
    if (downloadData) {
      copyActualResponseBtn.style.display = "none";
    } else {
      copyActualResponseBtn.style.display = "flex";
    }
  }
  if (downloadData) {
    // Handle file download display
    if (responseBodyContainer) {
      // Hide Monaco editor container
      responseBodyContainer.style.display = "none";
      responseBodyContainer.classList.add("hidden");

      // Check if download container already exists
      let downloadContainer = document.getElementById(
        "download-response-container"
      );
      if (!downloadContainer) {
        // Create download interface container
        downloadContainer = document.createElement("div");
        downloadContainer.id = "download-response-container";
        downloadContainer.className =
          "flex flex-col items-center justify-center h-full p-8 bg-gray-800 border border-gray-600 rounded-md";

        // Insert after the response body container
        responseBodyContainer.parentNode.insertBefore(
          downloadContainer,
          responseBodyContainer.nextSibling
        );
      }

      downloadContainer.innerHTML = `
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-lg font-medium text-white mb-2">File Downloaded Successfully</h3>
          <p class="text-gray-300 mb-4">
            <span class="font-medium">${downloadData.filename}</span>
            <br>            <span class="text-sm text-gray-400">${window.formatFileSize(
              downloadData.size
            )} • ${downloadData.type || "Unknown type"}</span>
          </p>
          <button id="re-download-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center w-full">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download Again
          </button>
        </div>
      `;

      // Show download container
      downloadContainer.style.display = "block";
      downloadContainer.classList.remove("hidden");

      // Add click handler for re-download
      const reDownloadBtn = document.getElementById("re-download-btn");
      if (reDownloadBtn) {
        reDownloadBtn.addEventListener("click", () => {
          const downloadUrl = window.URL.createObjectURL(downloadData.blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = downloadUrl;
          downloadLink.download = downloadData.filename;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadUrl);

          window.utils.showToast("File downloaded successfully", "success");
        });
      }
    }

    // Switch to response tab
    switchTab("response");
    return;
  } else {
    // Hide download container if it exists (for regular responses)
    const downloadContainer = document.getElementById(
      "download-response-container"
    );
    if (downloadContainer) {
      downloadContainer.style.display = "none";
      downloadContainer.classList.add("hidden");
    }

    // Ensure response body container is visible for regular responses
    if (responseBodyContainer) {
      responseBodyContainer.style.display = "block";
      responseBodyContainer.classList.remove("hidden");
    }
  }

  const contentTypeHeader =
    response.headers?.get("Content-Type") || "application/octet-stream";
  if (
    contentTypeHeader.includes("application/json") ||
    contentTypeHeader.includes("application/problem+json")
  ) {
    try {
      const jsonBody = JSON.parse(responseBodyText);
      displayValue = JSON.stringify(jsonBody, null, 2);
      language = "json";
    } catch (e) {
      console.warn("Failed to parse JSON response", e);
    }
  }

  // Create or update the response editor
  try {
    if (!window.responseBodyEditor) {
      // Create new editor if it doesn't exist
      window.monacoSetup
        .createMonacoEditor("actualResponseSample", {
          language,
          value: displayValue,
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: "off",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        })
        .then((editor) => {
          window.responseBodyEditor = editor;
          setupResponseEditor(responseBodyContainer);
        });
    } else {
      const model = window.responseBodyEditor.getModel();
      monaco.editor.setModelLanguage(model, language);
      window.responseBodyEditor.setValue(displayValue);
      setupResponseEditor(responseBodyContainer);
    }
  } catch (err) {
    console.error("Error displaying response:", err);
    // Fallback to plain text display
    if (responseBodyContainer) {
      responseBodyContainer.innerHTML = `<pre class="text-sm text-gray-300 p-4">${displayValue}</pre>`;
    }
  }

  // Switch to response tab
  switchTab("response");
}

// Helper function to setup response editor container
function setupResponseEditor(container) {
  if (!container) return;

  container.style.display = "block";
  container.classList.remove("hidden");

  // Give the editor time to layout properly
  setTimeout(() => {
    if (window.responseBodyEditor) {
      window.responseBodyEditor.layout();
    }
  }, 100);
}

// Make functions available globally
window.displayActualResponse = displayActualResponse;
window.setupResponseEditor = setupResponseEditor;


/* js/eventHandlers.js */
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


/* js/collectionRunner.js */
// Collection Runner module
// Provides functionality similar to Postman's Collection Runner

// Define a global CollectionRunner class
window.CollectionRunner = class CollectionRunner {
  constructor() {
    this.collection = [];
    this.currentIndex = 0;
    this.isRunning = false;
    this.delay = 0;
    this.results = [];
    this.apiTitle = null; // Store API title
    this.apiVersion = null; // Store API version
  }
  /**
   * Helper function to convert string to snake_case
   * @param {string} str - String to convert
   * @returns {string} - Snake case string
   */
  toSnakeCase(str) {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9.]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  /**
   * Get storage key with API title and version prefix
   * @param {string} key - Key to prefix
   * @returns {string} - Prefixed key
   */
  getStorageKey(key) {
    if (!this.apiTitle || !this.apiVersion) {
      console.warn("API title or version not set, using default storage key");
      return key;
    }
    return `${this.toSnakeCase(this.apiTitle)}_${this.toSnakeCase(
      this.apiVersion
    )}_${key}`;
  }

  /**
   * Add a request to the collection
   * @param {Object} request - The request object to add
   * @param {string} request.name - Request name
   * @param {string} request.path - API path
   * @param {string} request.method - HTTP method
   * @param {Object} request.headers - Request headers
   * @param {string} request.body - Request body
   * @param {Object} request.pathParams - Path parameters
   * @param {Object} request.queryParams - Query parameters
   */
  addRequest(request) {
    this.collection.push({
      ...request,
      id: Date.now() + Math.random().toString(36).substr(2, 5), // Generate unique ID
      enabled: true,
    });
  }

  /**
   * Remove a request from the collection
   * @param {string} id - Request ID
   */
  removeRequest(id) {
    this.collection = this.collection.filter((request) => request.id !== id);
  }

  /**
   * Toggle whether a request should be run
   * @param {string} id - Request ID
   * @param {boolean} enabled - Whether the request should run
   */
  toggleRequest(id, enabled) {
    const request = this.collection.find((request) => request.id === id);
    if (request) {
      request.enabled = enabled;
    }
  }

  /**
   * Set delay between requests in milliseconds
   * @param {number} delay - Delay in milliseconds
   */
  setDelay(delay) {
    this.delay = delay;
  }

  /**
   * Run all enabled requests in the collection
   * @returns {Promise<Array>} - Results of all requests
   */
  async runCollection() {
    if (this.isRunning) {
      throw new Error("Collection is already running");
    }

    try {
      this.isRunning = true;
      this.results = [];
      this.currentIndex = 0;

      // Filter only enabled requests
      const requests = this.collection.filter((request) => request.enabled);

      // Run each request sequentially
      for (const request of requests) {
        // Add actual execution logic here
        const result = await this.executeRequest(request);
        this.results.push(result);

        // Notify listeners about progress
        this.onProgress(this.currentIndex + 1, requests.length, result);

        this.currentIndex++;

        // Wait for delay unless it's the last request
        if (this.delay > 0 && this.currentIndex < requests.length) {
          await new Promise((resolve) => setTimeout(resolve, this.delay));
        }
      }

      // Notify about completion
      this.onComplete(this.results);

      return this.results;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Execute a single request
   * @param {Object} request - Request to execute
   * @returns {Object} - Result of the request
   */ async executeRequest(request) {
    const startTime = performance.now();
    let responseData = null;
    let error = null;

    try {
      // Apply variable replacement to request fields
      const processedRequest = this.applyVariableReplacement(request);

      // Make sure the path is properly formatted
      let currentPath = processedRequest.path; // If we're using a relative path, we need to prefix with base URL
      if (!currentPath.startsWith("http")) {
        // Get the base URL using the utility function from utils.js
        const baseUrl = typeof getBaseUrl === "function" ? getBaseUrl() : "";

        // Add leading slash if needed
        if (!currentPath.startsWith("/")) {
          currentPath = "/" + currentPath;
        }

        // Combine base URL with path
        currentPath = baseUrl.replace(/\/$/, "") + currentPath;
      } // Process path parameters
      if (processedRequest.pathParams) {
        Object.entries(processedRequest.pathParams).forEach(([name, value]) => {
          const paramPattern = new RegExp(`\\{${name}\\}`, "g");
          currentPath = currentPath.replace(paramPattern, value);
        });
      }

      // Process query parameters
      const queryParams = new URLSearchParams();
      if (processedRequest.queryParams) {
        Object.entries(processedRequest.queryParams).forEach(
          ([name, value]) => {
            queryParams.append(name, value);
          }
        );
      }

      // Add query string to URL if needed
      const queryString = queryParams.toString();
      if (queryString && !currentPath.includes("?")) {
        currentPath += `?${queryString}`;
      } // Initialize headers as Headers object
      const headers = new Headers();
      // Add any headers from the request
      if (processedRequest.headers) {
        Object.entries(processedRequest.headers).forEach(([name, value]) => {
          headers.append(name, value);
        });
      } // Prepare fetch options
      let fetchOptions = {
        method: processedRequest.method,
        headers: headers,
      };

      // Add body if needed for POST, PUT, PATCH methods
      if (
        ["POST", "PUT", "PATCH"].includes(
          processedRequest.method.toUpperCase()
        ) &&
        processedRequest.body
      ) {
        // Check if this is a multipart/form-data request
        const isMultipartRequest =
          processedRequest.headers &&
          Object.entries(processedRequest.headers).some(
            ([key, value]) =>
              key.toLowerCase() === "content-type" &&
              value === "multipart/form-data"
          );

        if (isMultipartRequest) {
          // Handle multipart/form-data requests
          try {
            const multipartData = JSON.parse(processedRequest.body);
            const formData = new FormData();

            // Convert the stored multipart data back to FormData
            Object.entries(multipartData).forEach(([fieldName, fieldData]) => {
              if (fieldData.type === "file") {
                // For files, we can't recreate the original file from stored metadata
                // This is a limitation of the collection runner - files need to be re-selected
                console.warn(
                  `File field '${fieldName}' cannot be sent - files must be re-selected for collection execution`
                );
              } else if (fieldData.type === "text" && fieldData.value) {
                // Add text fields to FormData
                formData.append(fieldName, fieldData.value);
              }
            });

            fetchOptions.body = formData;

            // Remove Content-Type header for multipart - browser will set it with boundary
            headers.delete("content-type");
            headers.delete("Content-Type");
          } catch (e) {
            console.error(
              "Failed to parse multipart body for collection execution:",
              e
            );
            // Fallback to original body
            fetchOptions.body = processedRequest.body;
          }
        } else {
          // Handle other content types normally
          fetchOptions.body = processedRequest.body;
        }
      }

      // Get operation security requirements
      let operationSecurity = null;
      if (
        window.swaggerData &&
        window.swaggerData.paths &&
        window.swaggerData.paths[processedRequest.path] &&
        window.swaggerData.paths[processedRequest.path][
          processedRequest.method.toLowerCase()
        ]
      ) {
        const operation =
          window.swaggerData.paths[processedRequest.path][
            processedRequest.method.toLowerCase()
          ];
        operationSecurity =
          operation.security !== undefined
            ? operation.security
            : window.swaggerData.security;
      }

      // Add authorization header if available
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

      // Execute the request
      const response = await fetch(currentPath, fetchOptions);

      // Process response
      let responseBody;
      // First get the text
      const responseText = await response.text();

      // Try to parse as JSON if possible
      try {
        responseBody = JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, use as text
        responseBody = responseText;
      }

      responseData = {
        status: response.status,
        statusText: getStatusText(response.status),
        headers: Object.fromEntries([...response.headers.entries()]),
        body: responseBody,
      };
    } catch (err) {
      console.error("Request execution failed:", err);
      error = err.message;
      responseData = {
        status: "Error",
        statusText: error,
        headers: {},
        body: error,
      };
    }
    const endTime = performance.now();

    const result = {
      request,
      response: responseData,
      error,
      duration: endTime - startTime,
      timestamp: new Date().toISOString(),
    };

    // Extract output parameters if request was successful and has output parameters defined
    this.extractOutputParameters(request, result);

    return result;
  }

  /**
   * Apply variable replacement to request fields
   * @param {Object} request - Request to process
   * @returns {Object} - Processed request with variables replaced
   */
  applyVariableReplacement(request) {
    if (!window.replaceVariables) {
      return request; // No variable replacement function available
    }

    const processedRequest = { ...request };

    // Replace variables in path
    if (processedRequest.path) {
      processedRequest.path = window.replaceVariables(processedRequest.path);
    }

    // Replace variables in path parameters
    if (processedRequest.pathParams) {
      const processedPathParams = {};
      Object.entries(processedRequest.pathParams).forEach(([key, value]) => {
        processedPathParams[key] = window.replaceVariables(String(value));
      });
      processedRequest.pathParams = processedPathParams;
    }

    // Replace variables in query parameters
    if (processedRequest.queryParams) {
      const processedQueryParams = {};
      Object.entries(processedRequest.queryParams).forEach(([key, value]) => {
        processedQueryParams[key] = window.replaceVariables(String(value));
      });
      processedRequest.queryParams = processedQueryParams;
    }

    // Replace variables in headers
    if (processedRequest.headers) {
      const processedHeaders = {};
      Object.entries(processedRequest.headers).forEach(([key, value]) => {
        processedHeaders[key] = window.replaceVariables(String(value));
      });
      processedRequest.headers = processedHeaders;
    }

    // Replace variables in body
    if (processedRequest.body) {
      processedRequest.body = window.replaceVariables(processedRequest.body);
    }

    return processedRequest;
  }

  /**
   * Extract output parameters from response and store as variables
   * @param {Object} request - Original request object
   * @param {Object} result - Request execution result
   */
  extractOutputParameters(request, result) {
    // Only extract if request was successful and has output parameters
    if (
      !request.outputParameters ||
      !result.response ||
      result.error ||
      result.response.status < 200 ||
      result.response.status >= 300
    ) {
      return;
    }

    try {
      const responseBody = result.response.body;

      // Skip if response body is not an object (can't apply JSONPath)
      if (!responseBody || typeof responseBody !== "object") {
        return;
      }

      request.outputParameters.forEach((param) => {
        try {
          const value = this.evaluateJsonPath(responseBody, param.jsonPath);
          if (value !== undefined) {
            // Store the extracted value as an output variable
            if (window.variablesStore && window.variablesStore.setOutput) {
              window.variablesStore.setOutput(param.name, String(value));
              console.log(
                `Extracted output variable: ${param.name} = ${value}`
              );
            }
          }
        } catch (error) {
          console.warn(
            `Failed to extract output parameter ${param.name} with path ${param.jsonPath}:`,
            error
          );
        }
      });
    } catch (error) {
      console.warn("Error extracting output parameters:", error);
    }
  }

  /**
   * Simple JSONPath evaluator for basic path expressions
   * @param {Object} obj - Object to evaluate path against
   * @param {string} path - JSONPath expression
   * @returns {*} - Extracted value or undefined
   */
  evaluateJsonPath(obj, path) {
    if (!path || !path.startsWith("$.")) {
      throw new Error("JSONPath must start with $.");
    }

    // Remove the leading $. and split by dots
    const parts = path.substring(2).split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array indices like [0] or [1]
      const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, propName, index] = arrayMatch;
        if (propName) {
          current = current[propName];
        }
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        } else {
          return undefined;
        }
      } else {
        // Handle simple property access
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Event handler for progress updates
   * @param {number} current - Current request index
   * @param {number} total - Total requests count
   * @param {Object} result - Result of the current request
   */
  onProgress(current, total, result) {
    // Default implementation does nothing
    // Will be overridden by UI code
  }

  /**
   * Event handler for collection run completion
   * @param {Array} results - All results
   */
  onComplete(results) {
    // Default implementation does nothing
    // Will be overridden by UI code
  }

  /**
   * Save the current collection to localStorage
   * @param {string} name - Collection name
   */
  saveCollection(name) {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    collections[name] = {
      requests: this.collection,
      delay: this.delay,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(collections));
  }

  /**
   * Load a saved collection from localStorage
   * @param {string} name - Collection name
   * @returns {boolean} - Success status
   */
  loadCollection(name) {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    if (collections[name]) {
      this.collection = collections[name].requests || [];
      this.delay = collections[name].delay || 0;
      return true;
    }

    return false;
  }

  /**
   * Get list of all saved collections
   * @returns {Array} - Collection names and metadata
   */
  getSavedCollections() {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    return Object.entries(collections).map(([name, data]) => ({
      name,
      requestCount: data.requests?.length || 0,
      updatedAt: data.updatedAt,
    }));
  }

  /**
   * Delete a saved collection from storage
   * @param {string} name - Collection name to delete
   * @returns {boolean} - Success status
   */
  deleteCollection(name) {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    if (collections[name]) {
      delete collections[name];
      localStorage.setItem(storageKey, JSON.stringify(collections));
      return true;
    }

    return false;
  }

  /**
   * Update an existing request in the collection
   * @param {string} id - ID of the request to update
   * @param {Object} updatedRequest - The updated request object
   * @returns {boolean} - Whether the update was successful
   */
  updateRequest(id, updatedRequest) {
    const index = this.collection.findIndex((request) => request.id === id);

    if (index === -1) {
      console.error(`Request with ID ${id} not found in collection`);
      return false;
    }

    // Preserve enabled state from the original request
    const enabled = this.collection[index].enabled;

    // Update the request, maintaining the ID and enabled state
    this.collection[index] = {
      ...updatedRequest,
      id,
      enabled,
    };

    return true;
  }

  /**
   * Reorder requests in the collection
   * @param {number} oldIndex - Original position index
   * @param {number} newIndex - New position index
   */
  reorderRequests(oldIndex, newIndex) {
    if (
      oldIndex < 0 ||
      oldIndex >= this.collection.length ||
      newIndex < 0 ||
      newIndex > this.collection.length || // Allow newIndex to equal collection length (insert at end)
      oldIndex === newIndex
    ) {
      return false;
    }

    // Remove the item from its original position
    const item = this.collection.splice(oldIndex, 1)[0];

    // Insert it at the new position
    this.collection.splice(newIndex, 0, item);

    return true;
  }
};

// Create a singleton instance
window.collectionRunner =
  window.collectionRunner || new window.CollectionRunner();


/* js/collectionRunnerUI.js */
// Collection Runner UI Implementation for the right panel  // Define a global CollectionRunnerUI class
window.CollectionRunnerUI = class CollectionRunnerUI {
  constructor() {
    this.collectionRunner = window.collectionRunner;

    if (!this.collectionRunner) {
      console.error(
        "Collection Runner not initialized. Creating a new instance."
      );
      window.collectionRunner = new window.CollectionRunner();
      this.collectionRunner = window.collectionRunner;
    }

    this.currentCollectionName = null; // Track currently loaded collection name
    this.currentRequestId = null; // Track the ID of the request being viewed from collection results
    this.isViewingFromCollection = false; // Track if we're viewing from collection

    // Defer binding events to ensure DOM is fully loaded
    setTimeout(() => {
      this.setupEventHandlers();
      this.loadUIElements();
      this.bindEvents();
      this.refreshRequestList();
      this.refreshSavedCollectionsList();
    }, 300);
  }

  /**
   * Load UI elements for the Collection Runner integrated in the right panel
   */
  loadUIElements() {
    // Load the save modal (still needed for saving collections)
    this.loadSaveModal();

    // Create a toast container if it doesn't exist
    if (!document.getElementById("toast-container")) {
      const toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }
  }

  /**
   * Load the save collection modal
   */ loadSaveModal() {
    // Check if the modal already exists
    if (document.getElementById("save-collection-modal")) {
      return;
    }

    const modalHtml = `
      <div id="save-collection-modal" class="collection-modal-overlay">
        <div class="collection-modal bg-gray-800 text-white border border-gray-700 shadow-lg">
          <div class="collection-modal-header border-b border-gray-700">
            <h3 class="collection-modal-title">Save Collection</h3>
            <span class="collection-modal-close text-gray-400 hover:text-gray-200" id="close-save-modal">×</span>
          </div>
          <div class="collection-modal-body">
            <div class="form-group">
              <label for="collection-name" class="form-label text-gray-300 block mb-2 text-sm">Collection Name</label>
              <input type="text" id="collection-name" class="form-input w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter a name for your collection">
            </div>
          </div>          <div class="collection-modal-footer border-t border-gray-700 pt-3">
            <button id="cancel-save-modal" class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
              Cancel
            </button>
            <button id="confirm-save-collection" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }
  /**
   * Bind events for the Collection Runner UI
   */
  bindEvents() {
    // Section activation events are handled by the main app

    // Create default action buttons when page loads
    setTimeout(() => {
      // Only create the button if we\'re not viewing from collection
      if (!this.currentRequestId) {
        this.setupTryItOutActionButtons(false);
      }
    }, 500);

    // Tab switching within Collection Runner section
    document.querySelectorAll(".collection-tab[data-tab]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchCollectionTab(e.currentTarget.dataset.tab);
      });
    }); // Collection actions
    const addCurrentButton = document.getElementById(
      "add-current-to-collection"
    );
    if (addCurrentButton) {
      addCurrentButton.innerHTML = `
        <svg data-slot="icon" fill="none" class="h-5 w-5 mr-1" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"></path>
        </svg> Add
      `;
      addCurrentButton.className =
        "px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors flex items-center justify-center";
      addCurrentButton.addEventListener("click", () =>
        this.addCurrentRequestToCollection()
      );
      // Add tooltip functionality
      addCurrentButton.addEventListener("mouseenter", handleTooltipMouseEnter);
      addCurrentButton.addEventListener("mouseleave", handleTooltipMouseLeave);
    }
    document
      .getElementById("delay-input")
      ?.addEventListener("change", (e) =>
        this.collectionRunner.setDelay(parseInt(e.target.value, 10))
      );
    document
      .getElementById("clear-collection-btn")
      ?.addEventListener("click", () => this.clearCollection());
    document
      .getElementById("run-collection-btn")
      ?.addEventListener("click", () => this.runCollection());
    document
      .getElementById("save-as-new-collection-btn")
      ?.addEventListener("click", () => this.openSaveModal(true));
    document
      .getElementById("save-collection-btn")
      ?.addEventListener("click", () => this.saveCurrentCollection());

    // Modal actions
    document
      .getElementById("close-save-modal")
      ?.addEventListener("click", () => this.closeSaveModal());
    document
      .getElementById("cancel-save-modal")
      ?.addEventListener("click", () => this.closeSaveModal());
    document
      .getElementById("confirm-save-collection")
      ?.addEventListener("click", () => this.saveCollection());
  }

  /**
   * Setup event handlers for the collection runner
   */
  setupEventHandlers() {
    // Override the default progress handler
    this.collectionRunner.onProgress = (current, total, result) => {
      // Update progress bar
      const progressBar = document.getElementById("collection-progress");
      if (progressBar) {
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
      }

      // Update progress text
      const progressInfo = document.getElementById("progress-info");
      if (progressInfo) {
        progressInfo.textContent = `Processed ${current} of ${total} requests`;
      }

      // Add result to results tab
      this.addResultItem(result);
    };

    // Override the default complete handler
    this.collectionRunner.onComplete = (results) => {
      // Update progress info
      const progressInfo = document.getElementById("progress-info");
      if (progressInfo) {
        const successCount = results.filter(
          (r) => r.response.status >= 200 && r.response.status < 300
        ).length;
        progressInfo.innerHTML = `
          <span class="font-medium">Complete:</span> ${
            results.length
          } requests processed, 
          <span class="text-green-500">${successCount} successful</span>, 
          <span class="text-red-500">${
            results.length - successCount
          } failed</span>
        `;
      }

      // Auto-switch to results tab
      this.switchTab("results-tab");
    };
  }
  switchCollectionTab(tabId) {
    // Save the active tab to localStorage
    this.saveActiveTab(tabId);

    // Store the currently active tab for transition
    const currentActiveContent = document.querySelector(
      ".collection-tab-content:not(.hidden)"
    );
    const selectedTab = document.getElementById(tabId);

    if (
      currentActiveContent &&
      selectedTab &&
      currentActiveContent !== selectedTab
    ) {
      // Apply fade-out animation to current tab
      currentActiveContent.style.opacity = "0";
      currentActiveContent.style.transition = "opacity 0.3s ease";

      // After fade-out completes, switch tabs
      setTimeout(() => {
        // Hide all collection tab contents
        document.querySelectorAll(".collection-tab-content").forEach((tab) => {
          tab.classList.add("hidden");
          tab.style.opacity = "0";
        });

        // Show the selected tab with fade-in
        if (selectedTab) {
          selectedTab.classList.remove("hidden");
          // Trigger reflow
          void selectedTab.offsetWidth;
          // Apply fade-in
          selectedTab.style.transition = "opacity 0.3s ease";
          selectedTab.style.opacity = "1";
        } else {
          console.warn("Tab content not found:", tabId);
        }
      }, 300);
    } else {
      // No current active tab or same tab clicked, just show the tab immediately
      document.querySelectorAll(".collection-tab-content").forEach((tab) => {
        tab.classList.add("hidden");
      });

      if (selectedTab) {
        selectedTab.classList.remove("hidden");
        selectedTab.style.opacity = "1";
      }
    }

    // Update tab buttons with animation
    document.querySelectorAll(".collection-tab[data-tab]").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.tab === tabId) {
        btn.classList.add("active");
      }
    });
  }

  /**
   * Backward compatibility for code that might still use switchTab()
   * @param {string} tabId - ID of the tab to activate
   */
  switchTab(tabId) {
    this.switchCollectionTab(tabId);
  }

  /**
   * Refresh the request list in the UI
   */ refreshRequestList() {
    const requestsContainer = document.getElementById("collection-requests");
    const requestCount = document.getElementById("request-count");

    if (!requestsContainer || !requestCount) return;

    // Update count
    requestCount.textContent = `${this.collectionRunner.collection.length} requests`;

    // Clear container
    requestsContainer.innerHTML = "";

    // Check for empty collection
    if (this.collectionRunner.collection.length === 0) {
      requestsContainer.innerHTML = `
        <div class="text-gray-500 text-center py-8 empty-collection-message">
          No requests in collection yet
        </div>
      `;
      return;
    }

    // Create a container for the items that will handle the dragging class
    const listContainer = document.createElement("div");
    listContainer.className = "collection-list-container";
    requestsContainer.appendChild(listContainer);

    // Add an initial drop zone at the top of the list
    this.createDropZone(listContainer, 0);

    // Add each request
    this.collectionRunner.collection.forEach((request, index) => {
      const requestItem = document.createElement("div");
      requestItem.className = "request-item";
      requestItem.dataset.id = request.id;
      requestItem.dataset.index = index.toString();
      requestItem.draggable = true;

      const methodClass = `method-${request.method.toLowerCase()}`;

      requestItem.innerHTML = `
        <div class="request-item-header">
          <div class="flex items-center">
            <span class="request-handle" title="Drag to reorder">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
              </svg>
            </span>
            <span class="request-item-method ${methodClass}">${
        request.method
      }</span>            <div>
              <div class="font-medium">${
                request.summary || request.name || "Unnamed Request"
              }</div>
              <div class="request-item-path">${request.path}</div>
            </div>
          </div>          <div class="request-actions">
            <input type="checkbox" class="toggle-request" ${
              request.enabled ? "checked" : ""
            }>            <button class="edit-request p-0.5 text-gray-500 hover:text-blue-500" data-tooltip="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="output-params-request p-0.5 text-gray-500 hover:text-green-500" data-tooltip="Output Parameters">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
              </svg>
            </button>            <button class="remove-request p-0.5 text-gray-500 hover:text-red-500" data-tooltip="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      `; // Add event listeners for this item
      requestItem
        .querySelector(".toggle-request")
        .addEventListener("change", (e) => {
          this.collectionRunner.toggleRequest(request.id, e.target.checked);
        });
      const editRequestButton = requestItem.querySelector(".edit-request");
      editRequestButton.addEventListener("click", () => {
        // First switch to the Try-it-out section (indicate this is from collection view)
        this.showTryItOutSection(true);

        // Make sure both tabs are available (show the tab UI)
        const tabsContainer = document.getElementById("try-it-out-tabs");
        if (tabsContainer) {
          tabsContainer.classList.remove("hidden");
          tabsContainer.classList.add("visible", "response-available");
        }

        // Show the request content too (so both tabs have content)
        const requestContent = document.getElementById("request-content");
        if (requestContent) {
          requestContent.classList.remove("hidden");
        }

        // Get the request details
        const requestDetails = this.collectionRunner.collection.find(
          (req) => req.id === request.id
        );

        // Set up the Save button since we're viewing from collection
        this.setupTryItOutActionButtons(true, request.id);

        // Setup the request details based on the saved request
        this.setupRequestDetails(requestDetails);
      });

      // Add tooltip functionality to edit button
      if (window.handleTooltipMouseEnter && window.handleTooltipMouseLeave) {
        editRequestButton.addEventListener(
          "mouseenter",
          window.handleTooltipMouseEnter
        );
        editRequestButton.addEventListener(
          "mouseleave",
          window.handleTooltipMouseLeave
        );
      }
      const removeRequestButton = requestItem.querySelector(".remove-request");
      removeRequestButton.addEventListener("click", () => {
        this.collectionRunner.removeRequest(request.id);
        this.refreshRequestList();
      });

      // Add tooltip functionality to delete button
      if (window.handleTooltipMouseEnter && window.handleTooltipMouseLeave) {
        removeRequestButton.addEventListener(
          "mouseenter",
          window.handleTooltipMouseEnter
        );
        removeRequestButton.addEventListener(
          "mouseleave",
          window.handleTooltipMouseLeave
        );
      }

      // Add output parameters button event listener
      const outputParamsButton = requestItem.querySelector(
        ".output-params-request"
      );
      outputParamsButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showOutputParametersPopup(request.id);
      });

      // Add tooltip functionality to output parameters button
      if (window.handleTooltipMouseEnter && window.handleTooltipMouseLeave) {
        outputParamsButton.addEventListener(
          "mouseenter",
          window.handleTooltipMouseEnter
        );
        outputParamsButton.addEventListener(
          "mouseleave",
          window.handleTooltipMouseLeave
        );
      }

      // Add drag and drop functionality
      requestItem.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
        requestItem.classList.add("dragging");

        // Add a class to the container to show all drop zones
        listContainer.classList.add("dragging");

        // Small delay to make the drag image look better
        setTimeout(() => {
          requestItem.style.opacity = "0.4";
        }, 0);
      });

      requestItem.addEventListener("dragend", () => {
        requestItem.classList.remove("dragging");
        requestItem.style.opacity = "1";

        // Remove the dragging class from the container
        listContainer.classList.remove("dragging");

        // Remove drag-over class from all items and drop zones
        document
          .querySelectorAll(".request-item, .request-item-drop-zone")
          .forEach((item) => {
            item.classList.remove("drag-over");
          });
      });

      requestItem.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        return false;
      });

      requestItem.addEventListener("dragenter", (e) => {
        e.preventDefault();
        requestItem.classList.add("drag-over");
      });

      requestItem.addEventListener("dragleave", () => {
        requestItem.classList.remove("drag-over");
      });

      requestItem.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const oldIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        const newIndex = index;

        // Reorder in collection
        if (oldIndex !== newIndex) {
          this.collectionRunner.reorderRequests(oldIndex, newIndex);

          // Refresh the UI to reflect the new order
          this.refreshRequestList();

          // If we have a current collection name, auto-save the change
          if (this.currentCollectionName) {
            this.collectionRunner.saveCollection(this.currentCollectionName);
            this.showToast(`Collection order updated`, "success");
          }
        }

        return false;
      });

      listContainer.appendChild(requestItem);

      // Add a drop zone after each request
      this.createDropZone(listContainer, index + 1);
    });
  }

  /**
   * Create a drop zone element to allow dropping between items
   * @param {HTMLElement} container - Container to add the drop zone to
   * @param {number} index - Index position for the drop zone
   */
  createDropZone(container, index) {
    const dropZone = document.createElement("div");
    dropZone.className = "request-item-drop-zone";
    dropZone.dataset.index = index.toString();

    // Add event listeners for drop zone
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    dropZone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const oldIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      const newIndex = parseInt(dropZone.dataset.index, 10);

      // Adjust the index if dropping after the dragged item's position
      let adjustedNewIndex = newIndex;
      if (oldIndex < newIndex) {
        adjustedNewIndex--;
      }

      // Only reorder if the position changed
      if (oldIndex !== adjustedNewIndex) {
        this.collectionRunner.reorderRequests(oldIndex, adjustedNewIndex);

        // Refresh the UI to reflect the new order
        this.refreshRequestList();

        // If we have a current collection name, auto-save the change
        if (this.currentCollectionName) {
          this.collectionRunner.saveCollection(this.currentCollectionName);
          this.showToast(`Collection order updated`, "success");
        }
      }
    });

    container.appendChild(dropZone);
  }
  /**
   * Refresh the list of saved collections
   */
  refreshSavedCollectionsList() {
    const savedContainer = document.getElementById("saved-collections");
    if (!savedContainer) return;

    // Clear container
    savedContainer.innerHTML = "";

    // Get saved collections
    const collections = this.collectionRunner.getSavedCollections();

    // Check for empty list
    if (collections.length === 0) {
      savedContainer.innerHTML = `
        <div class="text-gray-500 text-center py-8 empty-collections-message">
          No saved collections found
        </div>
      `;
      return;
    }

    // Create collection list container
    const listContainer = document.createElement("div");
    listContainer.className = "collection-list-container";

    // Add each collection
    collections.forEach((collection) => {
      const collectionItem = document.createElement("div");
      collectionItem.className = "collection-list-item";

      const updatedDate = new Date(collection.updatedAt).toLocaleDateString();

      collectionItem.innerHTML = `
        <div>
          <div class="collection-item-name">${collection.name}</div>
          <div class="collection-item-details">
            ${collection.requestCount} requests - Last updated: ${updatedDate}
          </div>
        </div>        <div class="collection-item-actions">
          <button class="load-collection px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
            Load
          </button>
          <button class="delete-collection px-3 py-1.5 bg-red-200 hover:bg-red-300 text-gray-800 dark:bg-red-700 dark:text-gray-200 dark:hover:bg-red-600 rounded-md text-sm font-medium transition-colors">
            Delete
          </button>
        </div>
      `;

      // Add event listeners
      collectionItem
        .querySelector(".load-collection")
        .addEventListener("click", () => {
          if (this.collectionRunner.loadCollection(collection.name)) {
            this.currentCollectionName = collection.name;
            this.refreshRequestList();
            this.switchTab("collection-tab");
            // Show the save button since we now have a current collection
            const saveBtn = document.getElementById("save-collection-btn");
            if (saveBtn) {
              saveBtn.style.display = "block";
            }
            this.showToast("Collection loaded successfully");
          }
        }); // Add delete functionality here
      collectionItem
        .querySelector(".delete-collection")
        .addEventListener("click", async () => {
          // Use the enhanced toast with confirmation buttons
          const confirmed = await window.utils.showToast(
            `Delete collection "${collection.name}"?`,
            "confirm"
          );

          if (confirmed) {
            if (this.collectionRunner.deleteCollection(collection.name)) {
              // If we just deleted the current collection, update state
              if (collection.name === this.currentCollectionName) {
                this.currentCollectionName = null;
                const saveBtn = document.getElementById("save-collection-btn");
                if (saveBtn) {
                  saveBtn.style.display = "none";
                }
              }
              this.refreshSavedCollectionsList();
              this.showToast("Collection deleted successfully", "success");
            }
          }
        });

      listContainer.appendChild(collectionItem);
    });

    savedContainer.appendChild(listContainer);
  }
  /**
   * Add the current request from the UI to the collection
   */
  addCurrentRequestToCollection() {
    // Check if we have a lastExecutedRequest in memory (from executeButtonHandler.js)
    if (window.lastExecutedRequest) {
      // Use the last executed request data
      const request = window.lastExecutedRequest;

      // Try to get the summary from OpenAPI spec
      const summary = this.getEndpointSummary(request.path, request.method);
      const requestName =
        summary || `${request.method} ${request.name || "Unnamed Request"}`;

      this.collectionRunner.addRequest({
        name: requestName,
        path: request.path,
        method: request.method,
        pathParams: request.pathParams,
        queryParams: request.queryParams,
        headers: request.headers,
        body: request.body,
        summary: summary, // Store the summary separately
      });

      // Show a more descriptive success toast message
      this.showToast(
        `${request.method} endpoint added to collection: ${
          request.path.split("?")[0]
        }`,
        "success"
      );

      // Refresh the collection list
      this.refreshRequestList();
      return;
    }

    // Fallback to reading from the UI if lastExecutedRequest is not available
    const pathElement = document.querySelector("#right-panel-path");
    const methodElement = document.querySelector("#right-panel-method");
    if (!pathElement || !methodElement) {
      this.showToast("Could not determine current request details", "error");
      return;
    }

    // Get current path and method
    const path = pathElement.textContent;
    const method = methodElement.textContent.toUpperCase();

    // Get parameters
    const pathParams = {};
    const pathParametersContainer = document.getElementById(
      "right-panel-path-parameters-container"
    );
    if (pathParametersContainer) {
      pathParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            pathParams[input.name] = input.value;
          }
        });
    }

    // Get query parameters
    const queryParams = {};
    const queryParametersContainer = document.getElementById(
      "right-panel-query-parameters-container"
    );
    if (queryParametersContainer) {
      queryParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            if (input.type === "checkbox") {
              if (input.checked) {
                queryParams[input.name] = input.value;
              }
            } else {
              queryParams[input.name] = input.value;
            }
          }
        });
    }

    // Get headers
    const headers = {};
    const headersContainer = document.getElementById(
      "right-panel-headers-container"
    );
    if (headersContainer) {
      headersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            headers[input.name] = input.value;
          }
        });
    } // Get request body section status
    const requestBodySection = document.getElementById(
      "right-panel-request-body-section"
    );
    const isBodySectionVisible =
      requestBodySection && !requestBodySection.classList.contains("hidden"); // Get request body only if body section is visible
    let body = undefined;
    if (isBodySectionVisible) {
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
              formData.append(input.name, input.value);
            }
          });

          body = formData.toString();
        } // Set Content-Type for form-encoded data
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (selectedContentType === "multipart/form-data") {
        // Handle multipart/form-data - store file info for collection
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const multipartData = {};
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name) {
              if (input.type === "file") {
                // For files, store filename and type info
                if (input.files && input.files.length > 0) {
                  const file = input.files[0];
                  multipartData[input.name] = {
                    type: "file",
                    filename: file.name,
                    size: file.size,
                    mimeType: file.type,
                  };
                }
              } else if (input.value) {
                // Handle regular form fields
                multipartData[input.name] = {
                  type: "text",
                  value: input.value,
                };
              }
            }
          });

          body = JSON.stringify(multipartData);
        }
        // Set Content-Type for multipart/form-data
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // Handle JSON and other content types using Monaco editor
        if (window.requestBodyEditor) {
          body = window.requestBodyEditor.getValue();
          // If body is empty string or whitespace, set to undefined
          if (!body || body.trim() === "") {
            body = undefined;
          }
        }
        // Set Content-Type for other content types if there's a body and content type is selected
        if (body && selectedContentType) {
          headers["Content-Type"] = selectedContentType;
        }
      }
    } // Create request name from path
    const name = path.split("/").pop() || method;

    // Try to get the summary from OpenAPI spec
    const summary = this.getEndpointSummary(path, method);
    const requestName = summary || `${method} ${name}`;

    // Add to collection
    this.collectionRunner.addRequest({
      name: requestName,
      path,
      method,
      pathParams,
      queryParams,
      headers,
      body,
      summary: summary, // Store the summary separately
    });

    // Show a descriptive success toast message
    this.showToast(
      `${method} endpoint added to collection: ${path.split("?")[0]}`,
      "success"
    );

    // Refresh the list
    this.refreshRequestList();

    // Switch to collection tab
    this.switchTab("collection-tab");
  }

  /**
   * Load a saved collection
   * @param {string} name - Name of collection to load
   */
  loadCollection(name) {
    if (this.collectionRunner.loadCollection(name)) {
      this.currentCollectionName = name;
      this.refreshRequestList();
      // Show the save button when a collection is loaded
      const saveBtn = document.getElementById("save-collection-btn");
      if (saveBtn) {
        saveBtn.style.display = "block";
      }
      this.switchTab("collection-tab");
      this.showToast("Collection loaded successfully");
    }
  }
  /**
   * Clear the collection with confirmation
   */
  async clearCollection() {
    // Use the enhanced toast with confirmation buttons
    const confirmed = await window.utils.showToast(
      "Are you sure you want to clear the collection?",
      "confirm"
    );

    if (confirmed) {
      this.collectionRunner.collection = [];
      this.currentCollectionName = null; // Reset current collection name
      this.refreshRequestList();
      // Hide the save button when collection is cleared
      const saveBtn = document.getElementById("save-collection-btn");
      if (saveBtn) {
        saveBtn.style.display = "none";
      }

      // Show success message after clearing
      window.utils.showToast("Collection cleared successfully", "success");
    }
  }

  /**
   * Run the collection
   */
  async runCollection() {
    try {
      // Clear previous results
      document.getElementById("collection-results").innerHTML = "";

      // Update UI state
      document.getElementById("run-collection-btn").disabled = true;
      document.getElementById("run-collection-btn").innerHTML = `

        Running...
      `;

      // Reset progress
      document.getElementById("collection-progress").style.width = "0%";
      document.getElementById("progress-info").textContent =
        "Starting collection run...";

      // Switch to results tab
      this.switchTab("results-tab");

      // Run the collection
      await this.collectionRunner.runCollection();
    } catch (err) {
      console.error("Error running collection:", err);
      alert(`Error running collection: ${err.message}`);
    } finally {
      // Restore UI state
      document.getElementById("run-collection-btn").disabled = false;
      document.getElementById("run-collection-btn").innerHTML =
        "Run Collection";
    }
  }

  /**
   * Add a result item to the results list
   * @param {Object} result - Result object from a request
   */
  addResultItem(result) {
    const resultsContainer = document.getElementById("collection-results");
    if (!resultsContainer) return;

    const resultItem = document.createElement("div");
    resultItem.className =
      "result-item flex items-center justify-between gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700";

    // Determine success/failure
    const isSuccess =
      result.response.status >= 200 && result.response.status < 300;
    const statusClass = isSuccess ? "status-success" : "status-error";
    resultItem.innerHTML = `
      <div class="flex items-center gap-4 flex-1">
        <div class="result-status ${statusClass} flex-shrink-0">
          ${
            isSuccess
              ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>'
          }
        </div>
        <div class="result-details flex-1 min-w-0">          <div class="result-name font-medium truncate">${
          result.request.summary || result.request.name || "Unnamed Request"
        }</div>
          <div class="result-path text-gray-400 text-sm font-mono truncate">${
            result.request.method
          } ${result.request.path}</div>
        </div>
      </div>
      <button class="view-result flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
        <span>View</span>
        <span class="px-2 py-0.5 bg-gray-700 rounded text-xs flex items-center gap-1">
          <span class="font-medium">${
            isSuccess ? result.response.status : "Error"
          }</span>
          <span class="text-gray-400">${Math.round(result.duration)}ms</span>
        </span>
      </button>    `; // Add click handler to view detailed result
    resultItem.querySelector(".view-result").addEventListener("click", () => {
      // First switch to the Try-it-out section (indicate this is from collection view)
      this.showTryItOutSection(true);

      // Make sure both tabs are available (show the tab UI)
      const tabsContainer = document.getElementById("try-it-out-tabs");
      if (tabsContainer) {
        tabsContainer.classList.remove("hidden");
        tabsContainer.classList.add("visible", "response-available");
      }

      // Show the request content too (so both tabs have content)
      const requestContent = document.getElementById("request-content");
      if (requestContent) {
        requestContent.classList.remove("hidden");
      } // Ensure we use the original saved request parameters, not the current ones

      // First ensure the Request tab is selected to prepare the form
      if (typeof switchTab === "function") {
        switchTab("request");
      }

      // Set up the Save button since we're viewing from collection
      this.setupTryItOutActionButtons(true, result.request.id);

      // Setup the request details based on the saved request
      this.setupRequestDetails(result.request);

      // Display the result in the response viewer
      if (window.responseBodyEditor) {
        if (typeof result.response.body === "object") {
          window.responseBodyEditor.setValue(
            JSON.stringify(result.response.body, null, 2)
          );
        } else {
          window.responseBodyEditor.setValue(result.response.body || "");
        }
      }

      // Force layout refresh on the response editor
      const responseBodyContainer = document.getElementById(
        "actualResponseSample"
      );
      if (responseBodyContainer && window.setupResponseEditor) {
        window.setupResponseEditor(responseBodyContainer);
      }

      // Show the response content
      const responseContent = document.getElementById("response-content");
      if (responseContent) {
        responseContent.classList.remove("hidden");
        responseContent.classList.add("active");
      }

      // Switch to the response tab after content is loaded
      if (typeof switchTab === "function") {
        // Delay switching to the response tab to ensure request details are fully populated first
        setTimeout(() => {
          switchTab("response");
        }, 100);
      } // Update the response details button
      const responseDetailsBtn = document.getElementById(
        "response-details-button"
      );
      if (responseDetailsBtn) {
        // Determine color based on status code (same logic as response headers)
        const statusStr = String(result.response.status);
        const responseColor = statusStr.startsWith("2")
          ? "green"
          : statusStr.startsWith("3")
          ? "yellow"
          : "red";

        // Check if there are any response headers
        const hasHeaders =
          result.response.headers &&
          Object.keys(result.response.headers).length > 0;

        // Only show arrow if there are headers
        const arrowHtml = hasHeaders
          ? `
          <svg id="response-details-arrow" class="h-5 w-5 mr-2 transform transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>`
          : "";

        const buttonHtml = `${arrowHtml}
          <div class="flex items-center justify-between w-full">
            <span id="actual-response-status-code-display" class="text-sm font-medium">
              ${result.response.status} ${
          result.response.statusText ||
          window.utils.getStatusText(result.response.status)
        }
            </span>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span id="response-execution-time" class="text-sm">${Math.round(
                result.duration
              )}ms</span>
            </div>
          </div>
        `;
        responseDetailsBtn.innerHTML = buttonHtml;
        responseDetailsBtn.className = `flex items-center w-full bg-${responseColor}-100 text-${responseColor}-800 py-2 px-3 rounded-md response-details-button`;
      }

      // Display headers if they exist
      const headersContainer = document.getElementById("response-headers");
      if (headersContainer) {
        headersContainer.innerHTML = "";

        if (result.response.headers) {
          const headersList = Object.entries(result.response.headers);

          if (headersList.length > 0) {
            headersList.forEach(([name, value]) => {
              const headerRow = document.createElement("div");
              headerRow.className = "response-header-row";
              headerRow.innerHTML = `
                <div class="response-header-name">${name}</div>
                <div class="response-header-value">${value}</div>
              `;
              headersContainer.appendChild(headerRow);
            });
          } else {
            headersContainer.innerHTML =
              '<div class="no-headers">No headers returned</div>';
          }
        }
      } // Re-attach the click handler for the response details button
      const newResponseDetailsBtn = responseDetailsBtn.cloneNode(true);

      // Only add click handler if there are headers
      if (
        result.response.headers &&
        Object.keys(result.response.headers).length > 0
      ) {
        newResponseDetailsBtn.addEventListener("click", () => {
          const content = document.getElementById("response-details-content");
          const arrow = document.getElementById("response-details-arrow");
          if (content && arrow) {
            content.classList.toggle("hidden");
            arrow.classList.toggle("rotate-90");
          }
        });
      }

      responseDetailsBtn.parentNode.replaceChild(
        newResponseDetailsBtn,
        responseDetailsBtn
      );
    });

    resultsContainer.appendChild(resultItem);
  }
  /**
   * Open the save collection modal
   * @param {boolean} saveAsNew - Whether this is a save as new operation
   */
  openSaveModal(saveAsNew = false) {
    const modalOverlay = document.getElementById("save-collection-modal");
    const nameInput = document.getElementById("collection-name");
    if (modalOverlay && nameInput) {
      if (!saveAsNew && this.currentCollectionName) {
        nameInput.value = this.currentCollectionName;
        nameInput.readOnly = true;
      } else {
        nameInput.value = "";
        nameInput.readOnly = false;
      }
      modalOverlay.classList.add("open");
      nameInput.focus();
    }
  }

  /**
   * Close the save collection modal
   */ closeSaveModal() {
    const modalOverlay = document.getElementById("save-collection-modal");
    if (modalOverlay) {
      modalOverlay.classList.remove("open");
    }
  }
  /**
   * Save the current collection
   */
  saveCollection() {
    const nameInput = document.getElementById("collection-name");
    if (!nameInput) return;

    const name = nameInput.value.trim();
    if (!name) {
      this.showToast("Please enter a collection name");
      return;
    }

    // Save the collection
    try {
      this.collectionRunner.saveCollection(name);
      this.currentCollectionName = name; // Update current collection name
      this.closeSaveModal();
      this.refreshSavedCollectionsList();
      this.showToast("Collection saved successfully");

      // Show the save button since we now have a current collection
      const saveBtn = document.getElementById("save-collection-btn");
      if (saveBtn) {
        saveBtn.style.display = "block";
      }
    } catch (err) {
      console.error("Error saving collection:", err);
      this.showToast("Error saving collection");
    }

    // Reset input's readonly state
    nameInput.readOnly = false;
    nameInput.value = "";
  }

  /**
   * Save directly to the current collection
   */
  saveCurrentCollection() {
    if (!this.currentCollectionName) {
      this.showToast("No current collection to save to");
      return;
    }

    try {
      this.collectionRunner.saveCollection(this.currentCollectionName);
      this.refreshSavedCollectionsList();
      this.showToast("Collection updated successfully");
    } catch (err) {
      console.error("Error saving collection:", err);
      this.showToast("Error saving collection");
    }
  }
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Notification type (success, error, warning)
   */
  showToast(message, type = "success") {
    // Always use the centralized utils.showToast function
    if (window.utils && typeof window.utils.showToast === "function") {
      window.utils.showToast(message, type);
    } else {
      console.warn("utils.showToast not available, falling back to alert");
      alert(message);
    }
  }

  /**
   * Switch to the Try-it-out section in the right panel
   * @param {boolean} fromCollectionView - Whether this is called from viewing a collection result
   */
  showTryItOutSection(fromCollectionView = false) {
    // Find the Try-it-out menu button
    const tryItOutButton = document.querySelector(
      '.vertical-menu-icon[data-section="try-it-out"]'
    );
    if (tryItOutButton) {
      // Simulate a click on the Try-it-out button to ensure proper section activation
      tryItOutButton.click();
    }

    // Make sure to hide all collection runner content
    const collectionRunnerSection = document.getElementById(
      "collection-runner-section"
    );
    if (collectionRunnerSection) {
      collectionRunnerSection.classList.remove("active");
    }

    // Setup appropriate action buttons - default to Add to Collection
    if (!fromCollectionView) {
      this.setupTryItOutActionButtons(false);
    }

    // Use the right panel section switching mechanism directly
    const tryItOutSection = document.getElementById("try-it-out-section");
    const allSections = document.querySelectorAll(".right-panel-section");

    if (tryItOutSection) {
      // Hide all sections
      allSections.forEach((section) => {
        section.classList.remove("active");
      });

      // Show the try-it-out section
      tryItOutSection.classList.add("active");

      // Update menu buttons
      document.querySelectorAll(".vertical-menu-icon").forEach((icon) => {
        icon.classList.remove("active");
        if (icon.dataset.section === "try-it-out") {
          icon.classList.add("active");
        }
      });

      // Make sure the try-it-out tabs are shown and properly configured
      const tabsContainer = document.getElementById("try-it-out-tabs");
      if (tabsContainer) {
        tabsContainer.classList.remove("hidden");
        tabsContainer.classList.add("visible", "response-available");
      }

      // Hide any collection runner sub-tabs
      document.querySelectorAll(".collection-tab-content").forEach((tab) => {
        tab.classList.add("hidden");
      });
    }
  }
  /**
   * Setup the request details in the Try-it-out section
   * @param {Object} request - The request object to display
   */
  setupRequestDetails(request) {
    if (!request) {
      console.error("No request data provided to setupRequestDetails");
      return;
    }
    console.log("Setting up request details with:", request);

    // Pre-check: certain HTTP methods typically don't have request bodies by default
    const methodsWithoutBody = ["get", "head", "delete", "options"];
    const isMethodThatTypicallyHasNoBody = methodsWithoutBody.includes(
      request.method.toLowerCase()
    );

    // Reset all sections first to clean previous content
    const pathParametersSection = document.getElementById(
      "right-panel-path-parameters-section"
    );
    const pathParametersContainer = document.getElementById(
      "right-panel-path-parameters-container"
    );
    const queryParametersSection = document.getElementById(
      "right-panel-query-parameters-section"
    );
    const queryParametersContainer = document.getElementById(
      "right-panel-query-parameters-container"
    );
    const headersSection = document.getElementById(
      "right-panel-headers-section"
    );
    const headersContainer = document.getElementById(
      "right-panel-headers-container"
    );
    const requestBodySection = document.getElementById(
      "right-panel-request-body-section"
    );
    // Hide all sections first
    if (pathParametersSection) pathParametersSection.classList.add("hidden");
    if (queryParametersSection) queryParametersSection.classList.add("hidden");
    if (headersSection) headersSection.classList.add("hidden");
    if (requestBodySection) requestBodySection.classList.add("hidden"); // Hide body section by default

    // Clear all containers
    if (pathParametersContainer) pathParametersContainer.innerHTML = "";
    if (queryParametersContainer) queryParametersContainer.innerHTML = "";
    if (headersContainer) headersContainer.innerHTML = "";

    // Set the base method and path
    const methodElement = document.getElementById("right-panel-method");
    const pathElement = document.getElementById("right-panel-path");

    // Get the base path (without query parameters)
    const basePath = request.path ? request.path.split("?")[0] : "";
    if (methodElement) {
      methodElement.textContent = request.method.toUpperCase();
      // Use consistent styling with the bg-gray-600 background
      methodElement.className = "ml-1 text-white";
    }

    if (pathElement) {
      pathElement.textContent = request.path;
    } // Find the matching endpoint definition in Swagger
    let endpointPath = null;
    let endpointMethod = null;
    let endpointOperation = null;

    // Clean the path to match against Swagger paths
    const cleanBasePath = basePath.replace(/[{}]/g, "");

    const swaggerDataLoaded =
      window.swaggerData &&
      window.swaggerData.paths &&
      Object.keys(window.swaggerData.paths).length > 0;

    if (swaggerDataLoaded) {
      try {
        // Try to find a matching endpoint
        Object.entries(window.swaggerData.paths).forEach(([path, methods]) => {
          const cleanSwaggerPath = path.replace(/[{}]/g, "");
          if (
            cleanSwaggerPath === cleanBasePath &&
            methods[request.method.toLowerCase()]
          ) {
            endpointPath = path;
            endpointMethod = request.method.toLowerCase();
            endpointOperation = methods[endpointMethod];
          }
        });

        if (!endpointOperation) {
          console.log(
            `Could not find matching endpoint for ${request.method.toUpperCase()} ${cleanBasePath} in Swagger data`
          );
        }
      } catch (error) {
        console.error("Error finding endpoint in Swagger data:", error);
        endpointOperation = null;
      }
    } else {
      console.log(
        "Swagger data not yet loaded, falling back to request data only"
      );
    } // Check if the endpoint requires a request body according to the Swagger definition
    let shouldShowBodySection = false;

    // For methods that typically don't have a body (like GET), default to false
    if (isMethodThatTypicallyHasNoBody) {
      shouldShowBodySection = false;
    } else {
      // For other methods (POST, PUT, PATCH), default to true
      shouldShowBodySection = true;
    }

    // Check if the endpoint definition has a requestBody
    if (endpointOperation && endpointOperation.requestBody) {
      shouldShowBodySection = true;
    }

    // If there's an existing body in the request, we should always show the body section
    if (request.body) {
      shouldShowBodySection = true;
    }

    // Check if there's a Content-Type header which indicates a body
    if (request.headers) {
      const hasContentType = Object.keys(request.headers).some(
        (key) => key.toLowerCase() === "content-type"
      );
      if (hasContentType) {
        shouldShowBodySection = true;
      }
    }

    // Show or hide the body section based on our determination
    if (requestBodySection) {
      if (shouldShowBodySection) {
        requestBodySection.classList.remove("hidden");
      } else {
        requestBodySection.classList.add("hidden");
      }
    } // Process Request Body if needed
    const requestBodyContentTypeSelect = document.getElementById(
      "right-panel-request-body-content-type-select"
    );
    if (requestBodyContentTypeSelect && shouldShowBodySection) {
      requestBodyContentTypeSelect.innerHTML = ""; // Clear options

      // Get all available content types from the endpoint operation
      let availableContentTypes = ["application/json"]; // Default fallback
      if (
        endpointOperation &&
        endpointOperation.requestBody &&
        endpointOperation.requestBody.content
      ) {
        availableContentTypes = Object.keys(
          endpointOperation.requestBody.content
        );
      }

      // Get the current content type from request headers
      let currentContentType = "application/json"; // Default
      if (request.headers) {
        const ctHeader = Object.entries(request.headers).find(
          ([key]) => key.toLowerCase() === "content-type"
        );

        if (ctHeader) {
          currentContentType = ctHeader[1];
        }
      }

      // Add all available content type options
      availableContentTypes.forEach((contentType) => {
        const option = document.createElement("option");
        option.value = contentType;
        option.textContent = contentType;
        requestBodyContentTypeSelect.appendChild(option);
      });

      // If the current content type is not in the available list, add it
      if (!availableContentTypes.includes(currentContentType)) {
        const option = document.createElement("option");
        option.value = currentContentType;
        option.textContent = currentContentType;
        requestBodyContentTypeSelect.appendChild(option);
      } // Set the current content type as selected
      requestBodyContentTypeSelect.value = currentContentType; // Force the content type to be re-evaluated after dropdown is set
      setTimeout(() => {
        if (requestBodyContentTypeSelect.value) {
          const contentType = requestBodyContentTypeSelect.value;

          // Trigger the proper display mode for the current content type
          if (contentType === "multipart/form-data" && request.body) {
            this.handleMultipartFormData(request, contentType);
          } else if (
            contentType === "application/x-www-form-urlencoded" &&
            request.body
          ) {
            this.handleFormEncodedData(request, contentType);
          } else {
            this.handleJSONOrOtherData(request, contentType);
          }
        }
      }, 50);

      // Add event listener for content type changes
      requestBodyContentTypeSelect.addEventListener("change", (e) => {
        const newContentType = e.target.value;

        // Update the Content-Type header in the request
        if (!request.headers) {
          request.headers = {};
        }

        // Find and update existing Content-Type header or add new one
        const existingCtHeader = Object.keys(request.headers).find(
          (key) => key.toLowerCase() === "content-type"
        );

        if (existingCtHeader) {
          delete request.headers[existingCtHeader];
        }
        request.headers["Content-Type"] = newContentType;

        // Trigger request body section update based on new content type
        if (newContentType === "application/x-www-form-urlencoded") {
          // Switch to form fields view
          const requestBodyEditorDiv = document.getElementById(
            "right-panel-request-body-editor"
          );
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "none";
          }

          // Show/create form fields container
          let formFieldsContainer = document.getElementById(
            "form-fields-container"
          );
          if (!formFieldsContainer) {
            formFieldsContainer = document.createElement("div");
            formFieldsContainer.id = "form-fields-container";
            formFieldsContainer.className = "space-y-2";
            if (requestBodyEditorDiv) {
              requestBodyEditorDiv.parentNode.insertBefore(
                formFieldsContainer,
                requestBodyEditorDiv.nextSibling
              );
            }
          }
          formFieldsContainer.style.display = "block";

          // If we have existing form data, preserve it, otherwise create empty fields from schema
          if (!request.body) {
            // Generate fields from schema
            if (
              endpointOperation &&
              endpointOperation.requestBody &&
              endpointOperation.requestBody.content &&
              endpointOperation.requestBody.content[
                "application/x-www-form-urlencoded"
              ]
            ) {
              const formSchemaInfo =
                endpointOperation.requestBody.content[
                  "application/x-www-form-urlencoded"
                ];
              if (formSchemaInfo && formSchemaInfo.schema) {
                let resolvedSchema = formSchemaInfo.schema;

                // Resolve schema reference if needed
                if (formSchemaInfo.schema.$ref) {
                  const refPath = formSchemaInfo.schema.$ref
                    .split("/")
                    .slice(1);
                  resolvedSchema = refPath.reduce(
                    (acc, part) => acc && acc[part],
                    window.swaggerData
                  );
                }

                if (resolvedSchema && resolvedSchema.properties) {
                  // Clear existing fields
                  formFieldsContainer.innerHTML = "";

                  // Generate form fields from schema
                  const schemaProperties = resolvedSchema.properties;
                  const requiredFields = resolvedSchema.required || [];

                  Object.entries(schemaProperties).forEach(
                    ([fieldName, fieldSchema]) => {
                      const fieldDiv = document.createElement("div");
                      fieldDiv.className = "mb-2 flex items-center gap-2";

                      const labelWrapper = document.createElement("div");
                      labelWrapper.className =
                        "w-1/3 text-sm font-medium text-gray-300 pr-1";

                      const label = document.createElement("label");
                      const isRequired = requiredFields.includes(fieldName);
                      label.innerHTML = `<span class="font-bold">${fieldName}${
                        isRequired
                          ? '<span class="text-red-400 ml-0.5">*</span>'
                          : ""
                      }</span>`;

                      if (fieldSchema.description) {
                        label.title = fieldSchema.description;
                      }

                      labelWrapper.appendChild(label);

                      let input;

                      if (fieldSchema.enum) {
                        input = document.createElement("select");
                        input.className =
                          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                        fieldSchema.enum.forEach((enumValue) => {
                          const option = document.createElement("option");
                          option.value = enumValue;
                          option.textContent = enumValue;
                          input.appendChild(option);
                        });
                      } else if (fieldSchema.type === "boolean") {
                        input = document.createElement("select");
                        input.className =
                          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                        ["true", "false"].forEach((val) => {
                          const option = document.createElement("option");
                          option.value = val;
                          option.textContent = val;
                          input.appendChild(option);
                        });
                      } else {
                        input = document.createElement("input");
                        input.type =
                          fieldSchema.type === "number" ? "number" : "text";
                        input.className =
                          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                      }

                      input.name = fieldName;

                      // Add input change listener for variable detection
                      input.addEventListener("input", () => {
                        if (window.highlightVariablePlaceholders) {
                          window.highlightVariablePlaceholders(input);
                        }
                      });

                      fieldDiv.appendChild(labelWrapper);
                      fieldDiv.appendChild(input);
                      formFieldsContainer.appendChild(fieldDiv);
                    }
                  );
                }
              }
            }
          }
        } else if (newContentType === "multipart/form-data") {
          // Switch to form fields view for multipart/form-data
          const requestBodyEditorDiv = document.getElementById(
            "right-panel-request-body-editor"
          );
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "none";
          }

          // Show/create form fields container
          let formFieldsContainer = document.getElementById(
            "form-fields-container"
          );
          if (!formFieldsContainer) {
            formFieldsContainer = document.createElement("div");
            formFieldsContainer.id = "form-fields-container";
            formFieldsContainer.className = "space-y-2";
            if (requestBodyEditorDiv) {
              requestBodyEditorDiv.parentNode.insertBefore(
                formFieldsContainer,
                requestBodyEditorDiv.nextSibling
              );
            }
          }
          formFieldsContainer.style.display = "block";

          // Generate fields from schema for multipart/form-data
          if (
            endpointOperation &&
            endpointOperation.requestBody &&
            endpointOperation.requestBody.content &&
            endpointOperation.requestBody.content["multipart/form-data"]
          ) {
            const formSchemaInfo =
              endpointOperation.requestBody.content["multipart/form-data"];
            if (formSchemaInfo && formSchemaInfo.schema) {
              let resolvedSchema = formSchemaInfo.schema;

              // Resolve schema reference if needed
              if (formSchemaInfo.schema.$ref) {
                const refPath = formSchemaInfo.schema.$ref.split("/").slice(1);
                resolvedSchema = refPath.reduce(
                  (acc, part) => acc && acc[part],
                  window.swaggerData
                );
              }

              if (resolvedSchema && resolvedSchema.properties) {
                // Clear existing fields
                formFieldsContainer.innerHTML = "";

                // Generate form fields from schema
                const schemaProperties = resolvedSchema.properties;
                const requiredFields = resolvedSchema.required || [];

                Object.entries(schemaProperties).forEach(
                  ([fieldName, fieldSchema]) => {
                    const fieldDiv = document.createElement("div");
                    fieldDiv.className = "mb-2 flex items-center gap-2";

                    const labelWrapper = document.createElement("div");
                    labelWrapper.className =
                      "w-1/3 text-sm font-medium text-gray-300 pr-1";

                    const label = document.createElement("label");
                    const isRequired = requiredFields.includes(fieldName);
                    label.innerHTML = `<span class="font-bold">${fieldName}${
                      isRequired
                        ? '<span class="text-red-400 ml-0.5">*</span>'
                        : ""
                    }</span>`;

                    if (fieldSchema.description) {
                      label.title = fieldSchema.description;
                    }

                    labelWrapper.appendChild(label);

                    let input;
                    // Check if this is a file field for multipart/form-data
                    const isFileField =
                      fieldSchema.type === "string" &&
                      fieldSchema.format === "binary";

                    if (isFileField) {
                      // Create file input for binary fields in multipart forms
                      input = document.createElement("input");
                      input.type = "file";
                      input.className =
                        "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                    } else if (fieldSchema.enum) {
                      input = document.createElement("select");
                      input.className =
                        "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                      fieldSchema.enum.forEach((enumValue) => {
                        const option = document.createElement("option");
                        option.value = enumValue;
                        option.textContent = enumValue;
                        input.appendChild(option);
                      });
                    } else if (fieldSchema.type === "boolean") {
                      input = document.createElement("select");
                      input.className =
                        "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                      ["true", "false"].forEach((val) => {
                        const option = document.createElement("option");
                        option.value = val;
                        option.textContent = val;
                        input.appendChild(option);
                      });
                    } else {
                      input = document.createElement("input");
                      input.type =
                        fieldSchema.type === "number" ? "number" : "text";
                      input.className =
                        "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                    }

                    input.name = fieldName;
                    input.placeholder =
                      fieldSchema.description || fieldSchema.example || "";
                    if (isRequired) {
                      input.required = true;
                    }

                    // Add input change listener for variable detection (except for file inputs)
                    if (!isFileField) {
                      input.addEventListener("input", () => {
                        if (window.highlightVariablePlaceholders) {
                          window.highlightVariablePlaceholders(input);
                        }
                      });
                    }

                    fieldDiv.appendChild(labelWrapper);
                    fieldDiv.appendChild(input);
                    formFieldsContainer.appendChild(fieldDiv);
                  }
                );
              }
            }
          }
        } else {
          // Switch to Monaco editor view for JSON and other content types
          const requestBodyEditorDiv = document.getElementById(
            "right-panel-request-body-editor"
          );
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "block";
          }

          // Convert form data to JSON if switching from form-encoded
          if (
            request.body &&
            typeof request.body === "string" &&
            request.body.includes("=")
          ) {
            try {
              const formData = new URLSearchParams(request.body);
              const jsonObj = {};
              formData.forEach((value, key) => {
                jsonObj[key] = value;
              });
              request.body = JSON.stringify(jsonObj, null, 2);

              if (window.requestBodyEditor) {
                window.requestBodyEditor.setValue(request.body);
              }
            } catch (e) {
              console.warn("Failed to convert form data to JSON:", e);
            }
          }
        }
      });
    } // Set the request body if available and if we should show the body section
    if (shouldShowBodySection) {
      // Determine content type from request headers FIRST, then from dropdown
      let contentType = "application/json"; // Default fallback

      if (request.headers) {
        // Try to get from request headers first
        const ctHeader = Object.entries(request.headers).find(
          ([key]) => key.toLowerCase() === "content-type"
        );
        if (ctHeader) {
          contentType = ctHeader[1];
        }
      }

      // If dropdown is available and has a value, use that as override
      if (requestBodyContentTypeSelect && requestBodyContentTypeSelect.value) {
        contentType = requestBodyContentTypeSelect.value;
      }
      if (contentType === "application/x-www-form-urlencoded" && request.body) {
        this.handleFormEncodedData(request, contentType);
      } else if (contentType === "multipart/form-data" && request.body) {
        this.handleMultipartFormData(request, contentType);
      } else {
        this.handleJSONOrOtherData(request, contentType);
      }
    }
    const labelClasses = "w-1/3 text-sm font-medium text-gray-300 pr-1";

    // Common function to create parameter div
    const createParameterDiv = (param, container, value = "") => {
      const paramRow = document.createElement("div");
      paramRow.className = "mb-1 flex items-center gap-1";

      const labelWrapper = document.createElement("div");
      labelWrapper.className = "flex items-center h-7 " + labelClasses;
      const label = document.createElement("div");
      label.className = "flex items-center w-full justify-between";
      label.innerHTML = `<span class="font-bold">${param.name}${
        param.required ? '<span class="text-red-400 ml-0.5">*</span>' : ""
      }</span> <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${
        window.formatTypeDisplay
          ? window.formatTypeDisplay(param.schema)
          : param.schema.type
      }</code>`;

      labelWrapper.appendChild(label);
      paramRow.appendChild(labelWrapper);
      let input;
      if (param.schema && param.schema.enum) {
        input = document.createElement("select");
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
        param.schema.enum.forEach((enumValue) => {
          const option = document.createElement("option");
          option.value = enumValue;
          option.textContent = enumValue;
          input.appendChild(option);
        });
        if (value) {
          input.value = value;
        } else if (param.schema.default) {
          input.value = param.schema.default;
        }
      } else if (param.schema && param.schema.type === "boolean") {
        input = document.createElement("select");
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
        ["true", "false"].forEach((val) => {
          const option = document.createElement("option");
          option.value = val;
          option.textContent = val;
          input.appendChild(option);
        });
        if (value) {
          input.value = value.toString();
        } else if (typeof param.schema.default === "boolean") {
          input.value = param.schema.default.toString();
        } else {
          input.value = "false";
        }
      } else {
        input = document.createElement("input");
        input.type =
          param.schema && param.schema.type === "integer" ? "number" : "text";
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
        if (value) {
          input.value = value;
        } else if (param.schema && param.schema.default) {
          input.value = param.schema.default;
        }
      }

      input.name = param.name;
      input.dataset.paramIn = param.in;
      input.placeholder = param.description || "";
      if (param.required) {
        input.required = true;
      }

      paramRow.appendChild(input);
      container.appendChild(paramRow);
    };

    // Handle path parameters
    if (endpointOperation && endpointOperation.parameters) {
      // Get path parameters from the endpoint definition
      const pathParams = endpointOperation.parameters.filter(
        (p) => p.in === "path"
      );

      if (
        pathParams.length > 0 &&
        pathParametersSection &&
        pathParametersContainer
      ) {
        pathParametersSection.classList.remove("hidden");

        // Add count to path parameters header
        const pathParamHeader = pathParametersSection.querySelector("h3");
        if (pathParamHeader) {
          pathParamHeader.innerHTML = `Path Parameters <span class="endpoint-count ml-2">${pathParams.length}</span>`;
        }

        // Add each path parameter
        pathParams.forEach((param) => {
          // Check if this parameter has a value in the request
          let value = "";
          if (request.pathParams && request.pathParams[param.name]) {
            value = request.pathParams[param.name];
          }

          createParameterDiv(param, pathParametersContainer, value);
        });
      }

      // Get query parameters from the endpoint definition
      const queryParams = endpointOperation.parameters.filter(
        (p) => p.in === "query"
      );

      if (
        queryParams.length > 0 &&
        queryParametersSection &&
        queryParametersContainer
      ) {
        queryParametersSection.classList.remove("hidden");

        // Add count to query parameters header
        const queryParamHeader = queryParametersSection.querySelector("h3");
        if (queryParamHeader) {
          queryParamHeader.innerHTML = `Query Parameters <span class="endpoint-count ml-2">${queryParams.length}</span>`;
        }

        // Extract existing query parameters from request
        const requestQueryParams = {};

        // Check for query params in the queryParams object
        if (request.queryParams) {
          Object.assign(requestQueryParams, request.queryParams);
        }

        // Also check for query parameters in the URL
        if (request.path && request.path.includes("?")) {
          const queryString = request.path.split("?")[1];
          if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            urlParams.forEach((value, key) => {
              requestQueryParams[key] = value;
            });
          }
        }

        // Add each query parameter
        queryParams.forEach((param) => {
          // Check if this parameter has a value in the request
          let value = "";
          if (requestQueryParams[param.name]) {
            value = requestQueryParams[param.name];
          }

          createParameterDiv(param, queryParametersContainer, value);
        });
      }

      // Handle headers
      const headerParams = endpointOperation.parameters.filter(
        (p) => p.in === "header"
      );

      if (headerParams.length > 0 && headersSection && headersContainer) {
        headersSection.classList.remove("hidden");

        // Add count to headers header
        const headersParamHeader = headersSection.querySelector("h3");
        if (headersParamHeader) {
          headersParamHeader.innerHTML = `Headers <span class="endpoint-count ml-2">${headerParams.length}</span>`;
        }

        // Add each header parameter
        headerParams.forEach((param) => {
          // Skip content-type header as it's handled separately
          if (param.name.toLowerCase() === "content-type") {
            return;
          }

          // Check if this parameter has a value in the request
          let value = "";
          if (request.headers && request.headers[param.name]) {
            value = request.headers[param.name];
          }

          createParameterDiv(param, headersContainer, value);
        });

        // Also add any custom headers from the request that aren't in the definition
        if (request.headers) {
          const definedHeaderNames = headerParams.map((p) =>
            p.name.toLowerCase()
          );

          Object.entries(request.headers).forEach(([name, value]) => {
            if (
              name.toLowerCase() !== "content-type" &&
              !definedHeaderNames.includes(name.toLowerCase())
            ) {
              const headerRow = document.createElement("div");
              headerRow.className = "mb-1 flex items-center gap-1";

              const labelWrapper = document.createElement("div");
              labelWrapper.className =
                "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

              const label = document.createElement("label");
              label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
              labelWrapper.appendChild(label);
              const input = document.createElement("input");
              input.type = "text";
              input.name = name;
              input.value = value;
              input.className =
                "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

              headerRow.appendChild(labelWrapper);
              headerRow.appendChild(input);
              headersContainer.appendChild(headerRow);
            }
          });
        }
      } else if (request.headers && Object.keys(request.headers).length > 0) {
        // If no header parameters in definition but request has headers
        headersSection.classList.remove("hidden");

        // Add each header as a form field
        Object.entries(request.headers).forEach(([name, value]) => {
          if (name.toLowerCase() !== "content-type") {
            // Content-type is handled separately
            const headerRow = document.createElement("div");
            headerRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);
            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            headerRow.appendChild(labelWrapper);
            headerRow.appendChild(input);
            headersContainer.appendChild(headerRow);
          }
        });
      }
    } else {
      // Fallback to the original behavior if endpoint definition is not found

      // Set Path Parameters if available
      if (request.pathParams && Object.keys(request.pathParams).length > 0) {
        if (pathParametersSection && pathParametersContainer) {
          pathParametersSection.classList.remove("hidden");

          // Add each path parameter as a form field
          Object.entries(request.pathParams).forEach(([name, value]) => {
            const paramRow = document.createElement("div");
            paramRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);

            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            paramRow.appendChild(labelWrapper);
            paramRow.appendChild(input);
            pathParametersContainer.appendChild(paramRow);
          });
        }
      }

      // Set Query Parameters if available
      if (request.queryParams && Object.keys(request.queryParams).length > 0) {
        if (queryParametersSection && queryParametersContainer) {
          queryParametersSection.classList.remove("hidden");

          // Add each query parameter as a form field
          Object.entries(request.queryParams).forEach(([name, value]) => {
            const paramRow = document.createElement("div");
            paramRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);
            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            paramRow.appendChild(labelWrapper);
            paramRow.appendChild(input);
            queryParametersContainer.appendChild(paramRow);
          });
        }
      } else if (request.path && request.path.includes("?")) {
        const queryParamsSection = document.getElementById(
          "right-panel-query-parameters-section"
        );
        const queryParamsContainer = document.getElementById(
          "right-panel-query-parameters-container"
        );

        if (queryParamsSection && queryParamsContainer) {
          queryParamsSection.classList.remove("hidden");

          // Extract and display query parameters from URL
          const queryString = request.path.split("?")[1];
          if (queryString) {
            const params = new URLSearchParams(queryString);
            params.forEach((value, key) => {
              const paramRow = document.createElement("div");
              paramRow.className = "mb-1 flex items-center gap-1";

              const labelWrapper = document.createElement("div");
              labelWrapper.className =
                "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

              const label = document.createElement("label");
              label.innerHTML = `<span class="font-bold text-white">${key}</span>`;
              labelWrapper.appendChild(label);

              const input = document.createElement("input");
              input.type = "text";
              input.name = key;
              input.value = value;
              input.className =
                "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

              paramRow.appendChild(labelWrapper);
              paramRow.appendChild(input);
              queryParamsContainer.appendChild(paramRow);
            });
          }
        }
      }

      // Set headers if available

      if (
        request.headers &&
        Object.keys(request.headers.filter((h) => h.name !== "contenty-type"))
          .length > 0
      ) {
        if (headersSection && headersContainer) {
          headersSection.classList.remove("hidden");

          // Add each header as a form field
          Object.entries(request.headers).forEach(([name, value]) => {
            // Content-type is handled separately
            const headerRow = document.createElement("div");
            headerRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);

            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            headerRow.appendChild(labelWrapper);
            headerRow.appendChild(input);
            headersContainer.appendChild(headerRow);
          });
        }
      }
    }
  }
  /**
   * Create or update action buttons in the Try It Out section
   * @param {boolean} isCollectionView - Whether this is a view from collection results
   * @param {string} requestId - ID of the request being viewed (only if isCollectionView is true)
   */ setupTryItOutActionButtons(isCollectionView = false, requestId = null) {
    // Find or create container for action buttons
    let actionButtonsContainer = document.getElementById(
      "try-it-out-action-buttons"
    );

    if (!actionButtonsContainer) {
      // Find the Execute button directly
      const rightPanelPath = document.getElementById("right-panel-path");

      if (!rightPanelPath) {
        console.error(
          "Could not find rightPanelPath for adding action buttons"
        );
        return;
      }

      // Create a container for our action buttons
      actionButtonsContainer = document.createElement("div");
      actionButtonsContainer.id = "try-it-out-action-buttons";
      actionButtonsContainer.className = "flex items-center";

      // Insert before the rightPanelPath
      rightPanelPath.parentNode.appendChild(actionButtonsContainer);
    }

    // Clear existing buttons
    actionButtonsContainer.innerHTML = "";

    if (isCollectionView && requestId) {
      // Store the request ID for later use
      this.currentRequestId = requestId; // Create a Save button for updating the collection request
      const saveButton = document.createElement("button");
      saveButton.id = "save-to-collection-button";
      saveButton.className =
        "px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors flex items-center justify-center";
      saveButton.dataset.tooltip = "Save changes to collection";
      saveButton.innerHTML = `
  <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zM7 5h6v4H7V5zm8 14H9v-6h6v6z" />
  </svg> Save
`;

      // Add click handler
      saveButton.addEventListener("click", () =>
        this.updateExistingRequest(this.currentRequestId)
      );

      // Add tooltip functionality
      saveButton.addEventListener("mouseenter", handleTooltipMouseEnter);
      saveButton.addEventListener("mouseleave", handleTooltipMouseLeave);

      // Add button to container
      actionButtonsContainer.appendChild(saveButton);
    } else {
      // Reset current request ID
      this.currentRequestId = null; // Create an Add to Collection button (+ svg only)
      const addButton = document.createElement("button");
      addButton.id = "add-to-collection-button";
      addButton.className =
        "px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors flex items-center justify-center";
      addButton.dataset.tooltip = "Add request to collection";
      addButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg> Add
      `; // Add click handler
      addButton.addEventListener("click", () =>
        this.addCurrentRequestToCollection()
      );

      // Add tooltip functionality
      addButton.addEventListener("mouseenter", handleTooltipMouseEnter);
      addButton.addEventListener("mouseleave", handleTooltipMouseLeave);

      // Add button to container
      actionButtonsContainer.appendChild(addButton);
    }
  }

  /**
   * Update an existing request in the collection
   * @param {string} requestId - ID of the request to update
   */
  updateExistingRequest(requestId) {
    if (!requestId) {
      this.showToast("No request ID provided", "error");
      return;
    }

    // Get current request details from the UI
    const pathElement = document.querySelector("#right-panel-path");
    const methodElement = document.querySelector("#right-panel-method");

    if (!pathElement || !methodElement) {
      this.showToast("Could not determine current request details", "error");
      return;
    }

    // Get current path and method
    const path = pathElement.textContent;
    const method = methodElement.textContent.toUpperCase();

    // Get parameters
    const pathParams = {};
    const pathParametersContainer = document.getElementById(
      "right-panel-path-parameters-container"
    );
    if (pathParametersContainer) {
      pathParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            pathParams[input.name] = input.value;
          }
        });
    }

    // Get query parameters
    const queryParams = {};
    const queryParametersContainer = document.getElementById(
      "right-panel-query-parameters-container"
    );
    if (queryParametersContainer) {
      queryParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            queryParams[input.name] = input.value;
          }
        });
    }

    // Get headers
    const headers = {};
    const headersContainer = document.getElementById(
      "right-panel-headers-container"
    );
    if (headersContainer) {
      headersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            headers[input.name] = input.value;
          }
        });
    } // Get request body section status
    const requestBodySection = document.getElementById(
      "right-panel-request-body-section"
    );
    const isBodySectionVisible =
      requestBodySection && !requestBodySection.classList.contains("hidden"); // Get request body content type only if body section is visible
    const contentTypeSelect = document.getElementById(
      "right-panel-request-body-content-type-select"
    );
    if (isBodySectionVisible && contentTypeSelect && contentTypeSelect.value) {
      headers["Content-Type"] = contentTypeSelect.value;
    } else {
      // Remove Content-Type header if body is not being used
      delete headers["Content-Type"];
    }

    // Get request body only if body section is visible
    let body = undefined;
    if (isBodySectionVisible) {
      const selectedContentType = contentTypeSelect
        ? contentTypeSelect.value
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
              formData.append(input.name, input.value);
            }
          });

          body = formData.toString();
        }
      } else if (selectedContentType === "multipart/form-data") {
        // Handle multipart/form-data - store file info for collection
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const multipartData = {};
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name) {
              if (input.type === "file") {
                // For files, store filename and type info
                if (input.files && input.files.length > 0) {
                  const file = input.files[0];
                  multipartData[input.name] = {
                    type: "file",
                    filename: file.name,
                    size: file.size,
                    mimeType: file.type,
                  };
                }
              } else if (input.value) {
                // Handle regular form fields
                multipartData[input.name] = {
                  type: "text",
                  value: input.value,
                };
              }
            }
          });

          body = JSON.stringify(multipartData);
        }
      } else {
        // Handle JSON and other content types using Monaco editor
        if (window.requestBodyEditor) {
          body = window.requestBodyEditor.getValue();
          // If body is empty string or whitespace, set to undefined
          if (!body || body.trim() === "") {
            body = undefined;
          }
        }
      }
    }

    // Create request name from path
    const name = path.split("/").pop() || method;

    // Update the request in the collection
    if (
      this.collectionRunner.updateRequest(requestId, {
        name: `${method} ${name}`,
        path,
        method,
        pathParams,
        queryParams,
        headers,
        body,
        id: requestId, // Preserve the ID
      })
    ) {
      this.showToast("Request updated in collection");

      // Refresh the collection list if we're in the collection view
      this.refreshRequestList();
    } else {
      this.showToast("Failed to update request", "error");
    }
  }

  /**
   * Show the output parameters popup for a specific request
   * @param {string} requestId - ID of the request to configure output parameters for
   */
  showOutputParametersPopup(requestId) {
    // Find the request in the collection
    const request = this.collectionRunner.collection.find(
      (r) => r.id === requestId
    );
    if (!request) {
      this.showToast("Request not found", "error");
      return;
    }

    // Create the modal if it doesn't exist
    this.createOutputParametersModal();

    // Populate the modal with existing output parameters
    this.populateOutputParametersModal(request);

    // Store the current request ID for saving
    this.currentOutputParamsRequestId = requestId;

    // Show the modal
    const modal = document.getElementById("output-parameters-modal");
    if (modal) {
      modal.classList.add("open");
    }
  }

  /**
   * Create the output parameters modal
   */
  createOutputParametersModal() {
    // Check if modal already exists
    if (document.getElementById("output-parameters-modal")) {
      return;
    }
    const modalHtml = `
      <div id="output-parameters-modal" class="collection-modal-overlay">
        <div class="collection-modal bg-gray-800 text-white border border-gray-700 shadow-lg" style="width: 40rem; max-width: 90vw;">
          <div class="collection-modal-header border-b border-gray-700">
            <h3 class="collection-modal-title">Output Parameters</h3>
            <span class="collection-modal-close text-gray-400 hover:text-gray-200" id="close-output-params-modal">×</span>
          </div>
          <div class="collection-modal-body" style="max-height: 60vh; overflow-y: auto;">            <div class="mb-4">
              <p class="text-gray-300 text-sm mb-4">
                Define output parameters to extract data from API responses for use in subsequent requests.
              </p>
            </div>
              <!-- Parameters Table -->
            <div class="bg-gray-700 rounded-md border border-gray-600">
              <table class="w-full">                <thead>
                  <tr class="border-b border-gray-600">
                    <th class="text-left px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <div class="flex items-center">
                        Parameter Name
                        <button data-popover-target="param-usage-popover" data-popover-placement="bottom-start" type="button" class="ml-1">
                          <svg class="w-4 h-4 text-gray-400 hover:text-gray-300" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="sr-only">Show parameter usage</span>
                        </button>
                      </div>
                    </th>
                    <th class="text-left px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <div class="flex items-center">
                        JSON Path Expression
                        <button data-popover-target="jsonpath-examples-popover" data-popover-placement="bottom-end" type="button" class="ml-1">
                          <svg class="w-4 h-4 text-gray-400 hover:text-gray-300" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="sr-only">Show JSON Path examples</span>
                        </button>
                      </div>
                    </th>                    <th class="text-center px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider w-12">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </th>
                  </tr>
                </thead>
                <tbody id="output-parameters-table-body">
                  <!-- Output parameters will be added here -->
                </tbody>
              </table>            </div>
            
            <!-- Parameter Usage Popover -->
            <div data-popover id="param-usage-popover" role="tooltip" class="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 w-80">
              <div class="p-3 space-y-2">
                <h3 class="font-semibold text-gray-900 ">Using Output Parameters</h3>
                <div class="space-y-2 text-xs">
                  <div class="text-gray-700">Output parameters extract values from API responses and make them available as variables in subsequent requests.</div>
                  <div class="mt-2">
                    <strong class="text-gray-900 dark:text-white">Usage in requests:</strong>
                  </div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">{{@paramName}}</code> - Use in path parameters, query params, headers, or request body</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">{{@userId}}</code> - Example: extracted user ID from previous response</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">{{@authToken}}</code> - Example: extracted authentication token</div>
                  <div class="mt-2 text-gray-600 dark:text-gray-400">
                    <em>Note: The @ symbol distinguishes output parameters from regular variables.</em>
                  </div>
                </div>
              </div>
              <div data-popper-arrow></div>
            </div>

            <!-- JSON Path Examples Popover -->
            <div data-popover id="jsonpath-examples-popover" role="tooltip" class="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 w-80">
              <div class="p-3 space-y-2">
                <h3 class="font-semibold text-gray-900">JSON Path Examples</h3>
                <div class="space-y-2 text-xs">
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.data.id</code> - Extract ID from data object</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.token</code> - Extract token from root</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.results[0].name</code> - First item's name from results array</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.user.profile.email</code> - Nested object property</div>
                </div>
              </div>
              <div data-popper-arrow></div>
            </div>
            
            <button id="add-output-parameter" class="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Parameter
            </button>
          </div>
          <div class="collection-modal-footer border-t border-gray-700 pt-3">
            <button id="cancel-output-params-modal" class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
              Cancel
            </button>
            <button id="save-output-params" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Bind events
    this.bindOutputParametersModalEvents();
  }

  /**
   * Bind events for the output parameters modal
   */
  bindOutputParametersModalEvents() {
    // Close modal events
    document
      .getElementById("close-output-params-modal")
      ?.addEventListener("click", () => {
        this.closeOutputParametersModal();
      });

    document
      .getElementById("cancel-output-params-modal")
      ?.addEventListener("click", () => {
        this.closeOutputParametersModal();
      });

    // Add parameter button
    document
      .getElementById("add-output-parameter")
      ?.addEventListener("click", () => {
        this.addOutputParameterRow();
      });

    // Save parameters
    document
      .getElementById("save-output-params")
      ?.addEventListener("click", () => {
        this.saveOutputParameters();
      }); // Close modal when clicking outside
    document
      .getElementById("output-parameters-modal")
      ?.addEventListener("click", (e) => {
        if (e.target.id === "output-parameters-modal") {
          this.closeOutputParametersModal();
        }
      });

    // Initialize popover for JSON Path examples
    this.initializeJsonPathPopover();

    // Initialize popover for parameter usage help
    this.initializeParameterUsagePopover();
  }
  /**
   * Populate the output parameters modal with existing data
   * @param {Object} request - The request object with potential output parameters
   */
  populateOutputParametersModal(request) {
    const container = document.getElementById("output-parameters-table-body");
    if (!container) return;

    // Clear existing parameters
    container.innerHTML = "";

    // Add existing output parameters
    if (request.outputParameters && request.outputParameters.length > 0) {
      request.outputParameters.forEach((param) => {
        this.addOutputParameterRow(param.name, param.jsonPath);
      });
    } else {
      // Add one empty row by default
      this.addOutputParameterRow();
    }
  }
  /**
   * Add a new output parameter row
   * @param {string} name - Parameter name
   * @param {string} jsonPath - JSON path expression
   */
  addOutputParameterRow(name = "", jsonPath = "") {
    const container = document.getElementById("output-parameters-table-body");
    if (!container) return;
    const row = document.createElement("tr");
    row.className =
      "output-parameter-row border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors";
    row.innerHTML = `
      <td class="border-r border-gray-600">        <input type="text" class="parameter-name w-full h-full px-3 py-2 bg-transparent border-0 text-white text-xs font-mono focus:outline-none focus:ring-0 focus:bg-gray-600" 
               placeholder="paramName" value="${name}" style="min-height: 36px;">
      </td>
      <td class="border-r border-gray-600">
        <input type="text" class="parameter-jsonpath w-full h-full px-3 py-2 bg-transparent border-0 text-white text-xs font-mono focus:outline-none focus:ring-0 focus:bg-gray-600" 
               placeholder="$.propertyName" value="${jsonPath}" style="min-height: 36px;">
      </td>      <td class="text-center" style="min-height: 36px; padding: 8px;">
        <button class="remove-output-parameter text-red-400 hover:text-red-300 p-1 rounded transition-colors" title="Remove Parameter">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    `;

    // Bind remove button event
    row
      .querySelector(".remove-output-parameter")
      .addEventListener("click", () => {
        row.remove();
      });

    container.appendChild(row);
  }
  /**
   * Save the output parameters for the current request
   */
  saveOutputParameters() {
    if (!this.currentOutputParamsRequestId) {
      this.showToast("No request selected", "error");
      return;
    }

    const container = document.getElementById("output-parameters-table-body");
    if (!container) return;

    const outputParameters = [];
    const rows = container.querySelectorAll(".output-parameter-row");

    rows.forEach((row) => {
      const name = row.querySelector(".parameter-name").value.trim();
      const jsonPath = row.querySelector(".parameter-jsonpath").value.trim();

      if (name && jsonPath) {
        outputParameters.push({
          name,
          jsonPath,
        });
      }
    });

    // Find and update the request
    const request = this.collectionRunner.collection.find(
      (r) => r.id === this.currentOutputParamsRequestId
    );
    if (request) {
      request.outputParameters = outputParameters;

      // If we have a current collection, auto-save it
      if (this.currentCollectionName) {
        this.collectionRunner.saveCollection(this.currentCollectionName);
      }

      this.showToast(
        `Output parameters updated for ${request.name}`,
        "success"
      );
      this.closeOutputParametersModal();
    } else {
      this.showToast("Request not found", "error");
    }
  }

  /**
   * Close the output parameters modal
   */
  closeOutputParametersModal() {
    const modal = document.getElementById("output-parameters-modal");
    if (modal) {
      modal.classList.remove("open");
    }
    this.currentOutputParamsRequestId = null;
  }

  /**
   * Initialize the JSON Path examples popover
   */
  initializeJsonPathPopover() {
    const trigger = document.querySelector(
      '[data-popover-target="jsonpath-examples-popover"]'
    );
    const popover = document.getElementById("jsonpath-examples-popover");

    if (!trigger || !popover) return;

    let isVisible = false;
    let hideTimeout = null;

    const showPopover = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      popover.classList.remove("invisible", "opacity-0");
      popover.classList.add("visible", "opacity-100");
      isVisible = true;

      // Position the popover
      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      // Position to the bottom-end of the trigger
      let top = triggerRect.bottom + 8;
      let left = triggerRect.right - popoverRect.width;

      // Adjust if popover goes outside viewport
      if (left < 10) left = 10;
      if (top + popoverRect.height > window.innerHeight - 10) {
        top = triggerRect.top - popoverRect.height - 8;
      }

      popover.style.position = "fixed";
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.zIndex = "1000";
    };

    const hidePopover = () => {
      hideTimeout = setTimeout(() => {
        popover.classList.add("invisible", "opacity-0");
        popover.classList.remove("visible", "opacity-100");
        isVisible = false;
      }, 150);
    };

    // Show on hover/click
    trigger.addEventListener("mouseenter", showPopover);
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      if (isVisible) {
        hidePopover();
      } else {
        showPopover();
      }
    });

    // Hide when leaving trigger
    trigger.addEventListener("mouseleave", hidePopover);

    // Keep popover visible when hovering over it
    popover.addEventListener("mouseenter", () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });

    popover.addEventListener("mouseleave", hidePopover);

    // Hide when clicking outside
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !popover.contains(e.target)) {
        hidePopover();
      }
    });
  }

  /**
   * Initialize the Parameter Usage help popover
   */
  initializeParameterUsagePopover() {
    const trigger = document.querySelector(
      '[data-popover-target="param-usage-popover"]'
    );
    const popover = document.getElementById("param-usage-popover");

    if (!trigger || !popover) return;

    let isVisible = false;
    let hideTimeout = null;

    const showPopover = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      popover.classList.remove("invisible", "opacity-0");
      popover.classList.add("visible", "opacity-100");
      isVisible = true;

      // Position the popover
      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      // Position to the bottom-start of the trigger
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // Adjust if popover goes outside viewport
      if (left + popoverRect.width > window.innerWidth - 10) {
        left = window.innerWidth - popoverRect.width - 10;
      }
      if (top + popoverRect.height > window.innerHeight - 10) {
        top = triggerRect.top - popoverRect.height - 8;
      }

      popover.style.position = "fixed";
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.zIndex = "1000";
    };

    const hidePopover = () => {
      hideTimeout = setTimeout(() => {
        popover.classList.add("invisible", "opacity-0");
        popover.classList.remove("visible", "opacity-100");
        isVisible = false;
      }, 150);
    };

    // Show on hover/click
    trigger.addEventListener("mouseenter", showPopover);
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      if (isVisible) {
        hidePopover();
      } else {
        showPopover();
      }
    });

    // Hide when leaving trigger
    trigger.addEventListener("mouseleave", hidePopover);

    // Keep popover visible when hovering over it
    popover.addEventListener("mouseenter", () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });

    popover.addEventListener("mouseleave", hidePopover);

    // Hide when clicking outside
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !popover.contains(e.target)) {
        hidePopover();
      }
    });
  }

  /**
   * Get the API prefix for localStorage keys
   * @returns {string} - The API prefix
   */
  getApiPrefix() {
    return window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";
  }

  /**
   * Save the current active collection tab to localStorage
   * @param {string} tabId - The tab ID to save
   */
  saveActiveTab(tabId) {
    try {
      const storageKey = `${this.getApiPrefix()}_collection_active_tab`;
      localStorage.setItem(storageKey, tabId);
    } catch (error) {
      console.error("Error saving active tab:", error);
    }
  }

  /**
   * Load the saved active collection tab from localStorage
   * @returns {string} - The saved tab ID or default tab ID
   */
  loadActiveTab() {
    try {
      const storageKey = `${this.getApiPrefix()}_collection_active_tab`;
      const savedTab = localStorage.getItem(storageKey);
      return savedTab || "collection-tab"; // Default to collection-tab if none saved
    } catch (error) {
      console.error("Error loading active tab:", error);
      return "collection-tab";
    }
  }

  /**
   * Restore the previously active collection tab
   * Called when the collection runner section is activated
   */
  restoreActiveTab() {
    const activeTab = this.loadActiveTab();

    // Show the saved active tab content
    document.querySelectorAll(".collection-tab-content").forEach((tab) => {
      if (tab.id === activeTab) {
        tab.classList.remove("hidden");
        tab.style.opacity = "1";
      } else {
        tab.classList.add("hidden");
      }
    });

    // Update the tab buttons
    document.querySelectorAll(".collection-tab[data-tab]").forEach((btn) => {
      if (btn.dataset.tab === activeTab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  /**
   * Get endpoint summary from OpenAPI spec
   * @param {string} path - The endpoint path
   * @param {string} method - The HTTP method
   * @returns {string|null} - The summary if found, null otherwise
   */
  getEndpointSummary(path, method) {
    if (!window.swaggerData || !window.swaggerData.paths) {
      return null;
    }

    // Try direct path match first
    if (
      window.swaggerData.paths[path] &&
      window.swaggerData.paths[path][method.toLowerCase()]
    ) {
      return (
        window.swaggerData.paths[path][method.toLowerCase()].summary || null
      );
    }

    // Create clean path for comparison (remove curly braces)
    const cleanRequestPath =
      window.utils && window.utils.createCleanPath
        ? window.utils.createCleanPath(path)
        : path.replace(/[{}]/g, "");

    // Search through all paths for a match
    for (const [swaggerPath, pathObj] of Object.entries(
      window.swaggerData.paths
    )) {
      const cleanSwaggerPath =
        window.utils && window.utils.createCleanPath
          ? window.utils.createCleanPath(swaggerPath)
          : swaggerPath.replace(/[{}]/g, "");

      if (
        cleanSwaggerPath === cleanRequestPath &&
        pathObj[method.toLowerCase()]
      ) {
        return pathObj[method.toLowerCase()].summary || null;
      }
    }
    return null;
  }

  /**
   * Format file size in a human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
  /**
   * Handle multipart/form-data content type display
   * @param {Object} request - The request object
   * @param {string} contentType - The content type
   */ handleMultipartFormData(request, contentType) {
    // Hide Monaco editor and show form fields for multipart content
    const requestBodyEditorDiv = document.getElementById(
      "right-panel-request-body-editor"
    );
    if (requestBodyEditorDiv) {
      requestBodyEditorDiv.style.display = "none";
    }

    // Create or show form fields container
    let formFieldsContainer = document.getElementById("form-fields-container");
    if (!formFieldsContainer) {
      formFieldsContainer = document.createElement("div");
      formFieldsContainer.id = "form-fields-container";
      formFieldsContainer.className = "space-y-2";
      if (requestBodyEditorDiv) {
        requestBodyEditorDiv.parentNode.insertBefore(
          formFieldsContainer,
          requestBodyEditorDiv.nextSibling
        );
      }
    }

    // Clear previous form fields
    formFieldsContainer.innerHTML = "";
    formFieldsContainer.style.display = "block";

    // Parse existing multipart data if available
    let multipartData = {};
    if (request.body) {
      try {
        multipartData = JSON.parse(request.body);
      } catch (e) {
        console.warn("Failed to parse multipart body:", e);
      }
    }

    // Try to get schema information from the endpoint operation
    let schemaProperties = null;
    let requiredFields = [];

    const endpointOperation = this.findEndpointOperation(request);
    if (
      endpointOperation &&
      endpointOperation.requestBody &&
      endpointOperation.requestBody.content
    ) {
      const formSchemaInfo =
        endpointOperation.requestBody.content["multipart/form-data"];
      if (formSchemaInfo && formSchemaInfo.schema) {
        let resolvedSchema = formSchemaInfo.schema;

        // Resolve schema reference if needed
        if (formSchemaInfo.schema.$ref) {
          const refPath = formSchemaInfo.schema.$ref.split("/").slice(1);
          resolvedSchema = refPath.reduce(
            (acc, part) => acc && acc[part],
            window.swaggerData
          );
        }

        if (resolvedSchema && resolvedSchema.properties) {
          schemaProperties = resolvedSchema.properties;
          requiredFields = resolvedSchema.required || [];
        }
      }
    }

    // Generate ALL schema properties first (like query parameters), then populate with saved values
    if (schemaProperties) {
      Object.entries(schemaProperties).forEach(([fieldName, fieldSchema]) => {
        const fieldData = multipartData[fieldName] || {}; // Get saved data if exists, otherwise empty object

        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("label");
        const isRequired = requiredFields.includes(fieldName);
        label.innerHTML = `<span class="font-bold">${fieldName}${
          isRequired ? '<span class="text-red-400 ml-0.5">*</span>' : ""
        }</span>`;

        // Add description as tooltip if available
        if (fieldSchema.description) {
          label.title = fieldSchema.description;
        }

        labelWrapper.appendChild(label);

        let input;
        // Check if this is a file field for multipart/form-data
        const isFileField =
          fieldData.type === "file" ||
          (fieldSchema.type === "string" && fieldSchema.format === "binary");

        if (isFileField) {
          // Create file input for binary fields in multipart forms
          input = document.createElement("input");
          input.type = "file";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";

          // For existing files, show file metadata
          if (fieldData.type === "file" && fieldData.filename) {
            const fileInfo = document.createElement("div");
            fileInfo.className = "text-xs text-gray-400 mt-1";
            fileInfo.textContent = `Previous: ${fieldData.filename} (${
              fieldData.size
                ? CollectionRunnerUI.formatFileSize(fieldData.size)
                : "unknown size"
            })`;
            fieldDiv.appendChild(fileInfo);
          }
        } else if (fieldSchema.enum) {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          fieldSchema.enum.forEach((enumValue) => {
            const option = document.createElement("option");
            option.value = enumValue;
            option.textContent = enumValue;
            if (fieldData.type === "text" && fieldData.value === enumValue) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else if (fieldSchema.type === "boolean") {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          ["true", "false"].forEach((val) => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            if (fieldData.type === "text" && fieldData.value === val) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else {
          input = document.createElement("input");
          input.type = fieldSchema.type === "number" ? "number" : "text";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
        }

        input.name = fieldName;

        // Set value from saved data (except for file inputs)
        if (!isFileField && fieldData.type === "text" && fieldData.value) {
          input.value = fieldData.value;
        }

        // Set placeholder
        input.placeholder =
          fieldSchema.description || fieldSchema.example || "";
        if (isRequired) {
          input.required = true;
        }

        // Add input change listener for variable detection (except for file inputs)
        if (!isFileField) {
          input.addEventListener("input", () => {
            if (window.highlightVariablePlaceholders) {
              window.highlightVariablePlaceholders(input);
            }
          });
        }

        fieldDiv.appendChild(labelWrapper);
        fieldDiv.appendChild(input);
        formFieldsContainer.appendChild(fieldDiv);
      });
    } else {
      // Fallback to old behavior if no schema properties - show saved fields only
      Object.entries(multipartData).forEach(([key, fieldData]) => {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("label");
        label.innerHTML = `<span class="font-bold">${key}</span>`;
        labelWrapper.appendChild(label);

        let input;
        const isFileField = fieldData.type === "file";

        if (isFileField) {
          input = document.createElement("input");
          input.type = "file";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";

          if (fieldData.filename) {
            const fileInfo = document.createElement("div");
            fileInfo.className = "text-xs text-gray-400 mt-1";
            fileInfo.textContent = `Previous: ${fieldData.filename} (${
              fieldData.size
                ? CollectionRunnerUI.formatFileSize(fieldData.size)
                : "unknown size"
            })`;
            fieldDiv.appendChild(fileInfo);
          }
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          if (fieldData.value) {
            input.value = fieldData.value;
          }
        }

        input.name = key;

        // Add input change listener for variable detection (except for file inputs)
        if (!isFileField) {
          input.addEventListener("input", () => {
            if (window.highlightVariablePlaceholders) {
              window.highlightVariablePlaceholders(input);
            }
          });
        }

        fieldDiv.appendChild(labelWrapper);
        fieldDiv.appendChild(input);
        formFieldsContainer.appendChild(fieldDiv);
      });
    }
  }

  /**
   * Handle application/x-www-form-urlencoded content type display
   * @param {Object} request - The request object
   * @param {string} contentType - The content type
   */
  handleFormEncodedData(request, contentType) {
    // Hide Monaco editor and show form fields for form-encoded content
    const requestBodyEditorDiv = document.getElementById(
      "right-panel-request-body-editor"
    );
    if (requestBodyEditorDiv) {
      requestBodyEditorDiv.style.display = "none";
    }

    // Create or show form fields container
    let formFieldsContainer = document.getElementById("form-fields-container");
    if (!formFieldsContainer) {
      formFieldsContainer = document.createElement("div");
      formFieldsContainer.id = "form-fields-container";
      formFieldsContainer.className = "space-y-2";
      if (requestBodyEditorDiv) {
        requestBodyEditorDiv.parentNode.insertBefore(
          formFieldsContainer,
          requestBodyEditorDiv.nextSibling
        );
      }
    }

    // Clear previous form fields
    formFieldsContainer.innerHTML = "";
    formFieldsContainer.style.display = "block"; // Parse the URL-encoded body to populate form fields
    let formData = {};
    if (request.body) {
      try {
        const urlSearchParams = new URLSearchParams(request.body);
        urlSearchParams.forEach((value, key) => {
          formData[key] = value;
        });
      } catch (e) {
        console.warn("Failed to parse form-encoded body:", e);
      }
    }

    // Try to get schema information from the endpoint operation
    let schemaProperties = null;
    let requiredFields = [];

    const endpointOperation = this.findEndpointOperation(request);

    if (
      endpointOperation &&
      endpointOperation.requestBody &&
      endpointOperation.requestBody.content
    ) {
      const formSchemaInfo =
        endpointOperation.requestBody.content[
          "application/x-www-form-urlencoded"
        ];
      if (formSchemaInfo && formSchemaInfo.schema) {
        let resolvedSchema = formSchemaInfo.schema;

        // Resolve schema reference if needed
        if (formSchemaInfo.schema.$ref) {
          const refPath = formSchemaInfo.schema.$ref.split("/").slice(1);
          resolvedSchema = refPath.reduce(
            (acc, part) => acc && acc[part],
            window.swaggerData
          );
        }

        if (resolvedSchema && resolvedSchema.properties) {
          schemaProperties = resolvedSchema.properties;
          requiredFields = resolvedSchema.required || [];
        }
      }
    } // Generate ALL schema properties first (like query parameters), then populate with saved values
    if (schemaProperties) {
      Object.entries(schemaProperties).forEach(([fieldName, fieldSchema]) => {
        const savedValue = formData[fieldName] || ""; // Get saved value if exists, otherwise empty

        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("div");
        label.className = "flex items-center justify-between";
        const isRequired = requiredFields.includes(fieldName);

        const typeDisplay = window.formatTypeDisplay
          ? window.formatTypeDisplay(fieldSchema)
          : fieldSchema.type || "string";
        label.innerHTML = `<span class="font-bold">${fieldName}${
          isRequired ? '<span class="text-red-400 ml-0.5">*</span>' : ""
        }</span> <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${typeDisplay}</code>`;

        // Add description as tooltip if available
        if (fieldSchema.description) {
          label.title = fieldSchema.description;
        }

        labelWrapper.appendChild(label);

        let input;
        if (fieldSchema.enum) {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          fieldSchema.enum.forEach((enumValue) => {
            const option = document.createElement("option");
            option.value = enumValue;
            option.textContent = enumValue;
            if (savedValue === enumValue) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else if (fieldSchema.type === "boolean") {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          ["true", "false"].forEach((val) => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            if (savedValue === val) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else {
          input = document.createElement("input");
          input.type = fieldSchema.type === "number" ? "number" : "text";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          input.value = savedValue;
        }

        input.name = fieldName;
        input.placeholder =
          fieldSchema.description || fieldSchema.example || "";
        if (isRequired) {
          input.required = true;
        }

        // Add input change listener for variable detection
        input.addEventListener("input", () => {
          if (window.highlightVariablePlaceholders) {
            window.highlightVariablePlaceholders(input);
          }
        });

        fieldDiv.appendChild(labelWrapper);
        fieldDiv.appendChild(input);
        formFieldsContainer.appendChild(fieldDiv);
      });
    } else {
      // Fallback to old behavior if no schema properties - show saved fields only
      Object.entries(formData).forEach(([key, value]) => {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("label");
        label.innerHTML = `<span class="font-bold">${key}</span>`;
        labelWrapper.appendChild(label);

        const input = document.createElement("input");
        input.type = "text";
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
        input.value = value;
        input.name = key;

        // Add input change listener for variable detection
        input.addEventListener("input", () => {
          if (window.highlightVariablePlaceholders) {
            window.highlightVariablePlaceholders(input);
          }
        });

        fieldDiv.appendChild(labelWrapper);
        fieldDiv.appendChild(input);
        formFieldsContainer.appendChild(fieldDiv);
      });
    }
  }

  /**
   * Handle JSON and other content types display
   * @param {Object} request - The request object
   * @param {string} contentType - The content type
   */
  handleJSONOrOtherData(request, contentType) {
    // Hide form fields container

    const formFieldsContainer = document.getElementById(
      "form-fields-container"
    );
    if (formFieldsContainer) {
      formFieldsContainer.style.display = "none";
    }

    // Show Monaco editor
    const requestBodyEditorDiv = document.getElementById(
      "right-panel-request-body-editor"
    );
    if (requestBodyEditorDiv) {
      requestBodyEditorDiv.style.display = "block";
    }

    if (window.requestBodyEditor && request.body) {
      try {
        // Try to parse as JSON first
        const bodyObj =
          typeof request.body === "string"
            ? JSON.parse(request.body)
            : request.body;
        const formattedBody = JSON.stringify(bodyObj, null, 2);
        window.requestBodyEditor.setValue(formattedBody);
      } catch (e) {
        // If parsing fails, use as-is
        const bodyString =
          typeof request.body === "string"
            ? request.body
            : JSON.stringify(request.body);
        window.requestBodyEditor.setValue(bodyString);
      }
    }
  }

  /**
   * Find the endpoint operation for a request
   * @param {Object} request - The request object
   * @returns {Object|null} - The endpoint operation or null
   */
  findEndpointOperation(request) {
    if (!window.swaggerData || !window.swaggerData.paths) {
      return null;
    }

    const basePath = request.path ? request.path.split("?")[0] : "";
    const cleanBasePath = basePath.replace(/[{}]/g, "");

    try {
      for (const [path, methods] of Object.entries(window.swaggerData.paths)) {
        const cleanSwaggerPath = path.replace(/[{}]/g, "");
        if (
          cleanSwaggerPath === cleanBasePath &&
          methods[request.method.toLowerCase()]
        ) {
          return methods[request.method.toLowerCase()];
        }
      }
    } catch (error) {
      console.error("Error finding endpoint in Swagger data:", error);
    }

    return null;
  }
};


/* js/scrollToTop.js */
/**
 * Scroll to top functionality for the main content area
 */

class ScrollToTop {
  constructor() {
    this.scrollContainer = document.getElementById("api-main-content");
    this.scrollButton = document.getElementById("scroll-to-top");
    this.scrollThreshold = 200; // Show button after scrolling 200px

    this.init();
  }

  init() {
    if (!this.scrollContainer || !this.scrollButton) {
      console.warn("Scroll to top: Required elements not found");
      return;
    }

    this.bindEvents();
    this.setupTooltip();
  }

  bindEvents() {
    // Listen for scroll events on the main content container
    this.scrollContainer.addEventListener(
      "scroll",
      this.handleScroll.bind(this)
    );

    // Handle button click
    this.scrollButton.addEventListener("click", this.scrollToTop.bind(this));
  }

  setupTooltip() {
    // Add data-tooltip attribute for the existing tooltip system
    this.scrollButton.setAttribute("data-tooltip", "Scroll to top");

    // Add event listeners for the existing tooltip system
    this.scrollButton.addEventListener("mouseenter", handleTooltipMouseEnter);
    this.scrollButton.addEventListener("mouseleave", handleTooltipMouseLeave);
  }

  handleScroll() {
    const scrollTop = this.scrollContainer.scrollTop;
    if (scrollTop > this.scrollThreshold) {
      this.showButton();
    } else {
      this.hideButton();
    }
  }

  showButton() {
    this.scrollButton.classList.add("visible");
  }

  hideButton() {
    this.scrollButton.classList.remove("visible");
  }

  scrollToTop() {
    this.scrollContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

// Expose the class globally
window.ScrollToTop = ScrollToTop;

// Initialize scroll to top functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if the button exists at DOM load time
  const scrollButton = document.getElementById("scroll-to-top");
  if (scrollButton) {
    new ScrollToTop();
  }
});


/* js/demoMode.js */
// Demo Mode functionality for OpenAPI UI
// Allows users to select predefined specs or input custom JSON

class DemoMode {
  constructor() {
    this.isInitialized = false;
    this.predefinedSpecs = [];
    this.init();
  }
  async init() {
    if (this.isInitialized) return;

    try {
      await this.loadPredefinedSpecs();
      this.createDemoModeUI();
      this.setupEventListeners();
      this.isInitialized = true;

      // Auto-load the first available spec on init
      await this.autoLoadFirstSpec();
    } catch (error) {
      console.error("Error initializing demo mode:", error);
    }
  }
  async loadPredefinedSpecs() {
    try {
      // Load the list of available specs from demo-info.json
      const response = await fetch("demo-info.json");
      if (response.ok) {
        const demoInfo = await response.json();
        this.predefinedSpecs = demoInfo.sampleSpecs.map((spec) => ({
          name: spec.title,
          description: spec.description,
          file: `sample-specs/${spec.file}`,
        }));
      } else {
        // Fallback to hardcoded specs if demo-info.json is not available
        const specFiles = [
          {
            name: "Demonstration API",
            description:
              "A comprehensive API specification demonstrating various OpenAPI features",
            file: "sample-specs/sample-api.json",
          },
          {
            name: "Security Test API",
            description: "API specification with various security schemes",
            file: "sample-specs/test-security-swagger.json",
          },
        ];
        this.predefinedSpecs = specFiles;
      }
    } catch (error) {
      console.error("Error loading predefined specs:", error);
      // Fallback to hardcoded specs
      const specFiles = [
        {
          name: "Demonstration API",
          description:
            "A comprehensive API specification demonstrating various OpenAPI features",
          file: "sample-specs/sample-api.json",
        },
        {
          name: "Security Test API",
          description: "API specification with various security schemes",
          file: "sample-specs/test-security-swagger.json",
        },
      ];
      this.predefinedSpecs = specFiles;
    }
  }

  async autoLoadFirstSpec() {
    try {
      if (this.predefinedSpecs.length > 0) {
        const firstSpec = this.predefinedSpecs[0];
        console.log(`Auto-loading first spec: ${firstSpec.name}`);
        await this.loadPredefinedSpec(firstSpec.file);
      }
    } catch (error) {
      console.error("Error auto-loading first spec:", error);
      // If auto-load fails, just continue - user can manually select specs
    }
  }

  createDemoModeUI() {
    // Create demo mode button - positioned absolutely at top left
    const demoButton = document.createElement("button");
    demoButton.id = "demo-mode-btn";
    demoButton.style.top = "75px";
    demoButton.className =
      "fixed left-6 z-40 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center gap-2";
    demoButton.innerHTML = `
      <span class="text-sm font-medium">Demo</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
      </svg>
    `;
    demoButton.title =
      "Demo Mode - Try predefined API specs or load custom JSON";

    document.body.appendChild(demoButton);

    // Create demo mode modal
    this.createDemoModal();
  }

  createDemoModal() {
    const modal = document.createElement("div");
    modal.id = "demo-mode-modal";
    modal.className =
      "fixed inset-0 z-50 hidden bg-black bg-opacity-50 flex items-center justify-center p-4";

    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 class="text-xl font-semibold">Demo Mode - Load API Specification</h2>
          <button id="close-demo-modal" class="text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <div class="p-6">
            <!-- Tab Navigation -->
            <div class="flex border-b border-gray-700 mb-6">
              <button id="predefined-tab" class="px-4 py-2 text-sm font-medium  border-b-2 border-purple-500">
                Predefined Specs
              </button>
              <button id="custom-tab" class="px-4 py-2 text-sm font-medium text-gray-400 border-b-2 border-transparent">
                Custom JSON
              </button>
            </div>

            <!-- Predefined Specs Tab -->
            <div id="predefined-content" class="tab-content">
              <p class="text-gray-300 mb-4">Select one of the predefined API specifications to explore:</p>
              <div id="predefined-specs-list" class="space-y-3">
                <!-- Specs will be populated here -->
              </div>
            </div>

            <!-- Custom JSON Tab -->
            <div id="custom-content" class="tab-content hidden">
              <p class="text-gray-300 mb-4">Paste your OpenAPI/Swagger JSON specification below:</p>
              <div class="space-y-4">
                <textarea 
                  id="custom-json-input" 
                  class="w-full h-96 p-4 bg-gray-900 border border-gray-600 rounded-md text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Paste your OpenAPI/Swagger JSON here..."
                ></textarea>
                <div class="flex items-center space-x-2">
                  <button id="validate-json-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                    Validate JSON
                  </button>
                  <button id="load-custom-spec-btn" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm">
                    Load Specification
                  </button>
                  <span id="json-validation-status" class="text-sm"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.populatePredefinedSpecs();
  }

  populatePredefinedSpecs() {
    const container = document.getElementById("predefined-specs-list");
    if (!container) return;

    container.innerHTML = "";

    this.predefinedSpecs.forEach((spec, index) => {
      const specItem = document.createElement("div");
      specItem.className =
        "p-4 bg-gray-900 rounded-md border border-gray-600 hover:border-purple-500 cursor-pointer transition-colors";
      specItem.setAttribute("data-spec-file", spec.file);

      specItem.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium">${spec.name}</h3>
            <p class="text-gray-400 text-sm mt-1">${spec.description}</p>
          </div>
          <button class="load-predefined-spec-btn px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md">
            Load
          </button>
        </div>
      `;

      container.appendChild(specItem);
    });
  }
  setupEventListeners() {
    // Demo mode button
    const demoButton = document.getElementById("demo-mode-btn");
    if (demoButton) {
      demoButton.addEventListener("click", () => this.showDemoModal());
    }

    // Modal close
    const closeButton = document.getElementById("close-demo-modal");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.hideDemoModal());
    }

    // Modal backdrop click
    const modal = document.getElementById("demo-mode-modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.hideDemoModal();
        }
      });
    }

    // Tab switching
    const predefinedTab = document.getElementById("predefined-tab");
    const customTab = document.getElementById("custom-tab");

    if (predefinedTab) {
      predefinedTab.addEventListener("click", () =>
        this.switchTab("predefined")
      );
    }

    if (customTab) {
      customTab.addEventListener("click", () => this.switchTab("custom"));
    }

    // Predefined spec loading
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("load-predefined-spec-btn")) {
        const specItem = e.target.closest("[data-spec-file]");
        if (specItem) {
          const specFile = specItem.getAttribute("data-spec-file");
          this.loadPredefinedSpec(specFile);
        }
      }
    });

    // Custom JSON validation and loading
    const validateButton = document.getElementById("validate-json-btn");
    const loadCustomButton = document.getElementById("load-custom-spec-btn");

    if (validateButton) {
      validateButton.addEventListener("click", () => this.validateCustomJSON());
    }

    if (loadCustomButton) {
      loadCustomButton.addEventListener("click", () => this.loadCustomSpec());
    }

    // ESC key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideDemoModal();
      }
    });
  }

  showDemoModal() {
    const modal = document.getElementById("demo-mode-modal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  hideDemoModal() {
    const modal = document.getElementById("demo-mode-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    const predefinedTab = document.getElementById("predefined-tab");
    const customTab = document.getElementById("custom-tab");
    const predefinedContent = document.getElementById("predefined-content");
    const customContent = document.getElementById("custom-content");

    if (tabName === "predefined") {
      predefinedTab.classList.add("border-purple-500");
      predefinedTab.classList.remove("text-gray-400", "border-transparent");
      customTab.classList.add("text-gray-400", "border-transparent");
      customTab.classList.remove("border-purple-500");

      predefinedContent.classList.remove("hidden");
      customContent.classList.add("hidden");
    } else {
      customTab.classList.add("border-purple-500");
      customTab.classList.remove("text-gray-400", "border-transparent");
      predefinedTab.classList.add("text-gray-400", "border-transparent");
      predefinedTab.classList.remove("border-purple-500");

      customContent.classList.remove("hidden");
      predefinedContent.classList.add("hidden");
    }
  }

  async loadPredefinedSpec(specFile) {
    try {
      window.utils.showToast("Loading API specification...", "info");

      const response = await fetch(specFile);
      if (!response.ok) {
        throw new Error(`Failed to load spec: ${response.status}`);
      }

      const specData = await response.json();
      await this.applyNewSpec(specData, `Loaded predefined spec: ${specFile}`);
    } catch (error) {
      console.error("Error loading predefined spec:", error);
      window.utils.showToast("Error loading predefined specification", "error");
    }
  }

  validateCustomJSON() {
    const textarea = document.getElementById("custom-json-input");
    const statusElement = document.getElementById("json-validation-status");

    if (!textarea || !statusElement) return;

    const jsonText = textarea.value.trim();

    if (!jsonText) {
      statusElement.textContent = "Please enter JSON content";
      statusElement.className = "text-sm text-yellow-400";
      return false;
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Basic OpenAPI validation
      if (!parsed.openapi && !parsed.swagger) {
        statusElement.textContent = "Warning: No OpenAPI/Swagger version found";
        statusElement.className = "text-sm text-yellow-400";
        return false;
      }

      if (!parsed.info || !parsed.info.title) {
        statusElement.textContent =
          "Warning: Missing required info.title field";
        statusElement.className = "text-sm text-yellow-400";
        return false;
      }

      statusElement.textContent = "Valid JSON structure";
      statusElement.className = "text-sm text-green-400";
      return true;
    } catch (error) {
      statusElement.textContent = `Invalid JSON: ${error.message}`;
      statusElement.className = "text-sm text-red-400";
      return false;
    }
  }

  async loadCustomSpec() {
    const textarea = document.getElementById("custom-json-input");
    if (!textarea) return;

    const jsonText = textarea.value.trim();

    if (!jsonText) {
      window.utils.showToast("Please enter JSON content", "error");
      return;
    }

    try {
      const specData = JSON.parse(jsonText);
      await this.applyNewSpec(specData, "Loaded custom JSON specification");
    } catch (error) {
      console.error("Error loading custom spec:", error);
      window.utils.showToast("Invalid JSON format", "error");
    }
  }

  async applyNewSpec(specData, successMessage) {
    try {
      // Clear current state
      this.clearCurrentState();

      // Apply new swagger data
      setSwaggerData(specData);

      // Dispatch event that new swagger data has been loaded
      document.dispatchEvent(
        new CustomEvent("swaggerDataLoaded", { detail: specData })
      );

      // Update API title and version in CollectionRunner
      if (
        specData.info &&
        specData.info.title &&
        specData.info.version &&
        window.collectionRunner
      ) {
        window.collectionRunner.apiTitle = specData.info.title;
        window.collectionRunner.apiVersion = specData.info.version;
      }

      // Update base URL
      if (typeof updateBaseUrl === "function") {
        updateBaseUrl(specData);
      }

      // Initialize security configuration
      if (
        window.auth &&
        typeof window.auth.initializeSecurityConfig === "function"
      ) {
        window.auth.initializeSecurityConfig(specData);
        window.auth.initAuth();
      }

      // Rebuild UI
      buildSidebar();
      buildMainContent();

      // Select first endpoint
      setTimeout(() => {
        const firstEndpointLink = document.querySelector(".endpoint-link");
        if (firstEndpointLink) {
          firstEndpointLink.click();
        }
      }, 100);

      // Hide modal and show success message
      this.hideDemoModal();
      window.utils.showToast(successMessage, "success");
    } catch (error) {
      console.error("Error applying new spec:", error);
      window.utils.showToast("Error applying specification", "error");
    }
  }
  clearCurrentState() {
    // Clear main content
    const mainContent = document.getElementById("api-main-content");
    if (mainContent) {
      mainContent.innerHTML = "";
    }

    // Clear sidebar
    const sidebar = document.getElementById("endpoint-list");
    if (sidebar) {
      sidebar.innerHTML = "";
    }

    // Clear right panel
    const rightPanel = document.getElementById("api-right-panel");
    if (rightPanel) {
      rightPanel.innerHTML = "";
    }

    // Clear auth section content
    const authSectionContent = document.querySelector("#auth-section .p-6");
    if (authSectionContent) {
      // Keep the title but remove all dynamically generated content
      authSectionContent.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-lg">Authentication</h2>
        </div>
        <!-- Security scheme content will be dynamically inserted here -->
      `;
    }

    // Reset any active states
    document.querySelectorAll(".endpoint-link.active").forEach((el) => {
      el.classList.remove("active");
    });
  }
}

// Initialize demo mode when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.demoMode = new DemoMode();
});

// Make it globally available
window.DemoMode = DemoMode;


/* js/app.js */
// Main application file
// All modules are now loaded separately in index.html

// Initialize theme manager immediately
if (typeof initThemeManager === "function") {
  initThemeManager();
}

// Set up Monaco theme listener once Monaco setup is available
document.addEventListener("DOMContentLoaded", () => {
  if (
    window.monacoSetup &&
    typeof window.monacoSetup.setupMonacoThemeListener === "function"
  ) {
    window.monacoSetup.setupMonacoThemeListener();
  }
});

// The toggleResponseCode function is already defined in utils.js and available globally
// URL hash navigation: The app supports navigation to specific endpoints via URL hashes
// Format: #method-path (e.g., #get-/api/users)

// Initialize the Collection Runner UI when DOM is loaded
document.addEventListener("swaggerDataLoaded", () => {
  // First initialize the Collection Runner core
  if (window.CollectionRunner) {
    window.collectionRunner = new window.CollectionRunner();
  }

  // Then initialize other components
  window.responseDetails.initResponseDetailsHandlers();

  // Finally initialize the Collection Runner UI
  if (window.CollectionRunnerUI) {
    window.collectionRunnerUI = new window.CollectionRunnerUI();

    // Initialize the collection action buttons if in the Try-it-out section
    const tryItOutSection = document.getElementById("try-it-out-section");
    if (tryItOutSection && tryItOutSection.classList.contains("active")) {
      window.collectionRunnerUI.setupTryItOutActionButtons(false);
    }
  }
  // Handle initial URL hash navigation after UI is built
  // This ensures that if there's a hash in the URL, the corresponding endpoint is navigated to
  if (
    window.location.hash &&
    typeof window.navigateToEndpointFromHash === "function"
  ) {
    // Add a small delay to ensure all DOM elements are fully rendered
    setTimeout(window.navigateToEndpointFromHash, 200);
  }
});

// Add an additional event listener to ensure favorites are properly initialized
// after the DOM is fully loaded and rendered
document.addEventListener("swaggerDataLoaded", () => {
  if (
    window.favorites &&
    typeof window.favorites.updateFavoritesUI === "function"
  ) {
    window.favorites.updateFavoritesUI();
  }
});


