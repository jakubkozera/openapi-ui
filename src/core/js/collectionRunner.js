// Collection Runner module
// Provides functionality similar to Postman's Collection Runner

// Define a global CollectionRunner class
window.CollectionRunner = class CollectionRunner {
  constructor() {
    this.collection = [];
    this.currentIndex = 0;
    this.isRunning = false;
    this.delay = 0;
    this.results = [];
    this.apiTitle = null; // Store API title
    this.apiVersion = null; // Store API version
  }
  /**
   * Helper function to convert string to snake_case
   * @param {string} str - String to convert
   * @returns {string} - Snake case string
   */
  toSnakeCase(str) {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9.]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  /**
   * Get storage key with API title and version prefix
   * @param {string} key - Key to prefix
   * @returns {string} - Prefixed key
   */
  getStorageKey(key) {
    if (!this.apiTitle || !this.apiVersion) {
      console.warn("API title or version not set, using default storage key");
      return key;
    }
    return `${this.toSnakeCase(this.apiTitle)}_${this.toSnakeCase(
      this.apiVersion
    )}_${key}`;
  }

  /**
   * Add a request to the collection
   * @param {Object} request - The request object to add
   * @param {string} request.name - Request name
   * @param {string} request.path - API path
   * @param {string} request.method - HTTP method
   * @param {Object} request.headers - Request headers
   * @param {string} request.body - Request body
   * @param {Object} request.pathParams - Path parameters
   * @param {Object} request.queryParams - Query parameters
   */
  addRequest(request) {
    this.collection.push({
      ...request,
      id: Date.now() + Math.random().toString(36).substr(2, 5), // Generate unique ID
      enabled: true,
    });
  }

  /**
   * Remove a request from the collection
   * @param {string} id - Request ID
   */
  removeRequest(id) {
    this.collection = this.collection.filter((request) => request.id !== id);
  }

  /**
   * Toggle whether a request should be run
   * @param {string} id - Request ID
   * @param {boolean} enabled - Whether the request should run
   */
  toggleRequest(id, enabled) {
    const request = this.collection.find((request) => request.id === id);
    if (request) {
      request.enabled = enabled;
    }
  }

  /**
   * Set delay between requests in milliseconds
   * @param {number} delay - Delay in milliseconds
   */
  setDelay(delay) {
    this.delay = delay;
  }

  /**
   * Run all enabled requests in the collection
   * @returns {Promise<Array>} - Results of all requests
   */
  async runCollection() {
    if (this.isRunning) {
      throw new Error("Collection is already running");
    }

    try {
      this.isRunning = true;
      this.results = [];
      this.currentIndex = 0;

      // Filter only enabled requests
      const requests = this.collection.filter((request) => request.enabled);

      // Run each request sequentially
      for (const request of requests) {
        // Add actual execution logic here
        const result = await this.executeRequest(request);
        this.results.push(result);

        // Notify listeners about progress
        this.onProgress(this.currentIndex + 1, requests.length, result);

        this.currentIndex++;

        // Wait for delay unless it's the last request
        if (this.delay > 0 && this.currentIndex < requests.length) {
          await new Promise((resolve) => setTimeout(resolve, this.delay));
        }
      }

      // Notify about completion
      this.onComplete(this.results);

      return this.results;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Execute a single request
   * @param {Object} request - Request to execute
   * @returns {Object} - Result of the request
   */ async executeRequest(request) {
    const startTime = performance.now();
    let responseData = null;
    let error = null;

    try {
      // Apply variable replacement to request fields
      const processedRequest = this.applyVariableReplacement(request);

      // Make sure the path is properly formatted
      let currentPath = processedRequest.path; // If we're using a relative path, we need to prefix with base URL
      if (!currentPath.startsWith("http")) {
        // Get the base URL using the utility function from utils.js
        const baseUrl = typeof getBaseUrl === "function" ? getBaseUrl() : "";

        // Add leading slash if needed
        if (!currentPath.startsWith("/")) {
          currentPath = "/" + currentPath;
        }

        // Combine base URL with path
        currentPath = baseUrl.replace(/\/$/, "") + currentPath;
      } // Process path parameters
      if (processedRequest.pathParams) {
        Object.entries(processedRequest.pathParams).forEach(([name, value]) => {
          const paramPattern = new RegExp(`\\{${name}\\}`, "g");
          currentPath = currentPath.replace(paramPattern, value);
        });
      }

      // Process query parameters
      const queryParams = new URLSearchParams();
      if (processedRequest.queryParams) {
        Object.entries(processedRequest.queryParams).forEach(
          ([name, value]) => {
            queryParams.append(name, value);
          }
        );
      }

      // Add query string to URL if needed
      const queryString = queryParams.toString();
      if (queryString && !currentPath.includes("?")) {
        currentPath += `?${queryString}`;
      } // Initialize headers as Headers object
      const headers = new Headers();
      // Add any headers from the request
      if (processedRequest.headers) {
        Object.entries(processedRequest.headers).forEach(([name, value]) => {
          headers.append(name, value);
        });
      } // Prepare fetch options
      let fetchOptions = {
        method: processedRequest.method,
        headers: headers,
      };

      // Add body if needed for POST, PUT, PATCH methods
      if (
        ["POST", "PUT", "PATCH"].includes(
          processedRequest.method.toUpperCase()
        ) &&
        processedRequest.body
      ) {
        // Check if this is a multipart/form-data request
        const isMultipartRequest =
          processedRequest.headers &&
          Object.entries(processedRequest.headers).some(
            ([key, value]) =>
              key.toLowerCase() === "content-type" &&
              value === "multipart/form-data"
          );

        if (isMultipartRequest) {
          // Handle multipart/form-data requests
          try {
            const multipartData = JSON.parse(processedRequest.body);
            const formData = new FormData();

            // Convert the stored multipart data back to FormData
            Object.entries(multipartData).forEach(([fieldName, fieldData]) => {
              if (fieldData.type === "file") {
                // For files, we can't recreate the original file from stored metadata
                // This is a limitation of the collection runner - files need to be re-selected
                console.warn(
                  `File field '${fieldName}' cannot be sent - files must be re-selected for collection execution`
                );
              } else if (fieldData.type === "text" && fieldData.value) {
                // Add text fields to FormData
                formData.append(fieldName, fieldData.value);
              }
            });

            fetchOptions.body = formData;

            // Remove Content-Type header for multipart - browser will set it with boundary
            headers.delete("content-type");
            headers.delete("Content-Type");
          } catch (e) {
            console.error(
              "Failed to parse multipart body for collection execution:",
              e
            );
            // Fallback to original body
            fetchOptions.body = processedRequest.body;
          }
        } else {
          // Handle other content types normally
          fetchOptions.body = processedRequest.body;
        }
      }

      // Get operation security requirements
      let operationSecurity = null;
      if (
        window.swaggerData &&
        window.swaggerData.paths &&
        window.swaggerData.paths[processedRequest.path] &&
        window.swaggerData.paths[processedRequest.path][
          processedRequest.method.toLowerCase()
        ]
      ) {
        const operation =
          window.swaggerData.paths[processedRequest.path][
            processedRequest.method.toLowerCase()
          ];
        operationSecurity =
          operation.security !== undefined
            ? operation.security
            : window.swaggerData.security;
      }

      // Add authorization header if available
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

      // Execute the request
      const response = await fetch(currentPath, fetchOptions);

      // Process response
      let responseBody;
      // First get the text
      const responseText = await response.text();

      // Try to parse as JSON if possible
      try {
        responseBody = JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, use as text
        responseBody = responseText;
      }

      responseData = {
        status: response.status,
        statusText: getStatusText(response.status),
        headers: Object.fromEntries([...response.headers.entries()]),
        body: responseBody,
      };
    } catch (err) {
      console.error("Request execution failed:", err);
      error = err.message;
      responseData = {
        status: "Error",
        statusText: error,
        headers: {},
        body: error,
      };
    }
    const endTime = performance.now();

    const result = {
      request,
      response: responseData,
      error,
      duration: endTime - startTime,
      timestamp: new Date().toISOString(),
    };

    // Extract output parameters if request was successful and has output parameters defined
    this.extractOutputParameters(request, result);

    return result;
  }

  /**
   * Apply variable replacement to request fields
   * @param {Object} request - Request to process
   * @returns {Object} - Processed request with variables replaced
   */
  applyVariableReplacement(request) {
    if (!window.replaceVariables) {
      return request; // No variable replacement function available
    }

    const processedRequest = { ...request };

    // Replace variables in path
    if (processedRequest.path) {
      processedRequest.path = window.replaceVariables(processedRequest.path);
    }

    // Replace variables in path parameters
    if (processedRequest.pathParams) {
      const processedPathParams = {};
      Object.entries(processedRequest.pathParams).forEach(([key, value]) => {
        processedPathParams[key] = window.replaceVariables(String(value));
      });
      processedRequest.pathParams = processedPathParams;
    }

    // Replace variables in query parameters
    if (processedRequest.queryParams) {
      const processedQueryParams = {};
      Object.entries(processedRequest.queryParams).forEach(([key, value]) => {
        processedQueryParams[key] = window.replaceVariables(String(value));
      });
      processedRequest.queryParams = processedQueryParams;
    }

    // Replace variables in headers
    if (processedRequest.headers) {
      const processedHeaders = {};
      Object.entries(processedRequest.headers).forEach(([key, value]) => {
        processedHeaders[key] = window.replaceVariables(String(value));
      });
      processedRequest.headers = processedHeaders;
    }

    // Replace variables in body
    if (processedRequest.body) {
      processedRequest.body = window.replaceVariables(processedRequest.body);
    }

    return processedRequest;
  }

  /**
   * Extract output parameters from response and store as variables
   * @param {Object} request - Original request object
   * @param {Object} result - Request execution result
   */
  extractOutputParameters(request, result) {
    // Only extract if request was successful and has output parameters
    if (
      !request.outputParameters ||
      !result.response ||
      result.error ||
      result.response.status < 200 ||
      result.response.status >= 300
    ) {
      return;
    }

    try {
      const responseBody = result.response.body;

      // Skip if response body is not an object (can't apply JSONPath)
      if (!responseBody || typeof responseBody !== "object") {
        return;
      }

      request.outputParameters.forEach((param) => {
        try {
          const value = this.evaluateJsonPath(responseBody, param.jsonPath);
          if (value !== undefined) {
            // Store the extracted value as an output variable
            if (window.variablesStore && window.variablesStore.setOutput) {
              window.variablesStore.setOutput(param.name, String(value));
              console.log(
                `Extracted output variable: ${param.name} = ${value}`
              );
            }
          }
        } catch (error) {
          console.warn(
            `Failed to extract output parameter ${param.name} with path ${param.jsonPath}:`,
            error
          );
        }
      });
    } catch (error) {
      console.warn("Error extracting output parameters:", error);
    }
  }

  /**
   * Simple JSONPath evaluator for basic path expressions
   * @param {Object} obj - Object to evaluate path against
   * @param {string} path - JSONPath expression
   * @returns {*} - Extracted value or undefined
   */
  evaluateJsonPath(obj, path) {
    if (!path || !path.startsWith("$.")) {
      throw new Error("JSONPath must start with $.");
    }

    // Remove the leading $. and split by dots
    const parts = path.substring(2).split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array indices like [0] or [1]
      const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, propName, index] = arrayMatch;
        if (propName) {
          current = current[propName];
        }
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        } else {
          return undefined;
        }
      } else {
        // Handle simple property access
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Event handler for progress updates
   * @param {number} current - Current request index
   * @param {number} total - Total requests count
   * @param {Object} result - Result of the current request
   */
  onProgress(current, total, result) {
    // Default implementation does nothing
    // Will be overridden by UI code
  }

  /**
   * Event handler for collection run completion
   * @param {Array} results - All results
   */
  onComplete(results) {
    // Default implementation does nothing
    // Will be overridden by UI code
  }

  /**
   * Save the current collection to localStorage
   * @param {string} name - Collection name
   */
  saveCollection(name) {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    collections[name] = {
      requests: this.collection,
      delay: this.delay,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(collections));
  }

  /**
   * Load a saved collection from localStorage
   * @param {string} name - Collection name
   * @returns {boolean} - Success status
   */
  loadCollection(name) {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    if (collections[name]) {
      this.collection = collections[name].requests || [];
      this.delay = collections[name].delay || 0;
      return true;
    }

    return false;
  }

  /**
   * Get list of all saved collections
   * @returns {Array} - Collection names and metadata
   */
  getSavedCollections() {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    return Object.entries(collections).map(([name, data]) => ({
      name,
      requestCount: data.requests?.length || 0,
      updatedAt: data.updatedAt,
    }));
  }

  /**
   * Delete a saved collection from storage
   * @param {string} name - Collection name to delete
   * @returns {boolean} - Success status
   */
  deleteCollection(name) {
    const storageKey = this.getStorageKey("collections");
    const collectionsStr = localStorage.getItem(storageKey) || "{}";
    const collections = JSON.parse(collectionsStr);

    if (collections[name]) {
      delete collections[name];
      localStorage.setItem(storageKey, JSON.stringify(collections));
      return true;
    }

    return false;
  }

  /**
   * Update an existing request in the collection
   * @param {string} id - ID of the request to update
   * @param {Object} updatedRequest - The updated request object
   * @returns {boolean} - Whether the update was successful
   */
  updateRequest(id, updatedRequest) {
    const index = this.collection.findIndex((request) => request.id === id);

    if (index === -1) {
      console.error(`Request with ID ${id} not found in collection`);
      return false;
    }

    // Preserve enabled state from the original request
    const enabled = this.collection[index].enabled;

    // Update the request, maintaining the ID and enabled state
    this.collection[index] = {
      ...updatedRequest,
      id,
      enabled,
    };

    return true;
  }

  /**
   * Reorder requests in the collection
   * @param {number} oldIndex - Original position index
   * @param {number} newIndex - New position index
   */
  reorderRequests(oldIndex, newIndex) {
    if (
      oldIndex < 0 ||
      oldIndex >= this.collection.length ||
      newIndex < 0 ||
      newIndex > this.collection.length || // Allow newIndex to equal collection length (insert at end)
      oldIndex === newIndex
    ) {
      return false;
    }

    // Remove the item from its original position
    const item = this.collection.splice(oldIndex, 1)[0];

    // Insert it at the new position
    this.collection.splice(newIndex, 0, item);

    return true;
  }
};

// Create a singleton instance
window.collectionRunner =
  window.collectionRunner || new window.CollectionRunner();
