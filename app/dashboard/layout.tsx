// Versi internal tanpa login. Siapapun yang tau URL ini bisa akses
// & ubah semua data - lihat catatan security di README.

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="px-6 py-4 border-b border-gray-800">
        <a href="/dashboard" className="font-medium">
          DeviceHub
        </a>
      </nav>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
