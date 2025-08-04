import SimpleNavigation from "@/components/layout/SimpleNavigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fef7e0" }}>
      {/* Navbar - 95% width */}
      <header
        style={{
          backgroundColor: "#fef7e0",
          borderBottom: "1px solid #9ca3af",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "95vw",
            margin: "0 auto",
            height: "44px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
              }}
            >
              我的图片
            </h1>
            <SimpleNavigation />
          </div>
        </div>
      </header>

      {/* Content - 95% of viewport width */}
      <main
        style={{
          width: "95vw",
          maxWidth: "95vw",
          margin: "24px auto 0 auto",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}
