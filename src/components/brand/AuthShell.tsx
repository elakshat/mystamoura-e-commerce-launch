import { ReactNode } from 'react';
import { Monogram } from './Monogram';

/** Split-screen frame for sign-in / sign-up / password pages. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100svh-76px)] lg:grid-cols-2">
      <aside className="on-nuit grain relative hidden overflow-hidden lg:block">
        <img
          src="/images/home-hero-still-life.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[75%_center] opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--nuit))] via-[hsl(var(--nuit)/0.3)] to-transparent" />
        <div className="relative z-[2] flex h-full flex-col justify-between p-12 xl:p-16">
          <Monogram className="h-14 w-14 text-xl text-nuit-foreground" />
          <div>
            <p className="eyebrow mb-5 text-brass-light">The Myst Amoura circle</p>
            <p className="max-w-md font-display text-5xl font-light italic leading-[1.05] text-nuit-foreground">
              Your orders, wishlist and addresses — kept in one place.
            </p>
          </div>
        </div>
      </aside>
      <div className="flex items-center justify-center px-5 py-16 md:px-12 md:py-24">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
