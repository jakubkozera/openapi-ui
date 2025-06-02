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
