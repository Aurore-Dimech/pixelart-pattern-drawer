import { Prisma } from "@prisma/client";

export async function syncTags(
  tx: Prisma.TransactionClient,
  drawingId: string,
  tags: string[]
): Promise<void> {
  await tx.drawingTag.deleteMany({ where: { drawingId } });
  if (tags.length === 0) return;
  const tagRecords = await Promise.all(
    tags.map((slug) =>
      tx.tag.upsert({ where: { slug }, update: {}, create: { slug, name: slug } })
    )
  );
  await tx.drawingTag.createMany({
    data: tagRecords.map((t) => ({ drawingId, tagId: t.id })),
  });
}
