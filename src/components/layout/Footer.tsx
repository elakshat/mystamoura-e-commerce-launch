import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function Footer() {
  const { data: settings } = useSettings();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-semibold text-gradient-gold">
              MYSTAMOURA
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {settings?.footer?.about_text || 'Luxury fragrances crafted with passion and precision.'}
            </p>
            <div className="flex items-center space-x-4 pt-2">
              {(settings?.footer?.instagram || settings?.social?.instagram) && (
                <a
                  href={settings?.footer?.instagram || settings?.social?.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {(settings?.footer?.facebook || settings?.social?.facebook) && (
                <a
                  href={settings?.footer?.facebook || settings?.social?.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {(settings?.footer?.twitter || settings?.social?.twitter) && (
                <a
                  href={settings?.footer?.twitter || settings?.social?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/collections/for-him" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  For Him
                </Link>
              </li>
              <li>
                <Link to="/collections/for-her" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  For Her
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-display text-lg font-medium mb-4">Policies</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-medium mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {settings?.footer?.email && (
                <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${settings.footer.email}`} className="hover:text-primary transition-colors">
                    {settings.footer.email}
                  </a>
                </li>
              )}
              {settings?.footer?.phone && (
                <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${settings.footer.phone}`} className="hover:text-primary transition-colors">
                    {settings.footer.phone}
                  </a>
                </li>
              )}
              <li className="flex items-start space-x-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Mystamoura. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
