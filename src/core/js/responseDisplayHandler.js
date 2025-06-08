// Function to display actual API response
function displayActualResponse(
  response,
  responseBodyText,
  error = false,
  executionTime = 0,
  downloadData = null
) {
  const responseContent = document.getElementById("response-content");
  const actualResponseStatusCodeDisplay = document.getElementById(
    "actual-response-status-code-display"
  );
  const tabsContainer = document.getElementById("try-it-out-tabs");
  const responseBodyContainer = document.getElementById("actualResponseSample");
  const timeSpan = document.getElementById("response-execution-time");
  const headersList = document.getElementById("response-headers");

  // Show both tabs after response is received
  if (tabsContainer) {
    tabsContainer.classList.remove("hidden");
    tabsContainer.classList.add("visible", "response-available");
  }

  // Show the response content
  if (responseContent) {
    responseContent.classList.remove("hidden");
  }

  // Get proper status text
  const statusText = window.utils.getStatusText(response.status);

  // Update status code display and button style
  if (actualResponseStatusCodeDisplay) {
    actualResponseStatusCodeDisplay.textContent = `${response.status} ${statusText}`;
  } // Update button style and reattach click handler
  const responseDetailsBtn = document.getElementById("response-details-button");
  if (responseDetailsBtn) {
    // Determine color based on status code (same logic as response headers)
    const statusStr = String(response.status);
    const responseColor = statusStr.startsWith("2")
      ? "green"
      : statusStr.startsWith("3")
      ? "yellow"
      : "red";

    // Check if there are any response headers
    const hasHeaders = response.headers && response.headers.keys().next().value;

    // Only show arrow if there are headers
    const arrowHtml = hasHeaders
      ? `<svg id="response-details-arrow" class="h-5 w-5 mr-2 transform transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
      </svg>`
      : "";

    const buttonHtml = `${arrowHtml}<div class="flex items-center justify-between w-full">
        <span id="actual-response-status-code-display" class="text-sm font-medium">${response.status} ${statusText}</span>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span id="response-execution-time" class="text-sm">${executionTime}ms</span>
        </div>
      </div>
    `;
    responseDetailsBtn.innerHTML = buttonHtml;
    responseDetailsBtn.className = `flex items-center w-full bg-${responseColor}-100 text-${responseColor}-800 py-2 px-3 rounded-md response-details-button`;

    // Remove old listeners and add new one
    const newResponseDetailsBtn = responseDetailsBtn.cloneNode(true);
    responseDetailsBtn.parentNode.replaceChild(
      newResponseDetailsBtn,
      responseDetailsBtn
    );

    // Only add click handler if there are headers
    if (hasHeaders) {
      newResponseDetailsBtn.addEventListener("click", () => {
        const content = document.getElementById("response-details-content");
        const arrow = document.getElementById("response-details-arrow");
        if (content && arrow) {
          content.classList.toggle("hidden");
          arrow.classList.toggle("rotate-90");
        }
      });
    }
  }

  // Update execution time
  if (timeSpan) {
    timeSpan.textContent = `${executionTime}ms`;
  }

  // Update response headers
  if (headersList && response.headers) {
    let formattedHeaders = "";
    response.headers.forEach((value, name) => {
      formattedHeaders += `<div class="border-b border-gray-600 last:border-0">
        <span class="font-semibold text-gray-300">${name}:</span> 
        <span class="text-gray-400">${value}</span>
      </div>`;
    });
    headersList.innerHTML = formattedHeaders;
  } // Process response body
  let displayValue = responseBodyText || "";
  let language = "text";

  // Hide/show copy button based on whether it's a file download
  const copyActualResponseBtn = document.getElementById(
    "copyActualResponseBtn"
  );
  if (copyActualResponseBtn) {
    if (downloadData) {
      copyActualResponseBtn.style.display = "none";
    } else {
      copyActualResponseBtn.style.display = "flex";
    }
  }
  if (downloadData) {
    // Handle file download display
    if (responseBodyContainer) {
      // Hide Monaco editor container
      responseBodyContainer.style.display = "none";
      responseBodyContainer.classList.add("hidden");

      // Check if download container already exists
      let downloadContainer = document.getElementById(
        "download-response-container"
      );
      if (!downloadContainer) {
        // Create download interface container
        downloadContainer = document.createElement("div");
        downloadContainer.id = "download-response-container";
        downloadContainer.className =
          "flex flex-col items-center justify-center h-full p-8 bg-gray-800 border border-gray-600 rounded-md";

        // Insert after the response body container
        responseBodyContainer.parentNode.insertBefore(
          downloadContainer,
          responseBodyContainer.nextSibling
        );
      }

      downloadContainer.innerHTML = `
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-lg font-medium text-white mb-2">File Downloaded Successfully</h3>
          <p class="text-gray-300 mb-4">
            <span class="font-medium">${downloadData.filename}</span>
            <br>            <span class="text-sm text-gray-400">${window.formatFileSize(
              downloadData.size
            )} • ${downloadData.type || "Unknown type"}</span>
          </p>
          <button id="re-download-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center w-full">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download Again
          </button>
        </div>
      `;

      // Show download container
      downloadContainer.style.display = "block";
      downloadContainer.classList.remove("hidden");

      // Add click handler for re-download
      const reDownloadBtn = document.getElementById("re-download-btn");
      if (reDownloadBtn) {
        reDownloadBtn.addEventListener("click", () => {
          const downloadUrl = window.URL.createObjectURL(downloadData.blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = downloadUrl;
          downloadLink.download = downloadData.filename;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadUrl);

          window.utils.showToast("File downloaded successfully", "success");
        });
      }
    }

    // Switch to response tab
    switchTab("response");
    return;
  } else {
    // Hide download container if it exists (for regular responses)
    const downloadContainer = document.getElementById(
      "download-response-container"
    );
    if (downloadContainer) {
      downloadContainer.style.display = "none";
      downloadContainer.classList.add("hidden");
    }

    // Ensure response body container is visible for regular responses
    if (responseBodyContainer) {
      responseBodyContainer.style.display = "block";
      responseBodyContainer.classList.remove("hidden");
    }
  }

  const contentTypeHeader =
    response.headers?.get("Content-Type") || "application/octet-stream";
  if (
    contentTypeHeader.includes("application/json") ||
    contentTypeHeader.includes("application/problem+json")
  ) {
    try {
      const jsonBody = JSON.parse(responseBodyText);
      displayValue = JSON.stringify(jsonBody, null, 2);
      language = "json";
    } catch (e) {
      console.warn("Failed to parse JSON response", e);
    }
  }

  // Create or update the response editor
  try {
    if (!window.responseBodyEditor) {
      // Create new editor if it doesn't exist
      window.monacoSetup
        .createMonacoEditor("actualResponseSample", {
          language,
          value: displayValue,
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: "off",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        })
        .then((editor) => {
          window.responseBodyEditor = editor;
          setupResponseEditor(responseBodyContainer);
        });
    } else {
      const model = window.responseBodyEditor.getModel();
      monaco.editor.setModelLanguage(model, language);
      window.responseBodyEditor.setValue(displayValue);
      setupResponseEditor(responseBodyContainer);
    }
  } catch (err) {
    console.error("Error displaying response:", err);
    // Fallback to plain text display
    if (responseBodyContainer) {
      responseBodyContainer.innerHTML = `<pre class="text-sm text-gray-300 p-4">${displayValue}</pre>`;
    }
  }

  // Switch to response tab
  switchTab("response");
}

// Helper function to setup response editor container
function setupResponseEditor(container) {
  if (!container) return;

  container.style.display = "block";
  container.classList.remove("hidden");

  // Give the editor time to layout properly
  setTimeout(() => {
    if (window.responseBodyEditor) {
      window.responseBodyEditor.layout();
    }
  }, 100);
}

// Make functions available globally
window.displayActualResponse = displayActualResponse;
window.setupResponseEditor = setupResponseEditor;
