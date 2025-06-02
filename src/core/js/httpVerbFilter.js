// HTTP Verb Filter functionality
let httpVerbsPopupVisible = false;
let selectedVerbs = new Set(); // Track selected HTTP verbs

// Function to extract all HTTP verbs from the loaded OpenAPI spec
function extractAvailableHttpVerbs() {
  const availableVerbs = new Set(); // If data isn't available, use fallback methods
  if (!window.swaggerData) {
    console.error("swaggerData is not available, using fallback methods");

    // Fallback to common HTTP methods - apiLoader.js will handle the actual loading
    return ["GET", "POST", "PUT", "DELETE", "PATCH"];
  }

  if (!window.swaggerData.paths) {
    console.error("swaggerData.paths is not available:", window.swaggerData);
    // Add some default methods for testing
    return ["GET", "POST", "PUT", "DELETE", "PATCH"];
  }
  const paths = window.swaggerData.paths;

  // Iterate through all paths and methods
  for (const path in paths) {
    for (const method in paths[path]) {
      // Convert to uppercase (GET, POST, etc.)
      availableVerbs.add(method.toUpperCase());
    }
  }

  const result = Array.from(availableVerbs).sort();
  return result;
}

// Load selected verbs from localStorage
function loadSelectedVerbs() {
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";

  const savedVerbs = localStorage.getItem(`${apiPrefix}_selected_http_verbs`);
  if (savedVerbs) {
    try {
      const parsedVerbs = JSON.parse(savedVerbs);
      selectedVerbs = new Set(parsedVerbs);
    } catch (e) {
      console.error("Error parsing saved HTTP verbs:", e);
      selectedVerbs = new Set();
    }
  } else {
    selectedVerbs = new Set();
  }
}

// Save selected verbs to localStorage
function saveSelectedVerbs() {
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";

  localStorage.setItem(
    `${apiPrefix}_selected_http_verbs`,
    JSON.stringify(Array.from(selectedVerbs))
  );
}

// Toggle individual HTTP verb selection
function toggleVerb(verbPill) {
  const verb = verbPill.dataset.verb.toLowerCase();

  // Toggle selection state
  if (selectedVerbs.has(verb)) {
    selectedVerbs.delete(verb);
    verbPill.classList.remove("selected");
  } else {
    selectedVerbs.add(verb);
    verbPill.classList.add("selected");
  }

  // If any verbs are selected, ALL should not be selected
  const allPill = document.querySelector(".http-verb-pill.all");
  if (allPill) {
    if (selectedVerbs.size > 0) {
      allPill.classList.remove("selected");
    } else {
      allPill.classList.add("selected");
    }
  }
}

// Toggle all verbs on/off
function toggleAllVerbs(allPill) {
  const verbPills = document.querySelectorAll(".http-verb-pill:not(.all)");

  // If we're selecting ALL (which means deselecting all individual verbs)
  if (!allPill.classList.contains("selected")) {
    // Clear all selections and select the ALL pill
    selectedVerbs.clear();
    allPill.classList.add("selected");

    // Deselect all other pills
    verbPills.forEach((pill) => {
      pill.classList.remove("selected");
    });
  }
}

// Clear all selected verbs
function clearAllVerbs() {
  selectedVerbs.clear();

  // Update UI to show ALL selected
  const allPill = document.querySelector(".http-verb-pill.all");
  const verbPills = document.querySelectorAll(".http-verb-pill:not(.all)");

  if (allPill) {
    allPill.classList.add("selected");
  }

  verbPills.forEach((pill) => {
    pill.classList.remove("selected");
  });
  // Clear from localStorage as well
  const apiPrefix =
    window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";
  localStorage.removeItem(`${apiPrefix}_selected_http_verbs`);

  // Reset the filter button state
  updateFilterButtonState();
}

// Apply the current verb filter selection
function applyVerbFilters() {
  // Save selected verbs to localStorage
  saveSelectedVerbs();

  // Apply filtering
  filterSidebarByHttpVerbs();

  // Force opacity update on all expanded containers to ensure endpoints are visible
  setTimeout(() => {
    document
      .querySelectorAll(".endpoints-container.expanded")
      .forEach((container) => {
        // This forces a repaint of the container, ensuring opacity is applied
        container.style.opacity = "1";
        container.style.visibility = "visible";
      });
  }, 50);

  // Close the popup
  toggleHttpVerbsPopup();
}

