import { GridDataSchema, CreateDrawingSchema, UpdateDrawingSchema } from "@/lib/validators/drawing";

const validGrid = {
  width: 16,
  height: 16,
  pixels: Array(256).fill("#FF0000"),
};

const validGridData = JSON.stringify(validGrid);

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
    const result = CreateDrawingSchema.safeParse({ title: "", gridData: validGridData });
    expect(result.success).toBe(false);
  });

  it("rejects malformed gridData JSON", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: "not-json" });
    expect(result.success).toBe(false);
  });
});

describe("UpdateDrawingSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(UpdateDrawingSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a title-only update", () => {
    expect(UpdateDrawingSchema.safeParse({ title: "Nouveau titre" }).success).toBe(true);
  });

  it("accepts a gridData-only update with valid grid", () => {
    expect(UpdateDrawingSchema.safeParse({ gridData: validGridData }).success).toBe(true);
  });

  it("rejects a gridData update with invalid grid dimensions", () => {
    const badGrid = { ...validGrid, width: 4, pixels: Array(4 * 16).fill("#FF0000") };
    expect(UpdateDrawingSchema.safeParse({ gridData: JSON.stringify(badGrid) }).success).toBe(false);
  });

  it("rejects a title longer than 100 characters", () => {
    expect(UpdateDrawingSchema.safeParse({ title: "a".repeat(101) }).success).toBe(false);
  });
});

describe("TagSlugsSchema (via CreateDrawingSchema)", () => {
  it("accepts a drawing with 1 valid tag", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: validGridData, tags: ["pixel-art"] });
    expect(result.success).toBe(true);
  });

  it("accepts a drawing with exactly 3 tags (boundary)", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: validGridData, tags: ["a", "b", "c"] });
    expect(result.success).toBe(true);
  });

  it("rejects a drawing with 4 tags", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: validGridData, tags: ["a", "b", "c", "d"] });
    expect(result.success).toBe(false);
  });

  it("rejects a tag with uppercase letters", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: validGridData, tags: ["InvalidTag"] });
    expect(result.success).toBe(false);
  });

  it("rejects a tag containing spaces", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: validGridData, tags: ["pixel art"] });
    expect(result.success).toBe(false);
  });

  it("accepts undefined tags (field is optional)", () => {
    const result = CreateDrawingSchema.safeParse({ title: "Test", gridData: validGridData });
    expect(result.success).toBe(true);
  });
});
