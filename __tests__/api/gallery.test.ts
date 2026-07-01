/**
 * @jest-environment node
 */
import { GET } from "@/app/api/gallery/route";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/constants", () => ({ GALLERY_PAGE_SIZE: 2 }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    drawing: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = auth as jest.Mock;
const mockFindMany = prisma.drawing.findMany as jest.Mock;
const mockCount = prisma.drawing.count as jest.Mock;
const mockTagFindMany = prisma.tag.findMany as jest.Mock;

const DRAWINGS = [
  { id: "d-1", title: "Ocean", isPublished: true, author: { name: "Alice" }, tags: [], favorites: [], _count: { favorites: 2 } },
  { id: "d-2", title: "Forest", isPublished: true, author: { name: "Bob" }, tags: [], favorites: [], _count: { favorites: 0 } },
];

describe("GET /api/gallery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(null);
    mockFindMany.mockResolvedValue(DRAWINGS);
    mockCount.mockResolvedValue(2);
    mockTagFindMany.mockResolvedValue([]);
  });

  it("returns 200 with data, total, page, pageSize and tags", async () => {
    const res = await GET(new Request("http://localhost/api/gallery"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(2);
    expect(body.tags).toEqual([]);
  });

  it("does not require authentication", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/gallery"));
    expect(res.status).toBe(200);
  });

  it("passes search query to Prisma filter", async () => {
    const res = await GET(new Request("http://localhost/api/gallery?search=ocean"));
    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { title: { contains: "ocean" } },
          ]),
        }),
      })
    );
  });

  it("passes tag slug to Prisma filter", async () => {
    const res = await GET(new Request("http://localhost/api/gallery?tag=pixel-art"));
    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { some: { tag: { slug: "pixel-art" } } },
        }),
      })
    );
  });

  it("uses page parameter for offset calculation", async () => {
    await GET(new Request("http://localhost/api/gallery?page=3"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 4, take: 2 }) // page 3, pageSize 2 → skip (3-1)*2=4
    );
  });
});
