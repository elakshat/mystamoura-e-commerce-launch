import { useEffect, useRef } from 'react';

/**
 * Oversized footer wordmark drawn as a halftone of brass dots.
 * A slow band of light drifts across it; under the cursor (or a finger) the
 * dots swirl outward like a spray of mist, brighten, then settle back home.
 * The <p> stays in the DOM for sizing and as the no-JS / reduced-motion fallback.
 */

type Dot = { hx: number; hy: number; r: number; x: number; y: number; vx: number; vy: number; glow: number };

const TEXT = 'MYST AMOURA';
// Brass → champagne, matching --brass and --brass-light.
const BASE = [160, 127, 76];
const LIGHT = [246, 226, 178];
const LEVELS = 10;
// Room above and below the letters so the swirl and its haze are never clipped.
const PAD = 48;

export function FooterWordmark() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, textEl = textRef.current, canvas = canvasRef.current;
    if (!wrap || !textEl || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dots: Dot[] = [];
    let W = 0, H = 0, step = 6, reach = 130;
    let raf = 0, visible = false, disposed = false;
    const pointer = { x: -9999, y: -9999, px: -9999, py: -9999, active: false, lastMove: 0 };
    const start = performance.now();

    const build = () => {
      const rect = textEl.getBoundingClientRect();
      W = Math.round(rect.width); H = Math.round(rect.height) + PAD * 2;
      if (!W || !H) return;
      canvas.style.top = `${-PAD}px`;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rasterise the wordmark exactly as the <p> sets it, then sample a grid.
      const cs = getComputedStyle(textEl);
      const size = parseFloat(cs.fontSize);
      const spacing = parseFloat(cs.letterSpacing) || 0;
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const o = off.getContext('2d', { willReadFrequently: true })!;
      o.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      o.textBaseline = 'alphabetic';
      o.fillStyle = '#fff';
      const widths = [...TEXT].map((ch) => o.measureText(ch).width + spacing);
      const total = widths.reduce((a, b) => a + b, 0) - spacing;
      const m = o.measureText(TEXT);
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      let x = (W - total) / 2;
      const baseline = (H + asc - desc) / 2; // centred in the padded box = centred on the text
      [...TEXT].forEach((ch, i) => { o.fillText(ch, x, baseline); x += widths[i]; });

      step = W < 640 ? 3.2 : W < 1100 ? 4.6 : 6;
      reach = Math.max(70, W * 0.085);
      const data = o.getImageData(0, 0, W, H).data;
      const cov = (px: number, py: number) => {
        const ix = Math.min(W - 1, Math.max(0, Math.round(px))), iy = Math.min(H - 1, Math.max(0, Math.round(py)));
        return data[(iy * W + ix) * 4 + 3] / 255;
      };
      const next: Dot[] = [];
      const q = step / 3;
      for (let gy = step / 2; gy < H; gy += step) {
        for (let gx = step / 2; gx < W; gx += step) {
          const c = (cov(gx, gy) * 2 + cov(gx - q, gy - q) + cov(gx + q, gy - q) + cov(gx - q, gy + q) + cov(gx + q, gy + q)) / 6;
          if (c < 0.08) continue;
          next.push({ hx: gx, hy: gy, r: step * 0.46 * Math.sqrt(c), x: gx, y: gy, vx: 0, vy: 0, glow: 0 });
        }
      }
      dots = next;
      textEl.style.opacity = '0';
      draw(performance.now(), true);
    };

    const paths = Array.from({ length: LEVELS }, () => [] as Dot[]);
    const colour = (level: number) => {
      const t = level / (LEVELS - 1);
      const c = BASE.map((b, i) => Math.round(b + (LIGHT[i] - b) * t));
      return `rgba(${c[0]},${c[1]},${c[2]},${0.46 + 0.5 * t})`;
    };
    const fills = Array.from({ length: LEVELS }, (_, i) => colour(i));

    const draw = (now: number, still = false) => {
      ctx.clearRect(0, 0, W, H);
      for (const p of paths) p.length = 0;

      const t = (now - start) / 1000;
      // A soft band of light that drifts across every ~8s.
      const band = ((t % 8) / 8) * (W + 600) - 300;
      const pv = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
      const live = pointer.active && now - pointer.lastMove < 1600;

      for (const d of dots) {
        if (!still) {
          if (live) {
            const dx = d.x - pointer.x, dy = d.y - pointer.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < reach) {
              const s = (1 - dist / reach) ** 2;
              const energy = 0.6 + Math.min(pv, 40) / 40;
              // swirl (tangential) + gentle outward push
              d.vx += ((-dy / dist) * 2.2 + (dx / dist) * 1.1) * s * energy;
              d.vy += ((dx / dist) * 2.2 + (dy / dist) * 1.1) * s * energy;
              d.glow = Math.max(d.glow, s * 1.15);
            }
          }
          d.vx += (d.hx - d.x) * 0.06; d.vy += (d.hy - d.y) * 0.06;
          d.vx *= 0.86; d.vy *= 0.86;
          d.x += d.vx; d.y += d.vy;
          d.glow *= 0.955;
        }
        const shimmer = reduced ? 0 : Math.max(0, 1 - Math.abs(d.hx + d.hy * 0.6 - band) / 160) * 0.45;
        const g = Math.min(1, d.glow + shimmer);
        paths[Math.min(LEVELS - 1, Math.round(g * (LEVELS - 1)))].push(d);
      }
      pointer.px = pointer.x; pointer.py = pointer.y;

      // Warm haze under the cursor, like light caught in a spray of mist.
      if (live && !still) {
        const haze = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, reach * 1.1);
        haze.addColorStop(0, 'rgba(246, 214, 150, 0.16)');
        haze.addColorStop(1, 'rgba(246, 214, 150, 0)');
        ctx.fillStyle = haze;
        ctx.fillRect(pointer.x - reach * 1.1, pointer.y - reach * 1.1, reach * 2.2, reach * 2.2);
      }

      for (let i = 0; i < LEVELS; i++) {
        const bucket = paths[i];
        if (!bucket.length) continue;
        ctx.fillStyle = fills[i];
        ctx.beginPath();
        const grow = 1 + (i / (LEVELS - 1)) * 0.25;
        for (const d of bucket) {
          ctx.moveTo(d.x + d.r * grow, d.y);
          ctx.arc(d.x, d.y, d.r * grow, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      if (disposed || !visible) { raf = 0; return; }
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const run = () => { if (!reduced && visible && !raf) raf = requestAnimationFrame(loop); };

    const setPointer = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = clientX - r.left; pointer.y = clientY - r.top;
      if (!pointer.active) { pointer.px = pointer.x; pointer.py = pointer.y; }
      pointer.active = true; pointer.lastMove = performance.now();
    };
    const onPointer = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { const t0 = e.touches[0]; if (t0) setPointer(t0.clientX, t0.clientY); };
    const onLeave = () => { pointer.active = false; };

    wrap.addEventListener('pointermove', onPointer, { passive: true });
    wrap.addEventListener('pointerleave', onLeave, { passive: true });
    wrap.addEventListener('touchstart', onTouch, { passive: true });
    wrap.addEventListener('touchmove', onTouch, { passive: true });
    wrap.addEventListener('touchend', onLeave, { passive: true });

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); }, { rootMargin: '100px' });
    io.observe(wrap);
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(build, 120); });
    ro.observe(wrap);
    document.fonts.ready.then(() => { if (!disposed) { build(); run(); } });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect(); ro.disconnect();
      wrap.removeEventListener('pointermove', onPointer);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('touchstart', onTouch);
      wrap.removeEventListener('touchmove', onTouch);
      wrap.removeEventListener('touchend', onLeave);
      textEl.style.opacity = '';
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative z-[2] select-none px-2" aria-hidden="true">
      <p
        ref={textRef}
        className="brand-wordmark whitespace-nowrap text-center text-[10.4vw] font-light leading-[0.8] !tracking-[0.04em] text-nuit-foreground/[0.07] transition-opacity duration-700"
      >
        Myst Amoura
      </p>
      <canvas ref={canvasRef} className="pointer-events-none absolute left-2" />
    </div>
  );
}
