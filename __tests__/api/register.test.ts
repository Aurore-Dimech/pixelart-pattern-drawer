/**
 * @jest-environment node
 */
import { POST } from "@/app/api/register/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

import { prisma } from "@/lib/prisma";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Par défaut : aucun doublon, création réussie
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "user-1" });
  });

  it("returns 400 if name is too short (< 2 chars)", async () => {
    const res = await POST(makeRequest({ name: "x", email: "a@a.com", password: "123456" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if email is invalid", async () => {
    const res = await POST(makeRequest({ name: "alice", email: "not-an-email", password: "123456" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if password is too short (< 6 chars)", async () => {
    const res = await POST(makeRequest({ name: "alice", email: "a@a.com", password: "123" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 if email is already used", async () => {
    // findUnique: premier appel (email) → trouvé, second (name) → null
    mockFindUnique
      .mockResolvedValueOnce({ id: "existing" })
      .mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ name: "newuser", email: "taken@a.com", password: "123456" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  it("returns 409 if username is already taken", async () => {
    // findUnique: premier appel (email) → null, second (name) → trouvé
    mockFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing" });
    const res = await POST(makeRequest({ name: "takenname", email: "new@a.com", password: "123456" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/nom/i);
  });

  it("returns 201 with only user id on success (no password, no email)", async () => {
    const res = await POST(makeRequest({ name: "alice", email: "alice@a.com", password: "123456" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("user-1");
    expect(body.data.password).toBeUndefined();
    expect(body.data.email).toBeUndefined();
  });
});
