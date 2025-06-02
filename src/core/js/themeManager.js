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
