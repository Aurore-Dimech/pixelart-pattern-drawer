import { z } from "zod";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export const GridDataSchema = z.object({
  width: z.number().int().min(8).max(64),
  height: z.number().int().min(8).max(64),
  pixels: z.array(z.string().regex(HEX_COLOR)),
}).refine(
  (d) => d.pixels.length === d.width * d.height,
  { message: "pixels: longueur incorrecte (width × height attendu)" }
);

const TagSlugsSchema = z.array(z.string().min(1).regex(/^[a-z0-9-]+$/).max(32)).max(3, "3 tags maximum").optional();

const gridDataField = z.string().transform((str, ctx) => {
  try {
    const parsed = JSON.parse(str);
    const result = GridDataSchema.safeParse(parsed);
    if (!result.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error.issues[0].message });
      return z.NEVER;
    }
    return str;
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "gridData invalide" });
    return z.NEVER;
  }
});

export const CreateDrawingSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100),
  gridData: gridDataField,
  tags: TagSlugsSchema,
});

export const UpdateDrawingSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  gridData: gridDataField.optional(),
  tags: TagSlugsSchema,
});
