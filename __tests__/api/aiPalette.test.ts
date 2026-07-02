/**
 * @jest-environment node
 */
import { POST } from "@/app/api/ai/palette/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@anthropic-ai/sdk", () => ({ __esModule: true, default: jest.fn() }));

import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const mockAuth = auth as jest.Mock;
const mockCreate = jest.fn();

const SESSION = { user: { id: "user-1" } };

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/ai/palette", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/ai/palette", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, ANTHROPIC_API_KEY: "test-key" };
    jest.mocked(Anthropic).mockImplementation(() => ({
      messages: { create: mockCreate },
    } as unknown as Anthropic));
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ theme: "forest" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if theme is missing", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns fallback palette if ANTHROPIC_API_KEY is absent", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const env = { ...OLD_ENV };
    delete env.ANTHROPIC_API_KEY;
    process.env = env;
    const res = await POST(makeRequest({ theme: "forest" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.fallback).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("returns palette from Anthropic on success", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const palette = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FF8800", "#8800FF"];
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(palette) }],
    });
    const res = await POST(makeRequest({ theme: "forest" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(palette);
    expect(body.fallback).toBeUndefined();
  });

  it("returns fallback palette if Anthropic throws", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockCreate.mockRejectedValue(new Error("API unavailable"));
    const res = await POST(makeRequest({ theme: "forest" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.fallback).toBe(true);
  });
});
