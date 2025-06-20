// Schema Type Popover functionality for interactive schema exploration

// Global popover instance
let currentPopover = null;
let popoverTimeout = null;

/**
 * Enhanced formatTypeDisplay that creates interactive elements for custom types
 */
function formatTypeDisplayWithPopovers(schema, level = 0) {
  if (!schema || !schema.type) return "unknown";

  if (schema.type === "array" && schema.items) {
    let itemType = "unknown";
    let isCustomType = false;

    if (schema.items.type) {
      // Direct type
      itemType = schema.items.type;
    } else if (schema.items.$ref) {
      // Reference to custom schema - extract the type name from the $ref
      const refParts = schema.items.$ref.split("/");
      itemType = refParts[refParts.length - 1]; // Get the last part after the last '/'
      isCustomType = true;
    }

    if (isCustomType) {
      // Create interactive span for custom types
      return `<span class="schema-type-interactive" data-schema-ref="${schema.items.$ref}" data-type-name="${itemType}" data-level="${level}">${itemType}</span>[]`;
    }

    return `${itemType}[]`;
  }

  // Handle direct schema references
  if (schema.$ref) {
    const refParts = schema.$ref.split("/");
    const typeName = refParts[refParts.length - 1];
    return `<span class="schema-type-interactive" data-schema-ref="${schema.$ref}" data-type-name="${typeName}" data-level="${level}">${typeName}</span>`;
  }

  return schema.type;
}

/**
 * Resolve a schema reference to get the actual schema definition
 */
function resolveSchemaReference(schemaRef) {
  if (!schemaRef || !window.swaggerData) return null;

  const refPath = schemaRef.split("/").slice(1); // Remove #
  return refPath.reduce((acc, part) => acc && acc[part], window.swaggerData);
}

/**
 * Build popover content for a schema
 */
function buildSchemaPopoverContent(schema, typeName, level = 0) {
  if (!schema) {
    return `<div class="text-red-500 text-sm">Could not resolve schema for ${typeName}</div>`;
  }

  let content = `
    <div class="schema-popover-content">
      <div class="schema-popover-header">
        <span class="schema-type-name">${typeName}</span>
        ${
          schema.description
            ? `<div class="schema-description">${schema.description}</div>`
            : ""
        }
      </div>
  `;

  if (schema.type === "object" && schema.properties) {
    const requiredFields = schema.required || [];
    const propertyCount = Object.keys(schema.properties).length;

    content += `
      <div class="schema-properties">
        <div class="schema-properties-header">Properties (${propertyCount})</div>
        <div class="schema-properties-list">
    `;

    Object.entries(schema.properties).forEach(([propName, propSchema]) => {
      const isRequired = requiredFields.includes(propName);

      // Resolve property schema if it's a reference
      let resolvedPropSchema = propSchema;
      if (propSchema.$ref) {
        const refPath = propSchema.$ref.split("/").slice(1);
        resolvedPropSchema = refPath.reduce(
          (acc, part) => acc && acc[part],
          window.swaggerData
        );
      } // Build validation rules for this property
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

      content += `
        <div class="schema-property">
          <div class="schema-property-header">
            <div class="schema-property-name">
              ${propName}${
        isRequired ? '<span class="required-indicator">*</span>' : ""
      }
            </div>
            <div class="schema-property-type">
              ${formatTypeDisplayWithPopovers(resolvedPropSchema, level + 1)}
            </div>
          </div>
          ${
            resolvedPropSchema?.description
              ? `<div class="schema-property-description">${resolvedPropSchema.description}</div>`
              : ""
          }
          ${
            validationRules.length > 0
              ? `<div class="schema-property-validation">
                  <div class="validation-header">Validation:</div>
                  <ul class="validation-list">
                    ${validationRules
                      .map((rule) => `<li>${rule}</li>`)
                      .join("")}
                  </ul>
                </div>`
              : ""
          }
        </div>
      `;
    });

    content += `
        </div>
      </div>
    `;
  } else if (schema.type === "array" && schema.items) {
    content += `
      <div class="schema-array-info">
        <span class="schema-array-label">Array of:</span>
        <span class="schema-array-type">${formatTypeDisplayWithPopovers(
          schema.items,
          level + 1
        )}</span>
      </div>
    `;
  } else {
    // Primitive type or simple schema
    content += `
      <div class="schema-primitive-info">
        <span class="schema-primitive-type">${schema.type}</span>
        ${
          schema.format
            ? `<span class="schema-format">(${schema.format})</span>`
            : ""
        }
      </div>
    `;
  }

  content += `</div>`;
  return content;
}

/**
 * Create and show popover
 */
