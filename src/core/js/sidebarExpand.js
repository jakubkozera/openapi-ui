// Enhanced sidebar functionality - ensures endpoints sections collapse and expand properly
document.addEventListener("DOMContentLoaded", function () {
  // Find all existing endpoint containers and ensure they are expanded by default
  const allEndpointContainers = document.querySelectorAll(
    ".endpoints-container"
  );
  allEndpointContainers.forEach((container) => {
    // Ensure all containers are expanded
    container.classList.add("expanded");
    const contentHeight = container.scrollHeight;
    container.style.maxHeight = `${contentHeight + 50}px`;

    // Make sure arrow is rotated and header has active class
    const header = container.previousElementSibling;
    if (header) {
      header.classList.add("bg-gray-200");
      const arrow = header.querySelector("svg.sidebar-arrow");
      if (arrow) {
        arrow.classList.add("rotate-90");
      }
    }
  });

  // Listen for clicks on tag headers that might not have been properly initialized
  // This is a safety measure for dynamic content that might be added later
  document.addEventListener("click", function (e) {
    // Check if the click was directly on the SVG arrow (not handled by main click handler)
    if (
      e.target.closest("svg.sidebar-arrow") ||
      (e.target.closest("path") && e.target.closest("svg.sidebar-arrow"))
    ) {
      const targetHeader = e.target.closest("a");
      if (targetHeader) {
        const targetContainer = targetHeader.parentElement.querySelector(
          ".endpoints-container"
        );
        if (targetContainer) {
          e.stopPropagation(); // Prevent any double-handling

          const isExpanded = targetContainer.classList.contains("expanded");
          setTimeout(() => {
            // Add a small delay to let the main handler finish first
            if (isExpanded && targetContainer.style.maxHeight !== "0px") {
              // Ensure it's properly collapsed if the class indicates it should be
              targetContainer.style.maxHeight = "0px";
            } else if (
              !isExpanded &&
              targetContainer.style.maxHeight === "0px"
            ) {
              // Ensure it's properly expanded if the class indicates it should be
              targetContainer.style.maxHeight = `${
                targetContainer.scrollHeight + 50
              }px`;
            }
          }, 50);
        }
      }
    }
  });
});
