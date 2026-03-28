---
name: seo-audit
description: Audit and implement SEO for any frontend project covering meta tags, structured data, semantic HTML, and SPA rendering. Framework-agnostic -- works with Vue, Nuxt, React, Next, or static HTML. Use when the user asks about SEO, meta tags, Open Graph, JSON-LD, sitemap, robots.txt, or search indexing. Triggers on "SEO", "meta tags", "Open Graph", "JSON-LD", "sitemap", "robots.txt", "canonical", "indexing", "posicionamiento", "datos estructurados".
---

# SEO Audit - Technical and On-Page

Audit any frontend project for SEO issues and generate implementation fixes for meta tags, structured data, and technical SEO.

## Phase 1: Discover project context

1. **Framework**: Check `package.json` for Vue, Nuxt, Next, React, Astro, SvelteKit, or static HTML.
2. **Rendering mode**: Determine SPA, SSR, SSG, or hybrid.
   - Nuxt: check `nuxt.config.*` for `ssr`, `routeRules`, `nitro.prerender`
   - Next: check `next.config.*` for `output`, page-level data fetching
   - Vue SPA: check `index.html` for single mount point, no server rendering
   - Astro: check `astro.config.*` for `output` mode
3. **SEO library**: Check `package.json` and imports for:
   - `@unhead/vue` or `@vueuse/head` (Vue head management)
   - `vue-meta` (legacy Vue 2)
   - `react-helmet` or `react-helmet-async` (React)
   - `next/head` or `next/metadata` (Next.js built-in)
   - `useHead` in Nuxt (built-in composable)
   - None found = manual or missing entirely
4. **Existing meta setup**: Grep for `useHead`, `useSeoMeta`, `metadataService`, `<meta` in `src/` and `index.html`.
5. **Structured data**: Grep for `application/ld+json`, `schema.org`, `JSON-LD` in `src/`, `public/`.
6. **Sitemap and robots**: Check for `public/robots.txt`, `public/sitemap.xml`, generation plugins (`vite-plugin-sitemap`, `@nuxtjs/sitemap`, `next-sitemap`).
7. **i18n**: Check for `hreflang`, `vue-i18n`, `@nuxtjs/i18n`, `next-intl`.
8. **Router**: Check for history mode (not hash), trailing slash config, 404 handling.

## Phase 2: Audit checklist

### Meta tags

- [ ] `<title>` unique per page (50-60 chars recommended)
- [ ] `<meta name="description">` unique per page (120-160 chars)
- [ ] `<link rel="canonical">` present and correct on every page
- [ ] `<html lang="xx">` set correctly
- [ ] `<meta name="viewport">` present

### Open Graph

- [ ] `og:title` present per page
- [ ] `og:description` present per page
- [ ] `og:type` set (`website` for homepage, `article` for blog)
- [ ] `og:url` matches canonical
- [ ] `og:image` present (1200x630px recommended)
- [ ] `og:locale` set correctly
- [ ] `og:site_name` set

### Twitter Cards

- [ ] `twitter:card` set (`summary_large_image` recommended)
- [ ] `twitter:title`, `twitter:description`, `twitter:image` present

### Structured data (JSON-LD)

- [ ] `Organization` schema on homepage or site-wide
- [ ] `WebSite` schema with `SearchAction` if search exists
- [ ] `BreadcrumbList` on inner pages
- [ ] `BlogPosting` or `Article` on blog/article pages
- [ ] `Service` on service pages
- [ ] `FAQPage` on FAQ sections
- [ ] All JSON-LD validates (no syntax errors, required fields present)

### Semantic HTML

- [ ] Single `<h1>` per page
- [ ] Heading hierarchy sequential (h1 > h2 > h3, no skipping)
- [ ] Landmark elements used (`<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`)
- [ ] `<a>` tags have descriptive text (no "click here")
- [ ] External links have `rel="noopener"` or `rel="noopener noreferrer"`

### Image SEO

- [ ] All `<img>` have descriptive `alt` text
- [ ] Images have explicit `width` and `height` (CLS prevention)
- [ ] Modern formats used where possible (WebP, AVIF)
- [ ] Decorative images use `alt=""`
- [ ] `loading="lazy"` on below-fold images
- [ ] `fetchpriority="high"` on LCP image

### Technical SEO

- [ ] `robots.txt` exists and allows crawling of important paths
- [ ] `robots.txt` blocks admin/private paths
- [ ] Sitemap XML exists or is generated at build time
- [ ] Sitemap references all public routes
- [ ] No `noindex` on pages that should be indexed
- [ ] 404 page returns proper HTTP 404 status
- [ ] Trailing slashes consistent across all routes

### i18n SEO (if multilingual)

- [ ] `hreflang` tags present for all language variants
- [ ] `x-default` hreflang set
- [ ] `og:locale` and `og:locale:alternate` present
- [ ] Canonical URL correct per locale

### SPA-specific concerns

