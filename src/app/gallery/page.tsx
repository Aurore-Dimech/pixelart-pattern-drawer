import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GalleryClient } from "./GalleryClient";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";

type Props = {
  searchParams: Promise<{ search?: string; tag?: string; page?: string }>;
};

export default async function GalleryPage({ searchParams }: Props) {
  const { search = "", tag = "", page: pageStr = "1" } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  const page = Math.max(1, parseInt(pageStr, 10));
  const pageSize = GALLERY_PAGE_SIZE;

  const where = {
    isPublished: true,
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { tags: { some: { tag: { name: { contains: search } } } } },
          ],
        }
      : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  const [drawings, total, allTags] = await Promise.all([
    prisma.drawing.findMany({
      where,
      include: {
        author: { select: { name: true } },
        tags: { include: { tag: true } },
        favorites: userId ? { where: { userId }, select: { id: true } } : false,
        _count: { select: { favorites: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.drawing.count({ where }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const data = drawings.map((d) => ({
    id: d.id,
    title: d.title,
    gridData: d.gridData,
    updatedAt: d.updatedAt.toISOString(),
    author: { name: d.author.name! },
    tags: d.tags.map((dt) => dt.tag),
    favoriteCount: d._count.favorites,
    isFavorited: userId ? (d.favorites as { id: string }[]).length > 0 : false,
    isOwn: userId === d.authorId,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Galerie</h1>
      {/* WHY: la key force un remount de GalleryClient à chaque changement de page/filtre,
          ce qui réinitialise les états locaux favorites/favCounts depuis les nouvelles props */}
      <GalleryClient
        key={`${search}-${tag}-${page}`}
        drawings={data}
        total={total}
        page={page}
        pageSize={pageSize}
        tags={allTags}
        initialSearch={search}
        initialTag={tag}
        isLoggedIn={!!userId}
      />
    </div>
  );
}
