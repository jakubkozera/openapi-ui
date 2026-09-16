import { describe, expect, it, vi } from "vitest";
import type * as Monaco from "monaco-editor";
import { bindVariableDecorations } from "./variableDecorations";

function editorFixture() {
  let value = '{"name":"{{name}}"}\n{{@id}} {{missing}}';
  const set = vi.fn();
  const clear = vi.fn();
  const disposeContent = vi.fn();
  const disposeModel = vi.fn();
  const editor = {
    createDecorationsCollection: vi.fn(() => ({ set, clear })),
    getModel: vi.fn(() => ({
      getValue: () => value,
      getPositionAt: (offset: number) => {
        const lines = value.slice(0, offset).split("\n");
        return {
          lineNumber: lines.length,
          column: lines[lines.length - 1].length + 1,
        };
      },
    })),
    onDidChangeModelContent: vi.fn((_listener: () => void) => ({
      dispose: disposeContent,
    })),
    onDidChangeModel: vi.fn((_listener: () => void) => ({
      dispose: disposeModel,
    })),
  };
  const monaco = {
    Range: class {
      constructor(
        public startLineNumber: number,
        public startColumn: number,
        public endLineNumber: number,
        public endColumn: number,
      ) {}
    },
    editor: { TrackedRangeStickiness: { NeverGrowsWhenTypingAtEdges: 1 } },
  };
  return {
    editor: editor as unknown as Monaco.editor.IStandaloneCodeEditor,
    monaco: monaco as unknown as typeof Monaco,
    set,
    clear,
    disposeContent,
    disposeModel,
    contentChanged: (text: string) => {
      value = text;
      editor.onDidChangeModelContent.mock.calls[0][0]();
    },
    modelChanged: () => editor.onDidChangeModel.mock.calls[0][0](),
  };
}

describe("Monaco variable decorations", () => {
  it("marks exact ranges and supplies safe hovers for regular, pending and missing variables", () => {
    const fixture = editorFixture();
    const dispose = bindVariableDecorations(
      fixture.editor,
      fixture.monaco,
      [{ name: "name", value: "[run](command:bad) <img>" }],
      [{ name: "id", path: "$.data.id" }],
    );
    const decorations = fixture.set.mock.calls[0][0];
    expect(decorations).toHaveLength(3);
    expect(decorations[0].range).toMatchObject({
      startLineNumber: 1,
      startColumn: 10,
      endLineNumber: 1,
      endColumn: 18,
    });
    expect(decorations[0].options.inlineClassName).toContain(
      "request-variable-resolved",
    );
    expect(decorations[0].options.hoverMessage).toMatchObject({
      isTrusted: false,
      supportHtml: false,
    });
    expect(decorations[0].options.hoverMessage.value).toContain(
      "\\[run\\]\\(command:bad\\) \\<img\\>",
    );
    expect(decorations[1].options.inlineClassName).toContain(
      "request-variable-pending",
    );
    expect(decorations[1].options.inlineClassName).toContain(
      "request-variable-output",
    );
    expect(decorations[1].options.hoverMessage.value).toContain(
      "Waiting for a response",
    );
    expect(decorations[2].options.inlineClassName).toContain(
      "request-variable-missing",
    );
    fixture.contentChanged("plain text");
    expect(fixture.set).toHaveBeenLastCalledWith([]);
    fixture.contentChanged("{{name}}");
    expect(
      fixture.set.mock.calls[fixture.set.mock.calls.length - 1][0],
    ).toHaveLength(1);
    fixture.modelChanged();
    dispose();
    expect(fixture.disposeContent).toHaveBeenCalledOnce();
    expect(fixture.disposeModel).toHaveBeenCalledOnce();
    expect(fixture.clear).toHaveBeenCalledOnce();
  });

  it("resolves extracted output values and refreshes when rebound with new workspace values", () => {
    const fixture = editorFixture();
    const dispose = bindVariableDecorations(fixture.editor, fixture.monaco, [
      { name: "id", value: "0" },
    ]);
    expect(
      fixture.set.mock.calls[fixture.set.mock.calls.length - 1][0][1].options
        .hoverMessage.value,
    ).toContain("Value: 0");
    dispose();
    const cleanup = bindVariableDecorations(fixture.editor, fixture.monaco, [
      { name: "id", value: "42" },
    ]);
    expect(
      fixture.set.mock.calls[fixture.set.mock.calls.length - 1][0][1].options
        .hoverMessage.value,
    ).toContain("Value: 42");
    expect(
      fixture.set.mock.calls[fixture.set.mock.calls.length - 1][0][1].options
        .inlineClassName,
    ).toContain("request-variable-resolved");
    cleanup();
  });
});
