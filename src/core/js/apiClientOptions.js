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
