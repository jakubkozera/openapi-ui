// Right panel and API interaction functionality

function switchTab(tabId) {
  const requestTab = document.getElementById("request-tab");
  const responseTab = document.getElementById("response-tab");
  const requestContent = document.getElementById("request-content");
  const responseContent = document.getElementById("response-content");

  if (!requestTab || !responseTab || !requestContent || !responseContent) {
    return;
  }

  // Store the currently active content
  const currentActiveContent =
    tabId === "request" ? responseContent : requestContent;
  const newActiveContent =
    tabId === "request" ? requestContent : responseContent;

  // Apply fade-out animation to current tab if it's active
  if (currentActiveContent.classList.contains("active")) {
    currentActiveContent.style.opacity = "0";

    // Use setTimeout to allow animation to complete before switching
    setTimeout(() => {
      // Switch tabs after fade-out
      if (tabId === "request") {
        requestTab.classList.add("active");
        requestTab.classList.remove("inactive");
        responseTab.classList.add("inactive");
        responseTab.classList.remove("active");
        responseContent.classList.add("hidden");
        responseContent.classList.remove("active");

        // Show request content with fade-in
        requestContent.classList.remove("hidden");
        requestContent.classList.add("active");
        // Force reflow to ensure transition applies
        void requestContent.offsetWidth;
        requestContent.style.opacity = "1";
      } else {
        // Similar logic for response tab
        responseTab.classList.add("active");
        responseTab.classList.remove("inactive");
        requestTab.classList.add("inactive");
        requestTab.classList.remove("active");
        requestContent.classList.add("hidden");
        requestContent.classList.remove("active");

        // Show response content with fade-in
        responseContent.classList.remove("hidden");
        responseContent.classList.add("active");
        // Force reflow to ensure transition applies
        void responseContent.offsetWidth;
        responseContent.style.opacity = "1";
      }

      // Ensure the collection action buttons are set up when switching to request tab
      if (tabId === "request" && window.collectionRunnerUI) {
        // Check if we're viewing a collection request by checking for currentRequestId
        if (window.collectionRunnerUI.currentRequestId) {
          window.collectionRunnerUI.setupTryItOutActionButtons(
            true,
            window.collectionRunnerUI.currentRequestId
          );
        } else {
          window.collectionRunnerUI.setupTryItOutActionButtons(false);
        }
      }
    }, 300);
  } else {
    // No fade needed, just switch immediately
    if (tabId === "request") {
      requestTab.classList.add("active");
      requestTab.classList.remove("inactive");
      responseTab.classList.add("inactive");
      responseTab.classList.remove("active");
      requestContent.classList.remove("hidden");
      requestContent.classList.add("active");
      requestContent.style.opacity = "1";
      responseContent.classList.add("hidden");
      responseContent.classList.remove("active");

      // Handle collection runner UI actions
      if (window.collectionRunnerUI) {
        if (window.collectionRunnerUI.currentRequestId) {
          window.collectionRunnerUI.setupTryItOutActionButtons(
            true,
            window.collectionRunnerUI.currentRequestId
          );
        } else {
          window.collectionRunnerUI.setupTryItOutActionButtons(false);
        }
      }
    } else {
      responseTab.classList.add("active");
      responseTab.classList.remove("inactive");
      requestTab.classList.add("inactive");
      requestTab.classList.remove("active");
      responseContent.classList.remove("hidden");
      responseContent.classList.add("active");
      responseContent.style.opacity = "1";
      requestContent.classList.add("hidden");
      requestContent.classList.remove("active");
    }
  }
}

