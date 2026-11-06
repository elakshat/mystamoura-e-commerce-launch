import { useId } from 'react';
import { cn } from '@/lib/utils';

/** Irregular wax edge: a circle with soft, deterministic lobes. */
const EDGE = (() => {
  const n = 28;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 54 + Math.sin(i * 2.7) * 2.2 + Math.cos(i * 1.3) * 1.6;
    return [60 + Math.cos(a) * r, 60 + Math.sin(a) * r];
  });
  // Catmull-Rom → cubic Bézier for a smooth, molten outline
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d + 'Z';
})();

interface WaxSealProps {
  className?: string;
  /** Text set around the rim, e.g. "Eau de Parfum · Made in India ·" */
  ring?: string;
}

/** A pressed oxblood wax seal carrying the MA monogram. */
export function WaxSeal({ className, ring }: WaxSealProps) {
  const id = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 120 120" className={cn('drop-shadow-[0_6px_10px_rgba(40,12,10,0.35)]', className)} role="img" aria-label="Myst Amoura wax seal">
      <defs>
        <radialGradient id={`${id}-wax`} cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#9a3a33" />
          <stop offset="45%" stopColor="#74241f" />
          <stop offset="100%" stopColor="#3f1110" />
        </radialGradient>
        <radialGradient id={`${id}-disc`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#8a2f29" />
          <stop offset="100%" stopColor="#561814" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        <path id={`${id}-ring`} d="M60,60 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0" />
      </defs>

      {/* molten edge */}
      <path d={EDGE} fill={`url(#${id}-wax)`} />
      <path d={EDGE} fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.4" />

      {/* pressed disc: dark upper-left lip, light lower-right lip = sunk into the wax */}
      <circle cx="60" cy="60" r="43" fill={`url(#${id}-disc)`} />
      <circle cx="60" cy="60" r="43" fill="none" stroke="#2a0a09" strokeOpacity="0.55" strokeWidth="1.6" transform="translate(-0.6 -0.6)" />
      <circle cx="60" cy="60" r="43" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1" transform="translate(0.7 0.7)" />
      <circle cx="60" cy="60" r="27" fill="none" stroke="#2a0a09" strokeOpacity="0.35" strokeWidth="0.8" />

      {ring && (
        <text fontFamily="Jost, system-ui, sans-serif" fontSize="6.4" fontWeight="500" fill="#f3d9c8" fillOpacity="0.72">
          <textPath href={`#${id}-ring`} textLength="218" lengthAdjust="spacing">
            {ring.toUpperCase()}
          </textPath>
        </text>
      )}

      {/* embossed monogram: shadow, highlight, face */}
      <g fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="30" fontWeight="500" textAnchor="middle" letterSpacing="-1.5">
        <text x="60" y="71" fill="#220807" fillOpacity="0.7" transform="translate(1 1.2)">MA</text>
        <text x="60" y="71" fill="#ffd9c7" fillOpacity="0.34" transform="translate(-0.8 -0.8)">MA</text>
        <text x="60" y="71" fill="#8a2f28">MA</text>
      </g>

      {/* specular glint */}
      <ellipse cx="42" cy="34" rx="14" ry="6" fill="#ffffff" fillOpacity="0.07" transform="rotate(-32 42 34)" />
    </svg>
  );
}
