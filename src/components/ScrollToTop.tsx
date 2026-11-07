import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** Start each new page at the top; Back/Forward keep the browser's own position. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP' || hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash, navigationType]);

  return null;
}
