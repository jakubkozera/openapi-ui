/**
 * Scroll to top functionality for the main content area
 */

class ScrollToTop {
  constructor() {
    this.scrollContainer = document.getElementById("api-main-content");
    this.scrollButton = document.getElementById("scroll-to-top");
    this.scrollThreshold = 200; // Show button after scrolling 200px

    this.init();
  }

  init() {
    if (!this.scrollContainer || !this.scrollButton) {
      console.warn("Scroll to top: Required elements not found");
      return;
    }

    this.bindEvents();
    this.setupTooltip();
  }

  bindEvents() {
    // Listen for scroll events on the main content container
    this.scrollContainer.addEventListener(
      "scroll",
      this.handleScroll.bind(this)
    );

    // Handle button click
    this.scrollButton.addEventListener("click", this.scrollToTop.bind(this));
  }

  setupTooltip() {
    // Add data-tooltip attribute for the existing tooltip system
    this.scrollButton.setAttribute("data-tooltip", "Scroll to top");

    // Add event listeners for the existing tooltip system
    this.scrollButton.addEventListener("mouseenter", handleTooltipMouseEnter);
    this.scrollButton.addEventListener("mouseleave", handleTooltipMouseLeave);
  }

  handleScroll() {
    const scrollTop = this.scrollContainer.scrollTop;
    if (scrollTop > this.scrollThreshold) {
      this.showButton();
    } else {
      this.hideButton();
    }
  }

  showButton() {
    this.scrollButton.classList.add("visible");
  }

  hideButton() {
    this.scrollButton.classList.remove("visible");
  }

  scrollToTop() {
    this.scrollContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

// Expose the class globally
window.ScrollToTop = ScrollToTop;

// Initialize scroll to top functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if the button exists at DOM load time
  const scrollButton = document.getElementById("scroll-to-top");
  if (scrollButton) {
    new ScrollToTop();
  }
});
