import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const drawing = await prisma.drawing.findUnique({ where: { id } });
  if (!drawing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (drawing.authorId !== session.user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const updated = await prisma.drawing.update({
    where: { id },
    data: { isPublished: !drawing.isPublished },
  });

  return NextResponse.json({ data: updated });
}
