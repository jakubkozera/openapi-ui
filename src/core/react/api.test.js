import { describe, expect, it } from "vitest";
import {
  buildRequest,
  exampleFor,
  extractOutputs,
  getOperations,
  makeDraft,
  parseSpec,
  serverUrl,
} from "./api";

const spec = {
  openapi: "3.0.3",
  info: { title: "Pets" },
  paths: {
    "/pets/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        parameters: [{ name: "tags", in: "query", schema: { type: "array" } }],
        security: [{ bearer: [], key: [] }, { basic: [] }],
      },
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" } },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearer: { type: "http", scheme: "bearer" },
      key: { type: "apiKey", in: "query", name: "api_key" },
      basic: { type: "http", scheme: "basic" },
    },
  },
};

describe("OpenAPI request engine", () => {
  it("parses YAML and merges path parameters with operation overrides", () => {
    expect(parseSpec("openapi: 3.1.0\npaths: {}").openapi).toBe("3.1.0");
    expect(() => parseSpec("hello")).toThrow("valid OpenAPI");
    const operation = getOperations(spec)[0];
    expect(operation.parameters.map((param) => param.name)).toEqual([
      "id",
      "tags",
    ]);
    expect(
      getOperations({
        ...spec,
        paths: {
          "/pets": {
            parameters: [{ name: "id", in: "query" }],
            get: { parameters: [{ name: "id", in: "query", required: true }] },
          },
        },
      })[0].parameters,
    ).toHaveLength(1);
  });

  it("encodes path and repeated query parameters, applies variables and an AND security group", () => {
    const operation = getOperations(spec)[0];
    const draft = makeDraft(operation, spec);
    draft.parameters[0].value = "{{id}}";
    draft.parameters[1] = {
      ...draft.parameters[1],
      enabled: true,
      value: "one,two",
    };
    const request = buildRequest(
      operation,
      draft,
      "https://example.com/v1",
      [{ name: "id", value: "a/b" }],
      { bearer: { token: "abc" }, key: { token: "key" } },
      spec,
    );
    expect(request.url).toBe(
      "https://example.com/v1/pets/a%2Fb?tags=one&tags=two&api_key=key",
    );
    expect(request.options.headers.get("Authorization")).toBe("Bearer abc");
  });

  it("chooses a complete alternative security requirement and respects anonymous overrides", () => {
    const operation = getOperations(spec)[0];
    const draft = makeDraft(operation, spec);
    draft.parameters[0].value = "1";
    expect(
      buildRequest(
        operation,
        draft,
        "https://example.com",
        [],
        { bearer: { token: "abc" } },
        spec,
      ).options.headers.has("Authorization"),
    ).toBe(false);
    const request = buildRequest(
      operation,
      draft,
      "https://example.com",
      [],
      { basic: { username: "user", password: "pass" } },
      spec,
    );
    expect(request.options.headers.get("Authorization")).toBe(
      `Basic ${btoa("user:pass")}`,
    );
    expect(
      buildRequest(
        { ...operation, security: [] },
        draft,
        "https://example.com",
        [],
        {},
        spec,
      ).options.headers.has("Authorization"),
    ).toBe(false);
  });

  it("allows anonymous requests with inherited security and ignores expired credentials", () => {
    const securedSpec = {
      ...spec,
      security: [{ bearer: [] }],
      paths: { "/health": { get: {} } },
    };
    const operation = getOperations(securedSpec)[0];
    const draft = makeDraft(operation, securedSpec);
    expect(operation.security).toEqual([{ bearer: [] }]);
    for (const credentials of [
      {},
      { bearer: { token: "expired", expiresAt: 1 } },
    ]) {
      const request = buildRequest(
        operation,
        draft,
        "https://example.com",
        [],
        credentials,
        securedSpec,
      );
      expect(request.url).toBe("https://example.com/health");
      expect(request.options.headers.has("Authorization")).toBe(false);
    }
    expect(
      buildRequest(
        operation,
        draft,
        "https://example.com",
        [],
        { bearer: { token: "valid" } },
        securedSpec,
      ).options.headers.get("Authorization"),
    ).toBe("Bearer valid");
    expect(
      buildRequest(
        operation,
        { ...draft, authEnabled: false },
        "https://example.com",
        [],
        { bearer: { token: "valid" } },
        securedSpec,
      ).options.headers.has("Authorization"),
    ).toBe(false);
  });

  it("validates required parameters and JSON before sending", () => {
    const operation = getOperations(spec)[1];
    const draft = makeDraft(operation, spec);
    expect(() => buildRequest(operation, draft, "https://example.com")).toThrow(
      "Required parameter",
    );
    draft.parameters[0].value = "1";
    draft.body = "{";
    expect(() =>
      buildRequest(operation, draft, "https://example.com"),
    ).toThrow();
  });

  it("keeps multipart boundaries browser-owned and supports form bodies", () => {
    const operation = { ...getOperations(spec)[1], security: [] };
    const draft = {
      ...makeDraft(operation, spec),
      parameters: [],
      path: "/pets",
      contentType: "multipart/form-data",
      headers: [{ name: "Content-Type", value: "bad" }],
      form: [{ name: "name", value: "{{name}}" }],
    };
    const request = buildRequest(operation, draft, "https://example.com", [
      { name: "name", value: "Pet" },
    ]);
    expect(request.options.body.get("name")).toBe("Pet");
    expect(request.options.headers.has("Content-Type")).toBe(false);
  });

  it("handles recursive schemas, server variables and JSONPath variable chaining", () => {
    const recursive = {
      components: {
        schemas: {
          Node: {
            type: "object",
            properties: { next: { $ref: "#/components/schemas/Node" } },
          },
        },
      },
    };
    expect(
      exampleFor({ $ref: "#/components/schemas/Node" }, recursive),
    ).toEqual({ next: null });
    expect(
      serverUrl(
        {
          servers: [
            { url: "/{version}", variables: { version: { default: "v2" } } },
          ],
        },
        "https://example.com/spec.json",
        "http://localhost",
      ),
    ).toBe("https://example.com/v2");
    expect(
      extractOutputs(
        [{ name: "id", path: "$.data[0].id" }],
        '{"data":[{"id":7}]}',
        [],
      ),
    ).toEqual([{ name: "id", value: "7", enabled: true }]);
  });

  it("normalizes Swagger 2 body and security definitions", () => {
    const legacy = {
      swagger: "2.0",
      paths: {
        "/pets": {
          post: {
            parameters: [
              { name: "body", in: "body", schema: { type: "string" } },
            ],
          },
        },
      },
    };
    expect(makeDraft(getOperations(legacy)[0], legacy).contentType).toBe(
      "application/json",
    );
  });
});
