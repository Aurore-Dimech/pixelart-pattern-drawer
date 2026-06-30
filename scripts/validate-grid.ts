import { readFileSync } from "fs";
import { z } from "zod";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const GridDataSchema = z.object({
  width: z.number().int().min(8).max(64),
  height: z.number().int().min(8).max(64),
  pixels: z.array(z.string().regex(HEX_COLOR)),
}).refine(
  (data) => data.pixels.length === data.width * data.height,
  { message: "pixels length mismatch (expected width × height)" }
).refine(
  (data) => data.pixels.some((p) => p.toUpperCase() !== "#FFFFFF"),
  { message: "Drawing is empty (all pixels are white)" }
);

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: ts-node scripts/validate-grid.ts <path-to-grid.json>");
  process.exit(1);
}

try {
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  const result = GridDataSchema.safeParse(raw);
  if (result.success) {
    console.log(`✅ Grid valid: ${result.data.width}x${result.data.height}, ${result.data.pixels.length} pixels`);
    process.exit(0);
  } else {
    console.error("❌ Grid invalid:");
    result.error.issues.forEach((e) => console.error(`  - ${e.path.join(".")}: ${e.message}`));
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Failed to read or parse file:", err);
  process.exit(1);
}
