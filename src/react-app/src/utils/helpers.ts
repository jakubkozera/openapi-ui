import type { Schema, Reference, OpenAPISpec } from '../types/openapi';

// Resolve $ref references
export function resolveRef<T>(
  spec: OpenAPISpec,
  obj: T | Reference | undefined
): T | undefined {
  if (!obj) return undefined;
  
  if (typeof obj === 'object' && obj !== null && '$ref' in obj) {
    const refPath = (obj as Reference).$ref;
    const parts = refPath.replace('#/', '').split('/');
    
    let current: unknown = spec;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current as T;
  }
  
  return obj as T;
}

// Generate example from schema
export function generateExampleFromSchema(
  schema: Schema | Reference | undefined,
  spec: OpenAPISpec,
  visited: Set<string> = new Set()
): unknown {
  if (!schema) return undefined;
  
  const resolvedSchema = resolveRef<Schema>(spec, schema);
  if (!resolvedSchema) return undefined;
  
  // Handle circular references
  if ('$ref' in schema) {
    const refPath = (schema as Reference).$ref;
    if (visited.has(refPath)) {
      return '...circular reference...';
    }
    visited.add(refPath);
  }
  
  // Use example if provided
  if (resolvedSchema.example !== undefined) {
    return resolvedSchema.example;
  }
  
  // Use default if provided
  if (resolvedSchema.default !== undefined) {
    return resolvedSchema.default;
  }
  
  // Handle allOf, oneOf, anyOf
  if (resolvedSchema.allOf) {
    let result = {};
    for (const item of resolvedSchema.allOf) {
      const itemExample = generateExampleFromSchema(item, spec, visited);
      if (typeof itemExample === 'object' && itemExample !== null) {
        result = { ...result, ...itemExample };
      }
    }
    return result;
  }
  
  if (resolvedSchema.oneOf && resolvedSchema.oneOf.length > 0) {
    return generateExampleFromSchema(resolvedSchema.oneOf[0], spec, visited);
  }
  
  if (resolvedSchema.anyOf && resolvedSchema.anyOf.length > 0) {
    return generateExampleFromSchema(resolvedSchema.anyOf[0], spec, visited);
  }
  
  // Generate based on type
  switch (resolvedSchema.type) {
    case 'object': {
      const obj: Record<string, unknown> = {};
      if (resolvedSchema.properties) {
        Object.entries(resolvedSchema.properties).forEach(([key, propSchema]) => {
          obj[key] = generateExampleFromSchema(propSchema, spec, visited);
        });
      }
      return obj;
    }
    
    case 'array': {
      const itemExample = generateExampleFromSchema(resolvedSchema.items, spec, visited);
      return [itemExample];
    }
    
    case 'string': {
      if (resolvedSchema.enum && resolvedSchema.enum.length > 0) {
        return resolvedSchema.enum[0];
      }
      switch (resolvedSchema.format) {
        case 'date':
          return new Date().toISOString().split('T')[0];
        case 'date-time':
          return new Date().toISOString();
        case 'email':
          return 'user@example.com';
        case 'uri':
        case 'url':
          return 'https://example.com';
        case 'uuid':
          return '00000000-0000-0000-0000-000000000000';
        case 'hostname':
          return 'example.com';
        case 'ipv4':
          return '192.168.0.1';
        case 'ipv6':
          return '::1';
        case 'binary':
          return 'base64encodeddata==';
        case 'byte':
          return 'YmFzZTY0ZGF0YQ==';
        case 'password':
          return 'password123';
        default:
          return 'string';
      }
    }
    
    case 'integer':
    case 'number': {
      if (resolvedSchema.enum && resolvedSchema.enum.length > 0) {
        return resolvedSchema.enum[0];
      }
      if (resolvedSchema.minimum !== undefined) {
        return resolvedSchema.minimum;
      }
      return resolvedSchema.type === 'integer' ? 0 : 0.0;
    }
    
    case 'boolean':
      return resolvedSchema.enum ? resolvedSchema.enum[0] : false;
    
    case 'null':
      return null;
    
    default:
      return null;
  }
}

// Convert kebab-case to Title Case
export function toTitleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Get HTTP method color class
export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    get: 'method-get',
    post: 'method-post',
    put: 'method-put',
    delete: 'method-delete',
    patch: 'method-patch',
    options: 'method-options',
    head: 'method-head',
    trace: 'method-trace',
  };
  return colors[method.toLowerCase()] || 'method-get';
}

// Format file size
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Parse JWT token
export function parseJwt(token: string): { 
  header: object; 
  payload: { 
    exp?: number; 
    iat?: number; 
    sub?: string;
  } & Record<string, unknown>;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    return {
      header,
      payload,
    };
  } catch {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const parsed = parseJwt(token);
  if (!parsed || !parsed.payload.exp) return false;
  return Date.now() >= parsed.payload.exp * 1000;
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Status code category
export function getStatusCategory(status: number | string): 'success' | 'redirect' | 'client-error' | 'server-error' | 'info' {
  const code = typeof status === 'number' ? status : parseInt(status, 10);
  
  if (code >= 100 && code < 200) return 'info';
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'redirect';
  if (code >= 400 && code < 500) return 'client-error';
  return 'server-error';
}

// Get status color class
export function getStatusColorClass(status: number | string): string {
  const category = getStatusCategory(status);
  const colors: Record<string, string> = {
    'success': 'text-green-500',
    'redirect': 'text-blue-500',
    'client-error': 'text-yellow-500',
    'server-error': 'text-red-500',
    'info': 'text-blue-300',
  };
  return colors[category] || 'text-gray-500';
}
