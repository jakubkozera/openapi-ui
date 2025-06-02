// Custom tooltip handlers

function positionTooltipNextToElement(element) {
  const tooltip = document.getElementById("custom-tooltip");
  const rect = element.getBoundingClientRect();

  // Ensure the tooltip is in the correct DOM position
  if (!document.body.contains(tooltip)) {
    document.body.appendChild(tooltip);
  }

  // Make tooltip visible but not yet positioned to calculate its dimensions
  tooltip.style.visibility = "hidden";
  tooltip.classList.remove("hidden");

  // Get the tooltip dimensions
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;

  // Position always right next to the element (not far right in the screen)
  const left = rect.right + 8;
  const top = rect.top + rect.height / 2 - tooltipHeight / 2;

  // Position the tooltip
  tooltip.style.position = "fixed";
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  // Check if tooltip would go off-screen
  const rightEdge = left + tooltipWidth;
  const bottomEdge = top + tooltipHeight;

  if (rightEdge > window.innerWidth - 20) {
    // If too close to the right edge, position it to the left of the element
    tooltip.style.left = `${rect.left - tooltipWidth - 8}px`;
    tooltip.classList.add("tooltip-left");
    tooltip.classList.remove("tooltip-above");
  } else {
    tooltip.classList.remove("tooltip-left", "tooltip-above");
  }

  if (bottomEdge > window.innerHeight - 20) {
    // If too close to the bottom, adjust vertically
    tooltip.style.top = `${window.innerHeight - tooltipHeight - 20}px`;
  }

  // Make tooltip visible again
  tooltip.style.visibility = "visible";
}

function handleTooltipMouseEnter(e) {
  const tooltip = document.getElementById("custom-tooltip");

  // Set content before positioning
  tooltip.textContent = e.currentTarget.dataset.tooltip;

  // Position and show the tooltip
  positionTooltipNextToElement(e.currentTarget);
  tooltip.classList.add("visible");

  // Keep tooltip properly positioned during scroll
  const handleScroll = () => {
    if (tooltip.classList.contains("visible")) {
      positionTooltipNextToElement(e.currentTarget);
    }
  };

  // Add scroll listener temporarily
  window.addEventListener("scroll", handleScroll);

  // Store the handler so we can remove it on mouseleave
  e.currentTarget._scrollHandler = handleScroll;
}

function handleTooltipMouseLeave(e) {
  const tooltip = document.getElementById("custom-tooltip");
  tooltip.classList.add("hidden");
  tooltip.classList.remove("visible", "tooltip-left", "tooltip-above");

  // Remove scroll handler if it exists
  if (e.currentTarget._scrollHandler) {
    window.removeEventListener("scroll", e.currentTarget._scrollHandler);
    e.currentTarget._scrollHandler = null;
  }
}

// All functions are now globally available