// Function to populate the HTTP verbs popup with pills
function populateHttpVerbsPopup() {
  const popup = document.getElementById("http-verbs-popup");

  if (!popup) {
    console.error("HTTP verbs popup element not found!");
    return;
  }

  // Load saved selections
  loadSelectedVerbs();

  // Ensure we have a valid selectedVerbs set
  if (!selectedVerbs) {
    selectedVerbs = new Set();
  }

  const verbs = extractAvailableHttpVerbs();
  const pillsContainer = popup.querySelector(".http-verb-pills-container");

  if (!pillsContainer) {
    console.error("Pills container not found!");
    return;
  }

  // Clear previous content
  pillsContainer.innerHTML = "";
  // Add "ALL" pill
  const allPill = document.createElement("button");
  allPill.className = `http-verb-pill all ${
    selectedVerbs.size === 0 ? "selected" : ""
  }`;
  allPill.textContent = "ALL";
  allPill.dataset.verb = "all";

  allPill.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAllVerbs(allPill);
  });

  pillsContainer.appendChild(allPill);

  // Add each available HTTP verb as a pill
  verbs.forEach((verb) => {
    const verbPill = document.createElement("button");
    verbPill.dataset.verb = verb.toLowerCase();

    // Check if this verb is currently selected
    const isSelected = selectedVerbs.has(verb.toLowerCase());

    // Assign color class based on the HTTP verb
    verbPill.className = `http-verb-pill ${verb.toLowerCase()} ${
      isSelected ? "selected" : ""
    }`;
    verbPill.textContent = verb;

    verbPill.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVerb(verbPill);
    });

    pillsContainer.appendChild(verbPill);
  });

  // Set up clear and apply buttons
  const clearButton = document.getElementById("clear-verb-filters");
  const applyButton = document.getElementById("apply-verb-filters");

  if (clearButton) {
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      clearAllVerbs();
    });
  }

  if (applyButton) {
    applyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      applyVerbFilters();
    });
  }
}

// Function to toggle the HTTP verbs popup
function toggleHttpVerbsPopup() {
  const popup = document.getElementById("http-verbs-popup");

  if (!popup) return;

  httpVerbsPopupVisible = !httpVerbsPopupVisible;

  if (httpVerbsPopupVisible) {
    popup.classList.remove("hidden");
    populateHttpVerbsPopup();
  } else {
    popup.classList.add("hidden");
  }
}

// Function to filter sidebar by multiple HTTP verbs
function filterSidebarByHttpVerbs() {
  // Get all endpoint links
  const endpointLinks = document.querySelectorAll(".endpoint-link");

  // Get current search term
  const searchInput = document.getElementById("sidebar-search");
  const currentSearchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  // Update filter button state
  updateFilterButtonState();

  // If no verbs are selected (ALL is active), reset filtering but respect search term
  if (selectedVerbs.size === 0) {
    // Remove any stored verb filter since we're clearing filters
    const apiPrefix =
      window.swaggerData?.info?.title && window.swaggerData?.info?.version
        ? `${window.swaggerData.info.title
            .toLowerCase()
            .replace(/\s+/g, "_")}_${window.swaggerData.info.version
            .toLowerCase()
            .replace(/\s+/g, "_")}`
        : "openapi_ui_default";
    localStorage.removeItem(`${apiPrefix}_selected_http_verbs`);

    if (currentSearchTerm) {
      // Reapply search filter without verb filter
      filterSidebar(currentSearchTerm);
    } else {
      // Show all endpoints if no search term
      endpointLinks.forEach((link) => {
        link.style.display = "";
      });

      // Make sure all tags with visible endpoints are expanded
      const tagSections = document.querySelectorAll(
        "#api-navigation > div.mt-2"
      );
      tagSections.forEach((tagSection) => {
        tagSection.style.display = "";
        const endpointsContainer = tagSection.querySelector(
          ".endpoints-container"
        );
        if (endpointsContainer) {
          // Add the expanded class to set opacity to 1
          endpointsContainer.classList.add("expanded");
          endpointsContainer.style.maxHeight =
            endpointsContainer.scrollHeight + 50 + "px";

          // Also rotate the arrow to show the section is expanded
          const arrow = tagSection.querySelector("svg.sidebar-arrow");
          if (arrow) arrow.classList.add("rotate-90");
        }
      });
    }
    return;
  }

  // Show only endpoints matching both any selected HTTP verbs and search term if present
  endpointLinks.forEach((link) => {
    const method = link.dataset.method.toLowerCase();
    const path = link.dataset.path ? link.dataset.path.toLowerCase() : "";
    const methodBadgeText = link.querySelector("span")
      ? link.querySelector("span").textContent
      : "";
    const summary = link.textContent
      .replace(methodBadgeText, "")
      .trim()
      .toLowerCase();

    const matchesVerb = selectedVerbs.has(method);
    const matchesSearch =
      !currentSearchTerm ||
      path.includes(currentSearchTerm) ||
      summary.includes(currentSearchTerm) ||
      method.includes(currentSearchTerm);

    if (matchesVerb && matchesSearch) {
      link.style.display = "";
    } else {
      link.style.display = "none";
    }
  });

  // For each tag section, check if it has any visible endpoints
  const tagSections = document.querySelectorAll("#api-navigation > div.mt-2");
  tagSections.forEach((tagSection) => {
    const endpointsContainer = tagSection.querySelector(".endpoints-container");
    const visibleEndpoints = endpointsContainer
      ? Array.from(
          endpointsContainer.querySelectorAll(".endpoint-link")
        ).filter((link) => link.style.display !== "none")
      : [];

    if (visibleEndpoints.length > 0) {
      tagSection.style.display = "";
      // Expand the section to show visible endpoints
      if (endpointsContainer) {
        endpointsContainer.classList.add("expanded");
        const arrow = tagSection.querySelector("svg.sidebar-arrow");
        if (arrow) arrow.classList.add("rotate-90");
        endpointsContainer.style.maxHeight =
          endpointsContainer.scrollHeight + 50 + "px";
      }
    } else {
      tagSection.style.display = "none";
    }
  });
}

