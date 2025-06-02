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
