// JavaScript API Client Generator for openapi-ui
class JavaScriptApiGenerator {
  constructor(options = {}) {
    this.swagger = null;
    this.options = {
      useESModules: true,
      useAsyncAwait: true,
      httpClient: "fetch", // "fetch" or "axios"
      generateTypeScript: false,
      generateClassesForModels: true,
      throwErrors: true,
      includeJSDoc: true,
      ...options,
    };
  }

  async loadFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.swagger = await response.json();
      return this.swagger;
    } catch (error) {
      throw new Error(`Error loading from URL: ${error.message}`);
    }
  }

  loadFromJson(jsonString) {
    try {
      this.swagger = JSON.parse(jsonString);
      return this.swagger;
    } catch (error) {
      throw new Error(`Error parsing JSON: ${error.message}`);
    }
  }

  loadFromSwaggerData(swaggerData) {
    if (!swaggerData) {
      throw new Error("Swagger data is required");
    }
    this.swagger = swaggerData;
    return this.swagger;
  }

  // Load from global window object
  loadFromWindow() {
    if (!window.swaggerData) {
      throw new Error("No swagger data found in window object");
    }
    this.swagger = window.swaggerData;
    return this.swagger;
  }

  generateClient(moduleName = "ApiClient", className = "ApiClient") {
    if (!this.swagger) {
      throw new Error("No Swagger data loaded");
    }

    const models = this.generateModels();
    const client = this.generateClientClass(moduleName, className);
    const types = this.options.generateTypeScript
      ? this.generateTypeDefinitions()
      : null;

    return {
      client,
      models,
      types,
    };
  }

  generateModels() {
    if (!this.swagger.components || !this.swagger.components.schemas) {
      return this.options.useESModules
        ? "// No models to generate\nexport {};"
        : "// No models to generate";
    }

    let code = "";

    if (this.options.includeJSDoc) {
      code += "/**\n * Generated data models\n */\n\n";
    }

    const schemas = this.swagger.components.schemas;
    const modelClasses = [];

    for (const [name, schema] of Object.entries(schemas)) {
      if (this.options.generateClassesForModels) {
        modelClasses.push(this.generateModelClass(name, schema));
      } else {
        modelClasses.push(this.generateModelFactory(name, schema));
      }
    }

    code += modelClasses.join("\n\n");

    if (this.options.useESModules) {
      const exportNames = Object.keys(schemas).map((name) =>
        this.toPascalCase(name)
      );
      code += `\n\nexport { ${exportNames.join(", ")} };`;
    }

    return code;
  }
  generateModelClass(name, schema) {
    const className = this.toPascalCase(name);
    let code = "";

    if (this.options.includeJSDoc) {
      code += `/**\n * ${schema.description || `${className} model`}\n */\n`;
    }

    code += `class ${className} {\n`;

    // Constructor
    code += "  constructor(data = {}) {\n";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const jsType = this.mapToJavaScriptType(propSchema);
        const defaultValue = this.getDefaultValue(propSchema);

        if (this.options.includeJSDoc) {
          code += `    /** @type {${jsType}} */\n`;
        }

        code += `    this.${propName} = data.${propName}`;
        if (defaultValue !== undefined) {
          code += ` !== undefined ? data.${propName} : ${defaultValue}`;
        }
        code += ";\n";
      }
    }

    code += "  }\n\n";

    // toJSON method
    code += "  toJSON() {\n";
    code += "    return {\n";

    if (schema.properties) {
      for (const propName of Object.keys(schema.properties)) {
        code += `      ${propName}: this.${propName},\n`;
      }
    }

    code += "    };\n";
    code += "  }\n";

    // fromJSON static method
    code += `\n  static fromJSON(data) {\n`;
    code += `    return new ${className}(data);\n`;
    code += "  }\n";

    code += "}";

    return code;
  }
  generateModelFactory(name, schema) {
    const factoryName = this.toCamelCase(name);
    let code = "";

    if (this.options.includeJSDoc) {
      code += `/**\n * Creates a ${factoryName} object\n`;
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(
          schema.properties
        )) {
          const jsType = this.mapToJavaScriptType(propSchema);
          code += ` * @param {Object} data - The data object\n`;
          code += ` * @param {${jsType}} [data.${propName}] - ${
            propSchema.description || propName
          }\n`;
        }
      }
      code += ` * @returns {Object} ${factoryName} object\n */\n`;
    }

    code += `function create${factoryName}(data = {}) {\n`;
    code += "  return {\n";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const defaultValue = this.getDefaultValue(propSchema);
        code += `    ${propName}: data.${propName}`;
        if (defaultValue !== undefined) {
          code += ` !== undefined ? data.${propName} : ${defaultValue}`;
        }
        code += ",\n";
      }
    }

    code += "  };\n";
    code += "}";

    return code;
  }

  generateClientClass(moduleName, className) {
    const baseUrl = this.getBaseUrl();
    let code = ""; // Imports
    if (this.options.useESModules) {
      code += "import * as Models from './models.js';\n";
      if (this.options.httpClient === "axios") {
        code += "import axios from 'axios';\n";
      }
      code += "\n";
    } else {
      if (this.options.httpClient === "axios") {
        code +=
          "// Note: This code requires axios to be available globally or via require()\n";
        code += "// Install with: npm install axios\n\n";
      }
    }

    if (this.options.includeJSDoc) {
      code += `/**\n * ${this.swagger.info?.title || moduleName} API Client\n`;
      if (this.swagger.info?.description) {
        code += ` * ${this.swagger.info.description}\n`;
      }
      code += ` */\n`;
    }

    code += `class ${className} {\n`;

    // Constructor
    if (this.options.includeJSDoc) {
      code += "  /**\n   * Creates an instance of the API client\n";
      code += "   * @param {Object} config - Configuration options\n";
      code += "   * @param {string} [config.baseUrl] - Base URL for the API\n";
      code +=
        "   * @param {Object} [config.defaultHeaders] - Default headers for all requests\n";
      code += "   */\n";
    }

    code += "  constructor(config = {}) {\n";
    code += `    this.baseUrl = config.baseUrl || '${baseUrl}';\n`;
    code += "    this.defaultHeaders = config.defaultHeaders || {};\n";
    code += "  }\n\n";

    // Request method
    code += this.generateRequestMethod();

    // Generate API methods
    if (this.swagger.paths) {
      for (const [path, pathItem] of Object.entries(this.swagger.paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (
            [
              "get",
              "post",
              "put",
              "delete",
              "patch",
              "head",
              "options",
            ].includes(method)
          ) {
            code += this.generateMethod(path, method, operation);
          }
        }
      }
    }

    code += "}";

    // Export
    if (this.options.useESModules) {
      code += `\n\nexport default ${className};`;
    } else {
      code += `\n\nif (typeof module !== 'undefined' && module.exports) {\n`;
      code += `  module.exports = ${className};\n`;
      code += "} else if (typeof window !== 'undefined') {\n";
      code += `  window.${className} = ${className};\n`;
      code += "}";
    }

    return code;
  }
  generateRequestMethod() {
    let code = "";

    if (this.options.includeJSDoc) {
      code += "  /**\n   * Makes an HTTP request\n";
      code += "   * @param {string} path - The API path\n";
      code += "   * @param {Object} options - Request options\n";
      code += "   * @returns {Promise<any>} The response data\n";
      code += "   */\n";
    }

    if (this.options.useAsyncAwait) {
      code += "  async request(path, options = {}) {\n";
    } else {
      code += "  request(path, options = {}) {\n";
    }

    code += "    const url = `${this.baseUrl}${path}`;\n";
    code +=
      "    const headers = { ...this.defaultHeaders, ...options.headers };\n\n";

    if (this.options.httpClient === "fetch") {
      code += this.generateFetchCode();
    } else if (this.options.httpClient === "axios") {
      code += this.generateAxiosCode();
    }

    code += "  }\n\n";

    return code;
  }

  generateFetchCode() {
    let code = "";

    code += "    const fetchOptions = {\n";
    code += "      method: options.method || 'GET',\n";
    code += "      headers,\n";
    code += "      ...options\n";
    code += "    };\n\n";

    if (this.options.useAsyncAwait) {
      code += "    try {\n";
      code += "      const response = await fetch(url, fetchOptions);\n\n";

      if (this.options.throwErrors) {
        code += "      if (!response.ok) {\n";
        code +=
          "        throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n";
        code += "      }\n\n";
      }

      code +=
        "      const contentType = response.headers.get('content-type');\n";
      code +=
        "      if (contentType && contentType.includes('application/json')) {\n";
      code += "        return await response.json();\n";
      code += "      }\n";
      code += "      return await response.text();\n";
      code += "    } catch (error) {\n";
      if (this.options.throwErrors) {
        code += "      throw error;\n";
      } else {
        code += "      return { error: error.message };\n";
      }
      code += "    }\n";
    } else {
      code += "    return fetch(url, fetchOptions)\n";
      code += "      .then(response => {\n";
      if (this.options.throwErrors) {
        code += "        if (!response.ok) {\n";
        code +=
          "          throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n";
        code += "        }\n";
      }
      code +=
        "        const contentType = response.headers.get('content-type');\n";
      code +=
        "        if (contentType && contentType.includes('application/json')) {\n";
      code += "          return response.json();\n";
      code += "        }\n";
      code += "        return response.text();\n";
      code += "      })";
      if (!this.options.throwErrors) {
        code += "\n      .catch(error => ({ error: error.message }))";
      }
      code += ";\n";
    }

    return code;
  }

  generateAxiosCode() {
    let code = "";

    code += "    const axiosConfig = {\n";
    code += "      method: options.method || 'GET',\n";
    code += "      url,\n";
    code += "      headers,\n";
    code += "      ...options\n";
    code += "    };\n\n";

    if (this.options.useAsyncAwait) {
      code += "    try {\n";
      code += "      const response = await axios(axiosConfig);\n";
      code += "      return response.data;\n";
      code += "    } catch (error) {\n";
      if (this.options.throwErrors) {
        code += "      if (error.response) {\n";
        code +=
          "        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);\n";
        code += "      }\n";
        code += "      throw error;\n";
      } else {
        code += "      return { error: error.message };\n";
      }
      code += "    }\n";
    } else {
      code += "    return axios(axiosConfig)\n";
      code += "      .then(response => response.data)";
      if (!this.options.throwErrors) {
        code += "\n      .catch(error => ({ error: error.message }))";
      }
      code += ";\n";
    }

    return code;
  }

  generateMethod(path, httpMethod, operation) {
    const methodName = this.generateMethodName(path, httpMethod);
    let code = "";

    if (this.options.includeJSDoc) {
      code += "  /**\n";
      code += `   * ${
        operation.summary || `${httpMethod.toUpperCase()} ${path}`
      }\n`;
      if (operation.description) {
        code += `   * ${operation.description}\n`;
      } // Parameters
      const params = this.getMethodParameters(operation);
      params.forEach((param) => {
        const paramType = this.mapToJavaScriptType(param.schema || param);
        const paramName = this.toCamelCase(param.name);
        code += `   * @param {${paramType}} ${paramName} - ${
          param.description || param.name
        }\n`;
      });

      const returnType = this.getReturnType(operation);
      code += `   * @returns {Promise<${returnType}>} The response data\n`;
      code += "   */\n";
    }

    const signature = this.generateMethodSignature(operation, httpMethod, path);

    if (this.options.useAsyncAwait) {
      code += `  async ${signature} {\n`;
    } else {
      code += `  ${signature} {\n`;
    }

    // Build request options
    code += "    const options = {\n";
    code += `      method: '${httpMethod.toUpperCase()}',\n`;
    code += "      headers: {}\n";
    code += "    };\n\n";

    // Handle request body
    const requestBodyParam = this.getRequestBodyParam(operation);
    if (requestBodyParam) {
      code += "    if (data !== undefined) {\n";
      code += "      options.headers['Content-Type'] = 'application/json';\n";
      code += "      options.body = JSON.stringify(data);\n";
      code += "    }\n\n";
    }

    // Build path with parameters
    const pathWithParams = this.buildPathWithParameters(path, operation);
    code += `    const apiPath = \`${pathWithParams}\`;\n\n`; // Handle query parameters
    const queryParams = this.getQueryParameters(operation);
    if (queryParams.length > 0) {
      code += "    const searchParams = new URLSearchParams();\n";
      queryParams.forEach((param) => {
        const paramName = this.toCamelCase(param.name);
        code += `    if (${paramName} !== undefined) {\n`;
        code += `      searchParams.append('${param.name}', ${paramName});\n`;
        code += "    }\n";
      });
      code += "    const queryString = searchParams.toString();\n";
      code +=
        "    const finalPath = queryString ? `${apiPath}?${queryString}` : apiPath;\n\n";
      code += this.options.useAsyncAwait
        ? "    return await this.request(finalPath, options);\n"
        : "    return this.request(finalPath, options);\n";
    } else {
      code += this.options.useAsyncAwait
        ? "    return await this.request(apiPath, options);\n"
        : "    return this.request(apiPath, options);\n";
    }

    code += "  }\n\n";

    return code;
  }

  generateMethodSignature(operation, httpMethod, path) {
    const methodName = this.generateMethodName(path, httpMethod);
    const params = this.getMethodParameters(operation);
    const requestBodyParam = this.getRequestBodyParam(operation);

    let paramList = []; // Path parameters
    const pathParams = params.filter((p) => p.in === "path");
    pathParams.forEach((param) => {
      const paramName = this.toCamelCase(param.name);
      paramList.push(paramName);
    });

    // Query parameters
    const queryParams = params.filter((p) => p.in === "query");
    queryParams.forEach((param) => {
      const paramName = this.toCamelCase(param.name);
      paramList.push(paramName);
    });

    // Request body
    if (requestBodyParam) {
      paramList.push("data");
    }

    return `${methodName}(${paramList.join(", ")})`;
  }

  getReturnType(operation) {
    if (!operation.responses) return "any";

    const successResponse =
      operation.responses["200"] ||
      operation.responses["201"] ||
      operation.responses["default"];
    if (!successResponse) return "any";

    if (
      successResponse.content &&
      successResponse.content["application/json"]
    ) {
      const schema = successResponse.content["application/json"].schema;
      return this.mapToJavaScriptType(schema);
    }

    return "any";
  }

  getMethodParameters(operation) {
    return operation.parameters || [];
  }

  getQueryParameters(operation) {
    const params = this.getMethodParameters(operation);
    return params.filter((p) => p.in === "query");
  }

  getRequestBodyParam(operation) {
    return operation.requestBody ? operation.requestBody : null;
  }
  buildPathWithParameters(path, operation) {
    let result = path;
    const pathParams = this.getMethodParameters(operation).filter(
      (p) => p.in === "path"
    );
    pathParams.forEach((param) => {
      const paramName = this.toCamelCase(param.name);
      result = result.replace(`{${param.name}}`, `\${${paramName}}`);
    });

    return result;
  }

  mapToJavaScriptType(schema) {
    if (!schema) return "any";

    switch (schema.type) {
      case "integer":
      case "number":
        return "number";
      case "string":
        return "string";
      case "boolean":
        return "boolean";
      case "array":
        const itemType = this.mapToJavaScriptType(schema.items);
        return `${itemType}[]`;
      case "object":
        if (schema.properties) {
          return "Object";
        }
        return "any";
      default:
        if (schema.$ref) {
          const refName = schema.$ref.split("/").pop();
          return this.toPascalCase(refName);
        }
        return "any";
    }
  }

  getDefaultValue(schema) {
    if (schema.default !== undefined) {
      if (typeof schema.default === "string") {
        return `"${schema.default}"`;
      }
      return schema.default;
    }

    switch (schema.type) {
      case "string":
        return '""';
      case "number":
      case "integer":
        return "0";
      case "boolean":
        return "false";
      case "array":
        return "[]";
      case "object":
        return "{}";
      default:
        return "null";
    }
  }
  generateMethodName(path, method) {
    // Remove path parameters and clean up
    let name = path.replace(/\{[^}]+\}/g, "").replace(/[^a-zA-Z0-9]/g, "_");

    // Remove leading/trailing underscores
    name = name.replace(/^_+|_+$/g, "");

    // Always convert to camelCase for method names
    name = this.toCamelCase(name);

    // Prefix with HTTP method
    const methodPrefix = method.toLowerCase();
    return methodPrefix + this.capitalizeFirst(name);
  }

  getBaseUrl() {
    if (this.swagger.servers && this.swagger.servers.length > 0) {
      return this.swagger.servers[0].url;
    }
    return "";
  }

  generateTypeDefinitions() {
    if (!this.options.generateTypeScript) return null;

    let code = "// TypeScript type definitions\n\n";

    if (this.swagger.components && this.swagger.components.schemas) {
      for (const [name, schema] of Object.entries(
        this.swagger.components.schemas
      )) {
        code += this.generateTypeDefinition(name, schema);
        code += "\n\n";
      }
    }

    return code;
  }
  generateTypeDefinition(name, schema) {
    const typeName = this.toPascalCase(name);
    let code = `export interface ${typeName} {\n`;

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const isRequired =
          schema.required && schema.required.includes(propName);
        const tsType = this.mapToTypeScriptType(propSchema);
        const optional = isRequired ? "" : "?";

        if (propSchema.description) {
          code += `  /** ${propSchema.description} */\n`;
        }
        code += `  ${propName}${optional}: ${tsType};\n`;
      }
    }

    code += "}";
    return code;
  }

  mapToTypeScriptType(schema) {
    if (!schema) return "any";

    switch (schema.type) {
      case "integer":
      case "number":
        return "number";
      case "string":
        return "string";
      case "boolean":
        return "boolean";
      case "array":
        const itemType = this.mapToTypeScriptType(schema.items);
        return `${itemType}[]`;
      case "object":
        return "object";
      default:
        if (schema.$ref) {
          const refName = schema.$ref.split("/").pop();
          return this.toPascalCase(refName);
        }
        return "any";
    }
  }
  toCamelCase(str) {
    // Handle PascalCase to camelCase conversion
    if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    }

    // Convert underscore_separated or dash-separated strings to camelCase
    return str
      .split(/[_-]+/)
      .map((word, index) => {
        if (index === 0) {
          // First word stays lowercase
          return word.toLowerCase();
        }
        // Subsequent words get capitalized
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  }

  toPascalCase(str) {
    // Handle already PascalCase strings
    if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
      return str;
    }

    // Convert underscore_separated or dash-separated strings to PascalCase
    return str
      .split(/[_-]+/)
      .map((word) => {
        // All words get capitalized for PascalCase
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Method to update options after construction
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }
}

// Make the generator available globally
window.JavaScriptApiGenerator = JavaScriptApiGenerator;

// Convenience function to create a generator with window data and options
window.createJavaScriptApiGenerator = function (options = {}) {
  // Get current options from options manager if available
  if (window.getApiClientOptions && !Object.keys(options).length) {
    options = window.getApiClientOptions("javascript");
  }

  const generator = new JavaScriptApiGenerator(options);
  if (window.swaggerData) {
    generator.loadFromWindow();
  }
  return generator;
};
