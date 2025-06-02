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
