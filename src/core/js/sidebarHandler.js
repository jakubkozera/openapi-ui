// Function to filter sidebar navigation based on search term
function filterSidebar(searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const navigation = document.getElementById("api-navigation");
  if (!navigation) return;
  // Check if there are active HTTP verb filters (now using multi-select)
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";

  // Get selected HTTP verbs from local storage
  let activeVerbFilters = [];
  const savedVerbs = localStorage.getItem(`${apiPrefix}_selected_http_verbs`);
  if (savedVerbs) {
    try {
      activeVerbFilters = JSON.parse(savedVerbs);
    } catch (e) {
      console.error("Error parsing saved HTTP verbs:", e);
      activeVerbFilters = [];
    }
  }

  const tagSections = navigation.querySelectorAll("#api-navigation > div.mt-2");

  tagSections.forEach((tagSection) => {
    const tagHeader = tagSection.querySelector("a");
    const tagNameElement = tagHeader
      ? tagHeader.querySelector("span:first-child")
      : null;
    const tagName = tagNameElement
      ? tagNameElement.textContent.toLowerCase()
      : "";
    const endpointsContainer = tagSection.querySelector(".endpoints-container");
    const endpointLinks = endpointsContainer
      ? endpointsContainer.querySelectorAll(".endpoint-link")
      : [];
    const arrow = tagHeader ? tagHeader.querySelector("svg") : null;

    if (!endpointsContainer) return; // Safety check

    if (lowerSearchTerm === "") {
      tagSection.style.display = "";
      if (endpointsContainer) {
        endpointsContainer.style.maxHeight = null; // Reset max-height
        endpointsContainer.classList.remove("expanded"); // Collapse using class
      }
      if (tagHeader) tagHeader.classList.remove("bg-gray-200");
      if (arrow) arrow.classList.remove("rotate-90");

      // If we have verb filters but no search term, still apply verb filtering
      if (activeVerbFilters.length > 0) {
        endpointLinks.forEach((link) => {
          const method = link.dataset.method
            ? link.dataset.method.toLowerCase()
            : "";
          const matchesVerbFilter = activeVerbFilters.includes(method);
          link.style.display = matchesVerbFilter ? "" : "none";
        });

        // Check if any endpoints are visible
        const visibleEndpoints = Array.from(endpointLinks).filter(
          (link) => link.style.display !== "none"
        );
        if (visibleEndpoints.length > 0) {
          // Expand this section
          endpointsContainer.classList.add("expanded");
          if (arrow) arrow.classList.add("rotate-90");
          endpointsContainer.style.maxHeight =
            endpointsContainer.scrollHeight + 50 + "px";
        }
      } else {
        // No verb filters and no search, show all
        endpointLinks.forEach((link) => (link.style.display = ""));
      }
    } else {
      let atLeastOneEndpointVisibleInTag = false;
      endpointLinks.forEach((link) => {
        const method = link.dataset.method
          ? link.dataset.method.toLowerCase()
          : "";
        const path = link.dataset.path ? link.dataset.path.toLowerCase() : "";
        const methodBadgeText = link.querySelector("span")
          ? link.querySelector("span").textContent
          : "";
        const summary = link.textContent
          .replace(methodBadgeText, "")
          .trim()
          .toLowerCase();

        // Check if the endpoint matches both search term and active verb filters (if any)
        const matchesSearch =
          method.includes(lowerSearchTerm) ||
          path.includes(lowerSearchTerm) ||
          summary.includes(lowerSearchTerm);

        // With multiple verb filters, check if method is in the list of active filters
        const matchesVerbFilter =
          activeVerbFilters.length === 0 || activeVerbFilters.includes(method);

        if (matchesSearch && matchesVerbFilter) {
          link.style.display = "";
          atLeastOneEndpointVisibleInTag = true;
        } else {
          link.style.display = "none";
        }
      });

      if (tagName.includes(lowerSearchTerm) || atLeastOneEndpointVisibleInTag) {
        tagSection.style.display = "";
        if (endpointsContainer) {
          // Expanding due to search
          endpointsContainer.style.maxHeight =
            endpointsContainer.scrollHeight + "px";
          endpointsContainer.classList.add("expanded"); // Expand using class
        }
        if (tagHeader) tagHeader.classList.add("bg-gray-200");
        if (arrow) arrow.classList.add("rotate-90");
      } else {
        tagSection.style.display = "none";
        if (endpointsContainer) {
          endpointsContainer.style.maxHeight = null; // Reset max-height
          endpointsContainer.classList.remove("expanded"); // Collapse if tag section is hidden
        }
        // Ensure styling is reset if tag section is hidden by search
        if (tagHeader) tagHeader.classList.remove("bg-gray-200");
        if (arrow) arrow.classList.remove("rotate-90");
      }
    }
  });
}