// Initialize HTTP verb filter
function initHttpVerbFilter() {
  const filterButton = document.getElementById("http-verb-filter");
  const popup = document.getElementById("http-verbs-popup");
  const searchInput = document.getElementById("sidebar-search");

  if (filterButton) {
    // Set tooltip for the filter button
    filterButton.title = "Filter by HTTP methods";

    filterButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleHttpVerbsPopup();
    });

    // Update icon color to show active state
    updateFilterButtonState();
  }

  // Handle search input to ensure HTTP verb filtering is preserved
  if (searchInput) {
    const originalInputHandler = searchInput.oninput;

    searchInput.addEventListener("input", function (e) {
      // Call the original handler if it exists
      if (typeof originalInputHandler === "function") {
        originalInputHandler.call(this, e);
      }

      // Reapply verb filters if they exist, after search filtering
      if (selectedVerbs.size > 0) {
        setTimeout(() => {
          filterSidebarByHttpVerbs();
        }, 50);
      }
    });
  }

  // Close popup when clicking outside
  document.addEventListener("click", (e) => {
    if (
      httpVerbsPopupVisible &&
      !popup.contains(e.target) &&
      e.target.id !== "http-verb-filter"
    ) {
      httpVerbsPopupVisible = false;
      popup.classList.add("hidden");
    }
  });

  // Set up the clear and apply buttons
  const clearButton = document.getElementById("clear-verb-filters");
  const applyButton = document.getElementById("apply-verb-filters");

  if (clearButton) {
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      clearAllVerbs();
    });
  }

  if (applyButton) {
    applyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      applyVerbFilters();
    });
  }

  // Load any saved preferences
  loadSelectedVerbs();
  if (selectedVerbs.size > 0) {
    filterSidebarByHttpVerbs();
  }
}

// Update the filter button to show an active state when filter is applied
function updateFilterButtonState() {
  const filterButton = document.getElementById("http-verb-filter");
  if (!filterButton) return;

  // Find the SVG inside the filter button
  const filterIcon = filterButton.querySelector("svg");

  // Find the counter badge
  const counterBadge = document.getElementById("filter-counter");

  if (selectedVerbs.size > 0) {
    // Active state - change color and style
    filterButton.classList.add("text-blue-600");
    filterButton.classList.remove("text-gray-400");

    // Add active class for styling
    filterButton.classList.add("active");

    // Make the icon slightly bolder when active
    if (filterIcon) {
      filterIcon.setAttribute("stroke-width", "2.5");

      // Add a slight animation - rotate icon slightly
      filterIcon.style.transform = "rotate(-5deg)";
    }

    // Show the counter badge with the number of filters
    if (counterBadge) {
      counterBadge.textContent = selectedVerbs.size;
      counterBadge.classList.remove("hidden");
    }

    // Set the title to include the active filter list
    const verbsList = Array.from(selectedVerbs)
      .map((v) => v.toUpperCase())
      .join(", ");
    filterButton.title = `Filtering by ${verbsList}`;
  } else {
    // Inactive state - restore default appearance
    filterButton.classList.remove("text-blue-600");
    filterButton.classList.add("text-gray-400");
    filterButton.classList.remove("active");

    // Restore normal stroke width and remove rotation
    if (filterIcon) {
      filterIcon.setAttribute("stroke-width", "2");
      filterIcon.style.transform = "rotate(0deg)";
    }

    // Hide the counter badge
    if (counterBadge) {
      counterBadge.classList.add("hidden");
    }

    filterButton.title = "Filter by HTTP methods";
  }
}

// Initialize http verb filter
function attemptFilterInit() {
  // Listen for the custom event that indicates Swagger data is loaded
  document.addEventListener("swaggerDataLoaded", function (event) {
    initHttpVerbFilter();
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Try to initialize if data is already loaded
  if (window.swaggerData) {
    initHttpVerbFilter();
  } else {
    // Wait for swagger data to be loaded
    attemptFilterInit();
  }
});