function showSchemaPopover(element, schemaRef, typeName, level) {
  // Clear any existing timeout
  if (popoverTimeout) {
    clearTimeout(popoverTimeout);
    popoverTimeout = null;
  }

  // Don't show popover if we're already at a deep level to prevent infinite nesting
  if (level > 2) return;

  // Resolve the schema
  const schema = resolveSchemaReference(schemaRef);
  if (!schema) return;

  // Remove existing popover
  hideSchemaPopover();

  // Create popover element
  const popover = document.createElement("div");
  popover.className = "schema-popover";
  popover.innerHTML = buildSchemaPopoverContent(schema, typeName, level);

  // Add to document
  document.body.appendChild(popover);
  currentPopover = popover;

  // Position popover
  const rect = element.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();

  let left = rect.left + rect.width / 2 - popoverRect.width / 2;
  let top = rect.bottom + 8;

  // Adjust if popover goes off screen
  if (left < 8) left = 8;
  if (left + popoverRect.width > window.innerWidth - 8) {
    left = window.innerWidth - popoverRect.width - 8;
  }
  if (top + popoverRect.height > window.innerHeight - 8) {
    top = rect.top - popoverRect.height - 8;
  }

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;

  // Show popover with animation
  requestAnimationFrame(() => {
    popover.classList.add("show");
  });

  // Add event listeners to interactive elements within the popover
  addPopoverEventListeners(popover);
}

/**
 * Hide popover
 */
function hideSchemaPopover() {
  if (currentPopover) {
    currentPopover.classList.remove("show");
    setTimeout(() => {
      if (currentPopover && currentPopover.parentNode) {
        currentPopover.parentNode.removeChild(currentPopover);
      }
      currentPopover = null;
    }, 200);
  }
}

/**
 * Add event listeners to interactive elements in popover
 */
function addPopoverEventListeners(container) {
  const interactiveElements = container.querySelectorAll(
    ".schema-type-interactive"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", (e) => {
      const schemaRef = e.target.getAttribute("data-schema-ref");
      const typeName = e.target.getAttribute("data-type-name");
      const level = parseInt(e.target.getAttribute("data-level") || "0");

      popoverTimeout = setTimeout(() => {
        showSchemaPopover(e.target, schemaRef, typeName, level);
      }, 500); // Show nested popover after 500ms delay
    });

    element.addEventListener("mouseleave", () => {
      if (popoverTimeout) {
        clearTimeout(popoverTimeout);
        popoverTimeout = null;
      }
    });
  });
}

/**
 * Initialize schema popover functionality
 */
function initializeSchemaPopovers() {
  // Add global event listener for interactive schema types
  document.addEventListener(
    "mouseenter",
    (e) => {
      if (
        e.target &&
        e.target.classList &&
        e.target.classList.contains("schema-type-interactive")
      ) {
        const schemaRef = e.target.getAttribute("data-schema-ref");
        const typeName = e.target.getAttribute("data-type-name");
        const level = parseInt(e.target.getAttribute("data-level") || "0");

        popoverTimeout = setTimeout(() => {
          showSchemaPopover(e.target, schemaRef, typeName, level);
        }, 300); // Show popover after 300ms delay
      }
    },
    true
  );
  document.addEventListener(
    "mouseleave",
    (e) => {
      if (
        e.target &&
        e.target.classList &&
        e.target.classList.contains("schema-type-interactive")
      ) {
        if (popoverTimeout) {
          clearTimeout(popoverTimeout);
          popoverTimeout = null;
        }

        // Hide popover after a short delay to allow moving to popover
        setTimeout(() => {
          if (
            currentPopover &&
            !currentPopover.matches(":hover") &&
            e.target &&
            e.target.matches &&
            !e.target.matches(":hover")
          ) {
            hideSchemaPopover();
          }
        }, 100);
      }
    },
    true
  );
  // Keep popover open when hovering over it
  document.addEventListener(
    "mouseenter",
    (e) => {
      if (e.target && e.target.closest && e.target.closest(".schema-popover")) {
        if (popoverTimeout) {
          clearTimeout(popoverTimeout);
          popoverTimeout = null;
        }
      }
    },
    true
  );
  document.addEventListener(
    "mouseleave",
    (e) => {
      if (e.target && e.target.closest && e.target.closest(".schema-popover")) {
        setTimeout(() => {
          if (
            currentPopover &&
            currentPopover.matches &&
            !currentPopover.matches(":hover")
          ) {
            hideSchemaPopover();
          }
        }, 300);
      }
    },
    true
  );
  // Hide popover when clicking outside
  document.addEventListener("click", (e) => {
    if (
      e.target &&
      (!e.target.closest || !e.target.closest(".schema-popover")) &&
      (!e.target.classList ||
        !e.target.classList.contains("schema-type-interactive"))
    ) {
      hideSchemaPopover();
    }
  });
}

// Make functions available globally
window.formatTypeDisplayWithPopovers = formatTypeDisplayWithPopovers;
window.initializeSchemaPopovers = initializeSchemaPopovers;

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSchemaPopovers);
} else {
  initializeSchemaPopovers();
}
