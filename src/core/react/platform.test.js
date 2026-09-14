import { describe, expect, it } from "vitest";
import { migrateLegacy } from "./platform";
import { getOperations, makeDraft, replaceVariables } from "./api";

describe("legacy user data migration", () => {
  it("preserves favorites, variables, output values and collection request snapshots", () => {
    const spec = {
      openapi: "3.0.3",
      info: { title: "Pet API", version: "1.0" },
      paths: { "/pets": { post: {} } },
    };
    const values = {
      pet_api_1_0_variables: '{"host":"https://example.com"}',
      pet_api_1_0_output_variables: '{"id":"42"}',
      "pet_api_1.0_favorites": '[{"path":"/pets","method":"POST"}]',
      "pet_api_1.0_collections":
        '{"Saved":{"requests":[{"path":"/pets","method":"POST","body":"saved body","headers":{"Accept":"application/json"}}],"delay":200}}',
    };
    const result = migrateLegacy(
      { getItem: (key) => values[key] },
      spec,
      getOperations(spec),
      makeDraft,
    );
    expect(result.favorites).toEqual(["post /pets"]);
    expect(replaceVariables("{{host}}/{{@id}}", result.variables)).toBe(
      "https://example.com/42",
    );
    expect(result.collections[0]).toMatchObject({
      name: "Saved",
      delay: 200,
      requests: [
        {
          draft: {
            body: "saved body",
            headers: [{ name: "Accept", value: "application/json" }],
          },
        },
      ],
    });
    expect(replaceVariables("{{@id}}", [{ name: "id", value: "7" }])).toBe("7");
  });
});
