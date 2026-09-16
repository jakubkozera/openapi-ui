import { load } from "js-yaml";
import { JSONPath } from "jsonpath-plus";

export const METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
];

export function resolveRef(value, spec, visited = new Set()) {
  if (!value?.$ref) return value || {};
  if (!value.$ref.startsWith("#/"))
    throw new Error(`External reference is not supported: ${value.$ref}`);
  if (visited.has(value.$ref)) return {};
  visited.add(value.$ref);
  const target = value.$ref
    .slice(2)
    .split("/")
    .reduce(
      (current, key) =>
        current?.[
          decodeURIComponent(key).replace(/~1/g, "/").replace(/~0/g, "~")
        ],
      spec,
    );
  if (!target) throw new Error(`Reference not found: ${value.$ref}`);
  return {
    ...resolveRef(target, spec, visited),
    ...Object.fromEntries(
      Object.entries(value).filter(([key]) => key !== "$ref"),
    ),
  };
}

export function parseSpec(text) {
  const spec = load(text);
  if (
    !spec ||
    typeof spec !== "object" ||
    (!spec.openapi && spec.swagger !== "2.0") ||
    !spec.paths ||
    typeof spec.paths !== "object"
  ) {
    throw new Error(
      "A valid OpenAPI 3.x or Swagger 2.0 document with paths is required.",
    );
  }
  return spec;
}

export function getOperations(spec) {
  return Object.entries(spec.paths).flatMap(([path, rawItem]) => {
    const item = resolveRef(rawItem, spec);
    return METHODS.filter((method) => item[method]).map((method) => {
      const operation = resolveRef(item[method], spec);
      const params = [
        ...(item.parameters || []),
        ...(operation.parameters || []),
      ].map((param) => resolveRef(param, spec));
      const parameters = [
        ...new Map(
          params.map((param) => [`${param.in}:${param.name}`, param]),
        ).values(),
      ];
      let requestBody = operation.requestBody
        ? resolveRef(operation.requestBody, spec)
        : undefined;
      if (spec.swagger === "2.0") {
        const body = parameters.find((param) => param.in === "body");
        const form = parameters.filter((param) => param.in === "formData");
        if (body || form.length) {
          const contentTypes = operation.consumes ||
            spec.consumes || [
              form.length
                ? "application/x-www-form-urlencoded"
                : "application/json",
            ];
          requestBody = {
            required: body?.required,
            content: Object.fromEntries(
              contentTypes.map((type) => [
                type,
                {
                  schema: body?.schema || {
                    type: "object",
                    properties: Object.fromEntries(
                      form.map((param) => [param.name, param]),
                    ),
                  },
                },
              ]),
            ),
          };
        }
      }
      return {
        ...operation,
        id: `${method} ${path}`,
        path,
        method,
        parameters: parameters.filter(
          (param) => !["body", "formData"].includes(param.in),
        ),
        requestBody,
        security: operation.security ?? spec.security ?? [],
        servers: operation.servers || item.servers || spec.servers,
      };
    });
  });
}

export function exampleFor(rawSchema, spec, depth = 0, visited = new Set()) {
  if (depth > 6 || (rawSchema?.$ref && visited.has(rawSchema.$ref)))
    return null;
  const next = new Set(visited);
  if (rawSchema?.$ref) next.add(rawSchema.$ref);
  const schema = resolveRef(rawSchema, spec);
  if (schema.example !== undefined) return schema.example;
  if (schema.examples?.length) return schema.examples[0];
  if (schema.default !== undefined) return schema.default;
  if (schema.enum?.length) return schema.enum[0];
  if (schema.allOf)
    return Object.assign(
      {},
      ...schema.allOf.map((item) => exampleFor(item, spec, depth + 1, next)),
    );
  if (schema.oneOf || schema.anyOf)
    return exampleFor((schema.oneOf || schema.anyOf)[0], spec, depth + 1, next);
  const type = Array.isArray(schema.type)
    ? schema.type.find((item) => item !== "null")
    : schema.type;
  if (type === "object" || schema.properties)
    return Object.fromEntries(
      Object.entries(schema.properties || {})
        .filter(([, value]) => !value.readOnly)
        .map(([name, value]) => [
          name,
          exampleFor(value, spec, depth + 1, next),
        ]),
    );
  if (type === "array")
    return Array.from({ length: Math.min(schema.minItems || 1, 5) }, () =>
      exampleFor(schema.items, spec, depth + 1, next),
    );
  if (type === "boolean") return true;
  if (type === "integer" || type === "number") return schema.minimum ?? 0;
  if (schema.format === "date-time") return new Date().toISOString();
  if (schema.format === "date") return new Date().toISOString().slice(0, 10);
  if (schema.format === "uuid") return "00000000-0000-4000-8000-000000000001";
  if (schema.format === "email") return "user@example.com";
  if (schema.format === "binary" || type === "file") return "";
  return "string";
}

