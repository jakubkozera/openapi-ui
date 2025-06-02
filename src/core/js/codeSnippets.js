// Code Snippets Generator for API Documentation
// Supports generating code snippets for API requests in various languages

/**
 * Generates code snippets for API requests in different programming languages
 */
class CodeSnippetGenerator {
  constructor() {
    this.supportedLanguages = {
      curl: {
        name: "cURL",
        formatter: this.generateCurlSnippet.bind(this),
      },
      javascript: {
        name: "JS/TS (Fetch)",
        formatter: this.generateJavaScriptSnippet.bind(this),
      },
      python: {
        name: "Python (requests)",
        formatter: this.generatePythonSnippet.bind(this),
      },
      csharp: {
        name: "C# (HttpClient)",
        formatter: this.generateCSharpSnippet.bind(this),
      },
      java: {
        name: "Java (OkHttp)",
        formatter: this.generateJavaSnippet.bind(this),
      },
    };
  }

  /**
   * Get list of supported languages
   * @returns {Array} Array of language objects with id and name
   */
  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages).map((key) => ({
      id: key,
      name: this.supportedLanguages[key].name,
    }));
  }

  /**
   * Generate code snippet based on request details and selected language
   * @param {string} language The language to generate code for
   * @param {string} method The HTTP method
   * @param {string} path The API path
   * @param {string} requestBody The request body as a string (JSON)
   * @param {Object} headers The request headers
   * @returns {string} The generated code snippet
   */
  generateSnippet(language, method, path, requestBody, headers = {}) {
    if (!this.supportedLanguages[language]) {
      return `// Language '${language}' is not supported yet.`;
    }

    // Ensure we include Content-Type header if we have a request body
    if (requestBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const requestDetails = {
      method: method,
      url: `${window.location.origin}${path}`,
      headers: headers,
      body: requestBody,
    };

    return this.supportedLanguages[language].formatter(requestDetails);
  }

  /**
   * Generate cURL code snippet
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated cURL snippet
   */
  generateCurlSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let curl = `curl -X ${method.toUpperCase()} "${url}"`;

    // Add headers
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (value) {
          curl += ` \\\n  -H "${key}: ${value}"`;
        } else {
          curl += ` \\\n  -H "${key}:"`;
        }
      }
    }

    // Add request body if present
    if (body) {
      const escapedBody = body.replace(/'/g, "'\\''");
      curl += ` \\\n  -d '${escapedBody}'`;
    }

    return curl;
  }

  /**
   * Generate JavaScript code snippet using Fetch API
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated JavaScript snippet
   */
  generateJavaScriptSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    const options = {
      method: method.toUpperCase(),
      headers: headers,
    };

    if (body) {
      options.body = body;
    }

    return `fetch("${url}", ${JSON.stringify(options, null, 2)})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  }

  /**
   * Generate Python code snippet using requests library
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated Python snippet
   */
  generatePythonSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let snippet = `import requests

url = "${url}"`;

    if (headers && Object.keys(headers).length > 0) {
      snippet += `\nheaders = ${JSON.stringify(headers, null, 2)}`;
    } else {
      snippet += `\nheaders = {}`;
    }

    if (body) {
      snippet += `\n\ndata = ${body}`;
    }

    snippet += `\n\nresponse = requests.${method.toLowerCase()}(url${
      body ? ", json=data" : ""
    }${headers && Object.keys(headers).length > 0 ? ", headers=headers" : ""})
