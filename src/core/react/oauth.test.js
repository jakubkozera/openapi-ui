import { afterEach, describe, expect, it, vi } from "vitest";
import { authorizationUrl, completeAuthorization, requestToken } from "./oauth";

afterEach(() => vi.unstubAllGlobals());
const memory = () => {
  const data = new Map();
  return {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
};

describe("OAuth", () => {
  it("uses cryptographic state and S256 PKCE, then exchanges the matching callback once", async () => {
    const storage = memory();
    const url = new URL(
      await authorizationUrl(
        {
          authorizationUrl: "https://identity.example/auth",
          tokenUrl: "https://identity.example/token",
        },
        {
          clientId: "client",
          flow: "authorizationCode",
          redirectUri: "https://app.example/",
        },
        "oauth",
        "workspace",
        storage,
      ),
    );
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toHaveLength(43);
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: "token", expires_in: 3600 }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const callback = `https://app.example/?code=code&state=${url.searchParams.get("state")}`;
    expect(await completeAuthorization(callback, storage)).toMatchObject({
      scheme: "oauth",
      workspace: "workspace",
      credential: { token: "token" },
    });
    expect(fetchMock.mock.calls[0][1].body.get("code_verifier")).toHaveLength(
      86,
    );
    await expect(completeAuthorization(callback, storage)).rejects.toThrow(
      "Invalid",
    );
  });

  it("rejects mismatched state without exchanging credentials", async () => {
    const storage = memory();
    await authorizationUrl(
      { authorizationUrl: "https://identity.example/auth" },
      {
        clientId: "client",
        flow: "implicit",
        redirectUri: "https://app.example/",
      },
      "oauth",
      "workspace",
      storage,
    );
    await expect(
      completeAuthorization(
        "https://app.example/#access_token=token&state=wrong",
        storage,
      ),
    ).rejects.toThrow("state");
  });

  it("sends client credentials with the correct grant", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: "token" }),
      });
    vi.stubGlobal("fetch", fetchMock);
    await requestToken(
      { tokenUrl: "https://identity.example/token" },
      { flow: "clientCredentials", clientId: "client", clientSecret: "secret" },
    );
    expect(fetchMock.mock.calls[0][1].body.get("grant_type")).toBe(
      "client_credentials",
    );
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      `Basic ${btoa("client:secret")}`,
    );
  });
});
