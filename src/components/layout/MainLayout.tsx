import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { PageTransition } from '@/components/animations/PageTransition';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const page = pathname.split('/')[1] || 'home';

  return (
    <div className="storefront relative min-h-screen flex flex-col bg-background overflow-x-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main data-page={page} className="storefront-main flex-1 pb-16 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </div>
  );
}
