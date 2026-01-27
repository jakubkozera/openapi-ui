import * as assert from "assert";
import * as http from "http";
import {
  FetchProxy,
  FetchProxyRequest,
  FetchProxyResponse,
  FetchProxyError,
  isFetchProxyError,
} from "../fetchProxy";

suite("FetchProxy Test Suite", () => {
  let testServer: http.Server;
  let testServerPort: number;

  // Set up a test HTTP server before tests
  suiteSetup((done) => {
    testServer = http.createServer((req, res) => {
      // Route handling for different test cases
      const url = new URL(req.url || "/", `http://localhost:${testServerPort}`);

      if (url.pathname === "/json") {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "X-Custom-Header": "test-value",
        });
        res.end(JSON.stringify({ message: "Hello, World!", status: "ok" }));
      } else if (url.pathname === "/text") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Hello, plain text!");
      } else if (url.pathname === "/echo") {
        // Echo back the request body and method
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              method: req.method,
              body: body,
              headers: req.headers,
            })
          );
        });
      } else if (url.pathname === "/error") {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      } else if (url.pathname === "/not-found") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
      } else if (url.pathname === "/slow") {
        // Delay response for timeout testing
        setTimeout(() => {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Slow response");
        }, 2000);
      } else if (url.pathname === "/headers") {
        // Return request headers
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(req.headers));
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Default response");
      }
    });

    // Listen on a random available port
    testServer.listen(0, "127.0.0.1", () => {
      const address = testServer.address();
      if (address && typeof address !== "string") {
        testServerPort = address.port;
      }
      done();
    });
  });

  // Tear down the test server after tests
  suiteTeardown((done) => {
    testServer.close(done);
  });

  test("should make a successful GET request", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/json`,
      method: "GET",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    assert.strictEqual(response.ok, true);
    assert.strictEqual(response.status, 200);

    const body = JSON.parse(response.body);
    assert.strictEqual(body.message, "Hello, World!");
    assert.strictEqual(body.status, "ok");
  });

  test("should return correct headers from response", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/json`,
      method: "GET",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    assert.strictEqual(response.headers["x-custom-header"], "test-value");
    assert.strictEqual(
      response.headers["content-type"],
      "application/json"
    );
  });

  test("should make a POST request with body", async () => {
    const proxy = new FetchProxy();
    const requestBody = JSON.stringify({ data: "test-data" });
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/echo`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    assert.strictEqual(response.ok, true);
    assert.strictEqual(response.status, 200);

    const body = JSON.parse(response.body);
    assert.strictEqual(body.method, "POST");
    assert.strictEqual(body.body, requestBody);
  });

  test("should handle 404 response", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/not-found`,
      method: "GET",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    assert.strictEqual(response.ok, false);
    assert.strictEqual(response.status, 404);
  });

  test("should handle 500 response", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/error`,
      method: "GET",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    assert.strictEqual(response.ok, false);
    assert.strictEqual(response.status, 500);
  });

  test("should pass custom headers to server", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/headers`,
      method: "GET",
      headers: {
        Authorization: "Bearer test-token",
        "X-Custom-Header": "custom-value",
      },
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    assert.strictEqual(response.ok, true);

    const receivedHeaders = JSON.parse(response.body);
    assert.strictEqual(receivedHeaders.authorization, "Bearer test-token");
    assert.strictEqual(receivedHeaders["x-custom-header"], "custom-value");
  });

  test("should handle connection refused error", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: "http://127.0.0.1:59999/non-existent", // Port that should not be in use
      method: "GET",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), true);
    const error = result as FetchProxyError;
    assert.strictEqual(error.error, true);
    assert.strictEqual(error.code, "ECONNREFUSED");
  });

  test("should handle invalid URL", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: "not-a-valid-url",
      method: "GET",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), true);
    const error = result as FetchProxyError;
    assert.strictEqual(error.error, true);
  });

  test("should handle timeout", async () => {
    const proxy = new FetchProxy({ timeout: 100 }); // 100ms timeout
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/slow`,
      method: "GET",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), true);
    const error = result as FetchProxyError;
    assert.strictEqual(error.error, true);
    assert.strictEqual(error.code, "ETIMEDOUT");
  });

  test("should use default method GET when not specified", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/echo`,
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    const body = JSON.parse(response.body);
    assert.strictEqual(body.method, "GET");
  });

  test("should make PUT request", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/echo`,
      method: "PUT",
      body: JSON.stringify({ update: true }),
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    const body = JSON.parse(response.body);
    assert.strictEqual(body.method, "PUT");
  });

  test("should make DELETE request", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/echo`,
      method: "DELETE",
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    const body = JSON.parse(response.body);
    assert.strictEqual(body.method, "DELETE");
  });

  test("should make PATCH request", async () => {
    const proxy = new FetchProxy();
    const request: FetchProxyRequest = {
      url: `http://127.0.0.1:${testServerPort}/echo`,
      method: "PATCH",
      body: JSON.stringify({ patch: "data" }),
    };

    const result = await proxy.fetch(request);

    assert.strictEqual(isFetchProxyError(result), false);
    const response = result as FetchProxyResponse;
    const body = JSON.parse(response.body);
    assert.strictEqual(body.method, "PATCH");
  });

  test("isFetchProxyError should correctly identify errors", () => {
    const errorResult: FetchProxyError = {
      error: true,
      message: "Test error",
      code: "TEST",
    };

    const successResult: FetchProxyResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {},
      body: "test",
      url: "http://example.com",
    };

    assert.strictEqual(isFetchProxyError(errorResult), true);
    assert.strictEqual(isFetchProxyError(successResult), false);
  });
});
