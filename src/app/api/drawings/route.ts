import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateDrawingSchema } from "@/lib/validators/drawing";
import { requireSession, parseJsonBody } from "@/lib/api-guard";

export async function GET() {
  const { userId, error: authError } = await requireSession();
  if (authError) return authError;

  const drawings = await prisma.drawing.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: drawings });
}

export async function POST(req: Request) {
  const { userId, error: authError } = await requireSession();
  if (authError) return authError;

  const { body, error: bodyError } = await parseJsonBody(req);
  if (bodyError) return bodyError;

  const parsed = CreateDrawingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const drawing = await prisma.drawing.create({
    data: {
      title: parsed.data.title,
      gridData: parsed.data.gridData,
      authorId: userId,
    },
  });

  return NextResponse.json({ data: drawing }, { status: 201 });
}