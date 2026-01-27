import * as https from "https";
import * as http from "http";
import { URL } from "url";

/**
 * Request options for the fetch proxy
 */
export interface FetchProxyRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * Response from the fetch proxy
 */
export interface FetchProxyResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  url: string;
}

/**
 * Error response from the fetch proxy
 */
export interface FetchProxyError {
  error: true;
  message: string;
  code?: string;
}

/**
 * Result type for fetch proxy operations
 */
export type FetchProxyResult = FetchProxyResponse | FetchProxyError;

/**
 * HTTP status text mapping
 */
const HTTP_STATUS_TEXT: Record<number, string> = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

function getStatusText(statusCode: number): string {
  return HTTP_STATUS_TEXT[statusCode] || "Unknown";
}

/**
 * FetchProxy class handles HTTP requests from the extension backend
 * to bypass CORS restrictions in the webview
 */
export class FetchProxy {
  private timeout: number;

  constructor(options?: { timeout?: number }) {
    this.timeout = options?.timeout ?? 30000; // 30 seconds default
  }

  /**
   * Execute a fetch request from the backend
   * @param request - The request to execute
   * @returns Promise resolving to FetchProxyResult
   */
  async fetch(request: FetchProxyRequest): Promise<FetchProxyResult> {
    try {
      const url = new URL(request.url);
      const isHttps = url.protocol === "https:";

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: request.method || "GET",
        headers: {
          ...request.headers,
          // Ensure we have a user agent
          "User-Agent":
            request.headers?.["User-Agent"] || "VSCode-OpenAPI-UI/1.0",
        },
        timeout: this.timeout,
        // Allow self-signed certificates for local development
        rejectUnauthorized: false,
      };

      return await this.executeRequest(
        isHttps ? https : http,
        options,
        request.body,
        request.url
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  private executeRequest(
    protocol: typeof https | typeof http,
    options: https.RequestOptions,
    body: string | undefined,
    originalUrl: string
  ): Promise<FetchProxyResult> {
    return new Promise((resolve) => {
      const req = protocol.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const bodyBuffer = Buffer.concat(chunks);
          const responseBody = bodyBuffer.toString("utf-8");

          // Convert headers to a simple object
          const headers: Record<string, string> = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (value !== undefined) {
              headers[key] = Array.isArray(value) ? value.join(", ") : value;
            }
          }

          const response: FetchProxyResponse = {
            ok: res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode || 0,
            statusText: res.statusMessage || getStatusText(res.statusCode || 0),
            headers,
            body: responseBody,
            url: originalUrl,
          };

          resolve(response);
        });

        res.on("error", (error) => {
          resolve(this.handleError(error));
        });
      });

      req.on("error", (error) => {
        resolve(this.handleError(error));
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          error: true,
          message: "Request timeout",
          code: "ETIMEDOUT",
        });
      });

      // Write body if present
      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  private handleError(error: unknown): FetchProxyError {
    const err = error as NodeJS.ErrnoException;
    let message = "Unknown error occurred";
    let code: string | undefined;

    if (err.message) {
      message = err.message;
    }

    if (err.code) {
      code = err.code;

      // Provide more user-friendly error messages
      switch (err.code) {
        case "ECONNREFUSED":
          message = `Connection refused. Is the server running at the specified address?`;
          break;
        case "ENOTFOUND":
          message = `Server not found. Please check the URL.`;
          break;
        case "ETIMEDOUT":
          message = `Request timed out. The server took too long to respond.`;
          break;
        case "ECONNRESET":
          message = `Connection was reset by the server.`;
          break;
        case "CERT_HAS_EXPIRED":
        case "DEPTH_ZERO_SELF_SIGNED_CERT":
        case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
          message = `SSL/TLS certificate error: ${err.message}`;
          break;
      }
    }

    return {
      error: true,
      message,
      code,
    };
  }
}

// Export a singleton instance
export const fetchProxy = new FetchProxy();

/**
 * Helper function to check if a result is an error
 */
export function isFetchProxyError(
  result: FetchProxyResult
): result is FetchProxyError {
  return "error" in result && result.error === true;
}
