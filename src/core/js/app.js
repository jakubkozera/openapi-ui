// Main application file
// All modules are now loaded separately in index.html

// Initialize theme manager immediately
if (typeof initThemeManager === "function") {
  initThemeManager();
}

// Set up Monaco theme listener once Monaco setup is available
document.addEventListener("DOMContentLoaded", () => {
  if (
    window.monacoSetup &&
    typeof window.monacoSetup.setupMonacoThemeListener === "function"
  ) {
    window.monacoSetup.setupMonacoThemeListener();
  }
});

// The toggleResponseCode function is already defined in utils.js and available globally
// URL hash navigation: The app supports navigation to specific endpoints via URL hashes
// Format: #method-path (e.g., #get-/api/users)

// Initialize the Collection Runner UI when DOM is loaded
document.addEventListener("swaggerDataLoaded", () => {
  // First initialize the Collection Runner core
  if (window.CollectionRunner) {
    window.collectionRunner = new window.CollectionRunner();
  }

  // Then initialize other components
  window.responseDetails.initResponseDetailsHandlers();

  // Finally initialize the Collection Runner UI
  if (window.CollectionRunnerUI) {
    window.collectionRunnerUI = new window.CollectionRunnerUI();

    // Initialize the collection action buttons if in the Try-it-out section
    const tryItOutSection = document.getElementById("try-it-out-section");
    if (tryItOutSection && tryItOutSection.classList.contains("active")) {
      window.collectionRunnerUI.setupTryItOutActionButtons(false);
    }
  }
  // Handle initial URL hash navigation after UI is built
  // This ensures that if there's a hash in the URL, the corresponding endpoint is navigated to
  if (
    window.location.hash &&
    typeof window.navigateToEndpointFromHash === "function"
  ) {
    // Add a small delay to ensure all DOM elements are fully rendered
    setTimeout(window.navigateToEndpointFromHash, 200);
  }
});

// Add an additional event listener to ensure favorites are properly initialized
// after the DOM is fully loaded and rendered
document.addEventListener("swaggerDataLoaded", () => {
  if (
    window.favorites &&
    typeof window.favorites.updateFavoritesUI === "function"
  ) {
    window.favorites.updateFavoritesUI();
  }
});
