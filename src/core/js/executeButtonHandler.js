// Initialize the execute request button

// Helper function to detect if a response is a file download
function isFileResponse(contentDisposition, contentType, requestPath) {
  // Check for explicit content-disposition header
  if (contentDisposition && contentDisposition.includes("attachment")) {
    return true;
  }

  // Check for file-like content types
  const fileContentTypes = [
    "application/octet-stream",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-7z-compressed",
  ];

  // Check for binary content types
  if (
    fileContentTypes.some((type) => contentType.toLowerCase().includes(type))
  ) {
    return true;
  }

  // Check for media content types
  if (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/")
  ) {
    return true;
  }

  // Check for text/plain with file-like patterns in the request path
  if (contentType.includes("text/plain")) {
    // Look for file extensions or download-related patterns in the path
    const fileExtensionPattern =
      /\.(txt|log|csv|json|xml|yaml|yml|md|sql|sh|bat|ps1)$/i;
    const downloadPattern = /(download|export|file|document|report)/i;

    if (
      fileExtensionPattern.test(requestPath) ||
      downloadPattern.test(requestPath)
    ) {
      return true;
    }
  }

  // Check for other document/text formats that might be downloadable
  if (
    contentType.includes("text/csv") ||
    (contentType.includes("application/json") &&
      requestPath.includes("export")) ||
    (contentType.includes("application/xml") && requestPath.includes("export"))
  ) {
    return true;
  }

  return false;
}

