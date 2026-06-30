import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() ?? "";
  const tag = searchParams.get("tag")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = GALLERY_PAGE_SIZE;

  const drawings = await prisma.drawing.findMany({
    where: {
      isPublished: true,
      ...(search ? { title: { contains: search } } : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: true } },
      favorites: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
      _count: { select: { favorites: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await prisma.drawing.count({
    where: {
      isPublished: true,
      ...(search ? { title: { contains: search } } : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    },
  });

  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  const data = drawings.map((d) => ({
    ...d,
    isFavorited: session?.user?.id
      ? (d.favorites as { id: string }[]).length > 0
      : false,
    favoriteCount: d._count.favorites,
    favorites: undefined,
    _count: undefined,
  }));

  return NextResponse.json({ data, total, page, pageSize, tags });
}
