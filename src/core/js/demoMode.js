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
