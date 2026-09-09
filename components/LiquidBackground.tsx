// Dekorasi background - gumpalan warna blur yang bergerak pelan di
// belakang panel-panel kaca. Murni CSS, gak perlu 'use client'.
// Animasi otomatis nonaktif kalau prefers-reduced-motion (lihat globals.css).

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-violet-500/25 blur-[120px] motion-safe:animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] max-w-[560px] max-h-[560px] rounded-full bg-cyan-400/20 blur-[120px] motion-safe:animate-blob-slow" />
      <div className="absolute bottom-[-15%] left-[15%] w-[38vw] h-[38vw] max-w-[520px] max-h-[520px] rounded-full bg-pink-400/15 blur-[120px] motion-safe:animate-blob" />
    </div>
  );
}
