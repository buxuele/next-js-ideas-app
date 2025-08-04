import SimpleNavigation from "@/components/layout/SimpleNavigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">艺术画廊</h1>
              <p className="text-gray-600 mt-1">精选艺术作品展示</p>
            </div>
            <SimpleNavigation />
          </div>
        </div>
      </header>
      <main className="w-full py-6">{children}</main>
    </div>
  );
}
