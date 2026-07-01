import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateDrawingSchema } from "@/lib/validators/drawing";
import { requireOwnership, parseJsonBody } from "@/lib/api-guard";
import { syncTags } from "@/lib/tags";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  const drawing = await prisma.drawing.findUnique({
    where: { id },
    include: { author: { select: { name: true } }, tags: { include: { tag: true } } },
  });

  if (!drawing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const isOwner = session?.user?.id === drawing.authorId;
  if (!drawing.isPublished && !isOwner) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  return NextResponse.json({ data: drawing });
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const { error: ownerError } = await requireOwnership(id);
  if (ownerError) return ownerError;

  const { body, error: bodyError } = await parseJsonBody(req);
  if (bodyError) return bodyError;
  const parsed = UpdateDrawingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { tags, ...rest } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (tags !== undefined) await syncTags(tx, id, tags);
    return tx.drawing.update({
      where: { id },
      data: rest,
      include: { tags: { include: { tag: true } } },
    });
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const { error: ownerError } = await requireOwnership(id);
  if (ownerError) return ownerError;

  await prisma.drawing.delete({ where: { id } });
  return NextResponse.json({ data: { deleted: true } });
}
