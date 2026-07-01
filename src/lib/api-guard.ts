// src/lib/api-guards.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, userId: null, error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  // TypeScript a narrowé session.user.id en string juste après le check
  return { session, userId: session.user.id, error: null };
}

export async function requireOwnedDrawing(id: string, userId: string) {
  const drawing = await prisma.drawing.findUnique({ where: { id } });
  if (!drawing) return { drawing: null, error: NextResponse.json({ error: "Introuvable" }, { status: 404 }) };
  if (drawing.authorId !== userId) return { drawing: null, error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  return { drawing, error: null };
}

export async function requireOwnership(id: string) {
  const { userId, error: authError } = await requireSession();
  if (authError) return { userId: null, error: authError };
  const { error: drawingError } = await requireOwnedDrawing(id, userId as string);
  if (drawingError) return { userId: null, error: drawingError };
  return { userId: userId as string, error: null };
}

export async function parseJsonBody(req: Request): Promise<{ body: unknown; error: NextResponse | null }> {
  try {
    return { body: await req.json(), error: null };
  } catch {
    return { body: null, error: NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 }) };
  }
}