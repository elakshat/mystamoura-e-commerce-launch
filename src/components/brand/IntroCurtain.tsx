import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { WaxSeal } from './WaxSeal';
import { INTRO_KEY, SKIP_INTRO, introAlreadySeen } from '@/lib/intro';

/** A short, once-per-visit curtain: wax seal + wordmark, then the page is unveiled. */
export function IntroCurtain() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const [show, setShow] = useState(() => !introAlreadySeen() && !SKIP_INTRO.some((p) => pathname.startsWith(p)));

  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* storage unavailable — the curtain simply won't be remembered */
    }
    const t = window.setTimeout(() => setShow(false), reduced ? 400 : 1900);
    return () => window.clearTimeout(t);
  }, [show, reduced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="intro-curtain on-nuit fixed inset-0 z-[90] flex cursor-pointer flex-col items-center justify-center"
          initial={{ y: 0 }}
          exit={{ y: '-100%', pointerEvents: 'none' }}
          transition={{ duration: reduced ? 0.2 : 1.1, ease: [0.76, 0, 0.24, 1] }}
          onClick={() => setShow(false)}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.4, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <WaxSeal className="h-24 w-24 md:h-28 md:w-28" />
          </motion.div>
          <div className="mt-8 overflow-hidden">
            <motion.p
              className="brand-wordmark text-xl text-nuit-foreground md:text-2xl"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              Myst Amoura
            </motion.p>
          </div>
          <motion.div
            className="mt-5 h-px w-24 origin-left bg-brass-light/70"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
