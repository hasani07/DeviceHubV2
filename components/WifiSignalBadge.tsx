export default function WifiSignalBadge({ rssi }: { rssi: number | null }) {
  if (rssi == null) return null;

  // Rentang umum RSSI wifi dalam dBm: semakin mendekati 0, semakin kuat.
  let label = 'Lemah';
  let color = 'bg-red-950 text-red-300';

  if (rssi >= -50) {
    label = 'Sangat kuat';
    color = 'bg-green-900 text-green-300';
  } else if (rssi >= -60) {
    label = 'Kuat';
    color = 'bg-green-950 text-green-400';
  } else if (rssi >= -70) {
    label = 'Cukup';
    color = 'bg-yellow-950 text-yellow-300';
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
      Wifi: {label} ({rssi} dBm)
    </span>
  );
}
