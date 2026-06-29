import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AddFavoriteSchema = z.object({ drawingId: z.string().min(1) });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

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

  return NextResponse.json({ data: favorites.map((f) => f.drawing) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = AddFavoriteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "drawingId requis" }, { status: 400 });

  const drawing = await prisma.drawing.findUnique({ where: { id: parsed.data.drawingId } });
  if (!drawing?.isPublished) return NextResponse.json({ error: "Dessin introuvable" }, { status: 404 });

  const favorite = await prisma.favorite.upsert({
    where: { userId_drawingId: { userId: session.user.id, drawingId: parsed.data.drawingId } },
    update: {},
    create: { userId: session.user.id, drawingId: parsed.data.drawingId },
  });

  return NextResponse.json({ data: favorite }, { status: 201 });
}
