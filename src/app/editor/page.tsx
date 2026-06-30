import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PixelEditorClient } from "@/components/editor/PixelEditorClient";

export default async function EditorPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Nouveau dessin</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <PixelEditorClient />
      </div>
    </div>
  );
}
