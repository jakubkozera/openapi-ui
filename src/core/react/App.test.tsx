// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { App } from "./App";
import { workspaceKey } from "./workspace";

const spec = {
  openapi: "3.0.3",
  info: { title: "Pet collection", version: "1.0" },
  servers: [{ url: "https://example.com" }],
  paths: {
    "/pets": {
      get: { summary: "List pets" },
      post: {
        summary: "Create pet",
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
      },
    },
  },
};
beforeEach(() => {
  localStorage.clear();
  history.replaceState({}, "", "/");
});
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const openRequest = (name: string) =>
  fireEvent.click(
    within(screen.getByLabelText("Collection navigation")).getByRole("button", {
      name,
    }),
  );

describe("React workspace", () => {
  it("exposes configurable client generation and generated model files", () => {
    render(<App initialSpec={spec} storage={localStorage} />);
    fireEvent.click(screen.getByRole("button", { name: "Code" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Language" }), {
      target: { value: "csharp" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "models" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Generated code",
        }) as HTMLTextAreaElement
      ).value,
    ).toContain("namespace ApiClient");
    expect(screen.getByRole("tab", { name: "interfaces" })).toBeVisible();
  });

  it("reconciles tabs when reimporting a changed specification with the same identity", () => {
    render(
      <App
        initialSpec={spec}
        initialSource="pasted-spec"
        storage={localStorage}
      />,
    );
    openRequest("GET List pets");
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("tab", { name: "Paste" }));
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Specification content" }),
      {
        target: {
          value: JSON.stringify({
            ...spec,
            paths: { "/new": { get: { summary: "New request" } } },
          }),
        },
      },
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Import" }));
    expect(
      screen.getByRole("heading", { name: "Pet collection" }),
    ).toBeVisible();
    expect(screen.queryByRole("tab", { name: "GET List pets" })).toBeNull();
    expect(
      within(screen.getByLabelText("Collection navigation")).getByRole(
        "button",
        { name: "GET New request" },
      ),
    ).toBeVisible();
  });

  it("starts on collection overview and restores edited tabs after remount", () => {
    const app = render(<App initialSpec={spec} storage={localStorage} />);
    expect(
      screen.getByRole("heading", { name: "Pet collection" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Save to collection" }),
    ).toBeNull();
    openRequest("POST Create pet");
    fireEvent.click(screen.getByRole("tab", { name: "Body" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Request body" }), {
      target: { value: '{"name":"Saved pet"}' },
    });
    openRequest("GET List pets");
    expect(
      within(
        screen.getByRole("tablist", { name: "Open requests" }),
      ).getAllByRole("tab"),
    ).toHaveLength(3);
    app.unmount();
    render(<App initialSpec={spec} storage={localStorage} />);
    expect(screen.getByRole("heading", { name: "List pets" })).toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: "POST Create pet" }));
    fireEvent.click(screen.getByRole("tab", { name: "Body" }));
    expect(screen.getByRole("textbox", { name: "Request body" })).toHaveValue(
      '{"name":"Saved pet"}',
    );
  });

  it("closes tabs, filters requests and persists standalone theme choice", () => {
    render(<App initialSpec={spec} storage={localStorage} />);
    openRequest("GET List pets");
    fireEvent.click(screen.getByRole("button", { name: "Close List pets" }));
    expect(
      screen.getByRole("heading", { name: "Pet collection" }),
    ).toBeVisible();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Filter by HTTP method" }),
      { target: { value: "post" } },
    );
    expect(
      within(screen.getByLabelText("Collection navigation")).queryByRole(
        "button",
        { name: "GET List pets" },
      ),
    ).toBeNull();
    const themePicker = screen.getByRole("combobox", { name: "Theme" });
    expect(
      within(themePicker)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(
      expect.arrayContaining([
        "GitHub Light",
        "GitHub Dark",
        "Visual Studio Light",
        "Visual Studio Dark",
      ]),
    );
    for (const theme of [
      "github-light",
      "github-dark",
      "visual-studio-light",
      "visual-studio-dark",
    ]) {
      fireEvent.change(themePicker, { target: { value: theme } });
      expect(document.body.dataset.theme).toBe(theme);
      expect(localStorage.getItem("openapi-ui:theme")).toBe(theme);
    }
  });

  it("records history without request secrets or response payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          status: 200,
          statusText: "OK",
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          blob: async () => ({
            text: async () => '{"private":"payload"}',
            size: 21,
          }),
        }),
    );
    render(<App initialSpec={spec} storage={localStorage} />);
    openRequest("GET List pets");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("200 OK")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(screen.getByRole("heading", { name: "History" })).toBeVisible();
    const saved = JSON.parse(
      localStorage.getItem(workspaceKey("swagger.json", spec))!,
    );
    expect(saved.history).toHaveLength(1);
    expect(JSON.stringify(saved.history)).not.toContain("payload");
    expect(saved.history[0].operationId).toBe("get /pets");
  });
});
