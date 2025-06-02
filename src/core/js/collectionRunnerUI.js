// Collection Runner UI Implementation for the right panel  // Define a global CollectionRunnerUI class
window.CollectionRunnerUI = class CollectionRunnerUI {
  constructor() {
    this.collectionRunner = window.collectionRunner;

    if (!this.collectionRunner) {
      console.error(
        "Collection Runner not initialized. Creating a new instance."
      );
      window.collectionRunner = new window.CollectionRunner();
      this.collectionRunner = window.collectionRunner;
    }

    this.currentCollectionName = null; // Track currently loaded collection name
    this.currentRequestId = null; // Track the ID of the request being viewed from collection results
    this.isViewingFromCollection = false; // Track if we're viewing from collection

    // Defer binding events to ensure DOM is fully loaded
    setTimeout(() => {
      this.setupEventHandlers();
      this.loadUIElements();
      this.bindEvents();
      this.refreshRequestList();
      this.refreshSavedCollectionsList();
    }, 300);
  }

  /**
   * Load UI elements for the Collection Runner integrated in the right panel
   */
  loadUIElements() {
    // Load the save modal (still needed for saving collections)
    this.loadSaveModal();

    // Create a toast container if it doesn't exist
    if (!document.getElementById("toast-container")) {
      const toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }
  }

  /**
   * Load the save collection modal
   */ loadSaveModal() {
    // Check if the modal already exists
    if (document.getElementById("save-collection-modal")) {
      return;
    }

    const modalHtml = `
      <div id="save-collection-modal" class="collection-modal-overlay">
        <div class="collection-modal bg-gray-800 text-white border border-gray-700 shadow-lg">
          <div class="collection-modal-header border-b border-gray-700">
            <h3 class="collection-modal-title">Save Collection</h3>
            <span class="collection-modal-close text-gray-400 hover:text-gray-200" id="close-save-modal">×</span>
          </div>
          <div class="collection-modal-body">
            <div class="form-group">
              <label for="collection-name" class="form-label text-gray-300 block mb-2 text-sm">Collection Name</label>
              <input type="text" id="collection-name" class="form-input w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter a name for your collection">
            </div>
          </div>          <div class="collection-modal-footer border-t border-gray-700 pt-3">
            <button id="cancel-save-modal" class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
              Cancel
            </button>
            <button id="confirm-save-collection" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }
  /**
   * Bind events for the Collection Runner UI
   */
  bindEvents() {
    // Section activation events are handled by the main app

    // Create default action buttons when page loads
    setTimeout(() => {
      // Only create the button if we\'re not viewing from collection
      if (!this.currentRequestId) {
        this.setupTryItOutActionButtons(false);
      }
    }, 500);

    // Tab switching within Collection Runner section
    document.querySelectorAll(".collection-tab[data-tab]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchCollectionTab(e.currentTarget.dataset.tab);
      });
    }); // Collection actions
    const addCurrentButton = document.getElementById(
      "add-current-to-collection"
    );
    if (addCurrentButton) {
      addCurrentButton.innerHTML = `
        <svg data-slot="icon" fill="none" class="h-5 w-5 mr-1" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"></path>
        </svg> Add
      `;
      addCurrentButton.className =
        "px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors flex items-center justify-center";
      addCurrentButton.addEventListener("click", () =>
        this.addCurrentRequestToCollection()
      );
      // Add tooltip functionality
      addCurrentButton.addEventListener("mouseenter", handleTooltipMouseEnter);
      addCurrentButton.addEventListener("mouseleave", handleTooltipMouseLeave);
    }
    document
      .getElementById("delay-input")
      ?.addEventListener("change", (e) =>
        this.collectionRunner.setDelay(parseInt(e.target.value, 10))
      );
    document
      .getElementById("clear-collection-btn")
      ?.addEventListener("click", () => this.clearCollection());
    document
      .getElementById("run-collection-btn")
      ?.addEventListener("click", () => this.runCollection());
    document
      .getElementById("save-as-new-collection-btn")
      ?.addEventListener("click", () => this.openSaveModal(true));
    document
      .getElementById("save-collection-btn")
      ?.addEventListener("click", () => this.saveCurrentCollection());

    // Modal actions
    document
      .getElementById("close-save-modal")
      ?.addEventListener("click", () => this.closeSaveModal());
    document
      .getElementById("cancel-save-modal")
      ?.addEventListener("click", () => this.closeSaveModal());
    document
      .getElementById("confirm-save-collection")
      ?.addEventListener("click", () => this.saveCollection());
  }

  /**
   * Setup event handlers for the collection runner
   */
  setupEventHandlers() {
    // Override the default progress handler
    this.collectionRunner.onProgress = (current, total, result) => {
      // Update progress bar
      const progressBar = document.getElementById("collection-progress");
      if (progressBar) {
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
      }

      // Update progress text
      const progressInfo = document.getElementById("progress-info");
      if (progressInfo) {
        progressInfo.textContent = `Processed ${current} of ${total} requests`;
      }

      // Add result to results tab
      this.addResultItem(result);
    };

    // Override the default complete handler
    this.collectionRunner.onComplete = (results) => {
      // Update progress info
      const progressInfo = document.getElementById("progress-info");
      if (progressInfo) {
        const successCount = results.filter(
          (r) => r.response.status >= 200 && r.response.status < 300
        ).length;
        progressInfo.innerHTML = `
          <span class="font-medium">Complete:</span> ${
            results.length
          } requests processed, 
          <span class="text-green-500">${successCount} successful</span>, 
          <span class="text-red-500">${
            results.length - successCount
          } failed</span>
        `;
      }

      // Auto-switch to results tab
      this.switchTab("results-tab");
    };
  }
  switchCollectionTab(tabId) {
    // Save the active tab to localStorage
    this.saveActiveTab(tabId);

    // Store the currently active tab for transition
    const currentActiveContent = document.querySelector(
      ".collection-tab-content:not(.hidden)"
    );
    const selectedTab = document.getElementById(tabId);

    if (
      currentActiveContent &&
      selectedTab &&
      currentActiveContent !== selectedTab
    ) {
      // Apply fade-out animation to current tab
      currentActiveContent.style.opacity = "0";
      currentActiveContent.style.transition = "opacity 0.3s ease";

      // After fade-out completes, switch tabs
      setTimeout(() => {
        // Hide all collection tab contents
        document.querySelectorAll(".collection-tab-content").forEach((tab) => {
          tab.classList.add("hidden");
          tab.style.opacity = "0";
        });

        // Show the selected tab with fade-in
        if (selectedTab) {
          selectedTab.classList.remove("hidden");
          // Trigger reflow
          void selectedTab.offsetWidth;
          // Apply fade-in
          selectedTab.style.transition = "opacity 0.3s ease";
          selectedTab.style.opacity = "1";
        } else {
          console.warn("Tab content not found:", tabId);
        }
      }, 300);
    } else {
      // No current active tab or same tab clicked, just show the tab immediately
      document.querySelectorAll(".collection-tab-content").forEach((tab) => {
        tab.classList.add("hidden");
      });

      if (selectedTab) {
        selectedTab.classList.remove("hidden");
        selectedTab.style.opacity = "1";
      }
    }

    // Update tab buttons with animation
    document.querySelectorAll(".collection-tab[data-tab]").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.tab === tabId) {
        btn.classList.add("active");
      }
    });
  }

  /**
   * Backward compatibility for code that might still use switchTab()
   * @param {string} tabId - ID of the tab to activate
   */
  switchTab(tabId) {
    this.switchCollectionTab(tabId);
  }

  /**
   * Refresh the request list in the UI
   */ refreshRequestList() {
    const requestsContainer = document.getElementById("collection-requests");
    const requestCount = document.getElementById("request-count");

    if (!requestsContainer || !requestCount) return;

    // Update count
    requestCount.textContent = `${this.collectionRunner.collection.length} requests`;

    // Clear container
    requestsContainer.innerHTML = "";

    // Check for empty collection
    if (this.collectionRunner.collection.length === 0) {
      requestsContainer.innerHTML = `
        <div class="text-gray-500 text-center py-8 empty-collection-message">
          No requests in collection yet
        </div>
      `;
      return;
    }

    // Create a container for the items that will handle the dragging class
    const listContainer = document.createElement("div");
    listContainer.className = "collection-list-container";
    requestsContainer.appendChild(listContainer);

    // Add an initial drop zone at the top of the list
    this.createDropZone(listContainer, 0);

    // Add each request
    this.collectionRunner.collection.forEach((request, index) => {
      const requestItem = document.createElement("div");
      requestItem.className = "request-item";
      requestItem.dataset.id = request.id;
      requestItem.dataset.index = index.toString();
      requestItem.draggable = true;

      const methodClass = `method-${request.method.toLowerCase()}`;

      requestItem.innerHTML = `
        <div class="request-item-header">
          <div class="flex items-center">
            <span class="request-handle" title="Drag to reorder">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
              </svg>
            </span>
            <span class="request-item-method ${methodClass}">${
        request.method
      }</span>            <div>
              <div class="font-medium">${
                request.summary || request.name || "Unnamed Request"
              }</div>
              <div class="request-item-path">${request.path}</div>
            </div>
          </div>          <div class="request-actions">
            <input type="checkbox" class="toggle-request" ${
              request.enabled ? "checked" : ""
            }>            <button class="edit-request p-0.5 text-gray-500 hover:text-blue-500" data-tooltip="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="output-params-request p-0.5 text-gray-500 hover:text-green-500" data-tooltip="Output Parameters">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
              </svg>
            </button>            <button class="remove-request p-0.5 text-gray-500 hover:text-red-500" data-tooltip="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      `; // Add event listeners for this item
      requestItem
        .querySelector(".toggle-request")
        .addEventListener("change", (e) => {
          this.collectionRunner.toggleRequest(request.id, e.target.checked);
        });
      const editRequestButton = requestItem.querySelector(".edit-request");
      editRequestButton.addEventListener("click", () => {
        // First switch to the Try-it-out section (indicate this is from collection view)
        this.showTryItOutSection(true);

        // Make sure both tabs are available (show the tab UI)
        const tabsContainer = document.getElementById("try-it-out-tabs");
        if (tabsContainer) {
          tabsContainer.classList.remove("hidden");
          tabsContainer.classList.add("visible", "response-available");
        }

        // Show the request content too (so both tabs have content)
        const requestContent = document.getElementById("request-content");
        if (requestContent) {
          requestContent.classList.remove("hidden");
        }

        // Get the request details
        const requestDetails = this.collectionRunner.collection.find(
          (req) => req.id === request.id
        );

        // Set up the Save button since we're viewing from collection
        this.setupTryItOutActionButtons(true, request.id);

        // Setup the request details based on the saved request
        this.setupRequestDetails(requestDetails);
      });

      // Add tooltip functionality to edit button
      if (window.handleTooltipMouseEnter && window.handleTooltipMouseLeave) {
        editRequestButton.addEventListener(
          "mouseenter",
          window.handleTooltipMouseEnter
        );
        editRequestButton.addEventListener(
          "mouseleave",
          window.handleTooltipMouseLeave
        );
      }
      const removeRequestButton = requestItem.querySelector(".remove-request");
      removeRequestButton.addEventListener("click", () => {
        this.collectionRunner.removeRequest(request.id);
        this.refreshRequestList();
      });

      // Add tooltip functionality to delete button
      if (window.handleTooltipMouseEnter && window.handleTooltipMouseLeave) {
        removeRequestButton.addEventListener(
          "mouseenter",
          window.handleTooltipMouseEnter
        );
        removeRequestButton.addEventListener(
          "mouseleave",
          window.handleTooltipMouseLeave
        );
      }

      // Add output parameters button event listener
      const outputParamsButton = requestItem.querySelector(
        ".output-params-request"
      );
      outputParamsButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showOutputParametersPopup(request.id);
      });

      // Add tooltip functionality to output parameters button
      if (window.handleTooltipMouseEnter && window.handleTooltipMouseLeave) {
        outputParamsButton.addEventListener(
          "mouseenter",
          window.handleTooltipMouseEnter
        );
        outputParamsButton.addEventListener(
          "mouseleave",
          window.handleTooltipMouseLeave
        );
      }

      // Add drag and drop functionality
      requestItem.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
        requestItem.classList.add("dragging");

        // Add a class to the container to show all drop zones
        listContainer.classList.add("dragging");

        // Small delay to make the drag image look better
        setTimeout(() => {
          requestItem.style.opacity = "0.4";
        }, 0);
      });

      requestItem.addEventListener("dragend", () => {
        requestItem.classList.remove("dragging");
        requestItem.style.opacity = "1";

        // Remove the dragging class from the container
        listContainer.classList.remove("dragging");

        // Remove drag-over class from all items and drop zones
        document
          .querySelectorAll(".request-item, .request-item-drop-zone")
          .forEach((item) => {
            item.classList.remove("drag-over");
          });
      });

      requestItem.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        return false;
      });

      requestItem.addEventListener("dragenter", (e) => {
        e.preventDefault();
        requestItem.classList.add("drag-over");
      });

      requestItem.addEventListener("dragleave", () => {
        requestItem.classList.remove("drag-over");
      });

      requestItem.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const oldIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        const newIndex = index;

        // Reorder in collection
        if (oldIndex !== newIndex) {
          this.collectionRunner.reorderRequests(oldIndex, newIndex);

          // Refresh the UI to reflect the new order
          this.refreshRequestList();

          // If we have a current collection name, auto-save the change
          if (this.currentCollectionName) {
            this.collectionRunner.saveCollection(this.currentCollectionName);
            this.showToast(`Collection order updated`, "success");
          }
        }

        return false;
      });

      listContainer.appendChild(requestItem);

      // Add a drop zone after each request
      this.createDropZone(listContainer, index + 1);
    });
  }

  /**
   * Create a drop zone element to allow dropping between items
   * @param {HTMLElement} container - Container to add the drop zone to
   * @param {number} index - Index position for the drop zone
   */
  createDropZone(container, index) {
    const dropZone = document.createElement("div");
    dropZone.className = "request-item-drop-zone";
    dropZone.dataset.index = index.toString();

    // Add event listeners for drop zone
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    dropZone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const oldIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      const newIndex = parseInt(dropZone.dataset.index, 10);

      // Adjust the index if dropping after the dragged item's position
      let adjustedNewIndex = newIndex;
      if (oldIndex < newIndex) {
        adjustedNewIndex--;
      }

      // Only reorder if the position changed
      if (oldIndex !== adjustedNewIndex) {
        this.collectionRunner.reorderRequests(oldIndex, adjustedNewIndex);

        // Refresh the UI to reflect the new order
        this.refreshRequestList();

        // If we have a current collection name, auto-save the change
        if (this.currentCollectionName) {
          this.collectionRunner.saveCollection(this.currentCollectionName);
          this.showToast(`Collection order updated`, "success");
        }
      }
    });

    container.appendChild(dropZone);
  }
  /**
   * Refresh the list of saved collections
   */
  refreshSavedCollectionsList() {
    const savedContainer = document.getElementById("saved-collections");
    if (!savedContainer) return;

    // Clear container
    savedContainer.innerHTML = "";

    // Get saved collections
    const collections = this.collectionRunner.getSavedCollections();

    // Check for empty list
    if (collections.length === 0) {
      savedContainer.innerHTML = `
        <div class="text-gray-500 text-center py-8 empty-collections-message">
          No saved collections found
        </div>
      `;
      return;
    }

    // Create collection list container
    const listContainer = document.createElement("div");
    listContainer.className = "collection-list-container";

    // Add each collection
    collections.forEach((collection) => {
      const collectionItem = document.createElement("div");
      collectionItem.className = "collection-list-item";

      const updatedDate = new Date(collection.updatedAt).toLocaleDateString();

      collectionItem.innerHTML = `
        <div>
          <div class="collection-item-name">${collection.name}</div>
          <div class="collection-item-details">
            ${collection.requestCount} requests - Last updated: ${updatedDate}
          </div>
        </div>        <div class="collection-item-actions">
          <button class="load-collection px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
            Load
          </button>
          <button class="delete-collection px-3 py-1.5 bg-red-200 hover:bg-red-300 text-gray-800 dark:bg-red-700 dark:text-gray-200 dark:hover:bg-red-600 rounded-md text-sm font-medium transition-colors">
            Delete
          </button>
        </div>
      `;

      // Add event listeners
      collectionItem
        .querySelector(".load-collection")
        .addEventListener("click", () => {
          if (this.collectionRunner.loadCollection(collection.name)) {
            this.currentCollectionName = collection.name;
            this.refreshRequestList();
            this.switchTab("collection-tab");
            // Show the save button since we now have a current collection
            const saveBtn = document.getElementById("save-collection-btn");
            if (saveBtn) {
              saveBtn.style.display = "block";
            }
            this.showToast("Collection loaded successfully");
          }
        }); // Add delete functionality here
      collectionItem
        .querySelector(".delete-collection")
        .addEventListener("click", async () => {
          // Use the enhanced toast with confirmation buttons
          const confirmed = await window.utils.showToast(
            `Delete collection "${collection.name}"?`,
            "confirm"
          );

          if (confirmed) {
            if (this.collectionRunner.deleteCollection(collection.name)) {
              // If we just deleted the current collection, update state
              if (collection.name === this.currentCollectionName) {
                this.currentCollectionName = null;
                const saveBtn = document.getElementById("save-collection-btn");
                if (saveBtn) {
                  saveBtn.style.display = "none";
                }
              }
              this.refreshSavedCollectionsList();
              this.showToast("Collection deleted successfully", "success");
            }
          }
        });

      listContainer.appendChild(collectionItem);
    });

    savedContainer.appendChild(listContainer);
  }
  /**
   * Add the current request from the UI to the collection
   */
  addCurrentRequestToCollection() {
    // Check if we have a lastExecutedRequest in memory (from executeButtonHandler.js)
    if (window.lastExecutedRequest) {
      // Use the last executed request data
      const request = window.lastExecutedRequest;

      // Try to get the summary from OpenAPI spec
      const summary = this.getEndpointSummary(request.path, request.method);
      const requestName =
        summary || `${request.method} ${request.name || "Unnamed Request"}`;

      this.collectionRunner.addRequest({
        name: requestName,
        path: request.path,
        method: request.method,
        pathParams: request.pathParams,
        queryParams: request.queryParams,
        headers: request.headers,
        body: request.body,
        summary: summary, // Store the summary separately
      });

      // Show a more descriptive success toast message
      this.showToast(
        `${request.method} endpoint added to collection: ${
          request.path.split("?")[0]
        }`,
        "success"
      );

      // Refresh the collection list
      this.refreshRequestList();
      return;
    }

    // Fallback to reading from the UI if lastExecutedRequest is not available
    const pathElement = document.querySelector("#right-panel-path");
    const methodElement = document.querySelector("#right-panel-method");
    if (!pathElement || !methodElement) {
      this.showToast("Could not determine current request details", "error");
      return;
    }

    // Get current path and method
    const path = pathElement.textContent;
    const method = methodElement.textContent.toUpperCase();

    // Get parameters
    const pathParams = {};
    const pathParametersContainer = document.getElementById(
      "right-panel-path-parameters-container"
    );
    if (pathParametersContainer) {
      pathParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            pathParams[input.name] = input.value;
          }
        });
    }

    // Get query parameters
    const queryParams = {};
    const queryParametersContainer = document.getElementById(
      "right-panel-query-parameters-container"
    );
    if (queryParametersContainer) {
      queryParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            if (input.type === "checkbox") {
              if (input.checked) {
                queryParams[input.name] = input.value;
              }
            } else {
              queryParams[input.name] = input.value;
            }
          }
        });
    }

    // Get headers
    const headers = {};
    const headersContainer = document.getElementById(
      "right-panel-headers-container"
    );
    if (headersContainer) {
      headersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            headers[input.name] = input.value;
          }
        });
    } // Get request body section status
    const requestBodySection = document.getElementById(
      "right-panel-request-body-section"
    );
    const isBodySectionVisible =
      requestBodySection && !requestBodySection.classList.contains("hidden"); // Get request body only if body section is visible
    let body = undefined;
    if (isBodySectionVisible) {
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
              formData.append(input.name, input.value);
            }
          });

          body = formData.toString();
        } // Set Content-Type for form-encoded data
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (selectedContentType === "multipart/form-data") {
        // Handle multipart/form-data - store file info for collection
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const multipartData = {};
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name) {
              if (input.type === "file") {
                // For files, store filename and type info
                if (input.files && input.files.length > 0) {
                  const file = input.files[0];
                  multipartData[input.name] = {
                    type: "file",
                    filename: file.name,
                    size: file.size,
                    mimeType: file.type,
                  };
                }
              } else if (input.value) {
                // Handle regular form fields
                multipartData[input.name] = {
                  type: "text",
                  value: input.value,
                };
              }
            }
          });

          body = JSON.stringify(multipartData);
        }
        // Set Content-Type for multipart/form-data
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // Handle JSON and other content types using Monaco editor
        if (window.requestBodyEditor) {
          body = window.requestBodyEditor.getValue();
          // If body is empty string or whitespace, set to undefined
          if (!body || body.trim() === "") {
            body = undefined;
          }
        }
        // Set Content-Type for other content types if there's a body and content type is selected
        if (body && selectedContentType) {
          headers["Content-Type"] = selectedContentType;
        }
      }
    } // Create request name from path
    const name = path.split("/").pop() || method;

    // Try to get the summary from OpenAPI spec
    const summary = this.getEndpointSummary(path, method);
    const requestName = summary || `${method} ${name}`;

    // Add to collection
    this.collectionRunner.addRequest({
      name: requestName,
      path,
      method,
      pathParams,
      queryParams,
      headers,
      body,
      summary: summary, // Store the summary separately
    });

    // Show a descriptive success toast message
    this.showToast(
      `${method} endpoint added to collection: ${path.split("?")[0]}`,
      "success"
    );

    // Refresh the list
    this.refreshRequestList();

    // Switch to collection tab
    this.switchTab("collection-tab");
  }

  /**
   * Load a saved collection
   * @param {string} name - Name of collection to load
   */
  loadCollection(name) {
    if (this.collectionRunner.loadCollection(name)) {
      this.currentCollectionName = name;
      this.refreshRequestList();
      // Show the save button when a collection is loaded
      const saveBtn = document.getElementById("save-collection-btn");
      if (saveBtn) {
        saveBtn.style.display = "block";
      }
      this.switchTab("collection-tab");
      this.showToast("Collection loaded successfully");
    }
  }
  /**
   * Clear the collection with confirmation
   */
  async clearCollection() {
    // Use the enhanced toast with confirmation buttons
    const confirmed = await window.utils.showToast(
      "Are you sure you want to clear the collection?",
      "confirm"
    );

    if (confirmed) {
      this.collectionRunner.collection = [];
      this.currentCollectionName = null; // Reset current collection name
      this.refreshRequestList();
      // Hide the save button when collection is cleared
      const saveBtn = document.getElementById("save-collection-btn");
      if (saveBtn) {
        saveBtn.style.display = "none";
      }

      // Show success message after clearing
      window.utils.showToast("Collection cleared successfully", "success");
    }
  }

  /**
   * Run the collection
   */
  async runCollection() {
    try {
      // Clear previous results
      document.getElementById("collection-results").innerHTML = "";

      // Update UI state
      document.getElementById("run-collection-btn").disabled = true;
      document.getElementById("run-collection-btn").innerHTML = `

        Running...
      `;

      // Reset progress
      document.getElementById("collection-progress").style.width = "0%";
      document.getElementById("progress-info").textContent =
        "Starting collection run...";

      // Switch to results tab
      this.switchTab("results-tab");

      // Run the collection
      await this.collectionRunner.runCollection();
    } catch (err) {
      console.error("Error running collection:", err);
      alert(`Error running collection: ${err.message}`);
    } finally {
      // Restore UI state
      document.getElementById("run-collection-btn").disabled = false;
      document.getElementById("run-collection-btn").innerHTML =
        "Run Collection";
    }
  }

  /**
   * Add a result item to the results list
   * @param {Object} result - Result object from a request
   */
  addResultItem(result) {
    const resultsContainer = document.getElementById("collection-results");
    if (!resultsContainer) return;

    const resultItem = document.createElement("div");
    resultItem.className =
      "result-item flex items-center justify-between gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700";

    // Determine success/failure
    const isSuccess =
      result.response.status >= 200 && result.response.status < 300;
    const statusClass = isSuccess ? "status-success" : "status-error";
    resultItem.innerHTML = `
      <div class="flex items-center gap-4 flex-1">
        <div class="result-status ${statusClass} flex-shrink-0">
          ${
            isSuccess
              ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>'
          }
        </div>
        <div class="result-details flex-1 min-w-0">          <div class="result-name font-medium truncate">${
          result.request.summary || result.request.name || "Unnamed Request"
        }</div>
          <div class="result-path text-gray-400 text-sm font-mono truncate">${
            result.request.method
          } ${result.request.path}</div>
        </div>
      </div>
      <button class="view-result flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
        <span>View</span>
        <span class="px-2 py-0.5 bg-gray-700 rounded text-xs flex items-center gap-1">
          <span class="font-medium">${
            isSuccess ? result.response.status : "Error"
          }</span>
          <span class="text-gray-400">${Math.round(result.duration)}ms</span>
        </span>
      </button>    `; // Add click handler to view detailed result
    resultItem.querySelector(".view-result").addEventListener("click", () => {
      // First switch to the Try-it-out section (indicate this is from collection view)
      this.showTryItOutSection(true);

      // Make sure both tabs are available (show the tab UI)
      const tabsContainer = document.getElementById("try-it-out-tabs");
      if (tabsContainer) {
        tabsContainer.classList.remove("hidden");
        tabsContainer.classList.add("visible", "response-available");
      }

      // Show the request content too (so both tabs have content)
      const requestContent = document.getElementById("request-content");
      if (requestContent) {
        requestContent.classList.remove("hidden");
      } // Ensure we use the original saved request parameters, not the current ones

      // First ensure the Request tab is selected to prepare the form
      if (typeof switchTab === "function") {
        switchTab("request");
      }

      // Set up the Save button since we're viewing from collection
      this.setupTryItOutActionButtons(true, result.request.id);

      // Setup the request details based on the saved request
      this.setupRequestDetails(result.request);

      // Display the result in the response viewer
      if (window.responseBodyEditor) {
        if (typeof result.response.body === "object") {
          window.responseBodyEditor.setValue(
            JSON.stringify(result.response.body, null, 2)
          );
        } else {
          window.responseBodyEditor.setValue(result.response.body || "");
        }
      }

      // Force layout refresh on the response editor
      const responseBodyContainer = document.getElementById(
        "actualResponseSample"
      );
      if (responseBodyContainer && window.setupResponseEditor) {
        window.setupResponseEditor(responseBodyContainer);
      }

      // Show the response content
      const responseContent = document.getElementById("response-content");
      if (responseContent) {
        responseContent.classList.remove("hidden");
        responseContent.classList.add("active");
      }

      // Switch to the response tab after content is loaded
      if (typeof switchTab === "function") {
        // Delay switching to the response tab to ensure request details are fully populated first
        setTimeout(() => {
          switchTab("response");
        }, 100);
      } // Update the response details button
      const responseDetailsBtn = document.getElementById(
        "response-details-button"
      );
      if (responseDetailsBtn) {
        // Determine color based on status code (same logic as response headers)
        const statusStr = String(result.response.status);
        const responseColor = statusStr.startsWith("2")
          ? "green"
          : statusStr.startsWith("3")
          ? "yellow"
          : "red";

        // Check if there are any response headers
        const hasHeaders =
          result.response.headers &&
          Object.keys(result.response.headers).length > 0;

        // Only show arrow if there are headers
        const arrowHtml = hasHeaders
          ? `
          <svg id="response-details-arrow" class="h-5 w-5 mr-2 transform transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>`
          : "";

        const buttonHtml = `${arrowHtml}
          <div class="flex items-center justify-between w-full">
            <span id="actual-response-status-code-display" class="text-sm font-medium">
              ${result.response.status} ${
          result.response.statusText ||
          window.utils.getStatusText(result.response.status)
        }
            </span>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span id="response-execution-time" class="text-sm">${Math.round(
                result.duration
              )}ms</span>
            </div>
          </div>
        `;
        responseDetailsBtn.innerHTML = buttonHtml;
        responseDetailsBtn.className = `flex items-center w-full bg-${responseColor}-100 text-${responseColor}-800 py-2 px-3 rounded-md response-details-button`;
      }

      // Display headers if they exist
      const headersContainer = document.getElementById("response-headers");
      if (headersContainer) {
        headersContainer.innerHTML = "";

        if (result.response.headers) {
          const headersList = Object.entries(result.response.headers);

          if (headersList.length > 0) {
            headersList.forEach(([name, value]) => {
              const headerRow = document.createElement("div");
              headerRow.className = "response-header-row";
              headerRow.innerHTML = `
                <div class="response-header-name">${name}</div>
                <div class="response-header-value">${value}</div>
              `;
              headersContainer.appendChild(headerRow);
            });
          } else {
            headersContainer.innerHTML =
              '<div class="no-headers">No headers returned</div>';
          }
        }
      } // Re-attach the click handler for the response details button
      const newResponseDetailsBtn = responseDetailsBtn.cloneNode(true);

      // Only add click handler if there are headers
      if (
        result.response.headers &&
        Object.keys(result.response.headers).length > 0
      ) {
        newResponseDetailsBtn.addEventListener("click", () => {
          const content = document.getElementById("response-details-content");
          const arrow = document.getElementById("response-details-arrow");
          if (content && arrow) {
            content.classList.toggle("hidden");
            arrow.classList.toggle("rotate-90");
          }
        });
      }

      responseDetailsBtn.parentNode.replaceChild(
        newResponseDetailsBtn,
        responseDetailsBtn
      );
    });

    resultsContainer.appendChild(resultItem);
  }
  /**
   * Open the save collection modal
   * @param {boolean} saveAsNew - Whether this is a save as new operation
   */
  openSaveModal(saveAsNew = false) {
    const modalOverlay = document.getElementById("save-collection-modal");
    const nameInput = document.getElementById("collection-name");
    if (modalOverlay && nameInput) {
      if (!saveAsNew && this.currentCollectionName) {
        nameInput.value = this.currentCollectionName;
        nameInput.readOnly = true;
      } else {
        nameInput.value = "";
        nameInput.readOnly = false;
      }
      modalOverlay.classList.add("open");
      nameInput.focus();
    }
  }

  /**
   * Close the save collection modal
   */ closeSaveModal() {
    const modalOverlay = document.getElementById("save-collection-modal");
    if (modalOverlay) {
      modalOverlay.classList.remove("open");
    }
  }
  /**
   * Save the current collection
   */
  saveCollection() {
    const nameInput = document.getElementById("collection-name");
    if (!nameInput) return;

    const name = nameInput.value.trim();
    if (!name) {
      this.showToast("Please enter a collection name");
      return;
    }

    // Save the collection
    try {
      this.collectionRunner.saveCollection(name);
      this.currentCollectionName = name; // Update current collection name
      this.closeSaveModal();
      this.refreshSavedCollectionsList();
      this.showToast("Collection saved successfully");

      // Show the save button since we now have a current collection
      const saveBtn = document.getElementById("save-collection-btn");
      if (saveBtn) {
        saveBtn.style.display = "block";
      }
    } catch (err) {
      console.error("Error saving collection:", err);
      this.showToast("Error saving collection");
    }

    // Reset input's readonly state
    nameInput.readOnly = false;
    nameInput.value = "";
  }

  /**
   * Save directly to the current collection
   */
  saveCurrentCollection() {
    if (!this.currentCollectionName) {
      this.showToast("No current collection to save to");
      return;
    }

    try {
      this.collectionRunner.saveCollection(this.currentCollectionName);
      this.refreshSavedCollectionsList();
      this.showToast("Collection updated successfully");
    } catch (err) {
      console.error("Error saving collection:", err);
      this.showToast("Error saving collection");
    }
  }
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Notification type (success, error, warning)
   */
  showToast(message, type = "success") {
    // Always use the centralized utils.showToast function
    if (window.utils && typeof window.utils.showToast === "function") {
      window.utils.showToast(message, type);
    } else {
      console.warn("utils.showToast not available, falling back to alert");
      alert(message);
    }
  }

  /**
   * Switch to the Try-it-out section in the right panel
   * @param {boolean} fromCollectionView - Whether this is called from viewing a collection result
   */
  showTryItOutSection(fromCollectionView = false) {
    // Find the Try-it-out menu button
    const tryItOutButton = document.querySelector(
      '.vertical-menu-icon[data-section="try-it-out"]'
    );
    if (tryItOutButton) {
      // Simulate a click on the Try-it-out button to ensure proper section activation
      tryItOutButton.click();
    }

    // Make sure to hide all collection runner content
    const collectionRunnerSection = document.getElementById(
      "collection-runner-section"
    );
    if (collectionRunnerSection) {
      collectionRunnerSection.classList.remove("active");
    }

    // Setup appropriate action buttons - default to Add to Collection
    if (!fromCollectionView) {
      this.setupTryItOutActionButtons(false);
    }

    // Use the right panel section switching mechanism directly
    const tryItOutSection = document.getElementById("try-it-out-section");
    const allSections = document.querySelectorAll(".right-panel-section");

    if (tryItOutSection) {
      // Hide all sections
      allSections.forEach((section) => {
        section.classList.remove("active");
      });

      // Show the try-it-out section
      tryItOutSection.classList.add("active");

      // Update menu buttons
      document.querySelectorAll(".vertical-menu-icon").forEach((icon) => {
        icon.classList.remove("active");
        if (icon.dataset.section === "try-it-out") {
          icon.classList.add("active");
        }
      });

      // Make sure the try-it-out tabs are shown and properly configured
      const tabsContainer = document.getElementById("try-it-out-tabs");
      if (tabsContainer) {
        tabsContainer.classList.remove("hidden");
        tabsContainer.classList.add("visible", "response-available");
      }

      // Hide any collection runner sub-tabs
      document.querySelectorAll(".collection-tab-content").forEach((tab) => {
        tab.classList.add("hidden");
      });
    }
  }
  /**
   * Setup the request details in the Try-it-out section
   * @param {Object} request - The request object to display
   */
  setupRequestDetails(request) {
    if (!request) {
      console.error("No request data provided to setupRequestDetails");
      return;
    }
    console.log("Setting up request details with:", request);

    // Pre-check: certain HTTP methods typically don't have request bodies by default
    const methodsWithoutBody = ["get", "head", "delete", "options"];
    const isMethodThatTypicallyHasNoBody = methodsWithoutBody.includes(
      request.method.toLowerCase()
    );

    // Reset all sections first to clean previous content
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
    const headersSection = document.getElementById(
      "right-panel-headers-section"
    );
    const headersContainer = document.getElementById(
      "right-panel-headers-container"
    );
    const requestBodySection = document.getElementById(
      "right-panel-request-body-section"
    );
    // Hide all sections first
    if (pathParametersSection) pathParametersSection.classList.add("hidden");
    if (queryParametersSection) queryParametersSection.classList.add("hidden");
    if (headersSection) headersSection.classList.add("hidden");
    if (requestBodySection) requestBodySection.classList.add("hidden"); // Hide body section by default

    // Clear all containers
    if (pathParametersContainer) pathParametersContainer.innerHTML = "";
    if (queryParametersContainer) queryParametersContainer.innerHTML = "";
    if (headersContainer) headersContainer.innerHTML = "";

    // Set the base method and path
    const methodElement = document.getElementById("right-panel-method");
    const pathElement = document.getElementById("right-panel-path");

    // Get the base path (without query parameters)
    const basePath = request.path ? request.path.split("?")[0] : "";
    if (methodElement) {
      methodElement.textContent = request.method.toUpperCase();
      // Use consistent styling with the bg-gray-600 background
      methodElement.className = "ml-1 text-white";
    }

    if (pathElement) {
      pathElement.textContent = request.path;
    } // Find the matching endpoint definition in Swagger
    let endpointPath = null;
    let endpointMethod = null;
    let endpointOperation = null;

    // Clean the path to match against Swagger paths
    const cleanBasePath = basePath.replace(/[{}]/g, "");

    const swaggerDataLoaded =
      window.swaggerData &&
      window.swaggerData.paths &&
      Object.keys(window.swaggerData.paths).length > 0;

    if (swaggerDataLoaded) {
      try {
        // Try to find a matching endpoint
        Object.entries(window.swaggerData.paths).forEach(([path, methods]) => {
          const cleanSwaggerPath = path.replace(/[{}]/g, "");
          if (
            cleanSwaggerPath === cleanBasePath &&
            methods[request.method.toLowerCase()]
          ) {
            endpointPath = path;
            endpointMethod = request.method.toLowerCase();
            endpointOperation = methods[endpointMethod];
          }
        });

        if (!endpointOperation) {
          console.log(
            `Could not find matching endpoint for ${request.method.toUpperCase()} ${cleanBasePath} in Swagger data`
          );
        }
      } catch (error) {
        console.error("Error finding endpoint in Swagger data:", error);
        endpointOperation = null;
      }
    } else {
      console.log(
        "Swagger data not yet loaded, falling back to request data only"
      );
    } // Check if the endpoint requires a request body according to the Swagger definition
    let shouldShowBodySection = false;

    // For methods that typically don't have a body (like GET), default to false
    if (isMethodThatTypicallyHasNoBody) {
      shouldShowBodySection = false;
    } else {
      // For other methods (POST, PUT, PATCH), default to true
      shouldShowBodySection = true;
    }

    // Check if the endpoint definition has a requestBody
    if (endpointOperation && endpointOperation.requestBody) {
      shouldShowBodySection = true;
    }

    // If there's an existing body in the request, we should always show the body section
    if (request.body) {
      shouldShowBodySection = true;
    }

    // Check if there's a Content-Type header which indicates a body
    if (request.headers) {
      const hasContentType = Object.keys(request.headers).some(
        (key) => key.toLowerCase() === "content-type"
      );
      if (hasContentType) {
        shouldShowBodySection = true;
      }
    }

    // Show or hide the body section based on our determination
    if (requestBodySection) {
      if (shouldShowBodySection) {
        requestBodySection.classList.remove("hidden");
      } else {
        requestBodySection.classList.add("hidden");
      }
    } // Process Request Body if needed
    const requestBodyContentTypeSelect = document.getElementById(
      "right-panel-request-body-content-type-select"
    );
    if (requestBodyContentTypeSelect && shouldShowBodySection) {
      requestBodyContentTypeSelect.innerHTML = ""; // Clear options

      // Get all available content types from the endpoint operation
      let availableContentTypes = ["application/json"]; // Default fallback
      if (
        endpointOperation &&
        endpointOperation.requestBody &&
        endpointOperation.requestBody.content
      ) {
        availableContentTypes = Object.keys(
          endpointOperation.requestBody.content
        );
      }

      // Get the current content type from request headers
      let currentContentType = "application/json"; // Default
      if (request.headers) {
        const ctHeader = Object.entries(request.headers).find(
          ([key]) => key.toLowerCase() === "content-type"
        );

        if (ctHeader) {
          currentContentType = ctHeader[1];
        }
      }

      // Add all available content type options
      availableContentTypes.forEach((contentType) => {
        const option = document.createElement("option");
        option.value = contentType;
        option.textContent = contentType;
        requestBodyContentTypeSelect.appendChild(option);
      });

      // If the current content type is not in the available list, add it
      if (!availableContentTypes.includes(currentContentType)) {
        const option = document.createElement("option");
        option.value = currentContentType;
        option.textContent = currentContentType;
        requestBodyContentTypeSelect.appendChild(option);
      } // Set the current content type as selected
      requestBodyContentTypeSelect.value = currentContentType; // Force the content type to be re-evaluated after dropdown is set
      setTimeout(() => {
        if (requestBodyContentTypeSelect.value) {
          const contentType = requestBodyContentTypeSelect.value;

          // Trigger the proper display mode for the current content type
          if (contentType === "multipart/form-data" && request.body) {
            this.handleMultipartFormData(request, contentType);
          } else if (
            contentType === "application/x-www-form-urlencoded" &&
            request.body
          ) {
            this.handleFormEncodedData(request, contentType);
          } else {
            this.handleJSONOrOtherData(request, contentType);
          }
        }
      }, 50);

      // Add event listener for content type changes
      requestBodyContentTypeSelect.addEventListener("change", (e) => {
        const newContentType = e.target.value;

        // Update the Content-Type header in the request
        if (!request.headers) {
          request.headers = {};
        }

        // Find and update existing Content-Type header or add new one
        const existingCtHeader = Object.keys(request.headers).find(
          (key) => key.toLowerCase() === "content-type"
        );

        if (existingCtHeader) {
          delete request.headers[existingCtHeader];
        }
        request.headers["Content-Type"] = newContentType;

        // Trigger request body section update based on new content type
        if (newContentType === "application/x-www-form-urlencoded") {
          // Switch to form fields view
          const requestBodyEditorDiv = document.getElementById(
            "right-panel-request-body-editor"
          );
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "none";
          }

          // Show/create form fields container
          let formFieldsContainer = document.getElementById(
            "form-fields-container"
          );
          if (!formFieldsContainer) {
            formFieldsContainer = document.createElement("div");
            formFieldsContainer.id = "form-fields-container";
            formFieldsContainer.className = "space-y-2";
            if (requestBodyEditorDiv) {
              requestBodyEditorDiv.parentNode.insertBefore(
                formFieldsContainer,
                requestBodyEditorDiv.nextSibling
              );
            }
          }
          formFieldsContainer.style.display = "block";

          // If we have existing form data, preserve it, otherwise create empty fields from schema
          if (!request.body) {
            // Generate fields from schema
            if (
              endpointOperation &&
              endpointOperation.requestBody &&
              endpointOperation.requestBody.content &&
              endpointOperation.requestBody.content[
                "application/x-www-form-urlencoded"
              ]
            ) {
              const formSchemaInfo =
                endpointOperation.requestBody.content[
                  "application/x-www-form-urlencoded"
                ];
              if (formSchemaInfo && formSchemaInfo.schema) {
                let resolvedSchema = formSchemaInfo.schema;

                // Resolve schema reference if needed
                if (formSchemaInfo.schema.$ref) {
                  const refPath = formSchemaInfo.schema.$ref
                    .split("/")
                    .slice(1);
                  resolvedSchema = refPath.reduce(
                    (acc, part) => acc && acc[part],
                    window.swaggerData
                  );
                }

                if (resolvedSchema && resolvedSchema.properties) {
                  // Clear existing fields
                  formFieldsContainer.innerHTML = "";

                  // Generate form fields from schema
                  const schemaProperties = resolvedSchema.properties;
                  const requiredFields = resolvedSchema.required || [];

                  Object.entries(schemaProperties).forEach(
                    ([fieldName, fieldSchema]) => {
                      const fieldDiv = document.createElement("div");
                      fieldDiv.className = "mb-2 flex items-center gap-2";

                      const labelWrapper = document.createElement("div");
                      labelWrapper.className =
                        "w-1/3 text-sm font-medium text-gray-300 pr-1";

                      const label = document.createElement("label");
                      const isRequired = requiredFields.includes(fieldName);
                      label.innerHTML = `<span class="font-bold">${fieldName}${
                        isRequired
                          ? '<span class="text-red-400 ml-0.5">*</span>'
                          : ""
                      }</span>`;

                      if (fieldSchema.description) {
                        label.title = fieldSchema.description;
                      }

                      labelWrapper.appendChild(label);

                      let input;

                      if (fieldSchema.enum) {
                        input = document.createElement("select");
                        input.className =
                          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                        fieldSchema.enum.forEach((enumValue) => {
                          const option = document.createElement("option");
                          option.value = enumValue;
                          option.textContent = enumValue;
                          input.appendChild(option);
                        });
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
                      } else {
                        input = document.createElement("input");
                        input.type =
                          fieldSchema.type === "number" ? "number" : "text";
                        input.className =
                          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                      }

                      input.name = fieldName;

                      // Add input change listener for variable detection
                      input.addEventListener("input", () => {
                        if (window.highlightVariablePlaceholders) {
                          window.highlightVariablePlaceholders(input);
                        }
                      });

                      fieldDiv.appendChild(labelWrapper);
                      fieldDiv.appendChild(input);
                      formFieldsContainer.appendChild(fieldDiv);
                    }
                  );
                }
              }
            }
          }
        } else if (newContentType === "multipart/form-data") {
          // Switch to form fields view for multipart/form-data
          const requestBodyEditorDiv = document.getElementById(
            "right-panel-request-body-editor"
          );
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "none";
          }

          // Show/create form fields container
          let formFieldsContainer = document.getElementById(
            "form-fields-container"
          );
          if (!formFieldsContainer) {
            formFieldsContainer = document.createElement("div");
            formFieldsContainer.id = "form-fields-container";
            formFieldsContainer.className = "space-y-2";
            if (requestBodyEditorDiv) {
              requestBodyEditorDiv.parentNode.insertBefore(
                formFieldsContainer,
                requestBodyEditorDiv.nextSibling
              );
            }
          }
          formFieldsContainer.style.display = "block";

          // Generate fields from schema for multipart/form-data
          if (
            endpointOperation &&
            endpointOperation.requestBody &&
            endpointOperation.requestBody.content &&
            endpointOperation.requestBody.content["multipart/form-data"]
          ) {
            const formSchemaInfo =
              endpointOperation.requestBody.content["multipart/form-data"];
            if (formSchemaInfo && formSchemaInfo.schema) {
              let resolvedSchema = formSchemaInfo.schema;

              // Resolve schema reference if needed
              if (formSchemaInfo.schema.$ref) {
                const refPath = formSchemaInfo.schema.$ref.split("/").slice(1);
                resolvedSchema = refPath.reduce(
                  (acc, part) => acc && acc[part],
                  window.swaggerData
                );
              }

              if (resolvedSchema && resolvedSchema.properties) {
                // Clear existing fields
                formFieldsContainer.innerHTML = "";

                // Generate form fields from schema
                const schemaProperties = resolvedSchema.properties;
                const requiredFields = resolvedSchema.required || [];

                Object.entries(schemaProperties).forEach(
                  ([fieldName, fieldSchema]) => {
                    const fieldDiv = document.createElement("div");
                    fieldDiv.className = "mb-2 flex items-center gap-2";

                    const labelWrapper = document.createElement("div");
                    labelWrapper.className =
                      "w-1/3 text-sm font-medium text-gray-300 pr-1";

                    const label = document.createElement("label");
                    const isRequired = requiredFields.includes(fieldName);
                    label.innerHTML = `<span class="font-bold">${fieldName}${
                      isRequired
                        ? '<span class="text-red-400 ml-0.5">*</span>'
                        : ""
                    }</span>`;

                    if (fieldSchema.description) {
                      label.title = fieldSchema.description;
                    }

                    labelWrapper.appendChild(label);

                    let input;
                    // Check if this is a file field for multipart/form-data
                    const isFileField =
                      fieldSchema.type === "string" &&
                      fieldSchema.format === "binary";

                    if (isFileField) {
                      // Create file input for binary fields in multipart forms
                      input = document.createElement("input");
                      input.type = "file";
                      input.className =
                        "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
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
                    } else {
                      input = document.createElement("input");
                      input.type =
                        fieldSchema.type === "number" ? "number" : "text";
                      input.className =
                        "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
                    }

                    input.name = fieldName;
                    input.placeholder =
                      fieldSchema.description || fieldSchema.example || "";
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
            }
          }
        } else {
          // Switch to Monaco editor view for JSON and other content types
          const requestBodyEditorDiv = document.getElementById(
            "right-panel-request-body-editor"
          );
          if (requestBodyEditorDiv) {
            requestBodyEditorDiv.style.display = "block";
          }

          // Convert form data to JSON if switching from form-encoded
          if (
            request.body &&
            typeof request.body === "string" &&
            request.body.includes("=")
          ) {
            try {
              const formData = new URLSearchParams(request.body);
              const jsonObj = {};
              formData.forEach((value, key) => {
                jsonObj[key] = value;
              });
              request.body = JSON.stringify(jsonObj, null, 2);

              if (window.requestBodyEditor) {
                window.requestBodyEditor.setValue(request.body);
              }
            } catch (e) {
              console.warn("Failed to convert form data to JSON:", e);
            }
          }
        }
      });
    } // Set the request body if available and if we should show the body section
    if (shouldShowBodySection) {
      // Determine content type from request headers FIRST, then from dropdown
      let contentType = "application/json"; // Default fallback

      if (request.headers) {
        // Try to get from request headers first
        const ctHeader = Object.entries(request.headers).find(
          ([key]) => key.toLowerCase() === "content-type"
        );
        if (ctHeader) {
          contentType = ctHeader[1];
        }
      }

      // If dropdown is available and has a value, use that as override
      if (requestBodyContentTypeSelect && requestBodyContentTypeSelect.value) {
        contentType = requestBodyContentTypeSelect.value;
      }
      if (contentType === "application/x-www-form-urlencoded" && request.body) {
        this.handleFormEncodedData(request, contentType);
      } else if (contentType === "multipart/form-data" && request.body) {
        this.handleMultipartFormData(request, contentType);
      } else {
        this.handleJSONOrOtherData(request, contentType);
      }
    }
    const labelClasses = "w-1/3 text-sm font-medium text-gray-300 pr-1";

    // Common function to create parameter div
    const createParameterDiv = (param, container, value = "") => {
      const paramRow = document.createElement("div");
      paramRow.className = "mb-1 flex items-center gap-1";

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
      paramRow.appendChild(labelWrapper);
      let input;
      if (param.schema && param.schema.enum) {
        input = document.createElement("select");
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
        param.schema.enum.forEach((enumValue) => {
          const option = document.createElement("option");
          option.value = enumValue;
          option.textContent = enumValue;
          input.appendChild(option);
        });
        if (value) {
          input.value = value;
        } else if (param.schema.default) {
          input.value = param.schema.default;
        }
      } else if (param.schema && param.schema.type === "boolean") {
        input = document.createElement("select");
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
        ["true", "false"].forEach((val) => {
          const option = document.createElement("option");
          option.value = val;
          option.textContent = val;
          input.appendChild(option);
        });
        if (value) {
          input.value = value.toString();
        } else if (typeof param.schema.default === "boolean") {
          input.value = param.schema.default.toString();
        } else {
          input.value = "false";
        }
      } else {
        input = document.createElement("input");
        input.type =
          param.schema && param.schema.type === "integer" ? "number" : "text";
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
        if (value) {
          input.value = value;
        } else if (param.schema && param.schema.default) {
          input.value = param.schema.default;
        }
      }

      input.name = param.name;
      input.dataset.paramIn = param.in;
      input.placeholder = param.description || "";
      if (param.required) {
        input.required = true;
      }

      paramRow.appendChild(input);
      container.appendChild(paramRow);
    };

    // Handle path parameters
    if (endpointOperation && endpointOperation.parameters) {
      // Get path parameters from the endpoint definition
      const pathParams = endpointOperation.parameters.filter(
        (p) => p.in === "path"
      );

      if (
        pathParams.length > 0 &&
        pathParametersSection &&
        pathParametersContainer
      ) {
        pathParametersSection.classList.remove("hidden");

        // Add count to path parameters header
        const pathParamHeader = pathParametersSection.querySelector("h3");
        if (pathParamHeader) {
          pathParamHeader.innerHTML = `Path Parameters <span class="endpoint-count ml-2">${pathParams.length}</span>`;
        }

        // Add each path parameter
        pathParams.forEach((param) => {
          // Check if this parameter has a value in the request
          let value = "";
          if (request.pathParams && request.pathParams[param.name]) {
            value = request.pathParams[param.name];
          }

          createParameterDiv(param, pathParametersContainer, value);
        });
      }

      // Get query parameters from the endpoint definition
      const queryParams = endpointOperation.parameters.filter(
        (p) => p.in === "query"
      );

      if (
        queryParams.length > 0 &&
        queryParametersSection &&
        queryParametersContainer
      ) {
        queryParametersSection.classList.remove("hidden");

        // Add count to query parameters header
        const queryParamHeader = queryParametersSection.querySelector("h3");
        if (queryParamHeader) {
          queryParamHeader.innerHTML = `Query Parameters <span class="endpoint-count ml-2">${queryParams.length}</span>`;
        }

        // Extract existing query parameters from request
        const requestQueryParams = {};

        // Check for query params in the queryParams object
        if (request.queryParams) {
          Object.assign(requestQueryParams, request.queryParams);
        }

        // Also check for query parameters in the URL
        if (request.path && request.path.includes("?")) {
          const queryString = request.path.split("?")[1];
          if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            urlParams.forEach((value, key) => {
              requestQueryParams[key] = value;
            });
          }
        }

        // Add each query parameter
        queryParams.forEach((param) => {
          // Check if this parameter has a value in the request
          let value = "";
          if (requestQueryParams[param.name]) {
            value = requestQueryParams[param.name];
          }

          createParameterDiv(param, queryParametersContainer, value);
        });
      }

      // Handle headers
      const headerParams = endpointOperation.parameters.filter(
        (p) => p.in === "header"
      );

      if (headerParams.length > 0 && headersSection && headersContainer) {
        headersSection.classList.remove("hidden");

        // Add count to headers header
        const headersParamHeader = headersSection.querySelector("h3");
        if (headersParamHeader) {
          headersParamHeader.innerHTML = `Headers <span class="endpoint-count ml-2">${headerParams.length}</span>`;
        }

        // Add each header parameter
        headerParams.forEach((param) => {
          // Skip content-type header as it's handled separately
          if (param.name.toLowerCase() === "content-type") {
            return;
          }

          // Check if this parameter has a value in the request
          let value = "";
          if (request.headers && request.headers[param.name]) {
            value = request.headers[param.name];
          }

          createParameterDiv(param, headersContainer, value);
        });

        // Also add any custom headers from the request that aren't in the definition
        if (request.headers) {
          const definedHeaderNames = headerParams.map((p) =>
            p.name.toLowerCase()
          );

          Object.entries(request.headers).forEach(([name, value]) => {
            if (
              name.toLowerCase() !== "content-type" &&
              !definedHeaderNames.includes(name.toLowerCase())
            ) {
              const headerRow = document.createElement("div");
              headerRow.className = "mb-1 flex items-center gap-1";

              const labelWrapper = document.createElement("div");
              labelWrapper.className =
                "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

              const label = document.createElement("label");
              label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
              labelWrapper.appendChild(label);
              const input = document.createElement("input");
              input.type = "text";
              input.name = name;
              input.value = value;
              input.className =
                "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

              headerRow.appendChild(labelWrapper);
              headerRow.appendChild(input);
              headersContainer.appendChild(headerRow);
            }
          });
        }
      } else if (request.headers && Object.keys(request.headers).length > 0) {
        // If no header parameters in definition but request has headers
        headersSection.classList.remove("hidden");

        // Add each header as a form field
        Object.entries(request.headers).forEach(([name, value]) => {
          if (name.toLowerCase() !== "content-type") {
            // Content-type is handled separately
            const headerRow = document.createElement("div");
            headerRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);
            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            headerRow.appendChild(labelWrapper);
            headerRow.appendChild(input);
            headersContainer.appendChild(headerRow);
          }
        });
      }
    } else {
      // Fallback to the original behavior if endpoint definition is not found

      // Set Path Parameters if available
      if (request.pathParams && Object.keys(request.pathParams).length > 0) {
        if (pathParametersSection && pathParametersContainer) {
          pathParametersSection.classList.remove("hidden");

          // Add each path parameter as a form field
          Object.entries(request.pathParams).forEach(([name, value]) => {
            const paramRow = document.createElement("div");
            paramRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);

            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            paramRow.appendChild(labelWrapper);
            paramRow.appendChild(input);
            pathParametersContainer.appendChild(paramRow);
          });
        }
      }

      // Set Query Parameters if available
      if (request.queryParams && Object.keys(request.queryParams).length > 0) {
        if (queryParametersSection && queryParametersContainer) {
          queryParametersSection.classList.remove("hidden");

          // Add each query parameter as a form field
          Object.entries(request.queryParams).forEach(([name, value]) => {
            const paramRow = document.createElement("div");
            paramRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);
            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            paramRow.appendChild(labelWrapper);
            paramRow.appendChild(input);
            queryParametersContainer.appendChild(paramRow);
          });
        }
      } else if (request.path && request.path.includes("?")) {
        const queryParamsSection = document.getElementById(
          "right-panel-query-parameters-section"
        );
        const queryParamsContainer = document.getElementById(
          "right-panel-query-parameters-container"
        );

        if (queryParamsSection && queryParamsContainer) {
          queryParamsSection.classList.remove("hidden");

          // Extract and display query parameters from URL
          const queryString = request.path.split("?")[1];
          if (queryString) {
            const params = new URLSearchParams(queryString);
            params.forEach((value, key) => {
              const paramRow = document.createElement("div");
              paramRow.className = "mb-1 flex items-center gap-1";

              const labelWrapper = document.createElement("div");
              labelWrapper.className =
                "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

              const label = document.createElement("label");
              label.innerHTML = `<span class="font-bold text-white">${key}</span>`;
              labelWrapper.appendChild(label);

              const input = document.createElement("input");
              input.type = "text";
              input.name = key;
              input.value = value;
              input.className =
                "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

              paramRow.appendChild(labelWrapper);
              paramRow.appendChild(input);
              queryParamsContainer.appendChild(paramRow);
            });
          }
        }
      }

      // Set headers if available

      if (
        request.headers &&
        Object.keys(request.headers.filter((h) => h.name !== "contenty-type"))
          .length > 0
      ) {
        if (headersSection && headersContainer) {
          headersSection.classList.remove("hidden");

          // Add each header as a form field
          Object.entries(request.headers).forEach(([name, value]) => {
            // Content-type is handled separately
            const headerRow = document.createElement("div");
            headerRow.className = "mb-1 flex items-center gap-1";

            const labelWrapper = document.createElement("div");
            labelWrapper.className =
              "flex items-center h-7 w-1/3 text-sm font-medium text-gray-300 pr-4";

            const label = document.createElement("label");
            label.innerHTML = `<span class="font-bold text-white">${name}</span>`;
            labelWrapper.appendChild(label);

            const input = document.createElement("input");
            input.type = "text";
            input.name = name;
            input.value = value;
            input.className =
              "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500";

            headerRow.appendChild(labelWrapper);
            headerRow.appendChild(input);
            headersContainer.appendChild(headerRow);
          });
        }
      }
    }
  }
  /**
   * Create or update action buttons in the Try It Out section
   * @param {boolean} isCollectionView - Whether this is a view from collection results
   * @param {string} requestId - ID of the request being viewed (only if isCollectionView is true)
   */ setupTryItOutActionButtons(isCollectionView = false, requestId = null) {
    // Find or create container for action buttons
    let actionButtonsContainer = document.getElementById(
      "try-it-out-action-buttons"
    );

    if (!actionButtonsContainer) {
      // Find the Execute button directly
      const rightPanelPath = document.getElementById("right-panel-path");

      if (!rightPanelPath) {
        console.error(
          "Could not find rightPanelPath for adding action buttons"
        );
        return;
      }

      // Create a container for our action buttons
      actionButtonsContainer = document.createElement("div");
      actionButtonsContainer.id = "try-it-out-action-buttons";
      actionButtonsContainer.className = "flex items-center";

      // Insert before the rightPanelPath
      rightPanelPath.parentNode.appendChild(actionButtonsContainer);
    }

    // Clear existing buttons
    actionButtonsContainer.innerHTML = "";

    if (isCollectionView && requestId) {
      // Store the request ID for later use
      this.currentRequestId = requestId; // Create a Save button for updating the collection request
      const saveButton = document.createElement("button");
      saveButton.id = "save-to-collection-button";
      saveButton.className =
        "px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors flex items-center justify-center";
      saveButton.dataset.tooltip = "Save changes to collection";
      saveButton.innerHTML = `
  <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zM7 5h6v4H7V5zm8 14H9v-6h6v6z" />
  </svg> Save
`;

      // Add click handler
      saveButton.addEventListener("click", () =>
        this.updateExistingRequest(this.currentRequestId)
      );

      // Add tooltip functionality
      saveButton.addEventListener("mouseenter", handleTooltipMouseEnter);
      saveButton.addEventListener("mouseleave", handleTooltipMouseLeave);

      // Add button to container
      actionButtonsContainer.appendChild(saveButton);
    } else {
      // Reset current request ID
      this.currentRequestId = null; // Create an Add to Collection button (+ svg only)
      const addButton = document.createElement("button");
      addButton.id = "add-to-collection-button";
      addButton.className =
        "px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors flex items-center justify-center";
      addButton.dataset.tooltip = "Add request to collection";
      addButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg> Add
      `; // Add click handler
      addButton.addEventListener("click", () =>
        this.addCurrentRequestToCollection()
      );

      // Add tooltip functionality
      addButton.addEventListener("mouseenter", handleTooltipMouseEnter);
      addButton.addEventListener("mouseleave", handleTooltipMouseLeave);

      // Add button to container
      actionButtonsContainer.appendChild(addButton);
    }
  }

  /**
   * Update an existing request in the collection
   * @param {string} requestId - ID of the request to update
   */
  updateExistingRequest(requestId) {
    if (!requestId) {
      this.showToast("No request ID provided", "error");
      return;
    }

    // Get current request details from the UI
    const pathElement = document.querySelector("#right-panel-path");
    const methodElement = document.querySelector("#right-panel-method");

    if (!pathElement || !methodElement) {
      this.showToast("Could not determine current request details", "error");
      return;
    }

    // Get current path and method
    const path = pathElement.textContent;
    const method = methodElement.textContent.toUpperCase();

    // Get parameters
    const pathParams = {};
    const pathParametersContainer = document.getElementById(
      "right-panel-path-parameters-container"
    );
    if (pathParametersContainer) {
      pathParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            pathParams[input.name] = input.value;
          }
        });
    }

    // Get query parameters
    const queryParams = {};
    const queryParametersContainer = document.getElementById(
      "right-panel-query-parameters-container"
    );
    if (queryParametersContainer) {
      queryParametersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            queryParams[input.name] = input.value;
          }
        });
    }

    // Get headers
    const headers = {};
    const headersContainer = document.getElementById(
      "right-panel-headers-container"
    );
    if (headersContainer) {
      headersContainer
        .querySelectorAll("input, select, textarea")
        .forEach((input) => {
          if (input.name && input.value) {
            headers[input.name] = input.value;
          }
        });
    } // Get request body section status
    const requestBodySection = document.getElementById(
      "right-panel-request-body-section"
    );
    const isBodySectionVisible =
      requestBodySection && !requestBodySection.classList.contains("hidden"); // Get request body content type only if body section is visible
    const contentTypeSelect = document.getElementById(
      "right-panel-request-body-content-type-select"
    );
    if (isBodySectionVisible && contentTypeSelect && contentTypeSelect.value) {
      headers["Content-Type"] = contentTypeSelect.value;
    } else {
      // Remove Content-Type header if body is not being used
      delete headers["Content-Type"];
    }

    // Get request body only if body section is visible
    let body = undefined;
    if (isBodySectionVisible) {
      const selectedContentType = contentTypeSelect
        ? contentTypeSelect.value
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
              formData.append(input.name, input.value);
            }
          });

          body = formData.toString();
        }
      } else if (selectedContentType === "multipart/form-data") {
        // Handle multipart/form-data - store file info for collection
        const formFieldsContainer = document.getElementById(
          "form-fields-container"
        );
        if (
          formFieldsContainer &&
          formFieldsContainer.style.display !== "none"
        ) {
          const multipartData = {};
          const formInputs = formFieldsContainer.querySelectorAll(
            "input, select, textarea"
          );

          formInputs.forEach((input) => {
            if (input.name) {
              if (input.type === "file") {
                // For files, store filename and type info
                if (input.files && input.files.length > 0) {
                  const file = input.files[0];
                  multipartData[input.name] = {
                    type: "file",
                    filename: file.name,
                    size: file.size,
                    mimeType: file.type,
                  };
                }
              } else if (input.value) {
                // Handle regular form fields
                multipartData[input.name] = {
                  type: "text",
                  value: input.value,
                };
              }
            }
          });

          body = JSON.stringify(multipartData);
        }
      } else {
        // Handle JSON and other content types using Monaco editor
        if (window.requestBodyEditor) {
          body = window.requestBodyEditor.getValue();
          // If body is empty string or whitespace, set to undefined
          if (!body || body.trim() === "") {
            body = undefined;
          }
        }
      }
    }

    // Create request name from path
    const name = path.split("/").pop() || method;

    // Update the request in the collection
    if (
      this.collectionRunner.updateRequest(requestId, {
        name: `${method} ${name}`,
        path,
        method,
        pathParams,
        queryParams,
        headers,
        body,
        id: requestId, // Preserve the ID
      })
    ) {
      this.showToast("Request updated in collection");

      // Refresh the collection list if we're in the collection view
      this.refreshRequestList();
    } else {
      this.showToast("Failed to update request", "error");
    }
  }

  /**
   * Show the output parameters popup for a specific request
   * @param {string} requestId - ID of the request to configure output parameters for
   */
  showOutputParametersPopup(requestId) {
    // Find the request in the collection
    const request = this.collectionRunner.collection.find(
      (r) => r.id === requestId
    );
    if (!request) {
      this.showToast("Request not found", "error");
      return;
    }

    // Create the modal if it doesn't exist
    this.createOutputParametersModal();

    // Populate the modal with existing output parameters
    this.populateOutputParametersModal(request);

    // Store the current request ID for saving
    this.currentOutputParamsRequestId = requestId;

    // Show the modal
    const modal = document.getElementById("output-parameters-modal");
    if (modal) {
      modal.classList.add("open");
    }
  }

  /**
   * Create the output parameters modal
   */
  createOutputParametersModal() {
    // Check if modal already exists
    if (document.getElementById("output-parameters-modal")) {
      return;
    }
    const modalHtml = `
      <div id="output-parameters-modal" class="collection-modal-overlay">
        <div class="collection-modal bg-gray-800 text-white border border-gray-700 shadow-lg" style="width: 40rem; max-width: 90vw;">
          <div class="collection-modal-header border-b border-gray-700">
            <h3 class="collection-modal-title">Output Parameters</h3>
            <span class="collection-modal-close text-gray-400 hover:text-gray-200" id="close-output-params-modal">×</span>
          </div>
          <div class="collection-modal-body" style="max-height: 60vh; overflow-y: auto;">            <div class="mb-4">
              <p class="text-gray-300 text-sm mb-4">
                Define output parameters to extract data from API responses for use in subsequent requests.
              </p>
            </div>
              <!-- Parameters Table -->
            <div class="bg-gray-700 rounded-md border border-gray-600">
              <table class="w-full">                <thead>
                  <tr class="border-b border-gray-600">
                    <th class="text-left px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <div class="flex items-center">
                        Parameter Name
                        <button data-popover-target="param-usage-popover" data-popover-placement="bottom-start" type="button" class="ml-1">
                          <svg class="w-4 h-4 text-gray-400 hover:text-gray-300" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="sr-only">Show parameter usage</span>
                        </button>
                      </div>
                    </th>
                    <th class="text-left px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <div class="flex items-center">
                        JSON Path Expression
                        <button data-popover-target="jsonpath-examples-popover" data-popover-placement="bottom-end" type="button" class="ml-1">
                          <svg class="w-4 h-4 text-gray-400 hover:text-gray-300" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="sr-only">Show JSON Path examples</span>
                        </button>
                      </div>
                    </th>                    <th class="text-center px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider w-12">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </th>
                  </tr>
                </thead>
                <tbody id="output-parameters-table-body">
                  <!-- Output parameters will be added here -->
                </tbody>
              </table>            </div>
            
            <!-- Parameter Usage Popover -->
            <div data-popover id="param-usage-popover" role="tooltip" class="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 w-80">
              <div class="p-3 space-y-2">
                <h3 class="font-semibold text-gray-900 ">Using Output Parameters</h3>
                <div class="space-y-2 text-xs">
                  <div class="text-gray-700">Output parameters extract values from API responses and make them available as variables in subsequent requests.</div>
                  <div class="mt-2">
                    <strong class="text-gray-900 dark:text-white">Usage in requests:</strong>
                  </div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">{{@paramName}}</code> - Use in path parameters, query params, headers, or request body</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">{{@userId}}</code> - Example: extracted user ID from previous response</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">{{@authToken}}</code> - Example: extracted authentication token</div>
                  <div class="mt-2 text-gray-600 dark:text-gray-400">
                    <em>Note: The @ symbol distinguishes output parameters from regular variables.</em>
                  </div>
                </div>
              </div>
              <div data-popper-arrow></div>
            </div>

            <!-- JSON Path Examples Popover -->
            <div data-popover id="jsonpath-examples-popover" role="tooltip" class="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 w-80">
              <div class="p-3 space-y-2">
                <h3 class="font-semibold text-gray-900">JSON Path Examples</h3>
                <div class="space-y-2 text-xs">
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.data.id</code> - Extract ID from data object</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.token</code> - Extract token from root</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.results[0].name</code> - First item's name from results array</div>
                  <div class="text-gray-700">• <code class="bg-gray-200 px-1 rounded font-mono">$.user.profile.email</code> - Nested object property</div>
                </div>
              </div>
              <div data-popper-arrow></div>
            </div>
            
            <button id="add-output-parameter" class="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Parameter
            </button>
          </div>
          <div class="collection-modal-footer border-t border-gray-700 pt-3">
            <button id="cancel-output-params-modal" class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
              Cancel
            </button>
            <button id="save-output-params" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Bind events
    this.bindOutputParametersModalEvents();
  }

  /**
   * Bind events for the output parameters modal
   */
  bindOutputParametersModalEvents() {
    // Close modal events
    document
      .getElementById("close-output-params-modal")
      ?.addEventListener("click", () => {
        this.closeOutputParametersModal();
      });

    document
      .getElementById("cancel-output-params-modal")
      ?.addEventListener("click", () => {
        this.closeOutputParametersModal();
      });

    // Add parameter button
    document
      .getElementById("add-output-parameter")
      ?.addEventListener("click", () => {
        this.addOutputParameterRow();
      });

    // Save parameters
    document
      .getElementById("save-output-params")
      ?.addEventListener("click", () => {
        this.saveOutputParameters();
      }); // Close modal when clicking outside
    document
      .getElementById("output-parameters-modal")
      ?.addEventListener("click", (e) => {
        if (e.target.id === "output-parameters-modal") {
          this.closeOutputParametersModal();
        }
      });

    // Initialize popover for JSON Path examples
    this.initializeJsonPathPopover();

    // Initialize popover for parameter usage help
    this.initializeParameterUsagePopover();
  }
  /**
   * Populate the output parameters modal with existing data
   * @param {Object} request - The request object with potential output parameters
   */
  populateOutputParametersModal(request) {
    const container = document.getElementById("output-parameters-table-body");
    if (!container) return;

    // Clear existing parameters
    container.innerHTML = "";

    // Add existing output parameters
    if (request.outputParameters && request.outputParameters.length > 0) {
      request.outputParameters.forEach((param) => {
        this.addOutputParameterRow(param.name, param.jsonPath);
      });
    } else {
      // Add one empty row by default
      this.addOutputParameterRow();
    }
  }
  /**
   * Add a new output parameter row
   * @param {string} name - Parameter name
   * @param {string} jsonPath - JSON path expression
   */
  addOutputParameterRow(name = "", jsonPath = "") {
    const container = document.getElementById("output-parameters-table-body");
    if (!container) return;
    const row = document.createElement("tr");
    row.className =
      "output-parameter-row border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors";
    row.innerHTML = `
      <td class="border-r border-gray-600">        <input type="text" class="parameter-name w-full h-full px-3 py-2 bg-transparent border-0 text-white text-xs font-mono focus:outline-none focus:ring-0 focus:bg-gray-600" 
               placeholder="paramName" value="${name}" style="min-height: 36px;">
      </td>
      <td class="border-r border-gray-600">
        <input type="text" class="parameter-jsonpath w-full h-full px-3 py-2 bg-transparent border-0 text-white text-xs font-mono focus:outline-none focus:ring-0 focus:bg-gray-600" 
               placeholder="$.propertyName" value="${jsonPath}" style="min-height: 36px;">
      </td>      <td class="text-center" style="min-height: 36px; padding: 8px;">
        <button class="remove-output-parameter text-red-400 hover:text-red-300 p-1 rounded transition-colors" title="Remove Parameter">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    `;

    // Bind remove button event
    row
      .querySelector(".remove-output-parameter")
      .addEventListener("click", () => {
        row.remove();
      });

    container.appendChild(row);
  }
  /**
   * Save the output parameters for the current request
   */
  saveOutputParameters() {
    if (!this.currentOutputParamsRequestId) {
      this.showToast("No request selected", "error");
      return;
    }

    const container = document.getElementById("output-parameters-table-body");
    if (!container) return;

    const outputParameters = [];
    const rows = container.querySelectorAll(".output-parameter-row");

    rows.forEach((row) => {
      const name = row.querySelector(".parameter-name").value.trim();
      const jsonPath = row.querySelector(".parameter-jsonpath").value.trim();

      if (name && jsonPath) {
        outputParameters.push({
          name,
          jsonPath,
        });
      }
    });

    // Find and update the request
    const request = this.collectionRunner.collection.find(
      (r) => r.id === this.currentOutputParamsRequestId
    );
    if (request) {
      request.outputParameters = outputParameters;

      // If we have a current collection, auto-save it
      if (this.currentCollectionName) {
        this.collectionRunner.saveCollection(this.currentCollectionName);
      }

      this.showToast(
        `Output parameters updated for ${request.name}`,
        "success"
      );
      this.closeOutputParametersModal();
    } else {
      this.showToast("Request not found", "error");
    }
  }

  /**
   * Close the output parameters modal
   */
  closeOutputParametersModal() {
    const modal = document.getElementById("output-parameters-modal");
    if (modal) {
      modal.classList.remove("open");
    }
    this.currentOutputParamsRequestId = null;
  }

  /**
   * Initialize the JSON Path examples popover
   */
  initializeJsonPathPopover() {
    const trigger = document.querySelector(
      '[data-popover-target="jsonpath-examples-popover"]'
    );
    const popover = document.getElementById("jsonpath-examples-popover");

    if (!trigger || !popover) return;

    let isVisible = false;
    let hideTimeout = null;

    const showPopover = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      popover.classList.remove("invisible", "opacity-0");
      popover.classList.add("visible", "opacity-100");
      isVisible = true;

      // Position the popover
      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      // Position to the bottom-end of the trigger
      let top = triggerRect.bottom + 8;
      let left = triggerRect.right - popoverRect.width;

      // Adjust if popover goes outside viewport
      if (left < 10) left = 10;
      if (top + popoverRect.height > window.innerHeight - 10) {
        top = triggerRect.top - popoverRect.height - 8;
      }

      popover.style.position = "fixed";
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.zIndex = "1000";
    };

    const hidePopover = () => {
      hideTimeout = setTimeout(() => {
        popover.classList.add("invisible", "opacity-0");
        popover.classList.remove("visible", "opacity-100");
        isVisible = false;
      }, 150);
    };

    // Show on hover/click
    trigger.addEventListener("mouseenter", showPopover);
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      if (isVisible) {
        hidePopover();
      } else {
        showPopover();
      }
    });

    // Hide when leaving trigger
    trigger.addEventListener("mouseleave", hidePopover);

    // Keep popover visible when hovering over it
    popover.addEventListener("mouseenter", () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });

    popover.addEventListener("mouseleave", hidePopover);

    // Hide when clicking outside
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !popover.contains(e.target)) {
        hidePopover();
      }
    });
  }

  /**
   * Initialize the Parameter Usage help popover
   */
  initializeParameterUsagePopover() {
    const trigger = document.querySelector(
      '[data-popover-target="param-usage-popover"]'
    );
    const popover = document.getElementById("param-usage-popover");

    if (!trigger || !popover) return;

    let isVisible = false;
    let hideTimeout = null;

    const showPopover = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      popover.classList.remove("invisible", "opacity-0");
      popover.classList.add("visible", "opacity-100");
      isVisible = true;

      // Position the popover
      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      // Position to the bottom-start of the trigger
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // Adjust if popover goes outside viewport
      if (left + popoverRect.width > window.innerWidth - 10) {
        left = window.innerWidth - popoverRect.width - 10;
      }
      if (top + popoverRect.height > window.innerHeight - 10) {
        top = triggerRect.top - popoverRect.height - 8;
      }

      popover.style.position = "fixed";
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.zIndex = "1000";
    };

    const hidePopover = () => {
      hideTimeout = setTimeout(() => {
        popover.classList.add("invisible", "opacity-0");
        popover.classList.remove("visible", "opacity-100");
        isVisible = false;
      }, 150);
    };

    // Show on hover/click
    trigger.addEventListener("mouseenter", showPopover);
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      if (isVisible) {
        hidePopover();
      } else {
        showPopover();
      }
    });

    // Hide when leaving trigger
    trigger.addEventListener("mouseleave", hidePopover);

    // Keep popover visible when hovering over it
    popover.addEventListener("mouseenter", () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });

    popover.addEventListener("mouseleave", hidePopover);

    // Hide when clicking outside
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !popover.contains(e.target)) {
        hidePopover();
      }
    });
  }

  /**
   * Get the API prefix for localStorage keys
   * @returns {string} - The API prefix
   */
  getApiPrefix() {
    return window.swaggerData?.info?.title && window.swaggerData?.info?.version
      ? `${window.swaggerData.info.title
          .toLowerCase()
          .replace(/\s+/g, "_")}_${window.swaggerData.info.version
          .toLowerCase()
          .replace(/\s+/g, "_")}`
      : "openapi_ui_default";
  }

  /**
   * Save the current active collection tab to localStorage
   * @param {string} tabId - The tab ID to save
   */
  saveActiveTab(tabId) {
    try {
      const storageKey = `${this.getApiPrefix()}_collection_active_tab`;
      localStorage.setItem(storageKey, tabId);
    } catch (error) {
      console.error("Error saving active tab:", error);
    }
  }

  /**
   * Load the saved active collection tab from localStorage
   * @returns {string} - The saved tab ID or default tab ID
   */
  loadActiveTab() {
    try {
      const storageKey = `${this.getApiPrefix()}_collection_active_tab`;
      const savedTab = localStorage.getItem(storageKey);
      return savedTab || "collection-tab"; // Default to collection-tab if none saved
    } catch (error) {
      console.error("Error loading active tab:", error);
      return "collection-tab";
    }
  }

  /**
   * Restore the previously active collection tab
   * Called when the collection runner section is activated
   */
  restoreActiveTab() {
    const activeTab = this.loadActiveTab();

    // Show the saved active tab content
    document.querySelectorAll(".collection-tab-content").forEach((tab) => {
      if (tab.id === activeTab) {
        tab.classList.remove("hidden");
        tab.style.opacity = "1";
      } else {
        tab.classList.add("hidden");
      }
    });

    // Update the tab buttons
    document.querySelectorAll(".collection-tab[data-tab]").forEach((btn) => {
      if (btn.dataset.tab === activeTab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  /**
   * Get endpoint summary from OpenAPI spec
   * @param {string} path - The endpoint path
   * @param {string} method - The HTTP method
   * @returns {string|null} - The summary if found, null otherwise
   */
  getEndpointSummary(path, method) {
    if (!window.swaggerData || !window.swaggerData.paths) {
      return null;
    }

    // Try direct path match first
    if (
      window.swaggerData.paths[path] &&
      window.swaggerData.paths[path][method.toLowerCase()]
    ) {
      return (
        window.swaggerData.paths[path][method.toLowerCase()].summary || null
      );
    }

    // Create clean path for comparison (remove curly braces)
    const cleanRequestPath =
      window.utils && window.utils.createCleanPath
        ? window.utils.createCleanPath(path)
        : path.replace(/[{}]/g, "");

    // Search through all paths for a match
    for (const [swaggerPath, pathObj] of Object.entries(
      window.swaggerData.paths
    )) {
      const cleanSwaggerPath =
        window.utils && window.utils.createCleanPath
          ? window.utils.createCleanPath(swaggerPath)
          : swaggerPath.replace(/[{}]/g, "");

      if (
        cleanSwaggerPath === cleanRequestPath &&
        pathObj[method.toLowerCase()]
      ) {
        return pathObj[method.toLowerCase()].summary || null;
      }
    }
    return null;
  }

  /**
   * Format file size in a human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
  /**
   * Handle multipart/form-data content type display
   * @param {Object} request - The request object
   * @param {string} contentType - The content type
   */ handleMultipartFormData(request, contentType) {
    // Hide Monaco editor and show form fields for multipart content
    const requestBodyEditorDiv = document.getElementById(
      "right-panel-request-body-editor"
    );
    if (requestBodyEditorDiv) {
      requestBodyEditorDiv.style.display = "none";
    }

    // Create or show form fields container
    let formFieldsContainer = document.getElementById("form-fields-container");
    if (!formFieldsContainer) {
      formFieldsContainer = document.createElement("div");
      formFieldsContainer.id = "form-fields-container";
      formFieldsContainer.className = "space-y-2";
      if (requestBodyEditorDiv) {
        requestBodyEditorDiv.parentNode.insertBefore(
          formFieldsContainer,
          requestBodyEditorDiv.nextSibling
        );
      }
    }

    // Clear previous form fields
    formFieldsContainer.innerHTML = "";
    formFieldsContainer.style.display = "block";

    // Parse existing multipart data if available
    let multipartData = {};
    if (request.body) {
      try {
        multipartData = JSON.parse(request.body);
      } catch (e) {
        console.warn("Failed to parse multipart body:", e);
      }
    }

    // Try to get schema information from the endpoint operation
    let schemaProperties = null;
    let requiredFields = [];

    const endpointOperation = this.findEndpointOperation(request);
    if (
      endpointOperation &&
      endpointOperation.requestBody &&
      endpointOperation.requestBody.content
    ) {
      const formSchemaInfo =
        endpointOperation.requestBody.content["multipart/form-data"];
      if (formSchemaInfo && formSchemaInfo.schema) {
        let resolvedSchema = formSchemaInfo.schema;

        // Resolve schema reference if needed
        if (formSchemaInfo.schema.$ref) {
          const refPath = formSchemaInfo.schema.$ref.split("/").slice(1);
          resolvedSchema = refPath.reduce(
            (acc, part) => acc && acc[part],
            window.swaggerData
          );
        }

        if (resolvedSchema && resolvedSchema.properties) {
          schemaProperties = resolvedSchema.properties;
          requiredFields = resolvedSchema.required || [];
        }
      }
    }

    // Generate ALL schema properties first (like query parameters), then populate with saved values
    if (schemaProperties) {
      Object.entries(schemaProperties).forEach(([fieldName, fieldSchema]) => {
        const fieldData = multipartData[fieldName] || {}; // Get saved data if exists, otherwise empty object

        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("label");
        const isRequired = requiredFields.includes(fieldName);
        label.innerHTML = `<span class="font-bold">${fieldName}${
          isRequired ? '<span class="text-red-400 ml-0.5">*</span>' : ""
        }</span>`;

        // Add description as tooltip if available
        if (fieldSchema.description) {
          label.title = fieldSchema.description;
        }

        labelWrapper.appendChild(label);

        let input;
        // Check if this is a file field for multipart/form-data
        const isFileField =
          fieldData.type === "file" ||
          (fieldSchema.type === "string" && fieldSchema.format === "binary");

        if (isFileField) {
          // Create file input for binary fields in multipart forms
          input = document.createElement("input");
          input.type = "file";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";

          // For existing files, show file metadata
          if (fieldData.type === "file" && fieldData.filename) {
            const fileInfo = document.createElement("div");
            fileInfo.className = "text-xs text-gray-400 mt-1";
            fileInfo.textContent = `Previous: ${fieldData.filename} (${
              fieldData.size
                ? CollectionRunnerUI.formatFileSize(fieldData.size)
                : "unknown size"
            })`;
            fieldDiv.appendChild(fileInfo);
          }
        } else if (fieldSchema.enum) {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          fieldSchema.enum.forEach((enumValue) => {
            const option = document.createElement("option");
            option.value = enumValue;
            option.textContent = enumValue;
            if (fieldData.type === "text" && fieldData.value === enumValue) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else if (fieldSchema.type === "boolean") {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          ["true", "false"].forEach((val) => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            if (fieldData.type === "text" && fieldData.value === val) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else {
          input = document.createElement("input");
          input.type = fieldSchema.type === "number" ? "number" : "text";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
        }

        input.name = fieldName;

        // Set value from saved data (except for file inputs)
        if (!isFileField && fieldData.type === "text" && fieldData.value) {
          input.value = fieldData.value;
        }

        // Set placeholder
        input.placeholder =
          fieldSchema.description || fieldSchema.example || "";
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
      });
    } else {
      // Fallback to old behavior if no schema properties - show saved fields only
      Object.entries(multipartData).forEach(([key, fieldData]) => {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("label");
        label.innerHTML = `<span class="font-bold">${key}</span>`;
        labelWrapper.appendChild(label);

        let input;
        const isFileField = fieldData.type === "file";

        if (isFileField) {
          input = document.createElement("input");
          input.type = "file";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";

          if (fieldData.filename) {
            const fileInfo = document.createElement("div");
            fileInfo.className = "text-xs text-gray-400 mt-1";
            fileInfo.textContent = `Previous: ${fieldData.filename} (${
              fieldData.size
                ? CollectionRunnerUI.formatFileSize(fieldData.size)
                : "unknown size"
            })`;
            fieldDiv.appendChild(fileInfo);
          }
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          if (fieldData.value) {
            input.value = fieldData.value;
          }
        }

        input.name = key;

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
      });
    }
  }

  /**
   * Handle application/x-www-form-urlencoded content type display
   * @param {Object} request - The request object
   * @param {string} contentType - The content type
   */
  handleFormEncodedData(request, contentType) {
    // Hide Monaco editor and show form fields for form-encoded content
    const requestBodyEditorDiv = document.getElementById(
      "right-panel-request-body-editor"
    );
    if (requestBodyEditorDiv) {
      requestBodyEditorDiv.style.display = "none";
    }

    // Create or show form fields container
    let formFieldsContainer = document.getElementById("form-fields-container");
    if (!formFieldsContainer) {
      formFieldsContainer = document.createElement("div");
      formFieldsContainer.id = "form-fields-container";
      formFieldsContainer.className = "space-y-2";
      if (requestBodyEditorDiv) {
        requestBodyEditorDiv.parentNode.insertBefore(
          formFieldsContainer,
          requestBodyEditorDiv.nextSibling
        );
      }
    }

    // Clear previous form fields
    formFieldsContainer.innerHTML = "";
    formFieldsContainer.style.display = "block"; // Parse the URL-encoded body to populate form fields
    let formData = {};
    if (request.body) {
      try {
        const urlSearchParams = new URLSearchParams(request.body);
        urlSearchParams.forEach((value, key) => {
          formData[key] = value;
        });
      } catch (e) {
        console.warn("Failed to parse form-encoded body:", e);
      }
    }

    // Try to get schema information from the endpoint operation
    let schemaProperties = null;
    let requiredFields = [];

    const endpointOperation = this.findEndpointOperation(request);

    if (
      endpointOperation &&
      endpointOperation.requestBody &&
      endpointOperation.requestBody.content
    ) {
      const formSchemaInfo =
        endpointOperation.requestBody.content[
          "application/x-www-form-urlencoded"
        ];
      if (formSchemaInfo && formSchemaInfo.schema) {
        let resolvedSchema = formSchemaInfo.schema;

        // Resolve schema reference if needed
        if (formSchemaInfo.schema.$ref) {
          const refPath = formSchemaInfo.schema.$ref.split("/").slice(1);
          resolvedSchema = refPath.reduce(
            (acc, part) => acc && acc[part],
            window.swaggerData
          );
        }

        if (resolvedSchema && resolvedSchema.properties) {
          schemaProperties = resolvedSchema.properties;
          requiredFields = resolvedSchema.required || [];
        }
      }
    } // Generate ALL schema properties first (like query parameters), then populate with saved values
    if (schemaProperties) {
      Object.entries(schemaProperties).forEach(([fieldName, fieldSchema]) => {
        const savedValue = formData[fieldName] || ""; // Get saved value if exists, otherwise empty

        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("div");
        label.className = "flex items-center justify-between";
        const isRequired = requiredFields.includes(fieldName);

        const typeDisplay = window.formatTypeDisplay
          ? window.formatTypeDisplay(fieldSchema)
          : fieldSchema.type || "string";
        label.innerHTML = `<span class="font-bold">${fieldName}${
          isRequired ? '<span class="text-red-400 ml-0.5">*</span>' : ""
        }</span> <code class="text-sm text-blue-800 bg-blue-100 px-1 py-0.5 rounded font-mono">${typeDisplay}</code>`;

        // Add description as tooltip if available
        if (fieldSchema.description) {
          label.title = fieldSchema.description;
        }

        labelWrapper.appendChild(label);

        let input;
        if (fieldSchema.enum) {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          fieldSchema.enum.forEach((enumValue) => {
            const option = document.createElement("option");
            option.value = enumValue;
            option.textContent = enumValue;
            if (savedValue === enumValue) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else if (fieldSchema.type === "boolean") {
          input = document.createElement("select");
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          ["true", "false"].forEach((val) => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            if (savedValue === val) {
              option.selected = true;
            }
            input.appendChild(option);
          });
        } else {
          input = document.createElement("input");
          input.type = fieldSchema.type === "number" ? "number" : "text";
          input.className =
            "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
          input.value = savedValue;
        }

        input.name = fieldName;
        input.placeholder =
          fieldSchema.description || fieldSchema.example || "";
        if (isRequired) {
          input.required = true;
        }

        // Add input change listener for variable detection
        input.addEventListener("input", () => {
          if (window.highlightVariablePlaceholders) {
            window.highlightVariablePlaceholders(input);
          }
        });

        fieldDiv.appendChild(labelWrapper);
        fieldDiv.appendChild(input);
        formFieldsContainer.appendChild(fieldDiv);
      });
    } else {
      // Fallback to old behavior if no schema properties - show saved fields only
      Object.entries(formData).forEach(([key, value]) => {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "mb-2 flex items-center gap-2";

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "w-1/3 text-sm font-medium text-gray-300 pr-1";

        const label = document.createElement("label");
        label.innerHTML = `<span class="font-bold">${key}</span>`;
        labelWrapper.appendChild(label);

        const input = document.createElement("input");
        input.type = "text";
        input.className =
          "w-2/3 px-2 py-1 border border-gray-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700";
        input.value = value;
        input.name = key;

        // Add input change listener for variable detection
        input.addEventListener("input", () => {
          if (window.highlightVariablePlaceholders) {
            window.highlightVariablePlaceholders(input);
          }
        });

        fieldDiv.appendChild(labelWrapper);
        fieldDiv.appendChild(input);
        formFieldsContainer.appendChild(fieldDiv);
      });
    }
  }

  /**
   * Handle JSON and other content types display
   * @param {Object} request - The request object
   * @param {string} contentType - The content type
   */
  handleJSONOrOtherData(request, contentType) {
    // Hide form fields container

    const formFieldsContainer = document.getElementById(
      "form-fields-container"
    );
    if (formFieldsContainer) {
      formFieldsContainer.style.display = "none";
    }

    // Show Monaco editor
    const requestBodyEditorDiv = document.getElementById(
      "right-panel-request-body-editor"
    );
    if (requestBodyEditorDiv) {
      requestBodyEditorDiv.style.display = "block";
    }

    if (window.requestBodyEditor && request.body) {
      try {
        // Try to parse as JSON first
        const bodyObj =
          typeof request.body === "string"
            ? JSON.parse(request.body)
            : request.body;
        const formattedBody = JSON.stringify(bodyObj, null, 2);
        window.requestBodyEditor.setValue(formattedBody);
      } catch (e) {
        // If parsing fails, use as-is
        const bodyString =
          typeof request.body === "string"
            ? request.body
            : JSON.stringify(request.body);
        window.requestBodyEditor.setValue(bodyString);
      }
    }
  }

  /**
   * Find the endpoint operation for a request
   * @param {Object} request - The request object
   * @returns {Object|null} - The endpoint operation or null
   */
  findEndpointOperation(request) {
    if (!window.swaggerData || !window.swaggerData.paths) {
      return null;
    }

    const basePath = request.path ? request.path.split("?")[0] : "";
    const cleanBasePath = basePath.replace(/[{}]/g, "");

    try {
      for (const [path, methods] of Object.entries(window.swaggerData.paths)) {
        const cleanSwaggerPath = path.replace(/[{}]/g, "");
        if (
          cleanSwaggerPath === cleanBasePath &&
          methods[request.method.toLowerCase()]
        ) {
          return methods[request.method.toLowerCase()];
        }
      }
    } catch (error) {
      console.error("Error finding endpoint in Swagger data:", error);
    }

    return null;
  }
};
