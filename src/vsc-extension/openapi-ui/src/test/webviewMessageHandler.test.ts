import * as assert from "assert";
import * as http from "http";
import {
  WebviewMessageHandler,
  FetchRequestMessage,
  isFetchRequestMessage,
  WebviewMessage,
} from "../webviewMessageHandler";

// Mock webview for testing
class MockWebview {
  public messages: unknown[] = [];

  postMessage(message: unknown): Thenable<boolean> {
    this.messages.push(message);
    return Promise.resolve(true);
  }

  getLastMessage<T>(): T | undefined {
    return this.messages[this.messages.length - 1] as T | undefined;
  }

  clearMessages(): void {
    this.messages = [];
  }
}

suite("WebviewMessageHandler Test Suite", () => {
  let testServer: http.Server;
  let testServerPort: number;

  // Set up a test HTTP server before tests
  suiteSetup((done) => {
    testServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, method: req.method }));
    });

    testServer.listen(0, "127.0.0.1", () => {
      const address = testServer.address();
      if (address && typeof address !== "string") {
        testServerPort = address.port;
      }
      done();
    });
  });

  suiteTeardown((done) => {
    testServer.close(done);
  });

  test("isFetchRequestMessage should correctly identify fetch request messages", () => {
    const validMessage: FetchRequestMessage = {
      type: "fetchRequest",
      requestId: "test-123",
      payload: {
        url: "http://example.com",
        method: "GET",
      },
    };

    const invalidMessage1: WebviewMessage = {
      type: "otherType",
      requestId: "test-123",
    };

    const invalidMessage2: WebviewMessage = {
      type: "fetchRequest",
      // missing requestId
    };

    const invalidMessage3: WebviewMessage = {
      type: "fetchRequest",
      requestId: "test-123",
      // missing payload
    };

    assert.strictEqual(isFetchRequestMessage(validMessage), true);
    assert.strictEqual(isFetchRequestMessage(invalidMessage1), false);
    assert.strictEqual(isFetchRequestMessage(invalidMessage2), false);
    assert.strictEqual(isFetchRequestMessage(invalidMessage3), false);
  });

  test("should handle fetch request and send response", async () => {
    const mockWebview = new MockWebview();
    const handler = new WebviewMessageHandler(mockWebview as any);

    const message: FetchRequestMessage = {
      type: "fetchRequest",
      requestId: "test-request-1",
      payload: {
        url: `http://127.0.0.1:${testServerPort}/test`,
        method: "GET",
      },
    };

    await handler.handleMessage(message);

    // Wait a moment for async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = mockWebview.getLastMessage<{
      type: string;
      requestId: string;
      payload: unknown;
    }>();

    assert.ok(response, "Should have sent a response");
    assert.strictEqual(response.type, "fetchResponse");
    assert.strictEqual(response.requestId, "test-request-1");
    assert.ok(response.payload, "Should have payload");
  });

  test("should preserve request ID in response", async () => {
    const mockWebview = new MockWebview();
    const handler = new WebviewMessageHandler(mockWebview as any);

    const requestId = "unique-request-id-12345";
    const message: FetchRequestMessage = {
      type: "fetchRequest",
      requestId: requestId,
      payload: {
        url: `http://127.0.0.1:${testServerPort}/test`,
        method: "GET",
      },
    };

    await handler.handleMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = mockWebview.getLastMessage<{ requestId: string }>();
    assert.strictEqual(response?.requestId, requestId);
  });

  test("should handle POST request", async () => {
    const mockWebview = new MockWebview();
    const handler = new WebviewMessageHandler(mockWebview as any);

    const message: FetchRequestMessage = {
      type: "fetchRequest",
      requestId: "post-request-1",
      payload: {
        url: `http://127.0.0.1:${testServerPort}/test`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: "test" }),
      },
    };

    await handler.handleMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = mockWebview.getLastMessage<{
      type: string;
      payload: { ok: boolean };
    }>();

    assert.strictEqual(response?.type, "fetchResponse");
    assert.strictEqual(response?.payload?.ok, true);
  });

  test("should handle connection error and send error response", async () => {
    const mockWebview = new MockWebview();
    const handler = new WebviewMessageHandler(mockWebview as any);

    const message: FetchRequestMessage = {
      type: "fetchRequest",
      requestId: "error-request-1",
      payload: {
        url: "http://127.0.0.1:59999/non-existent",
        method: "GET",
      },
    };

    await handler.handleMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = mockWebview.getLastMessage<{
      type: string;
      requestId: string;
      payload: { error: boolean; message: string };
    }>();

    assert.strictEqual(response?.type, "fetchResponse");
    assert.strictEqual(response?.requestId, "error-request-1");
    assert.strictEqual(response?.payload?.error, true);
    assert.ok(response?.payload?.message);
  });

  test("should ignore non-fetch messages", async () => {
    const mockWebview = new MockWebview();
    const handler = new WebviewMessageHandler(mockWebview as any);

    const message: WebviewMessage = {
      type: "unknownType",
      payload: { some: "data" },
    };

    await handler.handleMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.strictEqual(
      mockWebview.messages.length,
      0,
      "Should not send any response for unknown message types"
    );
  });

  test("should handle multiple concurrent requests", async () => {
    const mockWebview = new MockWebview();
    const handler = new WebviewMessageHandler(mockWebview as any);

    const messages: FetchRequestMessage[] = [
      {
        type: "fetchRequest",
        requestId: "concurrent-1",
        payload: { url: `http://127.0.0.1:${testServerPort}/test1`, method: "GET" },
      },
      {
        type: "fetchRequest",
        requestId: "concurrent-2",
        payload: { url: `http://127.0.0.1:${testServerPort}/test2`, method: "GET" },
      },
      {
        type: "fetchRequest",
        requestId: "concurrent-3",
        payload: { url: `http://127.0.0.1:${testServerPort}/test3`, method: "GET" },
      },
    ];

    // Send all messages concurrently
    await Promise.all(messages.map((m) => handler.handleMessage(m)));
    await new Promise((resolve) => setTimeout(resolve, 200));

    assert.strictEqual(
      mockWebview.messages.length,
      3,
      "Should have received 3 responses"
    );

    const responseIds = mockWebview.messages.map(
      (m: unknown) => (m as { requestId: string }).requestId
    );
    assert.ok(responseIds.includes("concurrent-1"));
    assert.ok(responseIds.includes("concurrent-2"));
    assert.ok(responseIds.includes("concurrent-3"));
  });
});
