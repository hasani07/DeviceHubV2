export default function WifiSignalBadge({ rssi }: { rssi: number | null }) {
  if (rssi == null) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/[0.04] border border-white/10 text-white/35">
        Wifi: belum ada data
      </span>
    );
  }

  let label = 'Lemah';
  let classes = 'bg-rose-400/10 border-rose-300/30 text-rose-300';

  if (rssi >= -50) {
    label = 'Sangat kuat';
    classes = 'bg-emerald-400/10 border-emerald-300/30 text-emerald-300';
  } else if (rssi >= -60) {
    label = 'Kuat';
    classes = 'bg-emerald-400/10 border-emerald-300/20 text-emerald-200/80';
  } else if (rssi >= -70) {
    label = 'Cukup';
    classes = 'bg-amber-400/10 border-amber-300/30 text-amber-300';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${classes}`}>
      Wifi: {label} ({rssi} dBm)
    </span>
  );
}
