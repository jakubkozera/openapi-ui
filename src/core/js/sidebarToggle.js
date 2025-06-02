// Module to handle opening/closing sidebars on small screens with enhanced animations
function initSidebarToggle() {
  const leftSidebar = document.getElementById("left-sidebar");
  const rightSidebar = document.getElementById("right-sidebar");
  const openLeftBtn = document.getElementById("open-left-sidebar");
  const toggleRightBtn = document.getElementById("toggle-right-sidebar");

  // Create backdrop element for mobile
  const backdrop = document.createElement("div");
  backdrop.className = "sidebar-backdrop";
  backdrop.id = "sidebar-backdrop";
  document.body.appendChild(backdrop);

  // Function to close any open sidebar
  function closeSidebars() {
    if (leftSidebar && leftSidebar.classList.contains("translate-x-0")) {
      leftSidebar.classList.add("-translate-x-full");
      leftSidebar.classList.remove("translate-x-0");
    }
    if (rightSidebar && rightSidebar.classList.contains("translate-x-0")) {
      rightSidebar.classList.add("translate-x-full");
      rightSidebar.classList.remove("translate-x-0");
      // Reset right sidebar toggle button
      if (toggleRightBtn) {
        const iconPath = toggleRightBtn.querySelector("#toggle-right-icon");
        if (iconPath) {
          iconPath.setAttribute("d", "M13 10V3L4 14h7v7l9-11h-7z");
        }
        toggleRightBtn.classList.remove("expanded");
      }
    }
    backdrop.classList.remove("active");
    document.body.classList.remove("sidebar-open");
  }

  // Left sidebar toggle
  openLeftBtn?.addEventListener("click", () => {
    const isOpen = leftSidebar.classList.contains("translate-x-0");

    if (isOpen) {
      closeSidebars();
    } else {
      // Close right sidebar if open
      if (rightSidebar && rightSidebar.classList.contains("translate-x-0")) {
        closeSidebars();
      }

      leftSidebar.classList.remove("-translate-x-full");
      leftSidebar.classList.add("translate-x-0");
      backdrop.classList.add("active");
      document.body.classList.add("sidebar-open");
    }
  });

  // Right sidebar toggle
  toggleRightBtn?.addEventListener("click", () => {
    const isOpen = rightSidebar.classList.contains("translate-x-0");
    const iconPath = toggleRightBtn.querySelector("#toggle-right-icon");

    if (isOpen) {
      closeSidebars();
    } else {
      // Close left sidebar if open
      if (leftSidebar && leftSidebar.classList.contains("translate-x-0")) {
        closeSidebars();
      }

      // Open right sidebar
      rightSidebar.classList.remove("translate-x-full");
      rightSidebar.classList.add("translate-x-0");
      backdrop.classList.add("active");
      document.body.classList.add("sidebar-open");

      // Update toggle button icon and state
      if (iconPath) {
        iconPath.setAttribute("d", "M6 18L18 6M6 6l12 12");
      }
      toggleRightBtn.classList.add("expanded");
    }
  });

  // Close sidebars when clicking backdrop
  backdrop.addEventListener("click", closeSidebars);

  // Close sidebars on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSidebars();
    }
  });

  // Close sidebars when screen becomes large enough
  const mediaQuery = window.matchMedia("(min-width: 1280px)");
  function handleScreenChange(e) {
    if (e.matches) {
      // Screen is large, remove mobile classes and backdrop
      closeSidebars();
    }
  }
  mediaQuery.addEventListener("change", handleScreenChange);
}

// Initialize toggle handlers: if DOM already loaded, call directly
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSidebarToggle);
} else {
  initSidebarToggle();
}
