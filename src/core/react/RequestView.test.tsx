// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
