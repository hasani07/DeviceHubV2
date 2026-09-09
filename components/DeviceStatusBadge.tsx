export default function DeviceStatusBadge({ status }: { status: 'online' | 'offline' }) {
  const isOnline = status === 'online';
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        isOnline ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
      }`}
    >
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
