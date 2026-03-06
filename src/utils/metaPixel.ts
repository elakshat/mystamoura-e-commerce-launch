/**
 * Safe Meta Pixel event helper.
 * Uses the global fbq function injected via index.html or RouteTracker.
 * Never crashes if fbq is unavailable.
 */
export const trackPixelEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", eventName, params);
    }
  } catch (error) {
    console.warn("Meta Pixel error:", error);
  }
};
