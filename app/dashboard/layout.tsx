// Versi internal tanpa login. Siapapun yang tau URL ini bisa akses
// & ubah semua data - lihat catatan security di README.

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white">
      <div className="sticky top-4 z-20 px-4">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3 rounded-full glass-edge backdrop-blur-2xl bg-white/[0.06] border border-white/[0.14] shadow-glass">
          <a href="/dashboard" className="font-bold tracking-tight text-lg bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
            DeviceHub
          </a>
        </nav>
      </div>
      <main className="px-4 pt-8 pb-16 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
