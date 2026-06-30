import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateDrawingSchema } from "@/lib/validators/drawing";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const drawings = await prisma.drawing.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: drawings });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateDrawingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const drawing = await prisma.drawing.create({
      data: {
        title: parsed.data.title,
        gridData: parsed.data.gridData,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ data: drawing }, { status: 201 });
  } catch (err) {
    console.error("[api/drawings]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}