function initExecuteRequestButton() {
  const executeRequestBtn = document.getElementById("executeRequestBtn");
  if (executeRequestBtn) {
    // Set initial button color if method element exists
    const methodElement = document.querySelector("#right-panel-method");
    if (methodElement && methodElement.textContent) {
      updateExecuteButtonColor(currentMethod);
    }

    executeRequestBtn.addEventListener("click", async () => {
      // Show loading overlay
      const loader = document.getElementById("try-it-out-loader");
      loader.classList.remove("hidden");

      const pathElement = document.querySelector("#right-panel-path");
      const methodElement = document.querySelector("#right-panel-method");

      if (!pathElement || !methodElement || !swaggerData) {
        console.error(
          "Missing current path, method, or Swagger data for execution."
        );
        displayActualResponse(
          {
            status: "Error",
            statusText: "Client Error",
            headers: new Headers(),
            body: "Missing current path, method, or Swagger data for execution.",
          },
          true
        );
        return;
      }
      let currentPath = pathElement.textContent;
      const currentMethod = methodElement.textContent.toUpperCase();

      // Update the execute button color based on the HTTP verb
      updateExecuteButtonColor(currentMethod);

      const apiResponseSection = document.getElementById(
        "api-response-section"
      ); // Make sure Monaco editor is initialized
      if (!window.responseBodyEditor) {
        try {
          await window.initMonacoEditor();
        } catch (error) {
          console.error("Error initializing Monaco editor:", error);
        }
      }
      const actualResponseStatusCodeDisplay = document.getElementById(
        "actual-response-status-code-display"
      );
      const actualResponseContentType = document.getElementById(
        "actual-response-content-type"
      );
      if (apiResponseSection) apiResponseSection.classList.remove("hidden");
      if (window.responseBodyEditor) {
        window.responseBodyEditor.setValue("Executing request...");
      }
      if (actualResponseStatusCodeDisplay)
        actualResponseStatusCodeDisplay.textContent = "";
      if (actualResponseContentType) actualResponseContentType.textContent = "";

      // Get parameters and handle path and query parameters separately
      const queryParams = new URLSearchParams();
      const pathParams = new Map();
      const pathParametersContainer = document.getElementById(
        "right-panel-path-parameters-container"
      );
      const queryParametersContainer = document.getElementById(
        "right-panel-query-parameters-container"
      ); // Process path parameters
      if (pathParametersContainer) {
        pathParametersContainer
          .querySelectorAll("input, select, textarea")
          .forEach((input) => {
            if (input.name && input.value) {
              // Apply variable replacement
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              // Store path parameters
              pathParams.set(input.name, processedValue);
            }
          });
      } // Process query parameters
      if (queryParametersContainer) {
        queryParametersContainer
          .querySelectorAll("input, select, textarea")
          .forEach((input) => {
            if (input.name && input.value) {
              if (input.type === "checkbox") {
                // Handle checkbox query parameters
                if (input.checked) {
                  // Apply variable replacement to checkbox values
                  const processedValue = window.replaceVariables
                    ? window.replaceVariables(input.value)
                    : input.value;
                  queryParams.append(input.name, processedValue);
                }
              } else {
                // Handle standard query parameters with variable replacement
                const processedValue = window.replaceVariables
                  ? window.replaceVariables(input.value)
                  : input.value;
                queryParams.append(input.name, processedValue);
              }
            }
          });
      }

      // Replace path parameters in the URL
      pathParams.forEach((value, name) => {
        const paramPattern = new RegExp(`\\{${name}\\}`, "g");
        currentPath = currentPath.replace(paramPattern, value);
      });

      // Add query parameters to URL
      const queryString = queryParams.toString();
      if (queryString) {
        currentPath += `?${queryString}`;
      } // Prepare headers
      const fetchHeaders = new Headers();
      const headersContainer = document.getElementById(
        "right-panel-headers-container"
      );
      if (headersContainer) {
        headersContainer
          .querySelectorAll("input, select, textarea")
          .forEach((input) => {
            if (input.name && input.value) {
              // Apply variable replacement to header values
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              fetchHeaders.append(input.name, processedValue);
            }
          });
      } // Prepare body and Content-Type header
      let requestBody = undefined;
      const requestBodyContentTypeSelect = document.getElementById(
        "right-panel-request-body-content-type-select"
      );
      const selectedContentType = requestBodyContentTypeSelect
        ? requestBodyContentTypeSelect.value
        : null;
      if (selectedContentType === "application/x-www-form-urlencoded") {
        // Handle form-encoded data
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const formData = new URLSearchParams();
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name && input.value) {
              // Apply variable replacement to form field values
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              formData.append(input.name, processedValue);
            }
          });

          requestBody = formData.toString();
        }
        // Always set Content-Type for form-encoded data
        fetchHeaders.append(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
      } else if (selectedContentType === "multipart/form-data") {
        // Handle multipart/form-data
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const formData = new FormData();
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name) {
              if (input.type === "file") {
                // Handle file input
                if (input.files && input.files.length > 0) {
                  formData.append(input.name, input.files[0]);
                }
              } else if (input.value) {
                // Handle regular form fields with variable replacement
                const processedValue = window.replaceVariables
                  ? window.replaceVariables(input.value)
                  : input.value;
                formData.append(input.name, processedValue);
              }
            }
          });

          requestBody = formData;
        }
        // Don't set Content-Type header for multipart/form-data - browser will set it with boundary
      } else {
        // Handle JSON and other content types using Monaco editor
        if (window.requestBodyEditor) {
          requestBody = window.requestBodyEditor.getValue();
          // Apply variable replacement to request body
          if (requestBody && window.replaceVariables) {
            requestBody = window.replaceVariables(requestBody);
          }
        }
        // Set Content-Type for other content types only if there's a body
        if (
          requestBody &&
          requestBodyContentTypeSelect &&
          requestBodyContentTypeSelect.value
        ) {
          fetchHeaders.append(
            "Content-Type",
            requestBodyContentTypeSelect.value
          );
        }
      }

      let fetchOptions = {
        method: currentMethod,
        headers: fetchHeaders,
      };
      if (currentMethod !== "GET" && currentMethod !== "HEAD" && requestBody) {
        fetchOptions.body = requestBody;
      }

      // Get operation security requirements
      let operationSecurity = null;
      if (
        swaggerData &&
        swaggerData.paths &&
        swaggerData.paths[pathElement.textContent] &&
        swaggerData.paths[pathElement.textContent][currentMethod.toLowerCase()]
      ) {
        const operation =
          swaggerData.paths[pathElement.textContent][
            currentMethod.toLowerCase()
          ];
        operationSecurity =
          operation.security !== undefined
            ? operation.security
            : swaggerData.security;
      }

      // Add authorization header if we have a token and auth module is available
      if (
        window.auth &&
        typeof window.auth.addAuthorizationHeader === "function"
      ) {
        fetchOptions = window.auth.addAuthorizationHeader(
          fetchOptions,
          operationSecurity
        );
      }

      // Handle API key query parameters from authentication
      if (fetchOptions.apiKeyParams) {
        const urlObj = new URL(currentPath, window.location.origin);
        Object.entries(fetchOptions.apiKeyParams).forEach(([name, value]) => {
          urlObj.searchParams.append(name, value);
        });
        currentPath = urlObj.pathname + urlObj.search;
      }

      try {
        // Get the base URL from config or swagger spec
        const baseUrl = getBaseUrl();
        // Ensure currentPath starts with /
        if (!currentPath.startsWith("/")) {
          currentPath = "/" + currentPath;
        }
        // Combine base URL with current path, ensuring no double slashes
        const fullUrl = baseUrl.replace(/\/$/, "") + currentPath;
        const startTime = performance.now();
        const response = await fetch(fullUrl, fetchOptions); // Check if response is a file download
        const contentDisposition = response.headers.get("content-disposition");
        const contentType = response.headers.get("content-type") || "";
        debugger;
        let downloadData = null;
        let responseBodyText;

        // Enhanced file download detection
        const isFileDownload = isFileResponse(
          contentDisposition,
          contentType,
          currentPath
        );
        if (isFileDownload) {
          // Handle file download
          try {
            const blob = await response.blob();

            // Extract filename from content-disposition header or generate one
            let filename = "download";
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(
                /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
              );
              if (filenameMatch) {
                filename = filenameMatch[1].replace(/['"]/g, "");
              } else {
                // Try filename* format (RFC 5987)
                const filenameStarMatch = contentDisposition.match(
                  /filename\*=UTF-8''([^;\n]*)/
                );
                if (filenameStarMatch) {
                  filename = decodeURIComponent(filenameStarMatch[1]);
                }
              }
            } else {
              // Generate filename based on content-type and timestamp
              const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .slice(0, -5);
              if (contentType.includes("text/plain")) {
                filename = `response-${timestamp}.txt`;
              } else if (contentType.includes("application/json")) {
                filename = `response-${timestamp}.json`;
              } else if (contentType.includes("application/xml")) {
                filename = `response-${timestamp}.xml`;
              } else if (contentType.includes("text/csv")) {
                filename = `response-${timestamp}.csv`;
              } else if (contentType.includes("application/pdf")) {
                filename = `response-${timestamp}.pdf`;
              } else if (contentType.startsWith("image/")) {
                const ext = contentType.split("/")[1] || "img";
                filename = `response-${timestamp}.${ext}`;
              } else {
                // Extract extension from path or use generic
                const pathMatch = currentPath.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                const ext = pathMatch ? pathMatch[1] : "bin";
                filename = `response-${timestamp}.${ext}`;
              }
            }

            downloadData = {
              blob: blob,
              filename: filename,
              size: blob.size,
              type:
                blob.type ||
                response.headers.get("content-type") ||
                "application/octet-stream",
            };

            // Trigger automatic download
            const downloadUrl = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");
            downloadLink.href = downloadUrl;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(downloadUrl);

            // Show success toast
            window.utils.showToast(
              `File "${filename}" downloaded successfully`,
              "success"
            );

            responseBodyText = `File downloaded: ${filename}`;
          } catch (blobError) {
            console.error("Error processing file download:", blobError);
            responseBodyText = "Error processing file download";
          }
        } else {
          // Handle regular response
          try {
            responseBodyText = await response.text();
          } catch (textError) {
            responseBodyText = "Unable to read response body";
          }
        }

        const executionTime = Math.round(performance.now() - startTime);

        if (!response.ok) {
          console.warn(
            "API request failed:",
            response.status,
            response.statusText
          );
        }
        displayActualResponse(
          response,
          responseBodyText,
          !response.ok,
          executionTime,
          downloadData
        );
      } catch (error) {
        console.error("Error during API request execution:", error);
        displayActualResponse(
          {
            status: 500,
            statusText: error.message || "Network Error",
            headers: new Headers(),
          },
          error.message || "Failed to execute request",
          true
        );
      } finally {
        // Hide loading overlay when request completes (success or error)
        const loader = document.getElementById("try-it-out-loader");
        loader.classList.add("hidden");
      }
    });
  }
}

// Export the function
window.initExecuteRequestButton = initExecuteRequestButton;
