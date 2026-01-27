/**
 * Fetch Interceptor Script
 * This script is injected into the webview to intercept fetch calls
 * and route them through the VS Code extension backend to avoid CORS issues.
 * 
 * This file is used as a template - the actual script is injected as a string
 * into the webview HTML.
 */

/**
 * Generate the fetch interceptor script as a string to be injected into webview
 */
export function getFetchInterceptorScript(): string {
  return `
(function() {
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Store pending requests
  const pendingRequests = new Map();
  
  // Generate unique request ID
  function generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
  
  // VS Code API for messaging
  const vscode = acquireVsCodeApi();
  
  // Check if a URL should be proxied through the extension
  function shouldProxy(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      const protocol = urlObj.protocol;
      
      // Proxy HTTP/HTTPS requests (except data: and blob: URLs)
      if (protocol === 'http:' || protocol === 'https:') {
        return true;
      }
      
      return false;
    } catch (e) {
      // If URL parsing fails, don't proxy
      return false;
    }
  }
  
  // Convert Headers object to plain object
  function headersToObject(headers) {
    const result = {};
    if (headers) {
      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          result[key] = value;
        });
      } else if (typeof headers === 'object') {
        Object.assign(result, headers);
      }
    }
    return result;
  }
  
  // Create a Response-like object from proxy response
  function createProxyResponse(proxyResponse) {
    const headers = new Headers(proxyResponse.headers || {});
    
    const response = {
      ok: proxyResponse.ok,
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: headers,
      url: proxyResponse.url,
      redirected: false,
      type: 'basic',
      bodyUsed: false,
      _body: proxyResponse.body,
      
      // Clone method
      clone: function() {
        return createProxyResponse(proxyResponse);
      },
      
      // Text method
      text: function() {
        this.bodyUsed = true;
        return Promise.resolve(this._body || '');
      },
      
      // JSON method
      json: function() {
        this.bodyUsed = true;
        try {
          return Promise.resolve(JSON.parse(this._body || '{}'));
        } catch (e) {
          return Promise.reject(new SyntaxError('Invalid JSON: ' + e.message));
        }
      },
      
      // Blob method
      blob: function() {
        this.bodyUsed = true;
        const blob = new Blob([this._body || ''], { 
          type: headers.get('content-type') || 'application/octet-stream' 
        });
        return Promise.resolve(blob);
      },
      
      // ArrayBuffer method
      arrayBuffer: function() {
        this.bodyUsed = true;
        const encoder = new TextEncoder();
        return Promise.resolve(encoder.encode(this._body || '').buffer);
      },
      
      // FormData method (basic implementation)
      formData: function() {
        this.bodyUsed = true;
        return Promise.reject(new Error('formData() not implemented in proxy response'));
      }
    };
    
    return response;
  }
  
  // Override fetch
  window.fetch = function(input, init) {
    let url;
    let options = init || {};
    
    // Handle Request object
    if (input instanceof Request) {
      url = input.url;
      options = {
        method: input.method,
        headers: headersToObject(input.headers),
        body: input.body,
        ...options
      };
    } else {
      url = input.toString();
    }
    
    // Check if we should proxy this request
    if (!shouldProxy(url)) {
      // Use original fetch for data: URLs, blob: URLs, etc.
      return originalFetch.apply(window, arguments);
    }
    
    // Create a promise that will be resolved when we get the response
    return new Promise((resolve, reject) => {
      const requestId = generateRequestId();
      
      // Store the promise resolvers
      pendingRequests.set(requestId, { resolve, reject });
      
      // Prepare the request body
      let body = options.body;
      if (body && typeof body !== 'string') {
        if (body instanceof FormData) {
          // Convert FormData to JSON if possible (simplified)
          const formObj = {};
          body.forEach((value, key) => {
            formObj[key] = value;
          });
          body = JSON.stringify(formObj);
        } else if (body instanceof URLSearchParams) {
          body = body.toString();
        } else if (body instanceof Blob) {
          // For blobs, we'll need to read them (async)
          body.text().then(text => {
            sendRequest(requestId, url, options.method, headersToObject(options.headers), text);
          });
          return;
        } else if (typeof body === 'object') {
          body = JSON.stringify(body);
        }
      }
      
      sendRequest(requestId, url, options.method, headersToObject(options.headers), body);
    });
  };
  
  // Send request to extension
  function sendRequest(requestId, url, method, headers, body) {
    vscode.postMessage({
      type: 'fetchRequest',
      requestId: requestId,
      payload: {
        url: url,
        method: method || 'GET',
        headers: headers || {},
        body: body
      }
    });
  }
  
  // Listen for responses from the extension
  window.addEventListener('message', function(event) {
    const message = event.data;
    
    if (message.type === 'fetchResponse' && message.requestId) {
      const pending = pendingRequests.get(message.requestId);
      
      if (pending) {
        pendingRequests.delete(message.requestId);
        
        if (message.payload.error) {
          // Handle error response
          const error = new Error(message.payload.message);
          error.code = message.payload.code;
          pending.reject(error);
        } else {
          // Create and resolve with Response-like object
          const response = createProxyResponse(message.payload);
          pending.resolve(response);
        }
      }
    }
  });
  
  // Log that the interceptor is active
  console.log('[OpenAPI UI] Fetch interceptor active - CORS bypass enabled');
})();
`;
}
