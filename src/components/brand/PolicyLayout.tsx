import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageHero } from './PageHero';
import { cn } from '@/lib/utils';

export interface PolicySection {
  title: string;
  body: ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  seoDescription: string;
  updated?: string;
  intro?: string;
  sections: PolicySection[];
}

const policies = [
  { to: '/shipping', label: 'Shipping' },
  { to: '/refund', label: 'Returns & Refunds' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms of Service' },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Shared frame for the legal & care pages: hero, sticky contents, ruled sections. */
export function PolicyLayout({ title, seoDescription, updated, intro, sections }: PolicyLayoutProps) {
  return (
    <MainLayout>
      <SEOHead title={title} description={seoDescription} />
      <PageHero
        eyebrow="Client care"
        title={title}
        description={intro}
        aside={updated && <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Last updated · {updated}</p>}
      />

      <div className="container mx-auto grid gap-12 px-5 py-14 md:px-12 md:py-24 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="space-y-10 lg:sticky lg:top-28">
            <nav aria-label="On this page" className="hidden lg:block">
              <p className="eyebrow mb-4 text-[10px] text-brass">On this page</p>
              <ol className="space-y-2.5">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <a href={`#${slug(s.title)}`} className="flex gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      <span className="tabular w-5 text-brass">{String(i + 1).padStart(2, '0')}</span>
                      {s.title.replace(/^\d+\.\s*/, '')}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <nav aria-label="Policies">
              <p className="eyebrow mb-4 text-[10px] text-brass">Policies</p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-2.5">
                {policies.map((p) => (
                  <li key={p.to}>
                    <NavLink
                      to={p.to}
                      className={({ isActive }) =>
                        cn(
                          'text-sm transition-colors max-lg:rounded-full max-lg:border max-lg:px-4 max-lg:py-2',
                          isActive ? 'text-foreground max-lg:border-foreground lg:underline lg:underline-offset-4' : 'text-muted-foreground hover:text-foreground'
                        )
                      }
                    >
                      {p.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <article className="lg:col-span-8 lg:col-start-5">
          {sections.map((s, i) => (
            <section key={s.title} id={slug(s.title)} className="scroll-mt-28 border-t py-10 first:border-t-0 first:pt-0 md:py-12">
              <div className="grid gap-4 md:grid-cols-[64px_1fr]">
                <span className="font-display text-3xl font-light italic text-brass">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="font-display text-[30px] leading-tight md:text-[36px]">{s.title.replace(/^\d+\.\s*/, '')}</h2>
                  <div className="maison-prose mt-4">{s.body}</div>
                </div>
              </div>
            </section>
          ))}
        </article>
      </div>
    </MainLayout>
  );
}
