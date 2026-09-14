import { describe, expect, it } from "vitest";
import { CSharpApiGenerator } from "../js/codeApiGenerators/csharpApiClientGenerator";
import { JavaScriptApiGenerator } from "../js/codeApiGenerators/javascriptApiClientGenerator";
import { CodeSnippetGenerator } from "../js/codeSnippets";

const spec = {
  openapi: "3.0.3",
  info: { title: "Pets" },
  paths: {
    "/pets": {
      get: {
        operationId: "getPets",
        responses: { 200: { description: "OK" } },
      },
      post: {
        operationId: "createPet",
        requestBody: { $ref: "#/components/requestBodies/Pet" },
        responses: { 200: { description: "OK" } },
      },
    },
  },
  components: {
    requestBodies: {
      Pet: {
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/Pet" } },
        },
      },
    },
    schemas: {
      Pet: { type: "object", properties: { name: { type: "string" } } },
    },
  },
};

describe("reused code generators", () => {
  it("generates C# without globals and resolves referenced request bodies", () => {
    const generator = new CSharpApiGenerator();
    generator.loadFromSwaggerData(spec);
    const result = generator.generateClient();
    expect(result.client).toContain("HttpClient");
    expect(result.models).toContain("Pet");
    expect(generator.getMethodParameters(spec.paths["/pets"].post)).toContain(
      "Pet requestBody",
    );
  });
  it("retains JS and TypeScript generation", () => {
    const generator = new JavaScriptApiGenerator({ generateTypeScript: true });
    generator.loadFromSwaggerData(spec);
    const result = generator.generateClient();
    expect(result.client).toContain("ApiClient");
    expect(result.models).toContain("Pet");
    expect(result.types).toBeTruthy();
  });
  it("generates all existing snippet languages against the selected server", () => {
    const generator = new CodeSnippetGenerator();
    for (const language of generator.getSupportedLanguages()) {
      expect(
        generator.generateSnippet(
          language.id,
          "get",
          "https://example.com/pets",
          "",
          {},
        ),
      ).toContain("https://example.com/pets");
    }
  });
});
