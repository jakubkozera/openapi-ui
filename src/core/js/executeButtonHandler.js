// Initialize the execute request button
function initExecuteRequestButton() {
  const executeRequestBtn = document.getElementById("executeRequestBtn");
  if (executeRequestBtn) {
    executeRequestBtn.addEventListener("click", async () => {
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

      // Ensure "Add to Collection" button is available after executing a request
      if (window.collectionRunnerUI) {
        window.collectionRunnerUI.setupTryItOutActionButtons(false);
      }

      let currentPath = pathElement.textContent;
      const currentMethod = methodElement.textContent.toUpperCase();

      // Make sure Monaco editor is initialized
      if (!window.responseBodyEditor) {
        try {
          await window.initMonacoEditor();
        } catch (error) {
          console.error("Error initializing Monaco editor:", error);
        }
      }

      // Clear previous response
      if (window.responseBodyEditor) {
        window.responseBodyEditor.setValue("Executing request...");
      }

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
              pathParams.set(input.name, processedValue);
            }
          });
      } // Process query parameters
      if (queryParametersContainer) {
        queryParametersContainer
          .querySelectorAll("input, select, textarea")
          .forEach((input) => {
            if (input.name && input.value) {
              // Apply variable replacement
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              if (input.type === "checkbox") {
                if (input.checked) {
                  queryParams.append(input.name, processedValue);
                }
              } else {
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
              // Apply variable replacement to both header name and value
              const processedName = window.replaceVariables
                ? window.replaceVariables(input.name)
                : input.name;
              const processedValue = window.replaceVariables
                ? window.replaceVariables(input.value)
                : input.value;
              fetchHeaders.append(processedName, processedValue);
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
      } // Get operation security requirements
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
      } // Add authorization header if available
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
        if (!currentPath.startsWith("/")) {
          currentPath = "/" + currentPath;
        }
        const fullUrl = baseUrl.replace(/\/$/, "") + currentPath;

        // Show loading overlay
        const loader = document.getElementById("try-it-out-loader");
        loader.classList.remove("hidden");

        // Start timing
        const startTime = performance.now();
        const response = await fetch(fullUrl, fetchOptions);
        const endTime = performance.now();
        const executionTime = Math.round(endTime - startTime);

        let responseBodyText;
        try {
          responseBodyText = await response.text();
        } catch (textError) {
          responseBodyText = "Unable to read response body";
        }

        // Update execution time display
        const timeSpan = document.getElementById("response-execution-time");
        if (timeSpan) {
          timeSpan.textContent = `${executionTime}ms`;
        } // Display response details
        displayActualResponse(
          response,
          responseBodyText,
          !response.ok,
          executionTime
        );

        // Store the last executed request in a global object for the collection runner
        window.lastExecutedRequest = {
          path: fullUrl,
          method: currentMethod,
          headers: Object.fromEntries([...fetchHeaders.entries()]),
          body: requestBody,
          name: currentPath.split("/").pop() || currentMethod,
        };
      } catch (error) {
        console.error("Error during API request execution:", error);

        // Update time even for errors
        const endTime = performance.now();
        const executionTime = Math.round(endTime - startTime);
        const timeSpan = document.getElementById("response-execution-time");
        displayActualResponse(
          {
            status: 500,
            statusText: error.message || "Network Error",
            headers: new Headers(),
          },
          error.message || "Failed to execute request",
          true,
          executionTime
        );
      } finally {
        loader.classList.add("hidden");
      }
    });
  }
}

// Export the function
window.initExecuteRequestButton = initExecuteRequestButton;
