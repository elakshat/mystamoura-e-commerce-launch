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