// Update right panel with endpoint-specific data
async function updateRightPanelDynamically(path, method) {
  // Ensure Monaco editors are initialized before proceeding
  if (window.initMonacoEditor) {
    try {
      await window.initMonacoEditor();
    } catch (error) {
      console.error("Error initializing Monaco editors:", error);
    }
  } else {
    console.error(
      "initMonacoEditor function is not defined on window. Monaco editors may not initialize correctly."
    );
  }

  if (
    !swaggerData ||
    !swaggerData.paths[path] ||
    !swaggerData.paths[path][method]
  ) {
    console.error(`Endpoint not found in Swagger: ${method} ${path}`);
    return;
  }

  // Reset tabs to initial state
  const tabsContainer = document.getElementById("try-it-out-tabs");
  if (tabsContainer) {
    tabsContainer.classList.add("hidden");
    tabsContainer.classList.remove("visible", "response-available");
  }

  // Show the request content by default and initialize tabs
  const requestContent = document.getElementById("request-content");
  const responseContent = document.getElementById("response-content");
  if (requestContent && responseContent) {
    // Show request content, hide response content
    requestContent.classList.remove("hidden");
    requestContent.classList.add("active");
    responseContent.classList.add("hidden");
    responseContent.classList.remove("active");

    // Make sure we're on the request tab
    switchTab("request");
  }

  // Setup the collection action buttons
  if (window.collectionRunnerUI) {
    window.collectionRunnerUI.setupTryItOutActionButtons(false);
  }
  // Show Try it out section by default
  const tryItOutSection = document.getElementById("try-it-out-section");
  const codeSnippetSection = document.getElementById("code-snippet-section");
  const authSection = document.getElementById("auth-section");

  if (tryItOutSection) {
    tryItOutSection.classList.remove("hidden");
    tryItOutSection.classList.add("active");
  }
  if (codeSnippetSection) {
    codeSnippetSection.classList.add("hidden");
    codeSnippetSection.classList.remove("active");
  }
  if (authSection) {
    authSection.classList.add("hidden");
    authSection.classList.remove("active");
  }

  // Hide collection runner section and all its tab content when switching endpoints
  const collectionRunnerSection = document.getElementById(
    "collection-runner-section"
  );
  if (collectionRunnerSection) {
    collectionRunnerSection.classList.add("hidden");
    collectionRunnerSection.classList.remove("active");
  }
  // Hide all collection runner tab content to prevent tabs from previous endpoint showing
  document.querySelectorAll(".collection-tab-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  // Hide variables section when switching endpoints
  const variablesSection = document.getElementById("variables-section");
  if (variablesSection) {
    variablesSection.classList.add("hidden");
    variablesSection.classList.remove("active");
  }

  // Make sure the vertical menu icon for try it out is active
  const verticalMenuIcons = document.querySelectorAll(".vertical-menu-icon");
  verticalMenuIcons.forEach((icon) => {
    icon.classList.remove("active");
    if (icon.dataset.section === "try-it-out") {
      icon.classList.add("active");
    }
  });

  // Store the current path and method globally
  setCurrentPath(path);
  setCurrentMethod(method);

  const operation = swaggerData.paths[path][method];

  // Set current operation security for auth system
  if (
    window.auth &&
    typeof window.auth.setCurrentOperationSecurity === "function"
  ) {
    const operationSecurity =
      operation.security !== undefined
        ? operation.security
        : swaggerData.security;
    window.auth.setCurrentOperationSecurity(operationSecurity);
  }

  // Update the header (method and path display)
  const methodElement = document.querySelector("#right-panel-method");
  const pathElement = document.querySelector("#right-panel-path");

  // Also update the snippet section elements
  const snippetMethodElement = document.querySelector("#snippet-method");
  const snippetPathElement = document.querySelector("#snippet-path");
  if (methodElement && pathElement) {
    methodElement.textContent = method.toUpperCase();
    methodElement.className = " text-white ml-1 rounded";
    pathElement.textContent = path;

    // Update execute button color based on the HTTP verb
    if (window.updateExecuteButtonColor) {
      window.updateExecuteButtonColor(method);
    }
  }

  if (snippetMethodElement && snippetPathElement) {
    snippetMethodElement.textContent = method.toUpperCase();
    snippetMethodElement.className =
      getMethodClass(method) + " text-white px-2 py-0.5 text-xs rounded mr-2";
    snippetPathElement.textContent = path;
  }

  // --- BEGIN "Try it out" DYNAMIC INPUTS ---
  // Get containers for dynamic inputs
  const pathParametersSection = document.getElementById(
    "right-panel-path-parameters-section"
  );
  const pathParametersContainer = document.getElementById(
    "right-panel-path-parameters-container"
  );
  const queryParametersSection = document.getElementById(
    "right-panel-query-parameters-section"
  );
  const queryParametersContainer = document.getElementById(
    "right-panel-query-parameters-container"
  );
  const headersSection = document.getElementById("right-panel-headers-section");
  const headersContainer = document.getElementById(
    "right-panel-headers-container"
  );
  const requestBodySection = document.getElementById(
    "right-panel-request-body-section"
  );
  const requestBodyContentTypeSelect = document.getElementById(
    "right-panel-request-body-content-type-select"
  );
  const requestBodyEditorDiv = document.getElementById(
    "right-panel-request-body-editor"
  );
  const requestBodyRequiredSpan = document.getElementById(
    "right-panel-request-body-required"
  );

  // Clear previous dynamic content
  pathParametersContainer.innerHTML = "";
  queryParametersContainer.innerHTML = "";
  headersContainer.innerHTML = "";
  // Clear Monaco editor content if it exists
  if (window.requestBodyEditor) {
    window.requestBodyEditor.setValue("");
  }
  requestBodyContentTypeSelect.innerHTML = "";

  // Hide sections by default
  pathParametersSection.classList.add("hidden");
  queryParametersSection.classList.add("hidden");
  headersSection.classList.add("hidden");
  requestBodySection.classList.add("hidden");

  if (!operation) return;
  // Define common classes for inputs and selects
  const inputClasses =
    "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClasses = "w-1/3 text-sm font-medium text-gray-300 pr-1";

  // Common function to create parameter div
  const createParameterDiv = (param, container) => {
    const paramDiv = document.createElement("div");
    paramDiv.classList.add("mb-1", "flex", "items-center", "gap-1");

    const labelWrapper = document.createElement("div");
    labelWrapper.className = "flex items-center h-7 " + labelClasses;
    const label = document.createElement("div");
    label.className = "flex items-center w-full justify-between";
    label.innerHTML = `<span class="font-bold">${param.name}${
      param.required ? '<span class="text-red-400 ml-0.5">*</span>' : ""
    }</span> <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${
      window.formatTypeDisplay
        ? window.formatTypeDisplay(param.schema)
        : param.schema.type
    }</code>`;

    labelWrapper.appendChild(label);
    paramDiv.appendChild(labelWrapper);

    // Add parameter info
    if (param.description) {
      label.title = param.description;
    }

    let input;
    if (param.schema.enum) {
      input = document.createElement("select");
      input.className = inputClasses;
      param.schema.enum.forEach((enumValue) => {
        const option = document.createElement("option");
        option.value = enumValue;
        option.textContent = enumValue;
        input.appendChild(option);
      });
      if (param.schema.default) {
        input.value = param.schema.default;
      }
    } else if (param.schema.type === "boolean") {
      input = document.createElement("select");
      input.className = inputClasses;
      ["true", "false"].forEach((val) => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val;
        input.appendChild(option);
      });
      if (typeof param.schema.default === "boolean") {
        input.value = param.schema.default.toString();
      } else {
        input.value = "false";
      }
    } else {
      input = document.createElement("input");
      input.type = param.schema.type === "integer" ? "number" : "text";
      input.className = inputClasses;
      if (param.schema.default) {
        input.value = param.schema.default;
      }
    }
    input.name = param.name;
    input.dataset.paramIn = param.in;
    input.placeholder = param.description || "";
    if (param.required) {
      input.required = true;
    }

    // Add input change listener for variable detection
    input.addEventListener("input", () => {
      if (window.highlightVariablePlaceholders) {
        window.highlightVariablePlaceholders(input);
      }
    });

    paramDiv.appendChild(input);
    container.appendChild(paramDiv);
  };

  // Populate Parameters
  if (operation.parameters && operation.parameters.length > 0) {
    const queryParams = operation.parameters.filter((p) => p.in === "query");
    const pathParams = operation.parameters.filter((p) => p.in === "path");
    const headerParams = operation.parameters.filter((p) => p.in === "header");

    // Process path parameters
    if (pathParams.length > 0) {
      // Show path parameters section
      pathParametersSection.classList.remove("hidden");
      pathParametersContainer.innerHTML = ""; // Clear previous
      // Add count to path parameters header
      const pathParamHeader = document.querySelector(
        "#right-panel-path-parameters-section h3"
      );
      pathParamHeader.innerHTML = `Path Parameters <span class="endpoint-count ml-2">${pathParams.length}</span>`;

      // Add path parameters
      pathParams.forEach((param) => {
        createParameterDiv(param, pathParametersContainer);
      });
    } else {
      pathParametersSection.classList.add("hidden");
    }

    // Process query parameters
    if (queryParams.length > 0) {
      // Show query parameters section
      queryParametersSection.classList.remove("hidden");
      queryParametersContainer.innerHTML = ""; // Clear previous
      // Add count to query parameters header
      const queryParamHeader = document.querySelector(
        "#right-panel-query-parameters-section h3"
      );
      queryParamHeader.innerHTML = `Query Parameters <span class="endpoint-count ml-2">${queryParams.length}</span>`;

      // Add query parameters
      queryParams.forEach((param) => {
        createParameterDiv(param, queryParametersContainer);
      });
    } else {
      queryParametersSection.classList.add("hidden");
    }

    // Process headers
    if (headerParams.length > 0) {
      headersSection.classList.remove("hidden");
      headersContainer.innerHTML = ""; // Clear previous
      headerParams.forEach((param) => {
        createParameterDiv(param, headersContainer);
      });
    } else {
      headersSection.classList.add("hidden");
    }
  }

  // Process request body
  if (operation.requestBody) {
    // Use the utility function to get request body content, handling both direct content and $ref
    const resolvedRequestBody = window.utils.getRequestBodyContent(operation.requestBody, swaggerData);
    
    if (
      resolvedRequestBody &&
      resolvedRequestBody.content &&
      requestBodySection &&
      requestBodyContentTypeSelect &&
      requestBodyEditorDiv &&
      requestBodyRequiredSpan
    ) {
      requestBodySection.classList.remove("hidden");
      const contentTypes = Object.keys(resolvedRequestBody.content || {});

      contentTypes.forEach((contentType) => {
        const option = document.createElement("option");
        option.value = contentType;
        option.textContent = contentType;
        requestBodyContentTypeSelect.appendChild(option);
      });

      // Set 'application/json' as default if available
      if (contentTypes.includes("application/json")) {
        requestBodyContentTypeSelect.value = "application/json";
      }

      if (resolvedRequestBody.required) {
        requestBodyRequiredSpan.classList.remove("hidden");
      } else {
        requestBodyRequiredSpan.classList.add("hidden");
      }
      const updateRequestBodyDetails = () => {
        const selectedContentType = requestBodyContentTypeSelect.value;
        const schemaInfo = resolvedRequestBody.content[selectedContentType];

        if (
          selectedContentType === "application/x-www-form-urlencoded" ||
          selectedContentType === "multipart/form-data"
        ) {
          // Hide Monaco editor and show form fields for form-encoded content
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "none";
          }

          // Create or show form fields container
          let formFieldsContainer = document.getElementById(
            "form-fields-container"
          );
          if (!formFieldsContainer) {
            formFieldsContainer = document.createElement("div");
            formFieldsContainer.id = "form-fields-container";
            formFieldsContainer.className = "space-y-2";
            requestBodyEditorDiv.parentNode.insertBefore(
              formFieldsContainer,
              requestBodyEditorDiv.nextSibling
            );
          }

          // Clear previous form fields
          formFieldsContainer.innerHTML = "";
          formFieldsContainer.style.display = "block";

          // Set data attribute to track content type for later use
          formFieldsContainer.setAttribute(
            "data-content-type",
            selectedContentType
          );

          // Resolve schema reference if needed
          let resolvedSchema = schemaInfo.schema;
          if (schemaInfo.schema && schemaInfo.schema.$ref) {
            const refPath = schemaInfo.schema.$ref.split("/").slice(1); // Remove #
            resolvedSchema = refPath.reduce(
              (acc, part) => acc && acc[part],
              window.swaggerData // Use swaggerData to properly resolve references
            );
          }

          if (resolvedSchema && resolvedSchema.properties) {
            // Create form fields based on schema properties
            Object.entries(resolvedSchema.properties).forEach(
              ([fieldName, fieldSchema]) => {
                const fieldDiv = document.createElement("div");
                fieldDiv.className = "mb-2 flex items-center gap-2";

                const labelWrapper = document.createElement("div");
                labelWrapper.className =
                  "w-1/3 text-sm font-medium text-gray-300 pr-1";

                const label = document.createElement("div");
                label.className = "flex items-center w-full justify-between";

                const isRequired =
                  resolvedSchema.required &&
                  resolvedSchema.required.includes(fieldName);
                label.className = "flex items-center w-full justify-between";
                label.innerHTML = `<span class="font-bold">${fieldName}${
                  isRequired ? '<span class="text-red-400 ml-0.5">*</span>' : ""
                }</span> <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${
                  window.formatTypeDisplay
                    ? window.formatTypeDisplay(fieldSchema)
                    : fieldSchema.type
                }</code>`;
                labelWrapper.appendChild(label);

                let input;
                // Check if this is a file field for multipart/form-data
                const isFileField =
                  selectedContentType === "multipart/form-data" &&
                  fieldSchema.type === "string" &&
                  fieldSchema.format === "binary";

                if (isFileField) {
                  // Create file input for binary fields in multipart forms
                  input = document.createElement("input");
                  input.type = "file";
                  input.className =
                    "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700";

                  // Add accept attribute based on description if available
                  if (fieldSchema.description) {
                    const desc = fieldSchema.description.toLowerCase();
                    if (desc.includes("pdf")) {
                      input.accept = input.accept
                        ? input.accept + ",.pdf"
                        : ".pdf";
                    }
                    if (
                      desc.includes("image") ||
                      desc.includes("png") ||
                      desc.includes("jpeg") ||
                      desc.includes("jpg")
                    ) {
                      input.accept = input.accept
                        ? input.accept + ",.png,.jpg,.jpeg"
                        : ".png,.jpg,.jpeg";
                    }
                  }
                } else if (fieldSchema.enum) {
                  input = document.createElement("select");
                  input.className =
                    "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                  fieldSchema.enum.forEach((enumValue) => {
                    const option = document.createElement("option");
                    option.value = enumValue;
                    option.textContent = enumValue;
                    input.appendChild(option);
                  });
                  if (fieldSchema.default) {
                    input.value = fieldSchema.default;
                  }
                } else if (fieldSchema.type === "boolean") {
                  input = document.createElement("select");
                  input.className =
                    "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                  ["true", "false"].forEach((val) => {
                    const option = document.createElement("option");
                    option.value = val;
                    option.textContent = val;
                    input.appendChild(option);
                  });
                  if (typeof fieldSchema.default === "boolean") {
                    input.value = fieldSchema.default.toString();
                  } else {
                    input.value = "false";
                  }
                } else {
                  input = document.createElement("input");
                  input.type =
                    fieldSchema.type === "integer"
                      ? "number"
                      : fieldSchema.type === "password"
                      ? "password"
                      : "text";
                  input.className =
                    "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                  if (fieldSchema.default) {
                    input.value = fieldSchema.default;
                  }
                }

                input.name = fieldName;
                if (!isFileField) {
                  input.placeholder =
                    fieldSchema.description || fieldSchema.example || "";
                }
                if (isRequired) {
                  input.required = true;
                }

                // Add input change listener for variable detection (except for file inputs)
                if (!isFileField) {
                  input.addEventListener("input", () => {
                    if (window.highlightVariablePlaceholders) {
                      window.highlightVariablePlaceholders(input);
                    }
                  });
                }

                fieldDiv.appendChild(labelWrapper);
                fieldDiv.appendChild(input);

                formFieldsContainer.appendChild(fieldDiv);
              }
            );
          }
        } else {
          // Show Monaco editor for JSON and other content types
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "block";
          }

          // Hide form fields container
          const formFieldsContainer = document.getElementById(
            "form-fields-container"
          );
          if (formFieldsContainer) {
            formFieldsContainer.style.display = "none";
          }

          if (schemaInfo && schemaInfo.schema) {
            // Get the example as a JavaScript object
            const example = generateExampleFromSchema(
              schemaInfo.schema,
              swaggerData.components
            );
            if (window.requestBodyEditor) {
              window.requestBodyEditor.setValue(JSON.stringify(example, null, 2));
            }
          } else {
            if (window.requestBodyEditor) {
              window.requestBodyEditor.setValue("");
            }
            console.warn(
              `No schema example available for ${selectedContentType}.`
            );
          }
        }
      };

      requestBodyContentTypeSelect.addEventListener(
        "change",
        updateRequestBodyDetails
      );
      if (contentTypes.length > 0) {
        updateRequestBodyDetails(); // Initial population
      }
    } else {
      requestBodySection.classList.add("hidden");
    }
  } else {
    requestBodySection.classList.add("hidden");
  }

  // Hide the request payload section as we're now using the interactive request body section
  const requestPayloadDiv = document.getElementById("request-payload-section");
  if (requestPayloadDiv) {
    requestPayloadDiv.classList.add("hidden");
  }

  // Clear previous actual response display
  const apiResponseSection = document.getElementById("api-response-section");
  if (apiResponseSection) apiResponseSection.classList.add("hidden"); // Hide until execute

  const actualResponseSamplePre = document.getElementById(
    "actualResponseSample"
  );
  if (window.responseBodyEditor) {
    window.responseBodyEditor.setValue("");
  }

  const actualResponseStatusCodeDisplay = document.getElementById(
    "actual-response-status-code-display"
  );
  if (actualResponseStatusCodeDisplay)
    actualResponseStatusCodeDisplay.textContent = "";

  const actualResponseContentType = document.getElementById(
    "actual-response-content-type"
  );
  if (actualResponseContentType) actualResponseContentType.textContent = "";
}

