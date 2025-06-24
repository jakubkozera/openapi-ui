// Schema example generation functions

// Generate validation-compliant example from schema
function generateValidExampleFromSchema(
  schema,
  components,
  indent = 0,
  visited = new Set()
) {
  if (!schema) return {};

  let resolvedSchema = schema;
  if (schema.$ref) {
    // Prevent infinite recursion with circular references
    if (visited.has(schema.$ref)) {
      return null;
    }
    visited.add(schema.$ref);

    const refPath = schema.$ref.split("/").slice(1); // Remove #
    resolvedSchema = refPath.reduce(
      (acc, part) => acc && acc[part],
      swaggerData // Use swaggerData instead of components to properly resolve references
    );
    if (!resolvedSchema) {
      return { error: `Could not resolve $ref: ${schema.$ref}` };
    }
  }

  // Use provided example if available
  if (resolvedSchema.example !== undefined) {
    return resolvedSchema.example;
  }
  // Use default value if available
  if (resolvedSchema.default !== undefined) {
    return resolvedSchema.default;
  }

  // Handle type as array (OpenAPI 3.1 JSON Schema compatibility)
  let schemaType = resolvedSchema.type;
  if (Array.isArray(resolvedSchema.type) && resolvedSchema.type.length > 0) {
    // Use first non-null type
    schemaType = resolvedSchema.type.find(type => type !== "null") || resolvedSchema.type[0];
  }

  if (schemaType === "object" && resolvedSchema.properties) {
    const example = {};
    const required = resolvedSchema.required || [];

    // Generate required fields first
    for (const propName of required) {
      if (resolvedSchema.properties[propName] && indent < 5) {
        const value = generateValidExampleFromSchema(
          resolvedSchema.properties[propName],
          components,
          indent + 1,
          new Set(visited)
        );
        if (value !== null) {
          example[propName] = value;
        }
      }
    } // Add all optional fields for completeness
    const optionalProps = Object.keys(resolvedSchema.properties).filter(
      (prop) => !required.includes(prop)
    );

    for (const propName of optionalProps) {
      if (indent < 5) {
        const value = generateValidExampleFromSchema(
          resolvedSchema.properties[propName],
          components,
          indent + 1,
          new Set(visited)
        );
        if (value !== null) {
          example[propName] = value;
        }
      }
    }    return example;
  } else if (schemaType === "array" && resolvedSchema.items) {
    if (indent < 5) {
      const itemExample = generateValidExampleFromSchema(
        resolvedSchema.items,
        components,
        indent + 1,
        new Set(visited)
      );
      return itemExample !== null ? [itemExample] : [];
    } else {
      return [];
    }
  } else {
    return generateValidPrimitiveExample(resolvedSchema);
  }
}

// Helper function to generate example from schema (backward compatibility)
function generateExampleFromSchema(schema, components, indent = 0) {
  return generateValidExampleFromSchema(schema, components, indent);
}

function generateValidPrimitiveExample(schema) {
  // Use provided example if available
  if (schema.example !== undefined) return schema.example;

  // Use default value if available
  if (schema.default !== undefined) return schema.default;
  // Handle enums first
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  // Handle type as array (OpenAPI 3.1 JSON Schema compatibility)
  let schemaType = schema.type;
  if (Array.isArray(schema.type) && schema.type.length > 0) {
    // Use first non-null type
    schemaType = schema.type.find(type => type !== "null") || schema.type[0];
  }

  switch (schemaType) {
    case "string":
      return generateValidStringExample(schema);
    case "integer":
      return generateValidIntegerExample(schema);
    case "number":
      return generateValidNumberExample(schema);
    case "boolean":
      return schema.default !== undefined ? schema.default : true;
    case "array":
      if (schema.items) {
        const itemExample = generateValidPrimitiveExample(schema.items);
        return [itemExample];
      }
      return [];
    case "object":
      if (schema.properties) {
        const objExample = {};
        const required = schema.required || [];

        // Only add required properties for primitive objects
        for (const propName of required) {
          if (schema.properties[propName]) {
            objExample[propName] = generateValidPrimitiveExample(
              schema.properties[propName]
            );
          }
        }
        return objExample;
      }
      if (schema.additionalProperties === true) {
        return { key: "value" };
      }
      return {};
    default:
      return null;
  }
}

