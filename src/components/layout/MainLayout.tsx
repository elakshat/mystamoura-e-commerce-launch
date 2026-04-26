import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { PageTransition } from '@/components/animations/PageTransition';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Ambient gradient orbs — give the glass blur something rich to refract */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[hsl(var(--rose-gold)/0.18)] blur-3xl animate-float"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-[hsl(var(--bronze)/0.14)] blur-3xl animate-float"
          style={{ animationDelay: '3s' }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </div>
  );
}
