# Raw research — Media generation strategy (2026-07-04)

> Agente de investigación Fable. Fuentes web verificadas + schemas MCP en vivo. Insumo para `docs/research/2026-07-04-fable-evolution.md`.

## (a) Capability map: what's actually connected in this Claude Code environment

### Adobe for Creativity MCP (verified against the live tool schemas, not marketing)

**Critical finding: this MCP has NO text-to-image generation tool.** `image_fill_area` is a *solid-color* fill into a mask — not Firefly generative fill with a prompt. The full inventory:

| Category | Tools (verified) | Notes |
|---|---|---|
| **Generative** | `image_generative_expand` | Outpainting around edges (up to 4096px/side), **accepts `seeds` for reproducibility**. Needs an input image — cannot create from nothing. |
| **Real photography** | `asset_search` + `asset_license_and_download_stock` | Search and license **Adobe Stock** at full resolution (presigned URL, licenses covered by the Adobe subscription, re-calls don't re-consume a license). The only "get a real photo" primitive — and a big one. |
| **Selection/compositing** | `image_select_subject`, `image_select_by_prompt`, `image_invert_selection`, `image_remove_background`, `change_background_color`, `image_fill_area` (solid color, blend modes, opacity) | Prompt-based masking ("the sky") + fills = real compositing pipeline. |
| **Color/tone** | `image_apply_preset` (100+ Lightroom presets: B&W, Grain, Style/cinematic/film-inspired, Adaptive; requires `image_list_presets` first, apply **only one**, they don't stack), `image_adjust_*` (exposure, highlights, HSL, temperature, vibrance, dark/light portions), `image_apply_auto_tone`, `image_apply_monochromatic_tint`, `image_apply_color_overlay` | Full grading chain. |
| **Texture/de-digitize** | `image_add_grain` (film grain 0–100; 40 moderate / 80 strong), `image_add_noise`, `image_apply_halftone`, `image_apply_glitch_effect`, `image_apply_gaussian_blur`, `image_apply_lens_blur` | Exactly the anti-AI-look toolkit. |
| **Vector** | `image_vectorize` | Raster → vector. |
| **Crop/format** | `image_crop_and_resize`, `image_crop_to_bounds`, `image_auto_straighten`, `image_generative_expand` for aspect conversion (crop tool emits `requires_expand_chain` hints) | |
| **Video** | `video_create_quick_cut`, `video_resize`, `video_render`, `video_render_frame`, `video_metadata` | Editing/rendering of existing footage — **no text-to-video generation tool**. |
| **Firefly Boards** | `create_firefly_board`, `boards_add_items_to_board` | Board creation/population; the *generation* (Firefly Image 5, partner models) happens in the Firefly web UI by the human. Handoff, not automation. |
| **Express/docs** | `export_html_to_express`, Express design tools, InDesign/PDF conversion, fonts | |

Context mid-2026: Firefly hosts 30+ models — Firefly Image Model 5, FLUX.2/Kontext, Ideogram 3.0, Runway Gen-4.5, Gen-4 Image, GPT Image, Gemini 3 "Nano Banana Pro", Imagen 4, Veo 3.1, Sora 2, Kling 3.0 — under one Creative Cloud subscription; Adobe runs an "unlimited image and video generations" promotion since Feb 2026 ([Adobe partner models](https://www.adobe.com/products/firefly/partner-models.html), [Firefly Boards partner models](https://helpx.adobe.com/firefly/web/create-mood-boards/firefly-boards/use-non-adobe-models-to-generate-images.html), [Adobe blog Mar 2026](https://blog.adobe.com/en/publish/2026/03/19/adobe-firefly-expands-video-image-creation-with-new-ai-capabilities-custom-models), [9to5Mac](https://9to5mac.com/2026/02/02/adobe-firefly-offers-unlimited-image-and-video-generations-third-party-models-included/)). But **none of that generation surface is exposed through this MCP** — it lives in the Firefly web app / Firefly Services API (separate enterprise product, [mcpmarket.com](https://mcpmarket.com/server/firefly-services)).

### Canva MCP

- `generate-design` / `generate-design-structured`: AI-generates full **designs** (posters, social posts, flyers, infographics, logos, docs — returns candidates, then `create-design-from-candidate`). Supports `brand_kit_id` and inserting uploaded assets (`asset_ids`, via `upload-asset-from-url`).
- `export-design`: PNG/JPG/PDF/PPTX/MP4 export → downloadable files.
- Editing transactions (`start/commit-editing-transaction`, `perform-editing-operations`), resize, brand templates, folders, comments.
- Canva's generation produces *composed layouts*; its AI imagery leans "stock-template" — usable for OG images/social cards, weaker as raw editorial photography. ([canva.dev/docs/mcp](https://www.canva.dev/docs/mcp/), [Canva AI Connector](https://www.canva.com/ai-connector/), [Canva + Claude](https://www.canva.com/newsroom/news/canva-claude-design/))

### Pencil MCP

Vector/wireframe design in .pen files, style guides, `export_nodes` (nodes → images/SVG assets). Good for **deterministic vector illustration authored by Claude itself** (no diffusion model), not for photography.

## (b) Recommendation: primary + fallback generation paths

**Within the current MCP set, Eros cannot autonomously run text-to-image.** Strategy: "real photography first, generation as escalation":

1. **PRIMARY — Adobe Stock + edit chain (fully autonomous, zero new cost).** `asset_search` → `asset_license_and_download_stock` → crop/`image_generative_expand` to layout aspect → grade with one Lightroom preset + adjustments → grain. Real photographs by definition don't look AI-generated — kills the "gradient placeholder = rejection" failure. Stock's generic look is fixed by the grading/crop pass, exactly how editorial art directors treat stock.
2. **SECONDARY — Firefly Boards handoff (human-in-loop, covered by Adobe subscription).** For imagery Stock can't provide: Eros writes the prompt pack, `create_firefly_board`, Mateo generates in Firefly web UI (currently unlimited; FLUX.2/Ideogram/Firefly 5 per shot), drops results back; Eros ingests and post-processes.
3. **TERTIARY — Canva `generate-design`** for composed graphics (OG images, social cards, simple posters); export PNG.
4. **VECTOR — Pencil-authored SVG** (Claude-drawn, deterministic) and `image_vectorize` for converting graded raster marks. If frequent standalone vector *illustration* is needed, Recraft is the only mainstream true-SVG generator ([Rangy](https://rangy.ai/blog/ideogram-vs-recraft-for-logos/), [ToolChase](https://toolchase.com/blog/ai-vector-design-recraft-guide/)) — paid API, open decision.
5. **VIDEO** — no autonomous generation path. Firefly web (Veo 3.1, Runway Gen-4.5, Kling 3.0, Sora 2) via the same Boards handoff; Adobe MCP handles quick-cut/resize/render. For most Eros sites, prefer WebGL/shader motion over generated video.

Alternatives: Flux 2 is the photorealism leader and runs locally in ComfyUI (Flux 2 Klein 4B/9B on 12–16GB VRAM, Dev on 24GB) — genuinely free autonomous path *if* the GPU qualifies ([NVIDIA](https://blogs.nvidia.com/blog/rtx-ai-garage-flux-2-comfyui/), [digitalapplied](https://www.digitalapplied.com/blog/local-image-generation-flux-stable-diffusion-comfyui-2026)). Midjourney still has **no official API** (V8.1, Apr 2026) ([apiframe](https://apiframe.ai/blog/best-midjourney-apis)); Reve tops blind photorealism arenas but is metered ([oakgen](https://oakgen.ai/blog/reve-image-1-review)).

## (c) De-AI-ing recipe

**Prompting rules** (for Firefly-Boards prompt packs) — [Delv](https://delv.tools/blog/ai-images-that-dont-look-ai-generated), [AVB](https://aivideobootcamp.com/blog/photorealistic-ai-prompts-guide-2026/), [Superfiles](https://superfiles.in/how-to-remove-ai-look-prompt-guide.php), [miraflow](https://miraflow.ai/blog/how-to-make-ai-images-look-like-real-photos-prompt-tricks):

1. Name a real camera/lens/film: "shot on Fujifilm X-T4, 56mm f/2.8" or "Kodak Portra 400" — film stocks carry color science + grain structure.
2. Ban the plastic triggers: never "4k, 8k, ultra HD, Unreal Engine, perfect lighting, hyperrealistic".
3. Request imperfection explicitly: "candid, unposed, slightly underexposed, visible skin texture, minor lens flare, motion blur on hands, overcast available light".
4. Compose off-center: "subject at left third, negative space right, cropped at the elbow" — kills the centered-symmetric AI default (also gives layout room for type).
5. Prefer environment over portrait glamour: interiors, hands, materials, half-turned subjects age better than faces.
6. Use Raw-style modes when available (FLUX1.1 Ultra Raw, MJ Raw).

**Post-process chain** (fully automatable via Adobe MCP — apply to *both* generated and stock images):

1. `image_crop_and_resize` — recrop to intentional, off-center editorial composition for the layout slot (`image_generative_expand` first if aspect flip would crop content).
2. `image_list_presets` → `image_apply_preset` — exactly one film-inspired / cinematic / B&W preset per brand (the project's "grade"); consistency across a site reads as art direction.
3. `image_adjust_*` fine pass — pull highlights down, mute vibrance/saturation slightly, shift temperature toward brand palette; `image_adjust_hsl` to unify hues.
4. `image_add_grain` at 30–45 — the single highest-leverage de-digitizer.
5. Optional texture identity per project: `image_apply_halftone` (print feel), `image_apply_monochromatic_tint` or low-opacity `image_apply_color_overlay` in multiply/soft-light (duotone), `image_apply_lens_blur` for depth imperfection.
6. In-page: CSS filter/blend layer matching brand tokens + subtle noise overlay, so imagery and UI share one atmosphere.

Rule of thumb: a duotone/graded/grainy image is simultaneously more "designed" and less identifiably AI — the treatments compound.

## (d) Asset metadata schema

One sidecar per asset, git-versioned (mirrors 2026 practice of immutable prompt artifacts in git — [Medium, Reproducible AI](https://medium.com/the-modern-scientist/reproducible-ai-versioning-models-prompts-and-data-96dd0337af65)):

```json
{
  "asset_id": "extra-hero-01_v3",
  "project": "extra",
  "slot": "hero/background",
  "kind": "photo | illustration | vector | texture | video",
  "source": {
    "type": "adobe_stock | firefly_web | canva | pencil | comfyui_local | manual",
    "stock_asset_id": null,
    "license": "adobe-stock-standard | generated | n/a",
    "model": "flux-2 | firefly-image-5 | ideogram-3 | null",
    "prompt": "full prompt text",
    "negative_prompt": null,
    "seed": 123456789,
    "generation_params": { "aspect": "21:9", "style_mode": "raw" }
  },
  "post_chain": [
    { "tool": "image_generative_expand", "args": { "left": 400, "right": 400 }, "seed": 42 },
    { "tool": "image_apply_preset", "args": { "presetName": "Style - Film Inspired 02" } },
    { "tool": "image_add_grain", "args": { "grainAmount": 40 } }
  ],
  "files": { "original": "…", "final": "…", "web_variants": ["…"], "hash_sha256": "…" },
  "review": {
    "status": "pending | approved | rejected",
    "rejection_reason": "too-AI | wrong-mood | composition | color-clash",
    "reviewer": "mateo | evaluator-agent",
    "date": "2026-07-04"
  },
  "learnings": ["Portra-style grade + grain 40 approved twice for dark editorial projects"]
}
```

`review.rejection_reason` + `learnings` let Eros's memory learn which generation/grading styles get approved. Adobe/Firefly outputs carry C2PA Content Credentials; keep originals so provenance is preserved.

## (e) Open decisions for Mateo

1. **GPU check for local ComfyUI + Flux 2** — if ≥12GB VRAM, the only *fully autonomous, zero-cost* text-to-image path.
2. **Accept the Firefly Boards human-in-loop step?** Breaks full autonomy (Eros pauses for Mateo to generate).
3. **Recraft paid API for native SVG illustration** — needs explicit sign-off.
4. **Confirm Adobe Stock licensing quota** on the plan (`get_account_type` can verify) — Stock-first assumes licenses effectively available.
5. **Firefly Services API** (enterprise, metered) would give true autonomous Firefly generation — flag only if 1–2 fail.