export function bodyExample(operation, spec, contentType) {
  const media = operation.requestBody?.content?.[contentType];
  if (!media) return "";
  const example =
    media.example ??
    resolveRef(Object.values(media.examples || {})[0], spec).value ??
    exampleFor(media.schema, spec);
  return typeof example === "string"
    ? example
    : JSON.stringify(example, null, 2);
}

export function makeDraft(operation, spec) {
  const contentType =
    Object.keys(operation.requestBody?.content || {})[0] || "";
  const parameters = operation.parameters.map((param) => {
    const schema = resolveRef(param.schema || param, spec);
    const value = param.example ?? schema.default ?? "";
    return {
      name: param.name,
      location: param.in,
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
      enabled: param.required || value !== "",
      required: !!param.required,
    };
  });
  const schema = resolveRef(
    operation.requestBody?.content?.[contentType]?.schema,
    spec,
  );
  return {
    path: operation.path,
    parameters,
    headers: [],
    body: bodyExample(operation, spec, contentType),
    contentType,
    form: Object.entries(schema.properties || {}).map(([name, value]) => ({
      name,
      value: value.default ?? "",
      enabled: true,
      file: value.format === "binary" || value.type === "file",
    })),
    outputs: [],
    authEnabled: true,
  };
}

export function replaceVariables(value, variables) {
  const values = new Map(
    variables
      .filter((variable) => variable.enabled !== false)
      .map((variable) => [variable.name, variable.value]),
  );
  return String(value ?? "").replace(
    /\{\{\s*([^{}]+?)\s*\}\}/g,
    (match, name) => {
      if (values.has(name)) return String(values.get(name));
      return name.startsWith("@") && values.has(name.slice(1))
        ? String(values.get(name.slice(1)))
        : match;
    },
  );
}

export function serverUrl(spec, source, fallback = location.origin) {
  let server = spec.servers?.[0]?.url;
  if (server)
    server = server.replace(
      /\{([^}]+)\}/g,
      (match, name) => spec.servers[0].variables?.[name]?.default ?? match,
    );
  if (!server && spec.host)
    server = `${spec.schemes?.[0] || "https"}://${spec.host}${spec.basePath || ""}`;
  const base = source && /^https?:/i.test(source) ? source : fallback;
  return new URL(server || "/", base).href.replace(/\/$/, "");
}

export function securitySchemes(spec) {
  return spec.components?.securitySchemes || spec.securityDefinitions || {};
}

export function credentialPresent(scheme, value) {
  if (!value) return false;
  if (value.expiresAt && value.expiresAt <= Date.now()) return false;
  if (scheme.type === "basic" || scheme.scheme === "basic")
    return !!value.username;
  return !!value.token;
}

function parameterValue(parameter, definition, value) {
  const type = definition?.schema?.type || definition?.type;
  if (type === "array") {
    const values = value.trim().startsWith("[")
      ? JSON.parse(value)
      : value.split(",");
    const delimiter =
      {
        spaceDelimited: " ",
        pipeDelimited: "|",
        ssv: " ",
        pipes: "|",
        tsv: "\t",
      }[definition.style || definition.collectionFormat] || ",";
    const explode =
      definition.explode ??
      (parameter.location === "query" && !definition.collectionFormat);
    return (explode || definition.collectionFormat === "multi") &&
      parameter.location === "query"
      ? values
      : [values.join(delimiter)];
  }
  return [value];
}

