// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { App, uiAssetUrl } from "./App";
import { Authorization } from "./Authorization";
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
  it("shows the OpenAPI UI logo and a GitHub repository link", () => {
    render(<App initialSpec={spec} storage={localStorage} />);
    expect(
      screen.getByRole("img", { name: "OpenAPI UI logo" }),
    ).toHaveAttribute("src", "/openapi-ui.png");
    expect(
      screen.getByRole("link", { name: "Open OpenAPI UI on GitHub" }),
    ).toHaveAttribute("href", "https://github.com/jakubkozera/openapi-ui");
  });

  it("resolves UI assets below the configured UI path", () => {
    expect(uiAssetUrl("openapi-ui.png")).toBe("/openapi-ui.png");
    history.replaceState({}, "", "/custom-openapi-ui/");
    expect(uiAssetUrl("openapi-ui.png")).toBe(
      "/custom-openapi-ui/openapi-ui.png",
    );
  });

  it.each([false, true])(
    "prefills the legacy OAuth Client ID and authorizes with it (override: %s)",
    async (override) => {
      const open = vi.fn();
      vi.stubGlobal("openapiHost", {});
      vi.stubGlobal("open", open);
      render(
        <Authorization
          spec={{
            ...spec,
            components: {
              securitySchemes: {
                oauth2: {
                  type: "oauth2",
                  flows: {
                    implicit: {
                      authorizationUrl: "https://identity.example/auth",
                      scopes: { "api://example-client/User.Read": "Read" },
                    },
                  },
                },
              },
            },
          }}
          credentials={{}}
          onChange={vi.fn()}
          workspace="oauth-test"
          remember={false}
          onRemember={vi.fn()}
          notify={vi.fn()}
          onEnabled={vi.fn()}
        />,
      );
      const input = screen.getByRole("textbox", { name: "Client ID" });
      expect(input).toHaveValue("api://example-client");
      if (override) {
        fireEvent.change(input, { target: { value: "" } });
        expect(input).toHaveValue("");
        fireEvent.change(input, { target: { value: "custom-client" } });
      }
      fireEvent.click(screen.getByRole("button", { name: "Authorize" }));
      await waitFor(() => expect(open).toHaveBeenCalledOnce());
      const url = new URL(open.mock.calls[0][0]);
      expect(url.searchParams.get("client_id")).toBe(
        override ? "custom-client" : "api://example-client",
      );
      expect(url.searchParams.get("scope")).toBe(
        "api://example-client/User.Read",
      );
      expect(url.searchParams.get("response_type")).toBe("token");
      sessionStorage.clear();
    },
  );

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
        "Dark+",
        "Dark Modern",
      ]),
    );
    expect(
      within(themePicker)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(expect.arrayContaining(["Light", "Dark+", "Dark Modern"]));
    expect(
      within(themePicker)
        .getAllByRole("option")
        .slice(0, 4)
        .map((option) => option.textContent),
    ).toEqual(["System", "Light", "Dark+", "Dark Modern"]);
    for (const theme of [
      "dark-plus",
      "dark-modern",
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

  it("offers context actions for request tabs but not Overview", () => {
    render(<App initialSpec={spec} storage={localStorage} />);
    const tablist = screen.getByRole("tablist", { name: "Open requests" });
    expect(screen.queryByRole("menu")).toBeNull();
    openRequest("GET List pets");
    openRequest("POST Create pet");

    const getTab = screen.getByRole("tab", { name: "GET List pets" });
    fireEvent.contextMenu(getTab.parentElement!);
    expect(
      screen.getByRole("menuitem", { name: "Add to favourites" }),
    ).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: "Add to runner" }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Add to favourites" }),
    );
    fireEvent.contextMenu(getTab.parentElement!);
    fireEvent.click(screen.getByRole("menuitem", { name: "Add to runner" }));
    fireEvent.click(screen.getByRole("button", { name: "Runner" }));
    const runner = screen
      .getByRole("heading", { name: "Collection runner" })
      .closest("section")!;
    expect(
      within(runner).getByRole("button", { name: "GET List pets" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Collections" }));
    const refreshedGetTab = screen.getByRole("tab", { name: "GET List pets" });
    fireEvent.contextMenu(refreshedGetTab.parentElement!);
    expect(
      screen.getByRole("menuitem", { name: "Remove from favourites" }),
    ).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: "Close others" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("menuitem", { name: "Close to the right" }),
    ).toBeEnabled();
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Close to the right" }),
    );
    expect(screen.queryByRole("tab", { name: "POST Create pet" })).toBeNull();

    openRequest("POST Create pet");
    const postTab = screen.getByRole("tab", { name: "POST Create pet" });
    fireEvent.contextMenu(postTab.parentElement!);
    fireEvent.click(screen.getByRole("menuitem", { name: "Close others" }));
    expect(screen.queryByRole("tab", { name: "GET List pets" })).toBeNull();
    expect(screen.getByRole("tab", { name: "POST Create pet" })).toBeVisible();
    expect(
      within(tablist).getByRole("tab", { name: "Overview" }),
    ).toBeVisible();
  });

  it.each([200, 401])(
    "sends without OAuth credentials and displays the server's %s response",
    async (status) => {
      const fetchMock = vi.fn().mockResolvedValue({
        status,
        statusText: status === 200 ? "OK" : "Unauthorized",
        ok: status === 200,
        headers: new Headers({ "content-type": "application/json" }),
        blob: async () => ({ text: async () => "{}", size: 2 }),
      });
      vi.stubGlobal("fetch", fetchMock);
      render(
        <App
          initialSpec={{
            ...spec,
            security: [{ oauth2: [] }],
            components: {
              securitySchemes: {
                oauth2: {
                  type: "oauth2",
                  flows: {
                    implicit: {
                      authorizationUrl: "https://identity.example/auth",
                      scopes: { "api://example-client/User.Read": "Read" },
                    },
                  },
                },
              },
            },
          }}
          storage={localStorage}
        />,
      );
      openRequest("GET List pets");
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(
        await screen.findByText(status === 200 ? "200 OK" : "401 Unauthorized"),
      ).toBeVisible();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0][1].headers.has("Authorization")).toBe(
        false,
      );
    },
  );

  it("records history without request secrets or response payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
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
