import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PixelEditorClient } from "@/components/editor/PixelEditorClient";

export default async function EditorPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 px-6">
          Nouveau dessin
        </h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <PixelEditorClient />
        </div>
      </div>
    </main>
  );
}