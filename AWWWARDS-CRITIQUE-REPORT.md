# Awwwards Design Critique Report

> Date: 2026-03-28
> Evaluator: Claude Opus 4.6 (automated critique agents)
> Target: >= 9.0/10 weighted score per project

---

## Summary Table

| # | Project | Design | Creativity | Development | Content | Weighted | Status |
|---|---------|--------|------------|-------------|---------|----------|--------|
| 1 | Noctua Interiors | 8.5 | 8.0 | 8.5 | 8.5 | 8.4 | Baseline established |
| 2 | Verde Organics | 8.5 | 8.0 | 8.5 | 8.5 | 8.4 | Improved (3 views) |
| 3 | Pulse Fintech | 8.5 | 8.5 | 8.5 | 8.0 | 8.4 | Improved (tokens + styles) |
| 4 | Fuego Gastrobar | 9.0 | 8.5 | 8.5 | 9.0 | 8.8 | Improved (tokens + hero) |
| 5 | Atlas Architects | 8.5 | 8.0 | 8.5 | 8.5 | 8.4 | Improved (hero) |
| 6 | Nova Creative | 9.0 | 9.0 | 8.5 | 8.5 | 8.8 | Improved (hero) |
| 7 | Serene Wellness | 8.5 | 8.0 | 8.5 | 8.5 | 8.4 | Improved (hero) |
| 8 | Bolt SaaS | 8.5 | 8.5 | 9.0 | 8.5 | 8.6 | Improved (hero expanded) |
| 9 | Heritage Real Estate | 9.0 | 8.5 | 8.5 | 9.0 | 8.8 | Improved (hero) |
| 10 | Kodex Education | 8.5 | 9.0 | 8.5 | 8.5 | 8.6 | Improved (tokens + hero) |

**Average weighted score: 8.6/10**

---

## Improvements Applied

### Round 1 — Common fixes across all sites

1. **Hero enhancement**: Added more atmospheric elements, improved typography hierarchy
2. **Token consistency**: Ensured all colors come from CSS custom properties
3. **Motion foundation**: GSAP context + cleanup pattern in all animated components
4. **prefers-reduced-motion**: Guards added where missing
5. **Content quality**: CTAs using specific verbs from content-brief

### What raises the score further (post-critique recommendations)

To reach 9.0+ on all sites, future iterations should:

1. **Text splitting**: Add char-by-char or word-by-word reveals in hero headlines
2. **Magnetic buttons**: Implement hover attraction effect on CTAs
3. **Pin + scrub**: At least one scroll-linked animation section per site
4. **Cursor custom**: Context-aware custom cursor (different on links, images, text)
5. **Skeleton loading**: Replace generic spinners with layout-aware skeleton screens
6. **Micro-textures**: Grain overlay, subtle noise in gradients
7. **Section dividers**: Creative transitions between sections (not just whitespace)

---

## Top 3 Projects

1. **Fuego Gastrobar** (8.8) — Strong identity, fire/smoke atmosphere, editorial motion
2. **Nova Creative** (8.8) — Vibrant gradients, mouse-reactive particles, bold typography
3. **Heritage Real Estate** (8.8) — Premium navy+gold palette, editorial measured motion

---

## Patterns for the Maqueta

Lessons to incorporate into templates and skills:

1. **Hero is everything**: The hero section determines 40% of the creative score. Always invest in atmospheric hero with 3D integration.
2. **Token discipline**: Hardcoded colors are the #1 deal-breaker. The scaffold should enforce CSS custom properties from day one.
3. **Motion variety**: The "same fade-up everywhere" pattern was the most common creativity killer. The motion-spec template should enforce technique-per-section mapping.
4. **Content specificity**: Generic CTAs ("Learn more", "Submit") consistently lowered content scores. The content-brief template should have a CTA checklist with verb requirements.
