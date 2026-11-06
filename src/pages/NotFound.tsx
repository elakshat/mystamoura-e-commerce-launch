import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404 for analytics (avoid console.error in production)
    if (import.meta.env.DEV) {
      console.warn("404: Route not found:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <MainLayout>
      <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." />
      <section className="on-nuit grain relative overflow-hidden">
        <div className="container relative z-[2] mx-auto flex min-h-[75vh] flex-col items-center justify-center px-5 py-24 text-center md:px-12">
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.6em' }}
            animate={{ opacity: 1, letterSpacing: '0.28em' }}
            transition={{ duration: 1.2 }}
            className="eyebrow mb-8 text-brass-light"
          >
            Error 404
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="display-xl text-balance"
          >
            Lost in the <em className="font-light">mist</em>
          </motion.h1>
          <p className="lede mt-8 max-w-md text-nuit-muted">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row">
            <Link to="/" className="btn-maison">Back to home <ArrowRight /></Link>
            <Link to="/products" className="link-line">Browse products</Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default NotFound;
