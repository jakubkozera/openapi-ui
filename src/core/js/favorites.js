// Favorites functionality for API endpoints
/**
 * This module adds a favorites feature to the API documentation:
 * - Adds heart icons next to HTTP verb buttons in the main content
 * - Allows users to save favorite endpoints to localStorage
 * - Creates a favorites section at the top of the documentation
 * - Adds a favorites section to the left navigation sidebar
 * - Loads/saves favorites based on the API title
 */

// Store for tracking favorite endpoints
let favoriteEndpoints = [];

// Function to load favorites from localStorage
function loadFavorites() {
  try {
    const apiPrefix =
      window.swaggerData?.info?.title && window.swaggerData?.info?.version
        ? `${window.swaggerData.info.title
            .toLowerCase()
            .replace(/\s+/g, "_")}_${window.swaggerData.info.version
            .toLowerCase()
            .replace(/\s+/g, "_")}`
        : "openapi_ui_default";

    const savedFavorites = localStorage.getItem(`${apiPrefix}_favorites`);
    if (savedFavorites) {
      favoriteEndpoints = JSON.parse(savedFavorites);
    }
  } catch (error) {
    console.error("Error loading favorites:", error);
    favoriteEndpoints = [];
  }
}

// Function to save favorites to localStorage
function saveFavorites() {
  try {
    const apiPrefix =
      window.swaggerData?.info?.title && window.swaggerData?.info?.version
        ? `${window.swaggerData.info.title
            .toLowerCase()
            .replace(/\s+/g, "_")}_${window.swaggerData.info.version
            .toLowerCase()
            .replace(/\s+/g, "_")}`
        : "openapi_ui_default";

    localStorage.setItem(
      `${apiPrefix}_favorites`,
      JSON.stringify(favoriteEndpoints)
    );
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
}

// Function to toggle favorite status for an endpoint
function toggleFavorite(path, method) {
  const index = favoriteEndpoints.findIndex(
    (fav) => fav.path === path && fav.method === method
  );

  // If found, remove it (unfavorite)
  if (index !== -1) {
    favoriteEndpoints.splice(index, 1);
  } else {
    // Add the endpoint to favorites with summary from DOM
    // Find the operation in swagger data
    const operation = swaggerData?.paths?.[path]?.[method.toLowerCase()];
    const summary = operation?.summary || path;

    favoriteEndpoints.push({ path, method, summary });
  }

  // Save updated favorites to localStorage
  saveFavorites();

  // Update UI
  updateFavoritesUI();
  updateFavoriteSectionInMainContent();

  return index === -1; // Return true if added, false if removed
}

// Check if an endpoint is favorited
function isFavorite(path, method) {
  return favoriteEndpoints.some(
    (fav) => fav.path === path && fav.method === method
  );
}

// Create heart icon element
function createFavoriteHeartIcon(path, method, size = 5) {
  const heartIcon = document.createElement("button");
  const isFav = isFavorite(path, method);

  heartIcon.className = `favorite-heart-icon text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200`;
  heartIcon.dataset.path = path;
  heartIcon.dataset.method = method;
  heartIcon.dataset.tooltip = isFav
    ? "Remove from favorites"
    : "Add to favorites";

  // Set the SVG with appropriate fill based on favorite status
  heartIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-${size} w-${size}" 
         viewBox="0 0 20 20" fill="${isFav ? "currentColor" : "none"}" 
         stroke="currentColor" stroke-width="1.5">
      <path fill-rule="${isFav ? "evenodd" : "nonzero"}" 
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
            clip-rule="${isFav ? "evenodd" : "nonzero"}"
            class="${isFav ? "text-red-500" : ""}"/>
    </svg>
  `;
  // Add click event listener
  heartIcon.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering parent element clicks

    const isNowFavorite = toggleFavorite(path, method);

    // Use the existing updateFavoritesUI to handle all updates consistently
    // This ensures all icons are updated the same way
    updateFavoritesUI();
  });

  return heartIcon;
}

// Update all favorite heart icons in the UI
function updateFavoritesUI() {
  document.querySelectorAll(`.favorite-heart-icon`).forEach((icon) => {
    const path = icon.dataset.path;
    const method = icon.dataset.method;

    if (!path || !method) {
      console.warn("Found heart icon without path or method attributes", icon);
      return;
    }

    const isFav = isFavorite(path, method);

    // Make sure the SVG element exists
    const svg = icon.querySelector("svg");
    if (svg) {
      svg.setAttribute("fill", isFav ? "currentColor" : "none");
    }

    // Make sure the path element exists
    const pathElement = icon.querySelector("path");
    if (pathElement) {
      pathElement.classList.toggle("text-red-500", isFav);
    }

    icon.dataset.tooltip = isFav ? "Remove from favorites" : "Add to favorites";
  });
}

// Create favorites section for the main content
function createFavoritesSection() {
  if (favoriteEndpoints.length === 0) {
    return "";
  }

  const mainContent = document.getElementById("api-main-content");
  if (!mainContent) return "";

  const favoritesContainer = document.createElement("div");
  favoritesContainer.id = "favorites-section";
  favoritesContainer.className = "mb-8 p-6 bg-white shadow-lg";

  // Create favorites header
  const header = document.createElement("div");
  header.className =
    "text-xl font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center";
  header.innerHTML = `
    <div class="flex items-center flex-grow">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
      </svg>
      Favorites
      <span class="endpoint-count endpoint-count-title ml-2">${
        favoriteEndpoints.length
      } endpoint${favoriteEndpoints.length !== 1 ? "s" : ""}</span>
    </div>
  `;

  favoritesContainer.appendChild(header);

  // Create favorites content
  const content = document.createElement("div");
  content.className = "space-y-2";

  favoriteEndpoints.forEach((fav) => {
    const endpoint = document.createElement("div");
    endpoint.className = "flex items-center justify-between p-2 rounded";

    // Method badge
    const methodClass = getMethodColor(fav.method);

    endpoint.innerHTML = `
      <div class="flex items-center">
        <span class="px-2 py-1 text-xs font-medium rounded ${methodClass} text-white mr-2">${fav.method.toUpperCase()}</span>
        <span class="font-mono text-sm">${fav.path}</span>
      </div>
    `;

    // Add heart icon for removal
    const heartIcon = createFavoriteHeartIcon(fav.path, fav.method, 4);
    heartIcon.classList.add("ml-2");
    endpoint.appendChild(heartIcon); // Add click handler to navigate to endpoint
    endpoint.addEventListener("click", function (e) {
      if (e.target.closest(".favorite-heart-icon")) return; // Don't navigate if clicking the heart

      // Update URL hash without triggering scroll
      if (window.utils && window.utils.createCleanPath) {
        const hash = `#${fav.method.toLowerCase()}-${window.utils.createCleanPath(
          fav.path
        )}`;
        history.replaceState(null, "", hash);
      }

      // Find the corresponding section in the document
      const sectionId = generateSectionId(fav.path, fav.method);
      const section = document.getElementById(sectionId);

      if (section) {
        // Expand the parent section if collapsed
        const endpointsContainer = section.closest(".endpoints-section");
        if (endpointsContainer) {
          endpointsContainer.style.opacity = "1";
          if (endpointsContainer.style.maxHeight === "0px") {
            const tagHeader = endpointsContainer.previousElementSibling;
            if (tagHeader) tagHeader.click(); // Click to expand
          }
        }

        // Scroll to the section
        section.scrollIntoView({ behavior: "smooth" });

        // Expand the endpoint if it's collapsed
        const outlineButton = section.querySelector(".outline-btn");
        const contentDiv = section.querySelector(".flex-1");

        if (outlineButton && contentDiv) {
          const content = [...contentDiv.children].slice(1);
          if (content[0] && content[0].classList.contains("hidden")) {
            outlineButton.click();
          }
        }
      }
    });

    content.appendChild(endpoint);
  });

  favoritesContainer.appendChild(content);
  return favoritesContainer;
}

// Update or create favorites section in main content
function updateFavoriteSectionInMainContent() {
  // Remove existing favorites section if it exists
  const existingSection = document.getElementById("favorites-section");
  if (existingSection) {
    existingSection.remove();
  }

  // If we have favorites, create a new section
  if (favoriteEndpoints.length > 0) {
    const favoritesSection = createFavoritesSection();
    const mainContent = document.getElementById("api-main-content");

    // Insert favorites at the top, right after the main heading
    if (mainContent) {
      const firstChild = mainContent.firstElementChild;
      if (firstChild) {
        mainContent.insertBefore(favoritesSection, firstChild.nextSibling);
      } else {
        mainContent.appendChild(favoritesSection);
      }
    }
  }

  // Update the sidebar favorites too
  updateFavoritesInSidebar();
}

// Add favorites section to sidebar
function updateFavoritesInSidebar() {
  const navigation = document.getElementById("api-navigation");
  if (!navigation) return;

  // Remove existing favorites section
  const existingFavSection = navigation.querySelector(
    ".favorites-sidebar-section"
  );
  if (existingFavSection) {
    existingFavSection.remove();
  }

  // If no favorites, exit
  if (favoriteEndpoints.length === 0) {
    return;
  }

  // Create new favorites section
  const favSection = document.createElement("div");
  favSection.className = "mt-2 favorites-sidebar-section";

  // Create header
  const favHeader = document.createElement("a");
  favHeader.href = "#";
  favHeader.className =
    "flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 bg-gray-600";
  favHeader.innerHTML = `
    <div class="flex items-center flex-grow">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
      </svg>
      <span>Favorites</span>
      <span class="endpoint-count ml-2">${favoriteEndpoints.length}</span>
    </div>
    <span class="ml-auto">
      <svg class="w-4 h-4 text-gray-400 transform sidebar-arrow rotate-90" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </span>
  `;

  // Create endpoints container
  const endpointsContainer = document.createElement("div");
  endpointsContainer.className = "endpoints-container expanded pl-3 pr-4 py-1";
  endpointsContainer.style.maxHeight = "1000px"; // Ensure it's expanded

  // Add favorites to container
  favoriteEndpoints.forEach((fav) => {
    const endpoint = document.createElement("div");
    endpoint.className =
      "endpoint endpoint-link bg-opacity-50 pr-2 pl-0 py-2 text-sm mb-2 cursor-pointer border-l-[3px] border-transparent";
    endpoint.dataset.path = fav.path;
    endpoint.dataset.method = fav.method;
    endpoint.dataset.tooltip = `${fav.method.toUpperCase()} ${fav.path}`;

    // Apply the method-specific text color
    const methodClass = getMethodClass(fav.method);

    endpoint.innerHTML = `
      <div class="flex items-center w-full">
        <span class="method-badge ${methodClass} w-[20%] text-right flex-shrink-0">${fav.method.toUpperCase()}</span>
        <span class="w-[65%] truncate text-left pl-1">${
          fav.summary || fav.path
        }</span>
        <button class="favorite-heart-icon w-[15%] text-right focus:outline-none" data-path="${
          fav.path
        }" data-method="${fav.method}" data-tooltip="Remove from favorites">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    // Add click event listener for navigation
    endpoint.addEventListener("click", function (e) {
      if (e.target.closest(".favorite-heart-icon")) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(fav.path, fav.method);
        return;
      }

      // Remove active class from all other endpoint links
      document
        .querySelectorAll(".endpoint-link")
        .forEach((link) =>
          link.classList.remove("bg-blue-100", "text-blue-800")
        );

      // Add active class to clicked link
      this.classList.add("bg-blue-100", "text-blue-800");

      // Find section and scroll to it
      const sectionId = generateSectionId(fav.path, fav.method);
      const section = document.getElementById(sectionId);

      if (section) {
        const endpointsContainer = section.closest(".endpoints-section");
        if (endpointsContainer) {
          endpointsContainer.style.opacity = "1";
          section.scrollIntoView({ behavior: "smooth" });

          // Expand the outline
          const outlineButton = section.querySelector(".outline-btn");
          if (outlineButton) outlineButton.click();
        }
      }

      // Update right panel
      if (typeof updateRightPanelDynamically === "function") {
        updateRightPanelDynamically(fav.path, fav.method);
      }

      // Update code snippet section
      if (typeof updateCodeSnippetSection === "function") {
        updateCodeSnippetSection(fav.path, fav.method);
      }

      // Update URL hash
      const hash = `#${fav.method.toLowerCase()}-${window.utils.createCleanPath(
        fav.path
      )}`;
      history.replaceState(null, "", hash);
    });

    endpointsContainer.appendChild(endpoint);
  });

  // Add toggling behavior to header
  favHeader.addEventListener("click", (e) => {
    e.preventDefault();
    const arrow = favHeader.querySelector("svg.sidebar-arrow");

    if (endpointsContainer.classList.contains("expanded")) {
      // Collapse
      endpointsContainer.classList.remove("expanded");
      favHeader.classList.remove("bg-gray-200");
      if (arrow) arrow.classList.remove("rotate-90");
      endpointsContainer.style.maxHeight = "0px";
    } else {
      // Expand
      endpointsContainer.classList.add("expanded");
      favHeader.classList.add("bg-gray-200");
      if (arrow) arrow.classList.add("rotate-90");
      const contentHeight = endpointsContainer.scrollHeight;
      endpointsContainer.style.maxHeight = `${contentHeight + 50}px`;
    }
  });

  // Append to navigation
  favSection.appendChild(favHeader);
  favSection.appendChild(endpointsContainer);

  // Insert at the top of the navigation
  navigation.insertBefore(favSection, navigation.firstChild);
}

