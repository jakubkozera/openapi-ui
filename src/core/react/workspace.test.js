import { describe, expect, it } from "vitest";
import {
  emptyWorkspace,
  HISTORY_LIMIT,
  persistWorkspace,
  restoreWorkspace,
  workspaceKey,
  workspaceReducer,
} from "./workspace";

const operations = [{ id: "get /pets" }, { id: "post /pets" }];
const storageFor = (value) => ({ getItem: () => value, setItem() {} });

describe("persistent request workspace", () => {
  it("opens requests once without replacing unsent edits", () => {
    let state = workspaceReducer(emptyWorkspace(), {
      type: "open",
      id: operations[0].id,
      draft: { body: "original" },
    });
    state = workspaceReducer(state, {
      type: "draft",
      id: operations[0].id,
      patch: { body: "edited" },
    });
    state = workspaceReducer(state, {
      type: "open",
      id: operations[0].id,
      draft: { body: "reset" },
    });
    expect(state.tabs).toEqual([
      { id: operations[0].id, draft: { body: "edited" } },
    ]);
  });

  it("restores tabs and drafts across sessions, dropping removed operations", () => {
    const saved = {
      ...emptyWorkspace(),
      tabs: [
        { id: operations[0].id, draft: { body: "unsent" } },
        { id: "get /removed", draft: {} },
      ],
      active: operations[0].id,
    };
    expect(
      restoreWorkspace(storageFor(JSON.stringify(saved)), "key", operations),
    ).toMatchObject({ tabs: [saved.tabs[0]], active: operations[0].id });
  });

  it("falls back safely for corrupt, unsupported, or inaccessible storage", () => {
    for (const value of [
      "{",
      "null",
      '{"version":99}',
      '{"version":1,"tabs":false}',
    ]) {
      expect(restoreWorkspace(storageFor(value), "key", operations)).toEqual(
        emptyWorkspace(),
      );
    }
    expect(
      restoreWorkspace(
        {
          getItem() {
            throw new Error("denied");
          },
        },
        "key",
        operations,
      ),
    ).toEqual(emptyWorkspace());
    expect(
      persistWorkspace(
        {
          setItem() {
            throw new Error("quota");
          },
        },
        "key",
        emptyWorkspace(),
      ),
    ).toBe(false);
  });

  it("selects an adjacent tab on close and returns to overview for the last tab", () => {
    let state = emptyWorkspace();
    for (const operation of operations)
      state = workspaceReducer(state, {
        type: "open",
        id: operation.id,
        draft: {},
      });
    state = workspaceReducer(state, { type: "close", id: operations[1].id });
    expect(state.active).toBe(operations[0].id);
    expect(
      workspaceReducer(state, { type: "close", id: operations[0].id }).active,
    ).toBe("overview");
  });

  it("rejects malformed nested drafts, variables, history and saved requests", () => {
    const saved = {
      ...emptyWorkspace(),
      tabs: [{ id: operations[0].id, draft: { parameters: [null] } }],
      history: [{ id: "bad" }],
      variables: [{ name: "bad", value: {} }],
      collections: [
        {
          id: "collection",
          name: "Saved",
          requests: [
            {
              id: "bad",
              operationId: operations[0].id,
              draft: { headers: "invalid" },
            },
          ],
        },
      ],
    };
    const restored = restoreWorkspace(
      storageFor(JSON.stringify(saved)),
      "key",
      operations,
    );
    expect(restored.tabs).toEqual([]);
    expect(restored.history).toEqual([]);
    expect(restored.variables).toEqual([]);
    expect(restored.collections[0].requests).toEqual([]);
  });

  it("bounds history and keeps collections isolated by source", () => {
    let state = emptyWorkspace();
    for (let index = 0; index < 110; index += 1)
      state = workspaceReducer(state, {
        type: "history",
        entry: { id: String(index) },
      });
    expect(state.history).toHaveLength(HISTORY_LIMIT);
    expect(state.history[0].id).toBe("109");
    expect(workspaceKey("/one.json", {})).not.toBe(
      workspaceKey("/two.json", {}),
    );
  });
});
