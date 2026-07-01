/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/drawings/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => {
  const drawing = { findMany: jest.fn(), create: jest.fn() };
  return {
    prisma: {
      drawing,
      $transaction: jest.fn().mockImplementation((cb: (tx: { drawing: typeof drawing }) => unknown) =>
        cb({ drawing })
      ),
    },
  };
});

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = auth as jest.Mock;
const mockFindMany = prisma.drawing.findMany as jest.Mock;
const mockCreate = prisma.drawing.create as jest.Mock;

const SESSION = { user: { id: "user-1" } };
const validGrid = { width: 16, height: 16, pixels: Array(256).fill("#FF0000") };

function makePostRequest(body: unknown) {
  return new Request("http://localhost/api/drawings", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/drawings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 200 with the user's drawings", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([{ id: "d-1", title: "Test", authorId: "user-1" }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("d-1");
  });

  it("returns 200 with empty array when user has no drawings", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });
});

describe("POST /api/drawings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makePostRequest({ title: "Test", gridData: JSON.stringify(validGrid) }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if title is empty", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makePostRequest({ title: "", gridData: JSON.stringify(validGrid) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if gridData is invalid JSON", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makePostRequest({ title: "Test", gridData: "not-json" }));
    expect(res.status).toBe(400);
  });

  it("returns 201 with the created drawing", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockCreate.mockResolvedValue({ id: "d-new", title: "Test", authorId: "user-1" });
    const res = await POST(makePostRequest({ title: "Test", gridData: JSON.stringify(validGrid) }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("d-new");
  });
});