function generateValidStringExample(schema) {
  // Handle format-specific examples
  if (schema.format) {
    switch (schema.format) {
      case "email":
        return "user@example.com";
      case "date":
        return "2025-06-01";
      case "date-time":
        return "2025-06-01T10:30:00Z";
      case "uri":
      case "url":
        return "https://example.com";
      case "uuid":
        return "123e4567-e89b-12d3-a456-426614174000";
      case "binary":
        return "base64EncodedData";
      case "byte":
        return "U3dhZ2dlciByb2Nrcw==";
      case "password":
        return "P@ssW0rd*";
      default:
        break;
    }
  }

  // Handle pattern validation
  if (schema.pattern) {
    return generateStringFromPattern(schema.pattern);
  }

  // Generate string based on length constraints
  let baseString = "example";

  if (schema.minLength) {
    // Ensure minimum length
    while (baseString.length < schema.minLength) {
      baseString += "Text";
    }
  }

  if (schema.maxLength) {
    // Ensure maximum length
    if (baseString.length > schema.maxLength) {
      baseString = baseString.substring(0, schema.maxLength);
    }
  }

  return baseString;
}

function generateValidIntegerExample(schema) {
  let value = 1; // Default positive integer

  // Respect minimum constraint
  if (schema.minimum !== undefined) {
    value = Math.max(value, schema.minimum);
    if (schema.exclusiveMinimum) {
      value = Math.max(value, schema.minimum + 1);
    }
  }

  // Respect maximum constraint
  if (schema.maximum !== undefined) {
    value = Math.min(value, schema.maximum);
    if (schema.exclusiveMaximum) {
      value = Math.min(value, schema.maximum - 1);
    }
  }

  // Handle multipleOf constraint
  if (schema.multipleOf) {
    value = Math.ceil(value / schema.multipleOf) * schema.multipleOf;
  }

  return Math.floor(value);
}

function generateValidNumberExample(schema) {
  let value = 1.0; // Default positive number

  // Respect minimum constraint
  if (schema.minimum !== undefined) {
    value = Math.max(value, schema.minimum);
    if (schema.exclusiveMinimum) {
      value = Math.max(value, schema.minimum + 0.1);
    }
  }

  // Respect maximum constraint
  if (schema.maximum !== undefined) {
    value = Math.min(value, schema.maximum);
    if (schema.exclusiveMaximum) {
      value = Math.min(value, schema.maximum - 0.1);
    }
  }

  // Handle multipleOf constraint
  if (schema.multipleOf) {
    value = Math.ceil(value / schema.multipleOf) * schema.multipleOf;
  }

  return value;
}

function generateStringFromPattern(pattern) {
  // Simple pattern-to-example mapping for common patterns
  const patternExamples = {
    "^[0-9a-fA-F]{24}$": "507f1f77bcf86cd799439011",
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$": "Password123",
    "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$": "user@example.com",
    "^https?://": "https://example.com",
    "^[A-Z]{2,3}$": "USD",
    "^\\d{4}-\\d{2}-\\d{2}$": "2025-06-01",
    "^\\+?[1-9]\\d{1,14}$": "+1234567890",
  };

  // Check for exact pattern matches
  for (const [regex, example] of Object.entries(patternExamples)) {
    if (pattern === regex) {
      return example;
    }
  }

  // For other patterns, try to generate a reasonable example
  if (pattern.includes("[0-9]") || pattern.includes("\\d")) {
    return "123456";
  }
  if (pattern.includes("[a-zA-Z]")) {
    return "example";
  }
  if (pattern.includes("@")) {
    return "user@example.com";
  }

  // Default fallback
  return "validString";
}

