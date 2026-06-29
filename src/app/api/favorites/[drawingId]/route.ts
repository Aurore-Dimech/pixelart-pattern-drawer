import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ drawingId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { drawingId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, drawingId },
  });

  return NextResponse.json({ data: { deleted: true } });
}
