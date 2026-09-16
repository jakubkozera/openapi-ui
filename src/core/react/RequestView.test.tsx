// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { getOperations, makeDraft } from "./api";
import { RequestView } from "./RequestView";

afterEach(cleanup);
const spec = {
  openapi: "3.0.3",
  paths: {
    "/pets": {
      post: {
        summary: "Create pet",
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { 200: { description: "OK" } },
      },
    },
  },
};
const operation = getOperations(spec)[0];
const props = () => ({
  operation,
  spec,
  draft: makeDraft(operation, spec),
  onChange: vi.fn(),
  onSend: vi.fn(),
  onCancel: vi.fn(),
  onFavorite: vi.fn(),
  onAddToCollection: vi.fn(),
  onAuth: vi.fn(),
});

describe("React request editor", () => {
  it("explains variable syntax and output extraction on hover and keyboard focus", () => {
    render(<RequestView {...props()} />);
    fireEvent.focus(
      screen.getByRole("button", { name: "Variable syntax help" }),
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("{{name}}");
    expect(screen.getByRole("tooltip")).toHaveTextContent("{{@name}}");
    fireEvent.keyDown(
      screen.getByRole("button", { name: "Variable syntax help" }),
      { key: "Escape" },
    );
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Output variables" }));
    const nameHelp = screen.getByRole("button", {
      name: "Output variable name help",
    });
    fireEvent.mouseEnter(nameHelp);
    expect(screen.getByRole("tooltip")).toHaveTextContent("{{@petId}}");
    fireEvent.mouseLeave(nameHelp);
    expect(screen.queryByRole("tooltip")).toBeNull();
    const pathHelp = screen.getByRole("button", {
      name: "Output variable JSONPath help",
    });
    fireEvent.focus(pathHelp);
    expect(screen.getByRole("tooltip")).toHaveTextContent("$.items[0].id");
    expect(screen.getByRole("tooltip")).toHaveTextContent("first match");
    fireEvent.blur(pathHelp);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("previews live variables in request fields without rendering values as HTML", () => {
    const handlers = props();
    const draft = {
      ...handlers.draft,
      path: "/pets/{{@petId}}",
      parameters: [{ name: "query", value: "{{name}}", location: "query" }],
      headers: [{ name: "X-Pet", value: "{{name}}" }],
      form: [{ name: "name", value: "{{name}}" }],
    };
    const outputDefinitions = [{ name: "petId", path: "$.data.id" }];
    const variables = [
      { name: "name", value: '<img src=x onerror="alert(1)">' },
    ];
    const view = render(
      <RequestView
        {...handlers}
        draft={draft}
        variables={variables}
        outputDefinitions={outputDefinitions}
      />,
    );
    fireEvent.mouseEnter(screen.getByRole("textbox", { name: "Request path" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Waiting for a response",
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("$.data.id");
    view.rerender(
      <RequestView
        {...handlers}
        draft={draft}
        variables={[...variables, { name: "petId", value: "42" }]}
        outputDefinitions={outputDefinitions}
      />,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Value: 42");
    fireEvent.mouseLeave(screen.getByRole("textbox", { name: "Request path" }));
    fireEvent.focus(screen.getByRole("textbox", { name: "Value query" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(variables[0].value);
    expect(within(screen.getByRole("tooltip")).queryByRole("img")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Value query" }), {
      target: { value: "{{other}}" },
    });
    expect(handlers.onChange).toHaveBeenCalledWith({
      parameters: [{ ...draft.parameters[0], value: "{{other}}" }],
    });
    fireEvent.click(screen.getByRole("tab", { name: "Headers" }));
    fireEvent.focus(screen.getByRole("textbox", { name: "Value X-Pet" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(variables[0].value);
    fireEvent.click(screen.getByRole("tab", { name: "Body" }));
    view.rerender(
      <RequestView
        {...handlers}
        draft={{ ...draft, contentType: "application/x-www-form-urlencoded" }}
        variables={variables}
      />,
    );
    fireEvent.focus(screen.getByRole("textbox", { name: "Value name" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(variables[0].value);
  });

  it("keeps the input mounted when variable syntax is added or removed", () => {
    const handlers = props();
    const view = render(<RequestView {...handlers} />);
    const input = screen.getByRole("textbox", { name: "Request path" });
    input.focus();
    view.rerender(
      <RequestView
        {...handlers}
        draft={{ ...handlers.draft, path: "/pets/{{id}}" }}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Request path" })).toBe(input);
    expect(input).toHaveFocus();
    view.rerender(<RequestView {...handlers} />);
    expect(input).toHaveFocus();
  });

  it("toggles and resizes the request and response layout", () => {
    const onLayoutChange = vi.fn();
    const onSplitChange = vi.fn();
    render(
      <RequestView
        {...props()}
        layout="stacked"
        split={58}
        onLayoutChange={onLayoutChange}
        onSplitChange={onSplitChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Show panels side by side" }),
    );
    expect(onLayoutChange).toHaveBeenCalledWith("columns");

    const separator = screen.getByRole("separator", {
      name: "Resize request and response",
    });
    fireEvent.keyDown(separator, { key: "ArrowDown" });
    expect(onSplitChange).toHaveBeenCalledWith(60);
    fireEvent.doubleClick(separator);
    expect(onSplitChange).toHaveBeenCalledWith(58);
  });

  it("sends a request and exposes cancellation while pending", () => {
    const handlers = props();
    const view = render(<RequestView {...handlers} />);
    const send = screen.getByRole("button", { name: "Send" });
    expect(send.querySelector('[data-icon="codicon-play"]')).not.toBeNull();
    fireEvent.click(send);
    expect(handlers.onSend).toHaveBeenCalledOnce();
    view.rerender(<RequestView {...handlers} pending />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handlers.onCancel).toHaveBeenCalledOnce();
  });

  it("edits request bodies and headers as controlled state", () => {
    const handlers = props();
    render(<RequestView {...handlers} />);
    fireEvent.click(screen.getByRole("tab", { name: "Body" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Request body" }), {
      target: { value: '{"name":"Pet"}' },
    });
    expect(handlers.onChange).toHaveBeenCalledWith({ body: '{"name":"Pet"}' });
    fireEvent.click(screen.getByRole("tab", { name: "Headers" }));
    fireEvent.click(screen.getByRole("button", { name: "Add header" }));
    expect(handlers.onChange).toHaveBeenCalledWith({
      headers: [{ name: "", value: "", enabled: true }],
    });
  });

  it("renders response status, headers and body, including non-success responses", () => {
    const onLayoutChange = vi.fn();
    render(
      <RequestView
        {...props()}
        onLayoutChange={onLayoutChange}
        response={{
          status: 400,
          statusText: "Bad Request",
          ok: false,
          body: "invalid",
          headers: { "x-request-id": "abc" },
          duration: 10,
          size: 7,
        }}
      />,
    );
    expect(screen.getByText("400 Bad Request")).toBeVisible();
    const copy = screen.getByRole("button", { name: "Copy to clipboard" });
    const layout = screen.getByRole("button", {
      name: "Show panels side by side",
    });
    expect(layout.parentElement?.previousElementSibling).toBe(copy);
    expect(screen.getByRole("textbox", { name: "Response body" })).toHaveValue(
      "invalid",
    );
    fireEvent.click(screen.getAllByRole("tab", { name: "Headers" })[1]);
    expect(screen.getByText("x-request-id")).toBeVisible();
    expect(screen.getByText("abc")).toBeVisible();
  });

  it("sanitizes documentation from imported specifications", () => {
    render(
      <RequestView
        {...props()}
        operation={{
          ...operation,
          description:
            "<img src=x onerror=alert(1)><script>alert(1)</script>Safe documentation",
        }}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Documentation" }));
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelector("[onerror]")).toBeNull();
    expect(screen.getByText("Safe documentation")).toBeVisible();
  });
});
