// Response details handler

// Variable to store response timing
let requestStartTime = 0;
let requestEndTime = 0;

// Start timing a request
function startTiming() {
  requestStartTime = performance.now();
}

// End timing a request
function endTiming() {
  requestEndTime = performance.now();
  return Math.round(requestEndTime - requestStartTime);
}

// Format headers for display
function formatHeaders(headers) {
  let formatted = "";
  headers.forEach((value, name) => {
    formatted += `<div class="text-sm border-b border-gray-600 last:border-0">
            <span class="font-semibold text-gray-300">${name}:</span> 
            <span class="text-gray-400">${value}</span>
        </div>`;
  });
  return formatted;
}

// Toggle response details visibility
function toggleResponseDetails() {
  const content = document.getElementById("response-details-content");
  const arrow = document.getElementById("response-details-arrow");
  if (content && arrow) {
    content.classList.toggle("hidden");
    arrow.classList.toggle("rotate-90");
  }
}

// Update response details with new data
function updateResponseDetails(response, executionTime) {
  // Update execution time
  const timeSpan = document.getElementById("response-execution-time");
  if (timeSpan) {
    timeSpan.textContent = `${executionTime}ms`;
  }

  // Update headers in the details section
  const headersList = document.getElementById("response-headers");
  if (headersList && response.headers) {
    headersList.innerHTML = formatHeaders(response.headers);
  }
}

// Initialize response details handlers
function initResponseDetailsHandlers() {
  const button = document.getElementById("response-details-button");
  if (button) {
    button.addEventListener("click", toggleResponseDetails);
  }
}

// Export functions
window.responseDetails = {
  startTiming,
  endTiming,
  updateResponseDetails,
  initResponseDetailsHandlers,
};
