import type * as Monaco from "monaco-editor";
import { variableReferences } from "./api";
import type { KeyValueRow, Variables } from "./types";

export function referenceDescription(reference: ReturnType<typeof variableReferences>[number]) {
  const heading = `${reference.output ? "Output variable" : "Variable"}: {{${reference.name}}}`;
  const details = reference.status === "resolved"
    ? `Value: ${reference.value === "" ? "(empty string)" : reference.value}`
    : reference.status === "pending"
      ? "Waiting for a response. Run the request that defines this output variable first."
      : reference.output
        ? "No enabled value or output definition. Add this name and a JSONPath in Output variables."
        : "Variable is undefined or disabled. Add or enable it in Variables.";
  return [heading, ...reference.paths.map((path) => `JSONPath: ${path}`), details].join("\n\n");
}

export function bindVariableDecorations(
  editor: Monaco.editor.IStandaloneCodeEditor,
  monaco: typeof Monaco,
  variables: Variables,
  outputs: KeyValueRow[] = [],
) {
  const decorations = editor.createDecorationsCollection([]);
  const update = () => {
    const model = editor.getModel();
    decorations.set(model ? variableReferences(model.getValue(), variables, outputs).map((reference) => {
      const start = model.getPositionAt(reference.start);
      const end = model.getPositionAt(reference.end);
      return {
        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        options: {
          inlineClassName: `request-variable request-variable-${reference.status}${reference.output ? " request-variable-output" : ""}`,
          hoverMessage: {
            value: referenceDescription(reference).replace(/[\\`*_{}[\]()#+.!<>|~-]/g, "\\$&"),
            isTrusted: false,
            supportHtml: false,
          },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      };
    }) : []);
  };
  const contentListener = editor.onDidChangeModelContent(update);
  const modelListener = editor.onDidChangeModel(update);
  update();
  return () => {
    contentListener.dispose();
    modelListener.dispose();
    decorations.clear();
  };
}