print(response.json())`;

    return snippet;
  }

  /**
   * Generate C# code snippet using HttpClient
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated C# snippet
   */
  generateCSharpSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let csharpCode = "";
    csharpCode += `// Create HttpClient instance\n`;
    csharpCode += `using var client = new HttpClient();\n\n`;

    // Add headers
    if (headers && Object.keys(headers).length > 0) {
      csharpCode += `// Set request headers\n`;
      for (const [key, value] of Object.entries(headers)) {
        if (value) {
          csharpCode += `client.DefaultRequestHeaders.Add("${key}", "${value}");\n`;
        } else {
          csharpCode += `client.DefaultRequestHeaders.Add("${key}", "");\n`;
        }
      }
      csharpCode += "\n";
    }

    csharpCode += `try\n{\n`;
    csharpCode += `    var requestUri = new Uri("${url}");\n`;
    csharpCode += `    HttpResponseMessage response;\n\n`;

    switch (method.toUpperCase()) {
      case "GET":
        csharpCode += `    // Send GET request\n`;
        csharpCode += `    response = await client.GetAsync(requestUri);\n`;
        break;
      case "DELETE":
        csharpCode += `    // Send DELETE request\n`;
        csharpCode += `    response = await client.DeleteAsync(requestUri);\n`;
        break;
      case "POST":
      case "PUT":
      case "PATCH":
        const methodName =
          method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
        csharpCode += `    // Create request content\n`;
        if (body) {
          csharpCode += `    var json = @"${body.replace(/"/g, '""')}";\n`;
          csharpCode += `    var content = new StringContent(json, Encoding.UTF8, "application/json");\n\n`;
        } else {
          csharpCode += `    var content = new StringContent("", Encoding.UTF8, "application/json");\n\n`;
        }
        if (method.toUpperCase() === "PATCH") {
          csharpCode += `    // Send PATCH request (requires HttpMethod.Patch)\n`;
          csharpCode += `    var request = new HttpRequestMessage(new HttpMethod("PATCH"), requestUri) { Content = content };\n`;
          csharpCode += `    response = await client.SendAsync(request);\n`;
        } else {
          csharpCode += `    // Send ${methodName} request\n`;
          csharpCode += `    response = await client.${methodName}Async(requestUri, content);\n`;
        }
        break;
      default:
        csharpCode += `    // Send custom request\n`;
        csharpCode += `    var request = new HttpRequestMessage(new HttpMethod("${method.toUpperCase()}"), requestUri);\n`;
        csharpCode += `    response = await client.SendAsync(request);\n`;
    }

    csharpCode += `\n    // Ensure the request was successful\n`;
    csharpCode += `    response.EnsureSuccessStatusCode();\n\n`;
    csharpCode += `    // Read response content\n`;
    csharpCode += `    var responseContent = await response.Content.ReadAsStringAsync();\n`;
    csharpCode += `    Console.WriteLine(responseContent);\n`;
    csharpCode += `}\ncatch (HttpRequestException e)\n{\n`;
    csharpCode += `    Console.WriteLine($"Request error: {e.Message}");\n`;
    csharpCode += `}\n`;

    return csharpCode;
  }

  /**
   * Generate Java code snippet using OkHttp
   * @param {Object} requestDetails The request details object
   * @returns {string} The generated Java snippet
   */
  generateJavaSnippet(requestDetails) {
    const { method, url, headers, body } = requestDetails;
    let code = `OkHttpClient client = new OkHttpClient();

MediaType mediaType = MediaType.parse("application/json");`;

    if (body) {
      code += `\nRequestBody body = RequestBody.create(mediaType, ${JSON.stringify(
        body
      )});`;
    }

    code += `\n\nRequest.Builder requestBuilder = new Request.Builder()
  .url("${url}")`;

    if (headers && Object.keys(headers).length > 0) {
      for (const [key, value] of Object.entries(headers)) {
        if (value) {
          code += `\n  .addHeader("${key}", "${value}")`;
        } else {
          code += `\n  .addHeader("${key}", "")`;
        }
      }
    }

    code += `\n  .method("${method.toUpperCase()}", ${body ? "body" : "null"});
    
Request request = requestBuilder.build();
Response response = client.newCall(request).execute();
System.out.println(response.body().string());`;

    return code;
  }
}

// Initialize everything properly at the end of the file
document.addEventListener("DOMContentLoaded", () => {
  // Initialize code snippet generator
  window.codeSnippetGenerator = new CodeSnippetGenerator();

  // Initialize code snippet functionality
  initCodeSnippetFunctionality();
});
