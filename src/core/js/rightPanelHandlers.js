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
