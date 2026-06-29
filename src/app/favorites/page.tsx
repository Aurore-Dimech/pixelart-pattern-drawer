import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FavoritesClient } from "./FavoritesClient";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      drawing: {
        include: {
          author: { select: { name: true } },
          tags: { include: { tag: true } },
          _count: { select: { favorites: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const drawings = favorites.map((f) => ({
    id: f.drawing.id,
    title: f.drawing.title,
    gridData: f.drawing.gridData,
    updatedAt: f.drawing.updatedAt.toISOString(),
    author: { name: f.drawing.author.name! },
    tags: f.drawing.tags.map((dt) => dt.tag),
    favoriteCount: f.drawing._count.favorites,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes favoris</h1>
      <FavoritesClient drawings={JSON.parse(JSON.stringify(drawings))} />
    </div>
  );
}