// Function to display actual API response
function displayActualResponse(
  response,
  responseBodyText,
  error = false,
  executionTime = 0
) {
  const responseContent = document.getElementById("response-content");
  const actualResponseStatusCodeDisplay = document.getElementById(
    "actual-response-status-code-display"
  );
  const actualResponseContentType = document.getElementById(
    "actual-response-content-type"
  );
  const executionTimeDisplay = document.getElementById(
    "response-execution-time"
  );
  const tabsContainer = document.getElementById("try-it-out-tabs");
  const responseBodyContainer = document.getElementById("actualResponseSample");

  // Show both tabs after response is received
  if (tabsContainer) {
    tabsContainer.classList.remove("hidden");
    tabsContainer.classList.add("visible", "response-available");
  }

  // Show the API response section
  const apiResponseSection = document.getElementById("api-response-section");
  if (apiResponseSection) {
    apiResponseSection.classList.remove("hidden");
    apiResponseSection.classList.add("block");
  }

  // Switch to response tab
  switchTab("response");

  // Show the response content
  if (responseContent) {
    responseContent.classList.remove("hidden");
  }
  // Update status code display
  if (actualResponseStatusCodeDisplay) {
    actualResponseStatusCodeDisplay.textContent = `${response.status} ${
      response.statusText || ""
    }`;
    actualResponseStatusCodeDisplay.className = `py-1 px-3 rounded text-sm font-semibold ${
      error || !String(response.status).startsWith("2")
        ? "bg-red-500 text-white"
        : "bg-green-500 text-white"
    }`;
  }

  // Update execution time display
  if (executionTimeDisplay) {
    executionTimeDisplay.textContent = `${executionTime}ms`;
  }

  // Update content type display
  const contentTypeHeader =
    response.headers?.get("Content-Type") || "application/octet-stream";
  if (actualResponseContentType) {
    actualResponseContentType.textContent = contentTypeHeader;
  }

  // Process response body
  let displayValue = responseBodyText || "";
  let language = "text";

  if (contentTypeHeader.includes("application/json")) {
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
      // Update existing editor
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

  // Update response headers
  const responseHeadersContainer = document.getElementById("response-headers");
  if (responseHeadersContainer) {
    let headersHtml = "";
    response.headers?.forEach((value, name) => {
      headersHtml += `<div><strong>${name}:</strong> ${value}</div>`;
    });
    responseHeadersContainer.innerHTML = headersHtml;
  }
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
