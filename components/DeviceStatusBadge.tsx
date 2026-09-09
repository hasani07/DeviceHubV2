export default function DeviceStatusBadge({ status }: { status: 'online' | 'offline' }) {
  const isOnline = status === 'online';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
        isOnline
          ? 'bg-emerald-400/10 border-emerald-300/30 text-emerald-300'
          : 'bg-white/[0.04] border-white/10 text-white/40'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-white/30'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
