import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Monogram } from '@/components/brand/Monogram';

const columns = [
  {
    title: 'Shop',
    links: [
      { to: '/products', label: 'All Fragrances' },
      { to: '/collections/for-him', label: 'For Him' },
      { to: '/collections/for-her', label: 'For Her' },
      { to: '/collections/unisex', label: 'Unisex' },
    ],
  },
  {
    title: 'The House',
    links: [
      { to: '/about', label: 'Our Story' },
      { to: '/contact', label: 'Contact' },
      { to: '/account', label: 'My Account' },
      { to: '/wishlist', label: 'Wishlist' },
    ],
  },
  {
    title: 'Care',
    links: [
      { to: '/shipping', label: 'Shipping' },
      { to: '/refund', label: 'Returns & Refunds' },
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
    ],
  },
];

export function Footer() {
  const { data: settings } = useSettings();
  const footer = (settings?.footer || {}) as Partial<Record<string, string>>;
  const socials = [
    { href: footer.instagram || settings?.social?.instagram, label: 'Instagram', Icon: Instagram },
    { href: footer.facebook || settings?.social?.facebook, label: 'Facebook', Icon: Facebook },
    { href: footer.twitter || settings?.social?.twitter, label: 'Twitter', Icon: Twitter },
  ].filter((s) => s.href);

  return (
    <footer className="on-nuit grain mt-auto overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="container relative z-[2] mx-auto px-5 md:px-12">
        {/* Invitation */}
        <div className="grid gap-10 border-b border-nuit-line py-16 md:grid-cols-[1.2fr_1fr] md:items-end md:py-24">
          <div>
            <p className="eyebrow mb-5 text-brass-light">Write to the house</p>
            <h2 className="display-md max-w-xl text-balance text-nuit-foreground">
              Need help choosing a scent? <em className="font-light">We would love to help.</em>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-6 md:items-end">
            <Link to="/contact" className="btn-ghost-maison text-nuit-foreground">
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
            {(footer.email || footer.phone) && (
              <div className="flex flex-col gap-1 text-sm text-nuit-muted md:text-right">
                {footer.email && <a href={`mailto:${footer.email}`} className="hover:text-nuit-foreground">{footer.email}</a>}
                {footer.phone && <a href={`tel:${footer.phone}`} className="hover:text-nuit-foreground">{footer.phone}</a>}
              </div>
            )}
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Monogram className="h-14 w-14 text-xl text-brass-light" />
            <p className="mt-6 max-w-xs font-display text-xl italic leading-snug text-nuit-muted">
              {settings?.hero?.title && settings?.hero?.subtitle
                ? `${settings.hero.title}. ${settings.hero.subtitle}.`
                : 'Luxury fragrances crafted with passion and precision.'}
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-nuit-line text-nuit-muted transition-colors hover:border-nuit-foreground hover:text-nuit-foreground"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.4} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-5 text-[10px] text-nuit-muted">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[15px] text-nuit-foreground/85 transition-colors hover:text-brass-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="relative z-[2] select-none px-2" aria-hidden="true">
        <p className="brand-wordmark whitespace-nowrap text-center text-[10.4vw] font-light leading-[0.8] !tracking-[0.04em] text-nuit-foreground/[0.07]">
          Myst Amoura
        </p>
      </div>

      <div className="container relative z-[2] mx-auto flex flex-col gap-2 border-t border-nuit-line px-5 py-6 text-xs text-nuit-muted md:flex-row md:items-center md:justify-between md:px-12">
        <p>© {new Date().getFullYear()} Mystamoura. All rights reserved.</p>
        <p>{footer.location || 'Mumbai, India'}</p>
      </div>
    </footer>
  );
}
