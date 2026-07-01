import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const drawings = await prisma.drawing.findMany({
    where: { authorId: session.user.id },
    include: { tags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mes dessins</h1>
        <Link
          href="/editor"
          className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
        >
          + Nouveau dessin
        </Link>
      </div>
      <DashboardClient drawings={JSON.parse(JSON.stringify(drawings))} />
    </div>
  );
}
