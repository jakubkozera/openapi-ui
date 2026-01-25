import type { EndpointInfo, HttpMethod, OpenAPISpec, RequestBody } from '../types/openapi';
import { resolveRef } from './helpers';

interface CodeSnippet {
  language: string;
  displayName: string;
  code: string;
}

interface RequestConfig {
  baseUrl: string;
  path: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
  contentType?: string;
}

// Build full URL with path and query params
function buildUrl(config: RequestConfig): string {
  let path = config.path;
  
  // Replace path params
  Object.entries(config.pathParams).forEach(([name, value]) => {
    path = path.replace(`{${name}}`, encodeURIComponent(value));
  });
  
  const url = new URL(path, config.baseUrl);
  
  // Add query params
  Object.entries(config.queryParams).forEach(([name, value]) => {
    if (value) url.searchParams.append(name, value);
  });
  
  return url.toString();
}

// Generate cURL snippet
function generateCurl(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const lines: string[] = [`curl -X '${method.toUpperCase()}'`];
  lines.push(`  '${url}'`);
  
  Object.entries(config.headers).forEach(([name, value]) => {
    lines.push(`  -H '${name}: ${value}'`);
  });
  
  if (config.body && ['post', 'put', 'patch'].includes(method)) {
    const escapedBody = config.body.replace(/'/g, "'\\''");
    lines.push(`  -d '${escapedBody}'`);
  }
  
  return lines.join(' \\\n');
}

// Generate JavaScript Fetch snippet
function generateJavaScript(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const hasBody = config.body && ['post', 'put', 'patch'].includes(method);
  
  let code = `fetch('${url}', {\n`;
  code += `  method: '${method.toUpperCase()}',\n`;
  
  if (Object.keys(config.headers).length > 0) {
    code += `  headers: {\n`;
    Object.entries(config.headers).forEach(([name, value]) => {
      code += `    '${name}': '${value}',\n`;
    });
    code += `  },\n`;
  }
  
  if (hasBody) {
    code += `  body: JSON.stringify(${config.body}),\n`;
  }
  
  code += `})\n`;
  code += `.then(response => response.json())\n`;
  code += `.then(data => console.log(data))\n`;
  code += `.catch(error => console.error('Error:', error));`;
  
  return code;
}

// Generate Python requests snippet
function generatePython(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const hasBody = config.body && ['post', 'put', 'patch'].includes(method);
  
  let code = `import requests\n\n`;
  
  code += `url = '${url}'\n`;
  
  if (Object.keys(config.headers).length > 0) {
    code += `headers = {\n`;
    Object.entries(config.headers).forEach(([name, value]) => {
      code += `    '${name}': '${value}',\n`;
    });
    code += `}\n`;
  } else {
    code += `headers = {}\n`;
  }
  
  if (hasBody) {
    code += `data = ${config.body}\n\n`;
    code += `response = requests.${method}(url, headers=headers, json=data)\n`;
  } else {
    code += `\nresponse = requests.${method}(url, headers=headers)\n`;
  }
  
  code += `print(response.json())`;
  
  return code;
}

// Generate C# HttpClient snippet
function generateCSharp(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const hasBody = config.body && ['post', 'put', 'patch'].includes(method);
  const methodPascal = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  
  let code = `using System.Net.Http;\nusing System.Text;\n\n`;
  code += `var client = new HttpClient();\n\n`;
  
  Object.entries(config.headers).forEach(([name, value]) => {
    if (name.toLowerCase() !== 'content-type') {
      code += `client.DefaultRequestHeaders.Add("${name}", "${value}");\n`;
    }
  });
  
  if (hasBody) {
    code += `\nvar content = new StringContent(\n`;
    code += `    @"${config.body?.replace(/"/g, '""')}",\n`;
    code += `    Encoding.UTF8,\n`;
    code += `    "${config.contentType || 'application/json'}");\n\n`;
    code += `var response = await client.${methodPascal}Async("${url}", content);\n`;
  } else {
    code += `\nvar response = await client.${methodPascal}Async("${url}");\n`;
  }
  
  code += `var responseBody = await response.Content.ReadAsStringAsync();\n`;
  code += `Console.WriteLine(responseBody);`;
  
  return code;
}

// Generate Java snippet
function generateJava(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const hasBody = config.body && ['post', 'put', 'patch'].includes(method);
  
  let code = `import java.net.http.*;\nimport java.net.URI;\n\n`;
  code += `HttpClient client = HttpClient.newHttpClient();\n\n`;
  code += `HttpRequest.Builder builder = HttpRequest.newBuilder()\n`;
  code += `    .uri(URI.create("${url}"))\n`;
  
  Object.entries(config.headers).forEach(([name, value]) => {
    code += `    .header("${name}", "${value}")\n`;
  });
  
  if (hasBody) {
    code += `    .${method.toUpperCase()}(HttpRequest.BodyPublishers.ofString("${config.body?.replace(/"/g, '\\"')}"))\n`;
  } else {
    code += `    .${method.toUpperCase()}(HttpRequest.BodyPublishers.noBody())\n`;
  }
  
  code += `    .build();\n\n`;
  code += `HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());\n`;
  code += `System.out.println(response.body());`;
  
  return code;
}

// Generate PHP snippet
function generatePhp(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const hasBody = config.body && ['post', 'put', 'patch'].includes(method);
  
  let code = `<?php\n\n`;
  code += `$ch = curl_init();\n\n`;
  code += `curl_setopt($ch, CURLOPT_URL, '${url}');\n`;
  code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
  code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method.toUpperCase()}');\n\n`;
  
  if (Object.keys(config.headers).length > 0) {
    code += `$headers = [\n`;
    Object.entries(config.headers).forEach(([name, value]) => {
      code += `    '${name}: ${value}',\n`;
    });
    code += `];\n`;
    code += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n\n`;
  }
  
  if (hasBody) {
    code += `curl_setopt($ch, CURLOPT_POSTFIELDS, '${config.body?.replace(/'/g, "\\'")}');\n\n`;
  }
  
  code += `$response = curl_exec($ch);\n`;
  code += `curl_close($ch);\n\n`;
  code += `echo $response;`;
  
  return code;
}

