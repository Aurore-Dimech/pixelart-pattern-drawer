import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Minimum 6 caractères"),
  name: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Register body:", body);

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      console.log("❌ Validation error:", parsed.error.errors);
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    console.log("🔐 Password hashed");

    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });
    console.log("✅ User created:", user.id);

    return NextResponse.json(
      { data: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (err) {
    console.error("💥 Register error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}