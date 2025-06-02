// C# API Client Generator for openapi-ui
class CSharpApiGenerator {
  constructor(options = {}) {
    this.swagger = null;
    this.options = {
      usePascalCase: true,
      useFields: false,
      useNullableTypes: false,
      addJsonPropertyAttributes: false,
      useJsonPropertyName: false,
      generateImmutableClasses: false,
      useRecordTypes: false,
      useReadonlyLists: false,
      useFileScopedNamespaces: false,
      usePrimaryConstructors: false,
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
      throw new Error(`JSON parsing error: ${error.message}`);
    }
  }

  loadFromSwaggerData(swaggerData) {
    if (!swaggerData) {
      throw new Error("No swagger data provided");
    }
    this.swagger = swaggerData;
    return this.swagger;
  }

  // New method to load from global window object
  loadFromWindow() {
    if (!window.swaggerData) {
      throw new Error("No swagger data found in window.swaggerData");
    }
    this.swagger = window.swaggerData;
    return this.swagger;
  }
  generateClient(namespace = "ApiClient", className = "ApiClient") {
    if (!this.swagger) {
      throw new Error("No loaded specification");
    }

    const models = this.generateModels(namespace);
    const interfaces = this.generateInterfaces(namespace);
    const client = this.generateClientClass(namespace, className);

    return { client, models, interfaces };
  }
  generateModels(namespace) {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.ComponentModel.DataAnnotations;\n`; // Add appropriate JSON library using statement based on options
    if (this.options.useJsonPropertyName) {
      code += `using System.Text.Json.Serialization;\n`;
    } else if (this.options.addJsonPropertyAttributes) {
      code += `using Newtonsoft.Json;\n`;
    }

    // Use file scoped namespace if enabled
    if (this.options.useFileScopedNamespaces) {
      code += `\nnamespace ${namespace}.Models;\n\n`;
    } else {
      code += `\nnamespace ${namespace}.Models\n{\n`;
    }

    if (this.swagger.components && this.swagger.components.schemas) {
      for (const [name, schema] of Object.entries(
        this.swagger.components.schemas
      )) {
        code += this.generateModelClass(name, schema);
      }
    }

    // Close namespace if not using file scoped
    if (!this.options.useFileScopedNamespaces) {
      code += `}\n`;
    }

    return code;
  }
  generateModelClass(name, schema) {
    // Use record types if enabled and not generating immutable classes
    if (this.options.useRecordTypes && !this.options.generateImmutableClasses) {
      return this.generateRecordClass(name, schema);
    }

    const className = this.options.usePascalCase
      ? this.toPascalCase(name)
      : name;

    // Generate primary constructor if enabled
    if (this.options.usePrimaryConstructors && schema.properties) {
      return this.generatePrimaryConstructorClass(name, schema);
    }

    // Determine indentation based on namespace style
    const indent = this.options.useFileScopedNamespaces ? "" : "    ";

    let code = `${indent}public class ${className}\n${indent}{\n`;
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const csharpType = this.mapToCSharpType(propSchema);
        const isRequired =
          schema.required && schema.required.includes(propName);

        // Apply nullable types option
        const finalType =
          this.options.useNullableTypes &&
          !isRequired &&
          !csharpType.includes("?") &&
          !csharpType.startsWith("List<")
            ? `${csharpType}?`
            : csharpType;

        // Property or field name
        const memberName = this.options.usePascalCase
          ? this.toPascalCase(propName)
          : propName;

        // Add JSON attributes if enabled
        if (this.options.addJsonPropertyAttributes) {
          code += `${indent}    [JsonProperty("${propName}")]\n`;
        } else if (this.options.useJsonPropertyName) {
          code += `${indent}    [JsonPropertyName("${propName}")]\n`;
        }

        // Add required attribute
        if (isRequired) {
          code += `${indent}    [Required]\n`;
        }

        // Generate field or property
        if (this.options.useFields) {
          code += `${indent}    public ${finalType} ${memberName};\n\n`;
        } else if (this.options.generateImmutableClasses) {
          code += `${indent}    public ${finalType} ${memberName} { get; init; }\n\n`;
        } else {
          code += `${indent}    public ${finalType} ${memberName} { get; set; }\n\n`;
        }
      }
    }

    code += `${indent}}\n\n`;
    return code;
  }
  generateRecordClass(name, schema) {
    const className = this.options.usePascalCase
      ? this.toPascalCase(name)
      : name;
    let parameters = [];

    // Determine indentation based on namespace style
    const indent = this.options.useFileScopedNamespaces ? "" : "    ";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const csharpType = this.mapToCSharpType(propSchema);
        const isRequired =
          schema.required && schema.required.includes(propName);

        // Apply nullable types option
        const finalType =
          this.options.useNullableTypes &&
          !isRequired &&
          !csharpType.includes("?") &&
          !csharpType.startsWith("List<")
            ? `${csharpType}?`
            : csharpType;

        const memberName = this.options.usePascalCase
          ? this.toPascalCase(propName)
          : propName;

        let paramStr = `${finalType} ${memberName}`;
        if (!isRequired && this.options.useNullableTypes) {
          paramStr += " = null";
        }

        parameters.push(paramStr);
      }
    }

    let code = `${indent}public record ${className}(\n`;
    code += parameters.map((p) => `${indent}    ${p}`).join(",\n");
    code += `\n${indent});\n\n`;

    return code;
  }
  generatePrimaryConstructorClass(name, schema) {
    const className = this.options.usePascalCase
      ? this.toPascalCase(name)
      : name;

    // Determine indentation based on namespace style
    const indent = this.options.useFileScopedNamespaces ? "" : "    ";

    let constructorParams = [];
    let propertyCode = "";

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const csharpType = this.mapToCSharpType(propSchema);
        const isRequired =
          schema.required && schema.required.includes(propName);

        // Apply nullable types option
        const finalType =
          this.options.useNullableTypes &&
          !isRequired &&
          !csharpType.includes("?") &&
          !csharpType.startsWith("List<")
            ? `${csharpType}?`
            : csharpType;

        // Property or field name
        const memberName = this.options.usePascalCase
          ? this.toPascalCase(propName)
          : propName;

        // Add to constructor parameters
        let paramStr = `${finalType} ${
          memberName.charAt(0).toLowerCase() + memberName.slice(1)
        }`;
        if (!isRequired && this.options.useNullableTypes) {
          paramStr += " = null";
        }
        constructorParams.push(paramStr);

        // Add JSON attributes if enabled
        if (this.options.addJsonPropertyAttributes) {
          propertyCode += `${indent}    [JsonProperty("${propName}")]\n`;
        } else if (this.options.useJsonPropertyName) {
          propertyCode += `${indent}    [JsonPropertyName("${propName}")]\n`;
        }

        // Add required attribute
        if (isRequired) {
          propertyCode += `${indent}    [Required]\n`;
        }

        // Generate property that maps to constructor parameter
        if (this.options.useFields) {
          propertyCode += `${indent}    public ${finalType} ${memberName} = ${
            memberName.charAt(0).toLowerCase() + memberName.slice(1)
          };\n\n`;
        } else if (this.options.generateImmutableClasses) {
          propertyCode += `${indent}    public ${finalType} ${memberName} { get; init; } = ${
            memberName.charAt(0).toLowerCase() + memberName.slice(1)
          };\n\n`;
        } else {
          propertyCode += `${indent}    public ${finalType} ${memberName} { get; set; } = ${
            memberName.charAt(0).toLowerCase() + memberName.slice(1)
          };\n\n`;
        }
      }
    }

    // Generate class with primary constructor
    let code = `${indent}public class ${className}(\n`;
    code += constructorParams.map((p) => `${indent}    ${p}`).join(",\n");
    code += `\n${indent})\n${indent}{\n`;
    code += propertyCode;
    code += `${indent}}\n\n`;

    return code;
  }
  generateInterfaces(namespace) {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.Threading.Tasks;\nusing ${namespace}.Models;\n\n`;

    // Use file scoped namespace if enabled
    if (this.options.useFileScopedNamespaces) {
      code += `namespace ${namespace}.Interfaces;\n\n`;
      code += `public interface IApiClient\n{\n`;
    } else {
      code += `namespace ${namespace}.Interfaces\n{\n`;
      code += `    public interface IApiClient\n    {\n`;
    }

    if (this.swagger.paths) {
      const indent = this.options.useFileScopedNamespaces ? "    " : "        ";
      for (const [path, methods] of Object.entries(this.swagger.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
          if (typeof operation === "object" && method !== "parameters") {
            const methodSignature = this.generateMethodSignature(
              operation,
              method,
              path
            );
            code += `${indent}${methodSignature};\n`;
          }
        }
      }
    }

    // Close interface and namespace if not using file scoped
    if (this.options.useFileScopedNamespaces) {
      code += `}\n`;
    } else {
      code += `    }\n}\n`;
    }

    return code;
  }
  generateClientClass(namespace, className) {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.Net.Http;\nusing System.Text;\nusing System.Threading.Tasks;\nusing Newtonsoft.Json;\nusing ${namespace}.Models;\nusing ${namespace}.Interfaces;\n\n`;

    // Use file scoped namespace if enabled
    if (this.options.useFileScopedNamespaces) {
      code += `namespace ${namespace};\n\n`;
    } else {
      code += `namespace ${namespace}\n{\n`;
    }

    const indent = this.options.useFileScopedNamespaces ? "    " : "        ";
    const classIndent = this.options.useFileScopedNamespaces ? "" : "    ";

    // Generate primary constructor if enabled
    if (this.options.usePrimaryConstructors) {
      code += `public class ${className}(\n`;
      code += `    HttpClient httpClient,\n`;
      code += `    string baseUrl\n`;
      code += `) : IApiClient\n{\n`;
      code += `${indent}private readonly HttpClient _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));\n`;
      code += `${indent}private readonly string _baseUrl = baseUrl?.TrimEnd('/') ?? throw new ArgumentNullException(nameof(baseUrl));\n\n`;
    } else {
      code += `${classIndent}public class ${className} : IApiClient\n${classIndent}{\n`;
      code += `${indent}private readonly HttpClient _httpClient;\n`;
      code += `${indent}private readonly string _baseUrl;\n\n`;

      code += `${indent}public ${className}(HttpClient httpClient, string baseUrl)\n${indent}{\n`;
      code += `${indent}    _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));\n`;
      code += `${indent}    _baseUrl = baseUrl?.TrimEnd('/') ?? throw new ArgumentNullException(nameof(baseUrl));\n`;
      code += `${indent}}\n\n`;
    }

    if (this.swagger.paths) {
      for (const [path, methods] of Object.entries(this.swagger.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
          if (typeof operation === "object" && method !== "parameters") {
            code += this.generateMethod(path, method, operation);
          }
        }
      }
    }

    code += `${indent}private async Task<T> SendRequestAsync<T>(string url, HttpMethod method, object content = null)\n${indent}{\n`;
    code += `${indent}    var request = new HttpRequestMessage(method, url);\n\n`;
    code += `${indent}    if (content != null)\n${indent}    {\n`;
    code += `${indent}        var json = JsonConvert.SerializeObject(content);\n`;
    code += `${indent}        request.Content = new StringContent(json, Encoding.UTF8, "application/json");\n`;
    code += `${indent}    }\n\n`;
    code += `${indent}    var response = await _httpClient.SendAsync(request);\n`;
    code += `${indent}    response.EnsureSuccessStatusCode();\n\n`;
    code += `${indent}    var responseContent = await response.Content.ReadAsStringAsync();\n`;
    code += `${indent}    return JsonConvert.DeserializeObject<T>(responseContent);\n`;
    code += `${indent}}\n\n`;

    code += `${indent}private async Task SendRequestAsync(string url, HttpMethod method, object content = null)\n${indent}{\n`;
    code += `${indent}    var request = new HttpRequestMessage(method, url);\n\n`;
    code += `${indent}    if (content != null)\n${indent}    {\n`;
    code += `${indent}        var json = JsonConvert.SerializeObject(content);\n`;
    code += `${indent}        request.Content = new StringContent(json, Encoding.UTF8, "application/json");\n`;
    code += `${indent}    }\n\n`;
    code += `${indent}    var response = await _httpClient.SendAsync(request);\n`;
    code += `${indent}    response.EnsureSuccessStatusCode();\n`;
    code += `${indent}}\n`;

    // Close class and namespace if not using file scoped
    if (this.options.useFileScopedNamespaces) {
      code += `}\n`;
    } else {
      code += `    }\n}\n`;
    }

    return code;
  }
  generateMethod(path, httpMethod, operation) {
    const methodName =
      operation.operationId || this.generateMethodName(path, httpMethod);
    const returnType = this.getReturnType(operation);
    const parameters = this.getMethodParameters(operation);
    const pathWithParams = this.buildPathWithParameters(path, operation);

    const indent = this.options.useFileScopedNamespaces ? "    " : "        ";
    const bodyIndent = this.options.useFileScopedNamespaces
      ? "        "
      : "            ";

    let code = `${indent}public async Task${returnType} ${methodName}(${parameters})\n${indent}{\n`;
    code += `${bodyIndent}var url = $"{{_baseUrl}}${pathWithParams}";\n`;

    if (
      httpMethod.toLowerCase() === "get" ||
      httpMethod.toLowerCase() === "delete"
    ) {
      if (returnType === "") {
        code += `${bodyIndent}await SendRequestAsync(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )});\n`;
      } else {
        code += `${bodyIndent}return await SendRequestAsync${returnType}(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )});\n`;
      }
    } else {
      const requestBody = this.getRequestBodyParam(operation);
      if (returnType === "") {
        code += `${bodyIndent}await SendRequestAsync(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )}${requestBody ? `, ${requestBody}` : ""});\n`;
      } else {
        code += `${bodyIndent}return await SendRequestAsync${returnType}(url, HttpMethod.${this.capitalizeFirst(
          httpMethod
        )}${requestBody ? `, ${requestBody}` : ""});\n`;
      }
    }

    code += `${indent}}\n\n`;
    return code;
  }
  generateMethodSignature(operation, httpMethod, path = "") {
    const methodName =
      operation.operationId || this.generateMethodName(path, httpMethod);
    const returnType = this.getReturnType(operation);
    const parameters = this.getMethodParameters(operation);

    return `Task${returnType} ${methodName}(${parameters})`;
  }

  getReturnType(operation) {
    if (!operation.responses || !operation.responses["200"]) {
      return "";
    }

    const response = operation.responses["200"];
    if (response.content && response.content["application/json"]) {
      const schema = response.content["application/json"].schema;
      if (schema) {
        const type = this.mapToCSharpType(schema);
        return `<${type}>`;
      }
    }

    return "";
  }

  getMethodParameters(operation) {
    let params = [];

    if (operation.parameters) {
      for (const param of operation.parameters) {
        const csharpType = this.mapToCSharpType(
          param.schema || { type: "string" }
        );
        params.push(`${csharpType} ${param.name}`);
      }
    }

    if (operation.requestBody) {
      const content = operation.requestBody.content;
      if (content && content["application/json"]) {
        const schema = content["application/json"].schema;
        const type = this.mapToCSharpType(schema);
        params.push(`${type} requestBody`);
      }
    }

    return params.join(", ");
  }

  getRequestBodyParam(operation) {
    if (operation.requestBody) {
      return "requestBody";
    }
    return null;
  }

  buildPathWithParameters(path, operation) {
    let result = path;

    if (operation.parameters) {
      // Zamień path parameters
      for (const param of operation.parameters) {
        if (param.in === "path") {
          result = result.replace(`{${param.name}}`, `{${param.name}}`);
        }
      }

      // Dodaj query parameters
      const queryParams = operation.parameters.filter((p) => p.in === "query");
      if (queryParams.length > 0) {
        const queryString = queryParams
          .map((p) => `${p.name}={${p.name}}`)
          .join("&");
        result += `?${queryString}`;
      }
    }

    return result;
  }
  mapToCSharpType(schema) {
    if (!schema) return "object";

    if (schema.$ref) {
      const refName = schema.$ref.split("/").pop();
      return this.options.usePascalCase ? this.toPascalCase(refName) : refName;
    }

    if (schema.type === "array") {
      const itemType = this.mapToCSharpType(schema.items);
      if (this.options.useReadonlyLists) {
        return `IReadOnlyList<${itemType}>`;
      }
      return `List<${itemType}>`;
    }

    switch (schema.type) {
      case "integer":
        return schema.format === "int64" ? "long" : "int";
      case "number":
        return schema.format === "float" ? "float" : "double";
      case "string":
        if (schema.format === "date-time") return "DateTime";
        if (schema.format === "date") return "DateTime";
        return "string";
      case "boolean":
        return "bool";
      case "object":
        return "object";
      default:
        return "object";
    }
  }
  generateMethodName(path, method) {
    // Clean up the path: remove parameters, clean slashes and hyphens, and create meaningful name
    let cleanPath = path
      .replace(/[{}]/g, "") // Remove parameter brackets
      .replace(/[\/\-]/g, "_") // Replace slashes and hyphens with underscores
      .replace(/^_+|_+$/g, "") // Remove leading and trailing underscores
      .replace(/_+/g, "_"); // Replace multiple underscores with single one

    // If no path or just underscores, use a generic name
    if (!cleanPath || cleanPath === "_") {
      cleanPath = "Resource";
    }

    // Create method name: HTTP method + cleaned path
    const methodPart = this.capitalizeFirst(method);
    const pathPart = cleanPath
      .split("_")
      .map((part) => this.capitalizeFirst(part))
      .join("");

    return `${methodPart}${pathPart}`;
  }

  toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
window.CSharpApiGenerator = CSharpApiGenerator;

// Convenience function to create a generator with window data and options
window.createCSharpApiGenerator = function (options = {}) {
  // Get current options from options manager if available
  if (window.getApiClientOptions && !Object.keys(options).length) {
    options = window.getApiClientOptions("csharp");
  }

  const generator = new CSharpApiGenerator(options);
  if (window.swaggerData) {
    generator.loadFromWindow();
  }
  return generator;
};
