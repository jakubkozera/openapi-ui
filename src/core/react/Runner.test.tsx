// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Runner } from "./Runner";

afterEach(cleanup);
const operations = [
  { id: "get /one", method: "get", path: "/one", parameters: [], security: [] },
  {
    id: "post /two",
    method: "post",
    path: "/two",
    parameters: [],
    security: [],
  },
];
const collections = [
  {
    id: "collection",
    name: "Flow",
    requests: operations.map((operation, index) => ({
      id: String(index),
      operationId: operation.id,
      draft: {},
      enabled: true,
    })),
  },
];

describe("collection runner", () => {
  it("runs in sequence and passes extracted variables to the next request", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        response: { ok: true, status: 200 },
        variables: [{ name: "id", value: "7" }],
      })
      .mockResolvedValueOnce({
        response: { ok: true, status: 201 },
        variables: [],
      });
    render(
      <Runner
        collections={collections}
        onChange={vi.fn()}
        operations={operations}
        execute={execute}
        variables={[]}
        notify={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
    expect(execute.mock.calls[1][2]).toEqual([{ name: "id", value: "7" }]);
    expect(await screen.findByText("201")).toBeVisible();
  });

  it("stops after an error when requested and supports reordering", async () => {
    const execute = vi
      .fn()
      .mockResolvedValue({
        response: { ok: false, status: 500 },
        variables: [],
      });
    const onChange = vi.fn();
    render(
      <Runner
        collections={collections}
        onChange={onChange}
        operations={operations}
        execute={execute}
        variables={[]}
        notify={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Move request 2 up" }));
    expect(onChange.mock.calls[0][0][0].requests[0].id).toBe("1");
    fireEvent.click(screen.getByLabelText("Stop on error"));
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await screen.findByText("500");
    expect(execute).toHaveBeenCalledOnce();
  });
});
