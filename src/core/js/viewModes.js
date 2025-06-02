// Functions for handling different view modes (list/tree)

// Function to parse a path into segments
function parsePathSegments(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  // Split by '/' but keep path parameters intact
  const segments = [];
  let currentSegment = "";
  let insideParam = false;

  for (let i = 0; i < cleanPath.length; i++) {
    const char = cleanPath[i];

    if (char === "{") {
      insideParam = true;
      currentSegment += char;
    } else if (char === "}") {
      insideParam = false;
      currentSegment += char;
    } else if (char === "/" && !insideParam) {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = "";
      }
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

// Function to build a tree structure from operations
function buildEndpointTree(operations) {
  const tree = {};

  operations.forEach((op) => {
    const segments = parsePathSegments(op.path);
    let currentNode = tree;

    segments.forEach((segment, index) => {
      if (!currentNode[segment]) {
        currentNode[segment] = {
          methods: {},
          children: {},
        };
      }

      if (index === segments.length - 1) {
        currentNode[segment].methods[op.method] = op;
      }

      currentNode = currentNode[segment].children;
    });
  });

  return tree;
}

// Function to build the list view (original implementation)
function buildListView(operations, container) {
  operations.forEach((op) => {
    const endpointDiv = createEndpointElement(op);
    container.appendChild(endpointDiv);
  });
}

// Use the common createCleanPath function from utils.js

// Function to create an endpoint element
function createEndpointElement(op) {
  const endpointDiv = document.createElement("div");
  endpointDiv.className =
    "endpoint endpoint-link bg-opacity-50 pr-2 pl-0 py-2 text-sm mb-2 cursor-pointer border-l-[3px] border-transparent";
  endpointDiv.dataset.path = op.path;
  endpointDiv.dataset.method = op.method;
  endpointDiv.dataset.tooltip = `${op.method.toUpperCase()} ${op.path}`;

  // Apply the method-specific text color and hover border color
  const methodClass = getMethodClass(op.method);
  const hoverBorderClass = getHoverBorderClass(op.method);

  if (hoverBorderClass) {
    endpointDiv.classList.add(hoverBorderClass);
  }

  endpointDiv.innerHTML = `
    <div class="flex items-center w-full">
        <span class="${methodClass} method-badge w-[20%] text-right flex-shrink-0">${
    op.method.length > 5
      ? op.method.substring(0, 3).toUpperCase()
      : op.method.toUpperCase()
  }</span>
        <span class="w-[80%] truncate text-left pl-1">${op.summary}</span>
    </div>
  `;

  // Add event listeners
  endpointDiv.addEventListener("mouseenter", handleTooltipMouseEnter);
  endpointDiv.addEventListener("mouseleave", handleTooltipMouseLeave);

  endpointDiv.addEventListener("click", function () {
    // Remove active class from all other endpoint links
    document
      .querySelectorAll(".endpoint-link")
      .forEach((link) => link.classList.remove("bg-blue-100", "text-blue-800"));
    // Add active class to the clicked link
    this.classList.add("bg-blue-100", "text-blue-800");

    const sectionId = generateSectionId(op.path, op.method);
    const section = document.getElementById(sectionId);
    if (section) {
      const endpointsContainer = section.closest(".endpoints-section");

      endpointsContainer.style.opacity = "1";
      // scoll after 400ms
      setTimeout(() => {
        section.scrollIntoView({ behavior: "smooth" });
      }, 50);

      const isCollapsed = endpointsContainer.style.maxHeight === "0px";

      if (isCollapsed) {
        const endpointsContainerHeader =
          endpointsContainer.previousElementSibling;
        endpointsContainerHeader.click();
      }
    }

    const endpointContent = section.querySelector(".endpoint-content");
    if (endpointContent.classList.contains("hidden")) {
      const outlineButton = section.querySelector(".outline-btn");
      outlineButton.click();
    }

    // Ensure right sidebar is expanded on mobile
    const rightSidebar = document.getElementById("right-sidebar");
    if (rightSidebar && rightSidebar.classList.contains("translate-x-full")) {
      const toggleRightBtn = document.getElementById("toggle-right-sidebar");
      if (toggleRightBtn) {
        toggleRightBtn.click();
      }
    } // Update right panel and ensure it's visible
    updateRightPanelDynamically(op.path, op.method);

    // Update code snippet section too
    if (typeof updateCodeSnippetSection === "function") {
      updateCodeSnippetSection(op.path, op.method);
    }

    // Update URL hash without triggering scroll
    const hash = `#${op.method.toLowerCase()}-${window.utils.createCleanPath(
      op.path
    )}`;
    history.replaceState(null, "", hash);
  });

  return endpointDiv;
}

// Function to render the endpoint tree
function renderEndpointTree(tree, container, basePath = "") {
  // Helper function to handle endpoint click
  function handleEndpointClick(op, method) {
    return function () {
      // Remove active class from all endpoint links
      document
        .querySelectorAll(".endpoint-link")
        .forEach((link) =>
          link.classList.remove("bg-blue-100", "text-blue-800")
        );
      this.classList.add("bg-blue-100", "text-blue-800");

      const sectionId = generateSectionId(op.path, method);
      const section = document.getElementById(sectionId);
      if (section) {
        const endpointsContainer = section.closest(".endpoints-section");

        endpointsContainer.style.opacity = "1";
        section.scrollIntoView({ behavior: "smooth" });

        // Expand the outline
        const outlineButton = section.querySelector(".outline-btn");
        const contentDiv = section.querySelector(".flex-1");
        if (outlineButton && contentDiv) {
          const content = [...contentDiv.children].slice(1);
          const svg = outlineButton.querySelector("svg");

          // Check if there's a saved preference to expand this endpoint
          if (
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
            );

            // Only expand if saved preference is specifically "true"
            if (savedState === "true") {
              // Remove hidden class from content
              content.forEach((element) => element.classList.remove("hidden"));

              // Rotate arrow to expanded state
              if (svg) {
                svg.style.transform = "rotate(90deg)";
              }
            }
          }
        }
      }

      updateRightPanelDynamically(op.path, method);

      // Update code snippet section too
      if (typeof updateCodeSnippetSection === "function") {
        updateCodeSnippetSection(op.path, method);
      } // Update URL hash without triggering scroll
      const hash = `#${method.toLowerCase()}-${window.utils.createCleanPath(
        op.path
      )}`;
      history.replaceState(null, "", hash);
    };
  }

  Object.keys(tree).forEach((segment) => {
    const node = tree[segment];
    const currentPath = basePath + "/" + segment;

    // Create segment container
    const segmentContainer = document.createElement("div");
    segmentContainer.className = "path-segment";

    // If there are methods for this segment, show them
    const methods = Object.keys(node.methods);
    if (methods.length > 0) {
      // Check if there's only one method for this path
      if (methods.length === 1) {
        // For a single method, display it on the same line as the segment
        const method = methods[0];
        const op = node.methods[method];
        // Create the endpoint element with segment name inline
        const endpointEl = document.createElement("div");
        endpointEl.className =
          "endpoint endpoint-link bg-opacity-50 px-2 py-2 text-sm rounded-md mb-2 cursor-pointer flex items-center justify-between";
        endpointEl.dataset.path = op.path;
        endpointEl.dataset.method = method;
        // Store tooltip data for custom tooltip
        endpointEl.dataset.tooltip = `${op.path} ${method.toUpperCase()}`; // Create wrapper div for flexbox layout
        const wrapperDiv = document.createElement("div");
        wrapperDiv.className = "flex items-center w-full";

        // Create method badge for the left side, taking 15% of space
        const methodBadge = document.createElement("span");
        methodBadge.className = `method-badge ${getMethodClass(
          method
        )} w-[15%] text-right`;
        methodBadge.textContent = method.toUpperCase();
        wrapperDiv.appendChild(methodBadge);

        // Add segment name (path) on the right, taking 85% of space
        const pathText = document.createElement("span");
        pathText.className = "w-[85%] text-left truncate";
        pathText.textContent = segment;
        wrapperDiv.appendChild(pathText);

        // Add the wrapper to the endpoint element
        endpointEl.appendChild(wrapperDiv);

        // Add mouse event listeners for custom tooltip
        endpointEl.addEventListener("mouseenter", handleTooltipMouseEnter);
        endpointEl.addEventListener("mouseleave", handleTooltipMouseLeave); // Add click event
        endpointEl.addEventListener("click", handleEndpointClick(op, method));

        segmentContainer.appendChild(endpointEl);
      } else {
        // For multiple methods, show segment name as a folder label first
        const segmentLabel = document.createElement("div");
        segmentLabel.className = "font-medium text-gray-700 mb-1";
        segmentLabel.textContent = segment;
        segmentContainer.appendChild(segmentLabel);

        // Container for all method endpoints
        const methodsContainer = document.createElement("div");
        methodsContainer.className = "methods-container pl-2";

        // For each HTTP method, create a clickable element on its own line
        methods.forEach((method) => {
          const op = node.methods[method];

          // Create method endpoint container (one per line)
          const methodContainer = document.createElement("div");
          methodContainer.className = "method-container";

          // Create method badge
          const methodBadge = document.createElement("span");
          methodBadge.className = `method-badge ${getMethodClass(method)}`;
          methodBadge.textContent = method.toUpperCase();

          // Create the endpoint element
          const endpointEl = document.createElement("div");
          endpointEl.className =
            "endpoint endpoint-link bg-opacity-50 px-2 py-1 text-sm rounded-md mb-1 cursor-pointer flex items-center justify-between";
          endpointEl.dataset.path = op.path;
          endpointEl.dataset.method = method;
          // Store tooltip data for custom tooltip
          endpointEl.dataset.tooltip = `${method.toUpperCase()} ${op.path}`; // Create wrapper div for flexbox layout
          const wrapperDiv = document.createElement("div");
          wrapperDiv.className = "flex items-center w-full";

          // Add method badge on the left, taking 15% of space
          methodBadge.className = `${methodBadge.className} w-[15%] text-right`;
          wrapperDiv.appendChild(methodBadge);

          // Add segment name (path) on the right, taking 85% of space
          const pathText = document.createElement("span");
          pathText.className = "w-[85%] text-left truncate";
          pathText.textContent = segment;
          wrapperDiv.appendChild(pathText);

          // Add the wrapper to the endpoint element
          endpointEl.appendChild(wrapperDiv);

          // Add mouse event listeners for custom tooltip
          endpointEl.addEventListener("mouseenter", handleTooltipMouseEnter);
          endpointEl.addEventListener("mouseleave", handleTooltipMouseLeave); // Add click event
          endpointEl.addEventListener("click", handleEndpointClick(op, method));

          // Add to method container and then to methods container
          methodContainer.appendChild(endpointEl);
          methodsContainer.appendChild(methodContainer);
        });

        // Add all method endpoints to segment container
        segmentContainer.appendChild(methodsContainer);
      }
    } else {
      // Just show the segment name as a folder
      const segmentLabel = document.createElement("div");
      segmentLabel.className = "font-medium text-gray-700";
      segmentLabel.textContent = segment;
      segmentContainer.appendChild(segmentLabel);
    }

    // Add segment container to parent container
    container.appendChild(segmentContainer);

    // If there are children, recursively render them
    if (Object.keys(node.children).length > 0) {
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-container";
      renderEndpointTree(node.children, childrenContainer, currentPath);
      container.appendChild(childrenContainer);
    }
  });
}

// Function to build the tree view (hierarchical implementation)
function buildTreeView(operations, container) {
  // Create a tree structure from the operations
  const tree = buildEndpointTree(operations);

  // Render the tree
  renderEndpointTree(tree, container);
}

// Functions are now globally available
