import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PublishSchema = z.object({ publish: z.boolean() });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const drawing = await prisma.drawing.findUnique({ where: { id } });
  if (!drawing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (drawing.authorId !== session.user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const parsed = PublishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètre publish (boolean) requis" }, { status: 400 });
  }

  const updated = await prisma.drawing.update({
    where: { id },
    data: { isPublished: parsed.data.publish },
  });

  return NextResponse.json({ data: updated });
}
