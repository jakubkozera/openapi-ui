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