// Generate Ruby snippet
function generateRuby(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const hasBody = config.body && ['post', 'put', 'patch'].includes(method);
  
  let code = `require 'net/http'\nrequire 'json'\n\n`;
  code += `uri = URI('${url}')\n`;
  code += `http = Net::HTTP.new(uri.host, uri.port)\n`;
  code += `http.use_ssl = uri.scheme == 'https'\n\n`;
  
  const methodClass = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  code += `request = Net::HTTP::${methodClass}.new(uri)\n`;
  
  Object.entries(config.headers).forEach(([name, value]) => {
    code += `request['${name}'] = '${value}'\n`;
  });
  
  if (hasBody) {
    code += `request.body = '${config.body?.replace(/'/g, "\\'")}'\n`;
  }
  
  code += `\nresponse = http.request(request)\n`;
  code += `puts response.body`;
  
  return code;
}

// Generate Go snippet
function generateGo(method: HttpMethod, config: RequestConfig): string {
  const url = buildUrl(config);
  const hasBody = config.body && ['post', 'put', 'patch'].includes(method);
  
  let code = `package main\n\n`;
  code += `import (\n`;
  code += `    "fmt"\n`;
  code += `    "io"\n`;
  code += `    "net/http"\n`;
  if (hasBody) {
    code += `    "strings"\n`;
  }
  code += `)\n\n`;
  code += `func main() {\n`;
  
  if (hasBody) {
    code += `    body := strings.NewReader(\`${config.body}\`)\n`;
    code += `    req, _ := http.NewRequest("${method.toUpperCase()}", "${url}", body)\n`;
  } else {
    code += `    req, _ := http.NewRequest("${method.toUpperCase()}", "${url}", nil)\n`;
  }
  
  Object.entries(config.headers).forEach(([name, value]) => {
    code += `    req.Header.Set("${name}", "${value}")\n`;
  });
  
  code += `\n    client := &http.Client{}\n`;
  code += `    resp, _ := client.Do(req)\n`;
  code += `    defer resp.Body.Close()\n\n`;
  code += `    data, _ := io.ReadAll(resp.Body)\n`;
  code += `    fmt.Println(string(data))\n`;
  code += `}`;
  
  return code;
}

// Main function to generate all code snippets
export function generateCodeSnippets(
  endpoint: EndpointInfo,
  config: RequestConfig
): CodeSnippet[] {
  const { method } = endpoint;
  
  return [
    { language: 'curl', displayName: 'cURL', code: generateCurl(method, config) },
    { language: 'javascript', displayName: 'JavaScript', code: generateJavaScript(method, config) },
    { language: 'python', displayName: 'Python', code: generatePython(method, config) },
    { language: 'csharp', displayName: 'C#', code: generateCSharp(method, config) },
    { language: 'java', displayName: 'Java', code: generateJava(method, config) },
    { language: 'php', displayName: 'PHP', code: generatePhp(method, config) },
    { language: 'ruby', displayName: 'Ruby', code: generateRuby(method, config) },
    { language: 'go', displayName: 'Go', code: generateGo(method, config) },
  ];
}

// Build request config from form values
export function buildRequestConfig(
  endpoint: EndpointInfo,
  spec: OpenAPISpec,
  baseUrl: string,
  values: {
    pathParams: Record<string, string>;
    queryParams: Record<string, string>;
    headers: Record<string, string>;
    body?: string;
  },
  authHeaders: Headers
): RequestConfig {
  const config: RequestConfig = {
    baseUrl,
    path: endpoint.path,
    pathParams: values.pathParams,
    queryParams: values.queryParams,
    headers: { ...values.headers },
    body: values.body,
    contentType: 'application/json',
  };
  
  // Add auth headers
  authHeaders.forEach((value, key) => {
    config.headers[key] = value;
  });
  
  // Determine content type from request body
  const operation = endpoint.operation;
  if (operation.requestBody) {
    const reqBody = resolveRef<RequestBody>(spec, operation.requestBody);
    if (reqBody?.content) {
      const contentTypes = Object.keys(reqBody.content);
      if (contentTypes.length > 0) {
        config.contentType = contentTypes[0];
        config.headers['Content-Type'] = config.contentType;
      }
    }
  }
  
  return config;
}