// Function to build the sidebar
function buildSidebar() {
  if (!swaggerData || !swaggerData.paths) return;

  const navigation = document.getElementById("api-navigation");
  if (!navigation) return;
  navigation.innerHTML = ""; // Clear existing sidebar

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
      pathsByTag[tag].push({
        path,
        method,
        summary: operation.summary || path,
      });
    }
  }

  // Maintain the order of tags as specified in swagger.json, then add any untagged
  const sortedTags = [...tagsOrder];
  for (const tag in pathsByTag) {
    if (!sortedTags.includes(tag)) {
      sortedTags.push(tag);
    }
  }

  sortedTags.forEach((tag) => {
    if (!pathsByTag[tag] || pathsByTag[tag].length === 0) return;

    const tagSection = document.createElement("div");
    tagSection.className = "mt-2";

    const tagHeader = document.createElement("a");
    tagHeader.href = "#";
    tagHeader.className =
      "tag-header flex items-center px-6 py-3 text-gray-700 ;"; // Removed bg-gray-200 for non-active
    const sectionCount = pathsByTag[tag].length;
    tagHeader.innerHTML = `
            <div class="flex items-center flex-grow">
              <span class="ml-1">${tag}</span>
              <span class="endpoint-count ml-2">${sectionCount}</span>
            </div>
            <span class="ml-auto">
                <svg class="w-4 h-4 text-gray-400 transform sidebar-arrow" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
            </span>
        `;
    const endpointsContainer = document.createElement("div");
    endpointsContainer.className = "endpoints-container pl-3 pr-4 py-1";
    // Ensure it starts collapsed with explicit style
    endpointsContainer.style.maxHeight = "0px";
    tagHeader.addEventListener("click", (e) => {
      e.preventDefault();
      const arrow = tagHeader.querySelector("svg");

      if (endpointsContainer.classList.contains("expanded")) {
        // Collapsing
        endpointsContainer.classList.remove("expanded");
        tagHeader.classList.remove("bg-gray-200");
        if (arrow) arrow.classList.remove("rotate-90");
        // Set a specific height of 0 to ensure collapse
        endpointsContainer.style.maxHeight = "0px";
      } else {
        // Expanding
        endpointsContainer.classList.add("expanded");
        tagHeader.classList.add("bg-gray-200");
        if (arrow) arrow.classList.add("rotate-90");
        // Set max-height explicitly to content height + buffer
        const contentHeight = endpointsContainer.scrollHeight;
        endpointsContainer.style.maxHeight = `${contentHeight + 50}px`;
      }
    });

    // Populate endpoints container based on view mode
    if (viewMode === "list") {
      // List view (original implementation)
      buildListView(pathsByTag[tag], endpointsContainer);
    } else {
      // Tree view (hierarchical implementation)
      buildTreeView(pathsByTag[tag], endpointsContainer);
    }

    tagSection.appendChild(tagHeader);
    tagSection.appendChild(endpointsContainer);
    navigation.appendChild(tagSection);
  });
}

// Functions are now globally available
