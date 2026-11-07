export const INTRO_KEY = 'ma-intro-seen';
// Never interrupt purchase, account or admin flows.
export const SKIP_INTRO = ['/checkout', '/order-success', '/admin', '/auth', '/reset-password', '/cart', '/account'];

export function introAlreadySeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return true;
  }
}

/** Seconds the intro covers the page on this load (0 when it won't play). Read once at mount. */
export function introDelay(pathname: string) {
  return !introAlreadySeen() && !SKIP_INTRO.some((p) => pathname.startsWith(p)) ? 1.5 : 0;
}
