import { z } from "zod";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export const GridDataSchema = z.object({
  width: z.number().int().min(8).max(64),
  height: z.number().int().min(8).max(64),
  pixels: z.array(z.string().regex(HEX_COLOR)),
}).refine(
  (d) => d.pixels.length === d.width * d.height,
  (d) => ({ message: `pixels: attendu ${d.width * d.height}, reçu ${d.pixels.length}` })
);

export const CreateDrawingSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100),
  gridData: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      const result = GridDataSchema.safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error.errors[0].message });
        return z.NEVER;
      }
      return str;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "gridData invalide" });
      return z.NEVER;
    }
  }),
});