export function buildRequest(
  operation,
  draft,
  server,
  variables = [],
  credentials = {},
  spec = {},
  files = {},
) {
  const replace = (value) => replaceVariables(value, variables);
  let path = replace(draft.path || operation.path);
  const query = new URLSearchParams();
  const headers = new Headers();
  for (const parameter of draft.parameters || []) {
    if (!parameter.enabled && !parameter.required) continue;
    const value = replace(parameter.value);
    if (parameter.required && !value)
      throw new Error(`Required parameter: ${parameter.name}`);
    const definition = operation.parameters.find(
      (item) => item.name === parameter.name && item.in === parameter.location,
    );
    const values = parameterValue(parameter, definition, value);
    if (parameter.location === "path")
      path = path
        .split(`{${parameter.name}}`)
        .join(encodeURIComponent(values.join(",")));
    if (parameter.location === "query") {
      if (definition?.style === "deepObject") {
        for (const [name, child] of Object.entries(JSON.parse(value)))
          query.append(`${parameter.name}[${name}]`, String(child));
      } else
        values.forEach((item) => query.append(parameter.name, String(item)));
    }
    if (parameter.location === "header")
      headers.set(parameter.name, values.join(","));
    if (parameter.location === "cookie" && value)
      throw new Error(
        "Browsers cannot set Cookie headers. Set cookies on the API origin.",
      );
  }
  if (/\{[^{}]+\}/.test(path) && !/\{\{/.test(path))
    throw new Error("Fill all path parameters before sending.");
  if (/^https?:\/\//i.test(path))
    throw new Error(
      "Use the server field for the API origin and a relative request path.",
    );
  const url = new URL(
    `${replace(server).replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
  );
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Only HTTP and HTTPS requests are supported.");
  query.forEach((value, name) => url.searchParams.append(name, value));
  for (const header of draft.headers || [])
    if (header.enabled !== false && header.name)
      headers.set(header.name, replace(header.value));
  if (draft.authEnabled !== false && operation.security.length) {
    const schemes = securitySchemes(spec);
    const requirement = operation.security.find((group) =>
      Object.keys(group).every((name) =>
        credentialPresent(resolveRef(schemes[name], spec), credentials[name]),
      ),
    );
    for (const name of Object.keys(requirement || {})) {
      const scheme = resolveRef(schemes[name], spec);
      const credential = credentials[name];
      if (scheme.type === "apiKey") {
        if (scheme.in === "query")
          url.searchParams.set(scheme.name, credential.token);
        else if (scheme.in === "cookie")
          throw new Error("Cookie API keys must be set on the API origin.");
        else headers.set(scheme.name, credential.token);
      } else if (scheme.type === "basic" || scheme.scheme === "basic") {
        headers.set(
          "Authorization",
          `Basic ${btoa(unescape(encodeURIComponent(`${credential.username}:${credential.password || ""}`)))}`,
        );
      } else headers.set("Authorization", `Bearer ${credential.token}`);
    }
  }
  let body;
  if (!["get", "head"].includes(operation.method)) {
    if (
      draft.contentType === "multipart/form-data" ||
      draft.contentType === "application/x-www-form-urlencoded"
    ) {
      body =
        draft.contentType === "multipart/form-data"
          ? new FormData()
          : new URLSearchParams();
      for (const field of draft.form || []) {
        if (field.enabled === false || !field.name) continue;
        if (field.file) {
          if (files[field.name]) body.append(field.name, files[field.name]);
        } else body.append(field.name, replace(field.value));
      }
      if (draft.contentType === "multipart/form-data")
        headers.delete("Content-Type");
      else headers.set("Content-Type", draft.contentType);
    } else if (draft.body) {
      body = replace(draft.body);
      if (draft.contentType?.includes("json")) JSON.parse(body);
      if (draft.contentType) headers.set("Content-Type", draft.contentType);
    }
    if (operation.requestBody?.required && !body)
      throw new Error("Request body is required.");
  }
  return {
    url: url.href,
    options: { method: operation.method.toUpperCase(), headers, body },
  };
}

export async function sendRequest(request, signal) {
  const started = performance.now();
  const response = await fetch(request.url, { ...request.options, signal });
  const blob = await response.blob();
  const contentType = response.headers.get("content-type") || "";
  const binary =
    /^(image|audio|video)\//.test(contentType) ||
    /octet-stream|pdf|zip|officedocument/.test(contentType);
  const text = binary ? "" : await blob.text();
  let body = text;
  try {
    body = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    /* Non-JSON responses remain plain text. */
  }
  return {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries()),
    body,
    blob,
    binary,
    duration: Math.round(performance.now() - started),
    size: blob.size,
    contentType,
  };
}

export function extractOutputs(outputs, body, variables) {
  let updated = [...variables];
  if (!outputs?.some((output) => output.name && output.path)) return updated;
  const json = JSON.parse(body);
  for (const output of outputs) {
    if (!output.name || !output.path) continue;
    const values = JSONPath({ path: output.path, json, eval: false });
    if (!values.length) continue;
    const value =
      typeof values[0] === "object"
        ? JSON.stringify(values[0])
        : String(values[0]);
    updated = [
      ...updated.filter((variable) => variable.name !== output.name),
      { name: output.name, value, enabled: true },
    ];
  }
  return updated;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
