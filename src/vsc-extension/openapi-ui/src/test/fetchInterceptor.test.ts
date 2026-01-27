import * as assert from "assert";
import { getFetchInterceptorScript } from "../fetchInterceptor";

suite("Fetch Interceptor Test Suite", () => {
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
      "Should store original fetch"
    );
    assert.ok(
      script.includes("window.fetch = function"),
      "Should override window.fetch"
    );
  });

  test("should have vscode API acquisition", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("acquireVsCodeApi()"),
      "Should acquire VS Code API"
    );
  });

  test("should have message listener for responses", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("addEventListener('message'"),
      "Should have message event listener"
    );
    assert.ok(
      script.includes("fetchResponse"),
      "Should handle fetchResponse messages"
    );
  });

  test("should send fetchRequest messages", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("type: 'fetchRequest'"),
      "Should send fetchRequest messages"
    );
    assert.ok(script.includes("postMessage"), "Should use postMessage");
  });

  test("should have shouldProxy function", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function shouldProxy"),
      "Should have shouldProxy function"
    );
    assert.ok(
      script.includes("http:") && script.includes("https:"),
      "Should check for http/https protocols"
    );
  });

  test("should create Response-like object", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function createProxyResponse"),
      "Should have createProxyResponse function"
    );
    assert.ok(
      script.includes("text: function"),
      "Response should have text method"
    );
    assert.ok(
      script.includes("json: function"),
      "Response should have json method"
    );
    assert.ok(
      script.includes("blob: function"),
      "Response should have blob method"
    );
  });

  test("should handle pending requests with Map", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("const pendingRequests = new Map()"),
      "Should use Map for pending requests"
    );
    assert.ok(
      script.includes("pendingRequests.set"),
      "Should set pending requests"
    );
    assert.ok(
      script.includes("pendingRequests.get"),
      "Should get pending requests"
    );
    assert.ok(
      script.includes("pendingRequests.delete"),
      "Should delete pending requests"
    );
  });

  test("should generate unique request IDs", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function generateRequestId"),
      "Should have generateRequestId function"
    );
    assert.ok(
      script.includes("Date.now()") || script.includes("Math.random()"),
      "Should use timestamp or random for ID generation"
    );
  });

  test("should handle Request object input", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("input instanceof Request"),
      "Should check for Request object"
    );
  });

  test("should handle error responses", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("message.payload.error"),
      "Should check for error in payload"
    );
    assert.ok(
      script.includes("pending.reject"),
      "Should reject promise on error"
    );
  });

  test("should log interceptor activation", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("console.log") &&
        script.includes("Fetch interceptor active"),
      "Should log activation message"
    );
  });

  test("should handle headers conversion", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("function headersToObject"),
      "Should have headersToObject function"
    );
    assert.ok(
      script.includes("instanceof Headers"),
      "Should check for Headers instance"
    );
  });

  test("should handle clone method", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("clone: function"),
      "Response should have clone method"
    );
  });

  test("should handle arrayBuffer method", () => {
    const script = getFetchInterceptorScript();

    assert.ok(
      script.includes("arrayBuffer: function"),
      "Response should have arrayBuffer method"
    );
    assert.ok(script.includes("TextEncoder"), "Should use TextEncoder");
  });
});
