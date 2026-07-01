import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireOwnership, parseJsonBody } from "@/lib/api-guard";

const PublishSchema = z.object({ publish: z.boolean() });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const { error: ownerError } = await requireOwnership(id);
  if (ownerError) return ownerError;

  const { body, error: bodyError } = await parseJsonBody(req);
  if (bodyError) return bodyError;
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