| Concern | Check |
|---------|-------|
| Crawlability | Is content available without JavaScript? SSR/SSG/prerender? |
| Meta tag timing | Are meta tags set before or after hydration? |
| Route changes | Does title and meta update on client navigation? |
| Dynamic routes | Do `/projects/:slug` pages have unique meta per slug? |
| History mode | Router uses history mode, not hash mode? |
| Server fallback | Server configured to serve index.html for all routes? |
| Prerender service | If pure SPA, is prerender.io or rendertron configured? |

## Anti-pattern detection — auto-severity

Grep for these patterns. Each match is automatic at the specified severity:

### CRITICAL (blocks indexing or causes SEO damage)

| Pattern to grep | Violation |
|-----------------|-----------|
| `<meta name="robots" content="noindex"` on public pages | Page blocked from indexing |
| No `<title>` tag in page/layout | Missing page title |
| Hash routing (`createWebHashHistory`, `HashRouter`) | Hash routes not indexable |
| Duplicate `<title>` across multiple pages | Identical titles hurt ranking |
| No `<html lang=` | Missing language declaration |
| `<h1` missing on a page | No primary heading for crawlers |
| Multiple `<h1>` on one page | Confused heading hierarchy |

### WARNING (degrades search visibility)

| Pattern to grep | Violation |
|-----------------|-----------|
| No `<meta name="description"` | Missing page description |
| No `og:image` on pages with social sharing potential | Poor social preview |
| No `<link rel="canonical"` | Risk of duplicate content |
| `<a` with text "click here", "read more", "learn more" (alone) | Non-descriptive link text |
| No `alt` on content images | Missing image SEO |
| No `application/ld+json` structured data | Missing rich results |
| Image without `width`/`height` | CLS risk hurts Core Web Vitals |
| No `robots.txt` in public/ | Missing crawler guidance |

### SUGGESTION (improves ranking signals)

| Pattern | Enhancement |
|---------|-------------|
| No `BreadcrumbList` JSON-LD on inner pages | Missing breadcrumb rich results |
| No `fetchpriority="high"` on LCP image | Suboptimal loading priority |
| No sitemap XML | Missing sitemap for discovery |
| Missing `hreflang` on multilingual sites | Poor language targeting |

## Pass/fail criteria

| Result | Condition |
|--------|-----------|
| **PASS** | Zero CRITICAL, fewer than 3 WARNING |
| **CONDITIONAL PASS** | Zero CRITICAL, 3+ WARNING |
| **FAIL** | Any CRITICAL finding |

---

## Phase 3: Implementation helpers

### JSON-LD templates

**Organization (site-wide)**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": ["https://linkedin.com/company/x", "https://github.com/x"]
}
```

**WebSite (homepage)**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Name",
  "url": "https://example.com"
}
```

**BreadcrumbList (inner pages)**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://example.com/services" }
  ]
}
```

**BlogPosting (articles)**
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article Title",
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-20",
  "author": { "@type": "Organization", "name": "Company Name" },
  "image": "https://example.com/article-cover.jpg",
  "description": "Article description"
}
```

**Service**
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "description": "What this service provides",
  "provider": { "@type": "Organization", "name": "Company Name" }
}
```

**FAQPage**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": { "@type": "Answer", "text": "Answer text." }
    }
  ]
}
```

### robots.txt template

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_nuxt/
Disallow: /.well-known/

Sitemap: https://example.com/sitemap.xml
```

### Vue SPA meta tag pattern (with @unhead/vue)

```js
import { useHead, useSeoMeta } from '@unhead/vue'

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: pageImage,
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: pageImage,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
```

### Meta tag length reference

| Tag | Recommended length | Display truncation |
|-----|-------------------|-------------------|
| `<title>` | 50-60 chars | Google truncates at ~60 |
| `meta description` | 120-160 chars | Google truncates at ~160 |
| `og:title` | 40-60 chars | Platform-dependent |
| `og:description` | 80-200 chars | Platform-dependent |
| `og:image` | 1200x630px | Minimum 600x315px |

## Phase 4: Report format

For each issue found:

```
[SEVERITY] file:line - Description
  Issue: what is wrong or missing
  Impact: effect on search visibility or crawling
  Fix: specific code change or implementation
```

Severity levels:
- `[CRITICAL]` - blocks indexing, breaks crawlability, or causes duplicate content
- `[WARNING]` - degrades search visibility or social sharing quality
- `[SUGGESTION]` - enhancement that improves ranking signals or rich results

### Audit summary table

After detailed findings, include a summary:

| Category | Status | Critical | Warnings | Suggestions |
|----------|--------|----------|----------|-------------|
| Meta tags | pass/fail | count | count | count |
| Open Graph | pass/fail | count | count | count |
| Structured data | pass/fail | count | count | count |
| Semantic HTML | pass/fail | count | count | count |
| Image SEO | pass/fail | count | count | count |
| Technical SEO | pass/fail | count | count | count |
| SPA rendering | pass/fail | count | count | count |
