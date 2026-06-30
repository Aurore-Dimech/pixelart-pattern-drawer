import { GridDataSchema, CreateDrawingSchema } from "@/lib/validators/drawing";

const validGrid = {
  width: 16,
  height: 16,
  pixels: Array(256).fill("#FF0000"),
};

describe("GridDataSchema", () => {
  it("accepts a valid 16×16 grid", () => {
    expect(GridDataSchema.safeParse(validGrid).success).toBe(true);
  });

  it("rejects width < 8", () => {
    expect(GridDataSchema.safeParse({ ...validGrid, width: 4, pixels: Array(4 * 16).fill("#FF0000") }).success).toBe(false);
  });

  it("rejects height > 64", () => {
    expect(GridDataSchema.safeParse({ ...validGrid, height: 128, pixels: Array(16 * 128).fill("#FF0000") }).success).toBe(false);
  });

  it("rejects an invalid color format", () => {
    const bad = { ...validGrid, pixels: Array(256).fill("red") };
    expect(GridDataSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects pixels.length !== width × height", () => {
    const bad = { ...validGrid, pixels: Array(100).fill("#FF0000") };
    expect(GridDataSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts an all-white grid (empty check is in the script, not the validator)", () => {
    const allWhite = { ...validGrid, pixels: Array(256).fill("#FFFFFF") };
    expect(GridDataSchema.safeParse(allWhite).success).toBe(true);
  });
});

describe("CreateDrawingSchema", () => {
  it("rejects an empty title", () => {
    const result = CreateDrawingSchema.safeParse({ title: "", gridData: JSON.stringify(validGrid) });
    expect(result.success).toBe(false);
  });

  it("rejects malformed gridData JSON", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: "not-json" });
    expect(result.success).toBe(false);
  });
});
