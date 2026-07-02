import { PrismaClient } from "@prisma/client";
import * as bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

function makeGrid(w: number, h: number, fn: (x: number, y: number) => string): string {
  const pixels: string[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      pixels.push(fn(x, y));
    }
  }
  return JSON.stringify({ width: w, height: h, pixels });
}

function dist(x: number, y: number, cx: number, cy: number): number {
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
}

const GRIDS = {
  sunset: makeGrid(16, 16, (x, y) => {
    if (dist(x, y, 8, 11) < 3.5) return "#ffd166";
    if (y < 5) return "#0d1b2a";
    if (y < 8) return "#1a3a5c";
    if (y < 10) return "#e76f51";
    if (y < 12) return "#f4a261";
    return "#264653";
  }),

  mushroom: makeGrid(16, 16, (x, y) => {
    const inStem = x >= 6 && x <= 10 && y >= 10 && y <= 14;
    const inCap = dist(x, y, 8, 7) < 6.5 && y < 11;
    if (inStem) return "#ffffff";
    if (inCap) {
      if (dist(x, y, 5, 7) < 1.5 || dist(x, y, 11, 7) < 1.5 || dist(x, y, 8, 4) < 1.5) return "#ffffff";
      return "#e63946";
    }
    return "#1a1a2e";
  }),

  tree: makeGrid(16, 16, (x, y) => {
    if (x >= 7 && x <= 9 && y >= 11 && y <= 15) return "#6d4c41";
    if (dist(x, y, 8, 8) < 4.5) return "#2e7d32";
    if (dist(x, y, 8, 5) < 3.5) return "#1b5e20";
    return "#90e0ef";
  }),

  heart: makeGrid(16, 16, (x, y) => {
    const nx = (x - 8) / 5;
    const ny = (y - 8) / 5;
    const v = (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny ** 3;
    if (v <= 0) return "#e63946";
    return "#f48fb1";
  }),

  spaceship: makeGrid(16, 16, (x, y) => {
    if (y === 11 && ((x >= 2 && x <= 5) || (x >= 11 && x <= 14))) return "#f4a261";
    if (y >= 8 && y <= 12 && x >= 5 && x <= 11) return "#9e9e9e";
    if (y >= 5 && y <= 8 && x >= 7 && x <= 9) return "#90e0ef";
    if (y >= 13 && y <= 14 && (x === 7 || x === 9)) return "#ff6b35";
    return "#1a1a2e";
  }),

  checkerboard: makeGrid(8, 8, (x, y) => {
    return (x + y) % 2 === 0 ? "#2a9d8f" : "#ffffff";
  }),

  smiley: makeGrid(16, 16, (x, y) => {
    if (dist(x, y, 8, 8) > 7) return "#1a1a2e";
    if (dist(x, y, 5, 6) < 1.5 || dist(x, y, 11, 6) < 1.5) return "#000000";
    if (y === 11 && x >= 5 && x <= 11) return "#000000";
    if (y === 10 && (x === 5 || x === 11)) return "#000000";
    return "#ffd166";
  }),

  diamonds: makeGrid(16, 16, (x, y) => {
    const COLORS = ["#e63946", "#f4a261", "#2a9d8f", "#7b2d8b", "#023e8a"];
    const col = Math.floor(x / 4);
    const row = Math.floor(y / 4);
    const lx = x % 4;
    const ly = y % 4;
    const md = Math.abs(lx - 2) + Math.abs(ly - 2);
    if (md < 2) return COLORS[(col + row) % COLORS.length];
    return COLORS[(col + row + 2) % COLORS.length];
  }),
};

async function main(): Promise<void> {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log("==> Base déjà seedée — skip");
    return;
  }

  const password = await bcryptjs.hash("password123", 12);

  const alice = await prisma.user.create({
    data: { name: "alice", email: "alice@example.com", password },
  });
  const bob = await prisma.user.create({
    data: { name: "bob", email: "bob@example.com", password },
  });
  const chloe = await prisma.user.create({
    data: { name: "chloe", email: "chloe@example.com", password },
  });

  console.log("==> Users créés (alice, bob, chloe — password: password123)");

  const tagDefs = [
    { name: "Rétro", slug: "retro" },
    { name: "Nature", slug: "nature" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Géométrique", slug: "geometrique" },
    { name: "Personnage", slug: "personnage" },
  ];

  const tags: Record<string, { id: string }> = {};
  for (const t of tagDefs) {
    tags[t.slug] = await prisma.tag.create({ data: t });
  }

  console.log("==> Tags créés");

  type DrawingDef = {
    title: string;
    gridData: string;
    author: { id: string };
    tags: string[];
  };

  const drawingDefs: DrawingDef[] = [
    { title: "Coucher de soleil", gridData: GRIDS.sunset, author: alice, tags: ["retro", "nature"] },
    { title: "Champignon magique", gridData: GRIDS.mushroom, author: alice, tags: ["retro", "fantasy"] },
    { title: "Petit arbre", gridData: GRIDS.tree, author: bob, tags: ["nature"] },
    { title: "Pixel coeur", gridData: GRIDS.heart, author: bob, tags: ["retro"] },
    { title: "Vaisseau spatial", gridData: GRIDS.spaceship, author: bob, tags: ["retro", "fantasy"] },
    { title: "Échiquier", gridData: GRIDS.checkerboard, author: chloe, tags: ["geometrique"] },
    { title: "Smiley classique", gridData: GRIDS.smiley, author: chloe, tags: ["personnage", "retro"] },
    { title: "Losanges colorés", gridData: GRIDS.diamonds, author: chloe, tags: ["geometrique"] },
  ];

  const drawings: { id: string }[] = [];
  for (const def of drawingDefs) {
    const drawing = await prisma.drawing.create({
      data: {
        title: def.title,
        gridData: def.gridData,
        isPublished: true,
        authorId: def.author.id,
        tags: {
          create: def.tags.map((slug) => ({ tag: { connect: { id: tags[slug].id } } })),
        },
      },
    });
    drawings.push(drawing);
  }

  console.log("==> Drawings créés (8 publiés)");

  // drawings[0,1] = alice | drawings[2,3,4] = bob | drawings[5,6,7] = chloe
  const favDefs = [
    { user: alice, drawing: drawings[2] }, // alice aime "Petit arbre" (bob)
    { user: alice, drawing: drawings[4] }, // alice aime "Vaisseau spatial" (bob)
    { user: bob, drawing: drawings[0] },   // bob aime "Coucher de soleil" (alice)
    { user: bob, drawing: drawings[7] },   // bob aime "Losanges colorés" (chloe)
    { user: chloe, drawing: drawings[1] }, // chloe aime "Champignon magique" (alice)
    { user: chloe, drawing: drawings[3] }, // chloe aime "Pixel coeur" (bob)
  ];

  for (const fav of favDefs) {
    await prisma.favorite.create({
      data: { userId: fav.user.id, drawingId: fav.drawing.id },
    });
  }

  console.log("==> Favoris créés (6 favoris croisés)");
  console.log("==> Seed terminé ✓");
}

main()
  .catch((e) => {
    console.error("[seed]", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
