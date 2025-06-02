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