function generatePrimitiveExample(propSchema, components, indent) {
  // Fallback to the new validation-compliant generator
  return generateValidPrimitiveExample(propSchema);
}

// Main function to generate compliant request body examples
function generateRequestBodyExample(operation, swaggerSpec) {
  if (!operation.requestBody || !operation.requestBody.content) {
    return null;
  }

  const content = operation.requestBody.content;
  const contentTypes = Object.keys(content);

  if (contentTypes.length === 0) {
    return null;
  }

  // Prefer JSON content type
  let selectedContentType =
    contentTypes.find((ct) => ct.includes("json")) || contentTypes[0];
  const selectedContent = content[selectedContentType];

  if (!selectedContent.schema) {
    return null;
  }

  // Generate the example
  const example = generateValidExampleFromSchema(
    selectedContent.schema,
    swaggerSpec.components,
    0
  );

  return {
    contentType: selectedContentType,
    example: example,
  };
}

// Utility function to validate if a value matches schema constraints
function validateAgainstSchema(value, schema, swaggerSpec) {
  try {
    // This is a basic validation - you could integrate with a proper JSON Schema validator
    return validateValue(value, schema, swaggerSpec.components);
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

function validateValue(value, schema, components, path = "") {
  let resolvedSchema = schema;

  // Resolve $ref
  if (schema.$ref) {
    const refPath = schema.$ref.split("/").slice(1);
    resolvedSchema = refPath.reduce((acc, part) => acc && acc[part], {
      components,
    });
  }

  const errors = [];

  // Check required fields for objects
  if (resolvedSchema.type === "object" && resolvedSchema.required) {
    for (const requiredField of resolvedSchema.required) {
      if (value[requiredField] === undefined) {
        errors.push(`Missing required field: ${path}.${requiredField}`);
      }
    }
  }

  // Check type
  if (resolvedSchema.type) {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (
      actualType !== resolvedSchema.type &&
      !(resolvedSchema.type === "integer" && actualType === "number")
    ) {
      errors.push(
        `Type mismatch at ${path}: expected ${resolvedSchema.type}, got ${actualType}`
      );
    }
  }

  // Check string constraints
  if (resolvedSchema.type === "string" && typeof value === "string") {
    if (resolvedSchema.minLength && value.length < resolvedSchema.minLength) {
      errors.push(
        `String too short at ${path}: minimum length ${resolvedSchema.minLength}`
      );
    }
    if (resolvedSchema.maxLength && value.length > resolvedSchema.maxLength) {
      errors.push(
        `String too long at ${path}: maximum length ${resolvedSchema.maxLength}`
      );
    }
    if (
      resolvedSchema.pattern &&
      !new RegExp(resolvedSchema.pattern).test(value)
    ) {
      errors.push(
        `String pattern mismatch at ${path}: must match ${resolvedSchema.pattern}`
      );
    }
    if (resolvedSchema.enum && !resolvedSchema.enum.includes(value)) {
      errors.push(
        `Invalid enum value at ${path}: must be one of ${resolvedSchema.enum.join(
          ", "
        )}`
      );
    }
  }

  // Check number constraints
  if (
    (resolvedSchema.type === "number" || resolvedSchema.type === "integer") &&
    typeof value === "number"
  ) {
    if (
      resolvedSchema.minimum !== undefined &&
      value < resolvedSchema.minimum
    ) {
      errors.push(
        `Number too small at ${path}: minimum ${resolvedSchema.minimum}`
      );
    }
    if (
      resolvedSchema.maximum !== undefined &&
      value > resolvedSchema.maximum
    ) {
      errors.push(
        `Number too large at ${path}: maximum ${resolvedSchema.maximum}`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

// Functions are now globally available
