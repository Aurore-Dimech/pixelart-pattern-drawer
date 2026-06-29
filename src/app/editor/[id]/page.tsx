import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GridData } from "@/types";
import { PixelEditorEditClient } from "@/components/editor/PixelEditorEditClient";

type Props = { params: Promise<{ id: string }> };

export default async function EditorEditPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const drawing = await prisma.drawing.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });

  if (!drawing || drawing.authorId !== session.user.id) notFound();

  const gridData: GridData = JSON.parse(drawing.gridData);
  const tags = drawing.tags.map((dt) => dt.tag.slug);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-6">
        Éditer : {drawing.title}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <PixelEditorEditClient
          drawingId={id}
          initialData={gridData}
          initialTitle={drawing.title}
          initialTags={tags}
        />
      </div>
    </div>
  );
}
