import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { DEFAULT_PALETTE } from "@/lib/constants";

const RequestSchema = z.object({
  theme: z.string().min(1).max(100),
});

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function parsePalette(text: string): string[] | null {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr) || arr.length < 8) return null;
    const colors = arr.slice(0, 8);
    if (!colors.every((c) => typeof c === "string" && HEX_RE.test(c))) return null;
    return colors;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Thème invalide" }, { status: 400 });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: `Generate a harmonious 8-color palette for pixel art on the theme "${parsed.data.theme}". Reply ONLY with a valid JSON array of exactly 8 hex color codes. Example: ["#FF0000","#00FF00","#0000FF","#FFFF00","#FF00FF","#00FFFF","#FF8800","#8800FF"]`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const colors = parsePalette(text);

    if (colors) {
      return NextResponse.json({ data: colors });
    }
  } catch {
    // Fallback intentionnel si l'API est indisponible
  }

  return NextResponse.json({ data: DEFAULT_PALETTE, fallback: true });
}
