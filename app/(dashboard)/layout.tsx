import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/layout/Navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={session.user} />
      <main className="w-full py-6">{children}</main>
    </div>
  );
}
