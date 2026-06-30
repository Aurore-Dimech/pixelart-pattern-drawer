/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/favorites/route";
import { DELETE } from "@/app/api/favorites/[drawingId]/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    drawing: {
      findUnique: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = auth as jest.Mock;
const mockFavFindMany = prisma.favorite.findMany as jest.Mock;
const mockFavUpsert = prisma.favorite.upsert as jest.Mock;
const mockFavDeleteMany = prisma.favorite.deleteMany as jest.Mock;
const mockDrawingFindUnique = prisma.drawing.findUnique as jest.Mock;

const SESSION = { user: { id: "user-1" } };

function makePostRequest(body: unknown) {
  return new Request("http://localhost/api/favorites", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/favorites", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 200 with the user's favorite drawings", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFavFindMany.mockResolvedValue([
      { drawing: { id: "d-1", title: "T", author: { name: "Alice" }, tags: [], _count: { favorites: 1 } } },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("d-1");
  });
});

describe("POST /api/favorites", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makePostRequest({ drawingId: "d-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if drawingId is missing", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const res = await POST(makePostRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 404 if drawing is not published", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockDrawingFindUnique.mockResolvedValue({ id: "d-2", authorId: "other-1", isPublished: false });
    const res = await POST(makePostRequest({ drawingId: "d-2" }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when user tries to favorite their own drawing", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockDrawingFindUnique.mockResolvedValue({ id: "d-3", authorId: "user-1", isPublished: true });
    const res = await POST(makePostRequest({ drawingId: "d-3" }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/propre/i);
  });

  it("returns 201 on successful favorite", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockDrawingFindUnique.mockResolvedValue({ id: "d-4", authorId: "other-1", isPublished: true });
    mockFavUpsert.mockResolvedValue({ id: "fav-1", userId: "user-1", drawingId: "d-4" });
    const res = await POST(makePostRequest({ drawingId: "d-4" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.userId).toBe("user-1");
  });
});

describe("DELETE /api/favorites/[drawingId]", () => {
  const PARAMS = Promise.resolve({ drawingId: "d-1" });

  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(401);
  });

  it("returns 200 with deleted: true on success", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFavDeleteMany.mockResolvedValue({ count: 1 });
    const res = await DELETE(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.deleted).toBe(true);
  });
});
