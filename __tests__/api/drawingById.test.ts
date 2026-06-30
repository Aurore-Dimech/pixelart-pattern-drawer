/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from "@/app/api/drawings/[id]/route";
import { POST as PUBLISH } from "@/app/api/drawings/[id]/publish/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    drawing: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    drawingTag: { deleteMany: jest.fn(), createMany: jest.fn() },
    tag: { upsert: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = auth as jest.Mock;
const mockFindUnique = prisma.drawing.findUnique as jest.Mock;
const mockUpdate = prisma.drawing.update as jest.Mock;
const mockDelete = prisma.drawing.delete as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;

const SESSION_OWNER = { user: { id: "owner-1" } };
const SESSION_OTHER = { user: { id: "other-1" } };

const DRAWING_PUBLIC = {
  id: "d-1", title: "T", authorId: "owner-1", isPublished: true,
  author: { name: "Owner" }, tags: [],
};
const DRAWING_PRIVATE = {
  id: "d-1", title: "T", authorId: "owner-1", isPublished: false,
  author: { name: "Owner" }, tags: [],
};

const PARAMS = Promise.resolve({ id: "d-1" });

describe("GET /api/drawings/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 404 if drawing does not exist", async () => {
    mockAuth.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(404);
  });

  it("returns 403 for a private drawing viewed by a non-owner", async () => {
    mockAuth.mockResolvedValue(SESSION_OTHER);
    mockFindUnique.mockResolvedValue(DRAWING_PRIVATE);
    const res = await GET(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(403);
  });

  it("returns 200 for a private drawing viewed by its owner", async () => {
    mockAuth.mockResolvedValue(SESSION_OWNER);
    mockFindUnique.mockResolvedValue(DRAWING_PRIVATE);
    const res = await GET(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(200);
  });

  it("returns 200 for a public drawing with no session", async () => {
    mockAuth.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC);
    const res = await GET(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("d-1");
  });
});

describe("PUT /api/drawings/[id]", () => {
  const validGrid = { width: 16, height: 16, pixels: Array(256).fill("#FFFFFF") };

  beforeEach(() => {
    jest.clearAllMocks();
    // $transaction exécute le callback avec un tx mock
    mockTransaction.mockImplementation(async (fn: (tx: Record<string, unknown>) => unknown) => {
      const tx = {
        drawingTag: { deleteMany: jest.fn().mockResolvedValue({}), createMany: jest.fn().mockResolvedValue({}) },
        tag: { upsert: jest.fn().mockResolvedValue({ id: "t-1" }) },
        drawing: { update: jest.fn().mockResolvedValue({ id: "d-1", title: "Updated", tags: [] }) },
      };
      return fn(tx);
    });
  });

  function makePutRequest(body: unknown) {
    return new Request("http://localhost/api/drawings/d-1", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PUT(makePutRequest({ title: "New" }), { params: PARAMS });
    expect(res.status).toBe(401);
  });

  it("returns 403 if user is not the owner", async () => {
    mockAuth.mockResolvedValue(SESSION_OTHER);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC);
    const res = await PUT(makePutRequest({ title: "New" }), { params: PARAMS });
    expect(res.status).toBe(403);
  });

  it("returns 404 if drawing does not exist", async () => {
    mockAuth.mockResolvedValue(SESSION_OWNER);
    mockFindUnique.mockResolvedValue(null);
    const res = await PUT(makePutRequest({ title: "New" }), { params: PARAMS });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated drawing on success", async () => {
    mockAuth.mockResolvedValue(SESSION_OWNER);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC);
    const res = await PUT(
      makePutRequest({ title: "Updated", gridData: JSON.stringify(validGrid), tags: ["pixel"] }),
      { params: PARAMS }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("d-1");
  });
});

describe("DELETE /api/drawings/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(401);
  });

  it("returns 403 if user is not the owner", async () => {
    mockAuth.mockResolvedValue(SESSION_OTHER);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC);
    const res = await DELETE(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(403);
  });

  it("returns 200 with deleted: true on success", async () => {
    mockAuth.mockResolvedValue(SESSION_OWNER);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC);
    mockDelete.mockResolvedValue({});
    const res = await DELETE(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.deleted).toBe(true);
  });
});

describe("POST /api/drawings/[id]/publish", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PUBLISH(new Request("http://localhost"), { params: PARAMS });
    expect(res.status).toBe(401);
  });

  it("returns 400 if body is missing publish field", async () => {
    mockAuth.mockResolvedValue(SESSION_OWNER);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC);
    const res = await PUBLISH(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } }),
      { params: PARAMS }
    );
    expect(res.status).toBe(400);
  });

  it("returns 403 if user is not the owner", async () => {
    mockAuth.mockResolvedValue(SESSION_OTHER);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC);
    const res = await PUBLISH(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ publish: false }), headers: { "Content-Type": "application/json" } }),
      { params: PARAMS }
    );
    expect(res.status).toBe(403);
  });

  it("sets isPublished to the explicit value sent in body", async () => {
    mockAuth.mockResolvedValue(SESSION_OWNER);
    mockFindUnique.mockResolvedValue(DRAWING_PUBLIC); // isPublished: true
    mockUpdate.mockResolvedValue({ ...DRAWING_PUBLIC, isPublished: false });
    const res = await PUBLISH(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ publish: false }), headers: { "Content-Type": "application/json" } }),
      { params: PARAMS }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.isPublished).toBe(false);
  });
});
