import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireSession, parseJsonBody } from "@/lib/api-guard";

const AddFavoriteSchema = z.object({ drawingId: z.string().min(1) });

export async function GET() {
  const { userId, error: authError } = await requireSession();
  if (authError) return authError;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
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
  const { userId, error: authError } = await requireSession();
  if (authError) return authError;

  const { body, error: bodyError } = await parseJsonBody(req);
  if (bodyError) return bodyError;

  const parsed = AddFavoriteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "drawingId requis" }, { status: 400 });

  const drawing = await prisma.drawing.findUnique({ where: { id: parsed.data.drawingId } });
  if (!drawing?.isPublished) return NextResponse.json({ error: "Dessin introuvable" }, { status: 404 });
  if (drawing.authorId === userId) return NextResponse.json({ error: "Vous ne pouvez pas mettre votre propre dessin en favori" }, { status: 403 });

  const favorite = await prisma.favorite.upsert({
    where: { userId_drawingId: { userId, drawingId: parsed.data.drawingId } },
    update: {},
    create: { userId, drawingId: parsed.data.drawingId },
  });

  return NextResponse.json({ data: favorite }, { status: 201 });
}
