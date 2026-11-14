#!/usr/bin/env node
/**
 * Post-build SEO step.
 *
 * The storefront is a client-rendered SPA, so crawlers and link-preview bots
 * (Google, WhatsApp, Instagram, Facebook) receive an empty <div id="root">.
 * This script runs after `vite build` and writes one static HTML file per
 * public route into dist/, each with:
 *   - route-specific <title>, description, canonical, Open Graph / Twitter tags
 *   - JSON-LD structured data (Organization, WebSite, Product, Breadcrumbs)
 *   - real, crawlable text content inside #root (React replaces it on mount)
 * It also regenerates dist/sitemap.xml with every product and collection URL.
 *
 * Product data is read from Supabase with the public (anon) key. If Supabase
 * is unreachable the build still succeeds with the static pages only.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = (process.env.SITE_URL || 'https://mystamoura.in').replace(/\/$/, '');
const SITE_NAME = 'Mystamoura';
const BRAND_NAME = 'Myst Amoura';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const INSTAGRAM_URL = 'https://www.instagram.com/mystamoura';

// ---------- env ----------
function loadDotEnv() {
  const file = path.join(ROOT, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadDotEnv();

// ---------- helpers ----------
const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const clip = (s = '', n = 158) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t;
};

const absUrl = (u) => {
  if (!u) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}/${u.replace(/^\//, '')}`;
};

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// ---------- data ----------
async function supabaseGet(table, query) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
  return res.json();
}

async function loadCatalog() {
  if (process.env.SEO_MOCK_DATA) {
    return JSON.parse(await readFile(process.env.SEO_MOCK_DATA, 'utf8'));
  }
  try {
    const [products, categories] = await Promise.all([
      supabaseGet(
        'products',
        'select=name,slug,description,notes,price,sale_price,currency,size,images,stock,sku,updated_at,category_id&is_visible=eq.true&order=created_at.desc',
      ),
      supabaseGet('categories', 'select=id,name,slug,description,image_url,updated_at&order=name.asc'),
    ]);
    return { products, categories };
  } catch (err) {
    console.warn(`[seo] Could not load catalog (${err.message}); generating static pages only.`);
    return { products: [], categories: [] };
  }
}

// ---------- page definitions ----------
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: BRAND_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  sameAs: [INSTAGRAM_URL],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: BRAND_NAME,
  url: SITE_URL,
};

const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: `${SITE_URL}${url}`,
  })),
});

const nav = `<nav><a href="/">Home</a> · <a href="/products">Shop all perfumes</a> · <a href="/about">About</a> · <a href="/contact">Contact</a></nav>`;
const footer = `<footer><p><a href="/shipping">Shipping</a> · <a href="/refund">Refunds</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="${INSTAGRAM_URL}">Instagram</a></p></footer>`;

const productLink = (p) => {
  const price = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
  return `<li><a href="/products/${esc(p.slug)}">${esc(p.name)}</a>${p.size ? ` (${esc(p.size)})` : ''} – ${inr(price)}</li>`;
};

function staticPages(products, categories) {
  const productList = products.length
    ? `<h2>Our perfumes</h2><ul>${products.map(productLink).join('')}</ul>`
    : '';
  const collectionList = categories.length
    ? `<h2>Collections</h2><ul>${categories
        .map((c) => `<li><a href="/collections/${esc(c.slug)}">${esc(c.name)}</a></li>`)
        .join('')}</ul>`
    : '';

  return [
    {
      route: '/',
      title: `${SITE_NAME} (${BRAND_NAME}) | Luxury Perfumes & Parfums in India`,
      description:
        'Mystamoura (Myst Amoura) crafts long-lasting luxury perfumes and parfums for him, her and unisex. Shop online in India with free shipping.',
      jsonLd: [orgJsonLd, websiteJsonLd],
      body: `<h1>${SITE_NAME} – Luxury Perfumes by ${BRAND_NAME}</h1><p>Long-lasting luxury perfumes and parfums for him, her and unisex, crafted in India. Free shipping across India.</p>${productList}${collectionList}`,
    },
    {
      route: '/products',
      title: `Shop All Perfumes | ${SITE_NAME}`,
      description: 'Browse every Mystamoura perfume and parfum – luxury fragrances for men, women and unisex, with free shipping in India.',
      jsonLd: [breadcrumbs([['Home', '/'], ['Shop', '/products']])],
      body: `<h1>Shop all Mystamoura perfumes</h1>${productList || '<p>Browse our full collection of luxury fragrances.</p>'}${collectionList}`,
    },
    {
      route: '/about',
      title: `About ${SITE_NAME} | The Story of ${BRAND_NAME}`,
      description: 'Discover the story behind Mystamoura (Myst Amoura), an Indian luxury perfume house crafting long-lasting parfums.',
      jsonLd: [orgJsonLd],
      body: `<h1>About ${SITE_NAME}</h1><p>${BRAND_NAME} is an Indian luxury perfume house crafting long-lasting parfums.</p>`,
    },
    {
      route: '/contact',
      title: `Contact Us | ${SITE_NAME}`,
      description: 'Get in touch with Mystamoura for orders, fragrance advice, gifting and bulk enquiries.',
      body: `<h1>Contact ${SITE_NAME}</h1><p>Questions about an order, a fragrance or gifting? Reach out to us, or message us on <a href="${INSTAGRAM_URL}">Instagram</a>.</p>`,
    },
    { route: '/shipping', title: `Shipping Policy | ${SITE_NAME}`, description: 'Mystamoura shipping policy – delivery times and free shipping across India.', body: `<h1>Shipping Policy</h1>` },
    { route: '/refund', title: `Refund & Return Policy | ${SITE_NAME}`, description: 'Mystamoura refund, return and exchange policy.', body: `<h1>Refund &amp; Return Policy</h1>` },
    { route: '/privacy', title: `Privacy Policy | ${SITE_NAME}`, description: 'How Mystamoura collects, uses and protects your information.', body: `<h1>Privacy Policy</h1>` },
    { route: '/terms', title: `Terms & Conditions | ${SITE_NAME}`, description: 'Terms and conditions for shopping at Mystamoura.', body: `<h1>Terms &amp; Conditions</h1>` },
  ];
}

function productPage(p, categoriesById) {
  const category = categoriesById.get(p.category_id);
  const onSale = p.sale_price && p.sale_price < p.price;
  const price = onSale ? p.sale_price : p.price;
  const images = (p.images || []).filter(Boolean).map(absUrl);
  const desc =
    clip(p.description) ||
    `Buy ${p.name}${p.size ? ` ${p.size}` : ''} by Mystamoura – a long-lasting luxury fragrance. Free shipping in India.`;
  const url = `/products/${p.slug}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: clip(p.description, 500) || desc,
    image: images.length ? images : [DEFAULT_IMAGE],
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(p.sku ? { sku: p.sku } : {}),
    ...(category ? { category: category.name } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${url}`,
      priceCurrency: p.currency || 'INR',
      price: String(price),
      availability:
        p.stock === null || p.stock === undefined || p.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };

  const crumbs = [['Home', '/'], ['Shop', '/products']];
  if (category) crumbs.push([category.name, `/collections/${category.slug}`]);
  crumbs.push([p.name, url]);

  return {
    route: url,
    title: `${p.name}${p.size ? ` ${p.size}` : ''} | ${SITE_NAME} Perfume`,
    description: desc,
    image: images[0],
    type: 'product',
    price,
    currency: p.currency || 'INR',
    jsonLd: [productJsonLd, breadcrumbs(crumbs)],
    body: `<h1>${esc(p.name)}</h1>${p.size ? `<p>Size: ${esc(p.size)}</p>` : ''}<p>Price: ${inr(price)}${onSale ? ` (was ${inr(p.price)})` : ''}</p>${p.description ? `<p>${esc(p.description)}</p>` : ''}${p.notes ? `<h2>Fragrance notes</h2><p>${esc(p.notes)}</p>` : ''}${images[0] ? `<img src="${esc(images[0])}" alt="${esc(p.name)} perfume bottle by Mystamoura" width="600" />` : ''}`,
  };
}

function collectionPage(c, products) {
  const items = products.filter((p) => p.category_id === c.id);
  return {
    route: `/collections/${c.slug}`,
    title: `${c.name} Perfumes | ${SITE_NAME}`,
    description: clip(c.description) || `Shop the ${c.name} collection of luxury perfumes by Mystamoura.`,
    image: c.image_url ? absUrl(c.image_url) : undefined,
    jsonLd: [breadcrumbs([['Home', '/'], ['Shop', '/products'], [c.name, `/collections/${c.slug}`]])],
    body: `<h1>${esc(c.name)}</h1>${c.description ? `<p>${esc(c.description)}</p>` : ''}${items.length ? `<ul>${items.map(productLink).join('')}</ul>` : ''}`,
  };
}

// ---------- rendering ----------
function setTag(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html.replace('</head>', `  ${replacement}\n</head>`);
}

function render(template, page) {
  const canonical = `${SITE_URL}${page.route === '/' ? '/' : page.route}`;
  const title = esc(page.title);
  const description = esc(page.description);
  const image = esc(page.image || DEFAULT_IMAGE);
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`);
  html = html.replace(/<meta\s+name="keywords"[\s\S]*?\/>\s*/, '');
  html = setTag(html, /<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${canonical}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${title}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${description}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*\/>/, `<meta property="og:type" content="${page.type || 'website'}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${canonical}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*\/>/, `<meta property="og:image" content="${image}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${title}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${description}" />`);
  html = setTag(html, /<meta name="twitter:image"[^>]*\/>/, `<meta name="twitter:image" content="${image}" />`);

  const extraHead = [];
  if (page.type === 'product' && page.price) {
    extraHead.push(`<meta property="product:price:amount" content="${page.price}" />`);
    extraHead.push(`<meta property="product:price:currency" content="${page.currency}" />`);
  }
  for (const data of page.jsonLd || []) {
    extraHead.push(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`);
  }
  if (extraHead.length) html = html.replace('</head>', `  ${extraHead.join('\n  ')}\n</head>`);

  // Crawlable content, kept invisible so visitors see a blank page until the
  // app loads (same as before). Crawlers read it from the HTML, and
  // createRoot().render() replaces #root's children when the app mounts.
  const content = `<div class="seo-prerender" style="visibility:hidden">${nav}<main>${page.body}</main>${footer}</div>`;
  html = html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${content}</div>`);
  return html;
}

function outFile(route) {
  if (route === '/') return path.join(DIST, 'index.html');
  // Cloudflare Pages / Workers assets serve `/about` from `about.html`.
  return path.join(DIST, `${route.replace(/^\//, '')}.html`);
}

function sitemap(pages, products, categories) {
  const lastmod = new Map();
  for (const p of products) if (p.updated_at) lastmod.set(`/products/${p.slug}`, p.updated_at.slice(0, 10));
  for (const c of categories) if (c.updated_at) lastmod.set(`/collections/${c.slug}`, c.updated_at.slice(0, 10));
  const priority = (r) =>
    r === '/' ? '1.0' : r === '/products' ? '0.9' : r.startsWith('/products/') ? '0.8' : r.startsWith('/collections/') ? '0.7' : ['/about', '/contact'].includes(r) ? '0.6' : '0.3';
  const urls = pages
    .map((p) => {
      const lm = lastmod.get(p.route);
      return `  <url>\n    <loc>${SITE_URL}${p.route === '/' ? '/' : p.route}</loc>${lm ? `\n    <lastmod>${lm}</lastmod>` : ''}\n    <priority>${priority(p.route)}</priority>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// ---------- main ----------
async function main() {
  const templatePath = path.join(DIST, 'index.html');
  if (!existsSync(templatePath)) throw new Error('dist/index.html not found – run `vite build` first.');
  const template = await readFile(templatePath, 'utf8');

  const { products, categories } = await loadCatalog();
  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  const pages = [
    ...staticPages(products, categories),
    ...products.filter((p) => p.slug).map((p) => productPage(p, categoriesById)),
    ...categories.filter((c) => c.slug).map((c) => collectionPage(c, products)),
  ];

  for (const page of pages) {
    const file = outFile(page.route);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, render(template, page));
  }
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap(pages, products, categories));

  console.log(`[seo] Prerendered ${pages.length} pages (${products.length} products, ${categories.length} collections) and sitemap.xml`);
}

main().catch((err) => {
  console.error('[seo] Prerender failed:', err);
  // Never block a deploy because of SEO extras.
  process.exit(0);
});