// Helper function to get method color class
function getMethodColor(method) {
  const lowerMethod = method.toLowerCase();
  switch (lowerMethod) {
    case "get":
      return "bg-green-600";
    case "post":
      return "bg-blue-600";
    case "put":
      return "bg-yellow-600";
    case "patch":
      return "bg-yellow-500";
    case "delete":
      return "bg-red-600";
    case "options":
    case "head":
      return "bg-gray-600";
    default:
      return "bg-gray-600";
  }
}

// Helper function to get method class for sidebar
function getMethodClass(method) {
  const lowerMethod = method.toLowerCase();
  switch (lowerMethod) {
    case "get":
      return "text-green-600";
    case "post":
      return "text-blue-600";
    case "put":
      return "text-yellow-600";
    case "patch":
      return "text-yellow-500";
    case "delete":
      return "text-red-600";
    case "options":
    case "head":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
}

// Helper function from the app - copied here to avoid circular dependency
function generateSectionId(path, method) {
  return `${method.toLowerCase()}-${createFavoritePathIdentifier(path)}`;
}

// Helper function to create clean path for IDs
// Using the shared createCleanPath from utils.js
// For favorites, we need to modify the path differently - replacing slashes with hyphens
function createFavoritePathIdentifier(path) {
  return window.utils
    .createCleanPath(path)
    .replace(/\//g, "-")
    .replace(/^-|-$/g, "");
}

// Initialize favorites functionality
function initFavorites() {
  // Load favorites from localStorage
  loadFavorites();

  // Add favorites section to main content and sidebar
  updateFavoriteSectionInMainContent();

  // Update all heart icons to reflect favorite state
  // Use a longer timeout to ensure all heart icons are in the DOM before updating them
  setTimeout(() => {
    updateFavoritesUI();
  }, 300);
}

// Listen for swaggerDataLoaded event to initialize favorites
document.addEventListener("swaggerDataLoaded", function () {
  // Initialize after a small delay to ensure DOM is ready
  setTimeout(() => {
    initFavorites();
  }, 100);
});

// Export functions for use in other modules
window.favorites = {
  toggleFavorite,
  isFavorite,
  createFavoriteHeartIcon,
  updateFavoritesUI,
};
