import * as assert from "assert";
import { runInNewContext } from "node:vm";
import { getFetchInterceptorScript } from "../fetchInterceptor";

function createBrowserHarness() {
  const messages: any[] = [];
  let onMessage: (message: any) => void = () => {};
  const sent = new Promise<any>((resolve) => {
    onMessage = resolve;
  });
  let listener: (event: any) => void = () => {};
  const browser: any = {
    fetch: () => Promise.reject(new Error("Unexpected native fetch")),
    location: { origin: "http://localhost" },
    addEventListener: (_name: string, callback: typeof listener) => {
      listener = callback;
    },
  };
  runInNewContext(getFetchInterceptorScript(), {
    window: browser,
    acquireVsCodeApi: () => ({
      postMessage: (message: any) => {
        messages.push(message);
        onMessage(message);
      },
    }),
    URL,
    URLSearchParams,
    Request,
    Headers,
    FormData,
    Blob,
    ArrayBuffer,
    Uint8Array,
    TextEncoder,
    DOMException,
    btoa,
    atob,
    console: { log() {} },
  });
  return {
    browser,
    messages,
    sent,
    respond: (payload: unknown) =>
      listener({
        data: {
          type: "fetchResponse",
          requestId: messages.find((message) => message.type === "fetchRequest")
            ?.requestId,
          payload,
        },
      }),
  };
}

suite("Fetch Interceptor Test Suite", () => {
  test("serializes multipart files with a real boundary without altering bytes", async () => {
    const harness = createBrowserHarness();
    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array([0, 255, 128, 42])]),
      "test.bin",
    );
    const pending = harness.browser.fetch("https://example.com/upload", {
      method: "POST",
      body: form,
    });
    const request = await harness.sent;
    assert.ok(
      request.payload.headers["content-type"].startsWith(
        "multipart/form-data; boundary=",
      ),
    );
    const bytes = Buffer.from(request.payload.bodyBase64, "base64");
    assert.ok(bytes.includes(Buffer.from([0, 255, 128, 42])));
    assert.ok(bytes.toString().includes('filename="test.bin"'));
    harness.respond({ ok: true, status: 200, headers: {}, body: "OK" });
    await pending;
  });

  test("returns binary response blobs byte for byte", async () => {
    const harness = createBrowserHarness();
    const pending = harness.browser.fetch("https://example.com/download");
    const bytes = Buffer.from([0, 255, 128, 42]);
    harness.respond({
      ok: true,
      status: 200,
      headers: { "content-type": "application/octet-stream" },
      body: "",
      bodyBase64: bytes.toString("base64"),
    });
    const response = await pending;
    assert.deepStrictEqual(
      Buffer.from(await (await response.blob()).arrayBuffer()),
      bytes,
    );
  });

  test("rejects cancelled requests and notifies the extension", async () => {
    const harness = createBrowserHarness();
    const controller = new AbortController();
    const pending = harness.browser.fetch("https://example.com/slow", {
      signal: controller.signal,
    });
    controller.abort();
    await assert.rejects(pending, { name: "AbortError" });
    assert.ok(
      harness.messages.some((message) => message.type === "fetchCancel"),
    );
  });

  test("shares the existing VS Code API and safely embeds persisted state", () => {
    const script = getFetchInterceptorScript({
      "openapi-ui:workspace:pets": "</script><script>alert(1)</script>",
    });
    assert.ok(script.includes("window.openapiHost"));
    assert.ok(script.includes("workspaceSave"));
    assert.ok(!script.includes("</script>"));
    assert.strictEqual(script.match(/acquireVsCodeApi\(\)/g)?.length, 1);
  });

  test("preserves multipart bytes and propagates abort signals", () => {
    const script = getFetchInterceptorScript();
    assert.ok(script.includes("new Request(url"));
    assert.ok(script.includes("bodyBase64"));
    assert.ok(script.includes("fetchCancel"));
    assert.ok(script.includes("new Blob([bytes]"));
  });

  test("should return a non-empty script string", () => {
    const script = getFetchInterceptorScript();

    assert.ok(script, "Script should not be empty");
    assert.ok(script.length > 100, "Script should have substantial content");
  });

  test("should contain the IIFE wrapper", () => {
    const script = getFetchInterceptorScript();

    assert.ok(script.includes("(function()"), "Should have IIFE opening");
    assert.ok(script.includes("})();"), "Should have IIFE closing");
  });

  test("should override window.fetch", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("const originalFetch = window.fetch"),
      "Should store original fetch",
    );
    assert.ok(
      script.includes("window.fetch = function"),
      "Should override window.fetch",
    );
  });

  test("should have vscode API acquisition", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("acquireVsCodeApi()"),
      "Should acquire VS Code API",
    );
  });

  test("should have message listener for responses", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("addEventListener('message'"),
      "Should have message event listener",
    );
    assert.ok(
      script.includes("fetchResponse"),
      "Should handle fetchResponse messages",
    );
  });

  test("should send fetchRequest messages", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("type: 'fetchRequest'"),
      "Should send fetchRequest messages",
    );
    assert.ok(script.includes("postMessage"), "Should use postMessage");
  });

  test("should have shouldProxy function", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function shouldProxy"),
      "Should have shouldProxy function",
    );
    assert.ok(
      script.includes("http:") && script.includes("https:"),
      "Should check for http/https protocols",
    );
  });

  test("should create Response-like object", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function createProxyResponse"),
      "Should have createProxyResponse function",
    );
    assert.ok(
      script.includes("text: function"),
      "Response should have text method",
    );
    assert.ok(
      script.includes("json: function"),
      "Response should have json method",
    );
    assert.ok(
      script.includes("blob: function"),
      "Response should have blob method",
    );
  });

  test("should handle pending requests with Map", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("const pendingRequests = new Map()"),
      "Should use Map for pending requests",
    );
    assert.ok(
      script.includes("pendingRequests.set"),
      "Should set pending requests",
    );
    assert.ok(
      script.includes("pendingRequests.get"),
      "Should get pending requests",
    );
    assert.ok(
      script.includes("pendingRequests.delete"),
      "Should delete pending requests",
    );
  });

  test("should generate unique request IDs", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function generateRequestId"),
      "Should have generateRequestId function",
    );
    assert.ok(
      script.includes("Date.now()") || script.includes("Math.random()"),
      "Should use timestamp or random for ID generation",
    );
  });

  test("should handle Request object input", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("input instanceof Request"),
      "Should check for Request object",
    );
  });

  test("should handle error responses", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("message.payload.error"),
      "Should check for error in payload",
    );
    assert.ok(
      script.includes("pending.reject"),
      "Should reject promise on error",
    );
  });

  test("should log interceptor activation", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("console.log") &&
        script.includes("Fetch interceptor active"),
      "Should log activation message",
    );
  });

  test("should handle headers conversion", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function headersToObject"),
      "Should have headersToObject function",
    );
    assert.ok(
      script.includes("instanceof Headers"),
      "Should check for Headers instance",
    );
  });

  test("should handle clone method", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("clone: function"),
      "Response should have clone method",
    );
  });

  test("should handle arrayBuffer method", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("arrayBuffer: function"),
      "Response should have arrayBuffer method",
    );
    assert.ok(script.includes("TextEncoder"), "Should use TextEncoder");
  });
});
