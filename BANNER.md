# Banner & Social Preview

JobPrep's visual identity is an **indigo → emerald triptych** representing the
three product pillars: **CV Builder**, **live AI mock-interview avatar**, and
**Code Arena**.

- Hero / social preview placeholder: [`assets/banner.svg`](assets/banner.svg) (1280×640),
  referenced from the README so it never 404s or rate-limits.
- Palette: indigo `#4f46e5` → violet `#7c3aed` → emerald `#10b981` on near-black `#0a0a0f`.

---

## Final image-gen prompt (copy/paste)

> Generate with the `brandkit` skill, then save **two** files: a 1280×640
> `assets/banner.png` (set as GitHub Settings → Social preview) and a wider
> hero `assets/banner-hero.png` for the top of the README.

```
A dark editorial product banner for "JobPrep AI", composed as a three-panel
triptych on a near-black background (#0a0a0f) with a soft left-to-right gradient
flowing indigo (#4f46e5) → violet (#7c3aed) → emerald (#10b981).

Panel 1 (left, indigo): a clean ATS-style CV / resume document with subtle
type-setting lines and a highlighted skills row — the "CV Builder" pillar.

Panel 2 (center, violet, largest): a live mock-interview scene — a glowing
photorealistic AI avatar head framed in a video-call window with a waveform and
a small real-time-feedback chip — the "live AI interview" pillar.

Panel 3 (right, emerald): a dark code editor with a monospaced challenge and a
green "Accepted" check — the "Code Arena" pillar.

Thin luminous dividers separate the panels. Wordmark "JobPrep AI" set in a
modern geometric sans, white, lower-left, with the tagline "Multi-AI career prep
— Claude · GPT · Gemini · Ollama" in muted grey. Premium, restrained, high
contrast; subtle grain; no stock-photo people, no clutter, no rainbow gradients.
Aspect ratio 2:1, 1280×640.
```

---

## Checklist

- [ ] Run the prompt above (`brandkit`) → save `assets/banner.png` (1280×640) + `assets/banner-hero.png`.
- [ ] Set `assets/banner.png` as the GitHub **Social preview** (Settings → Social preview).
- [ ] Update the README `<img>` to point at the final PNG (currently `assets/banner.svg`).
- [ ] Add per-feature screenshots/GIFs (CV builder, live interview, code arena)
      under `docs/screenshots/` and reference them in the README.

Until the brandkit assets are produced, the README references the committed SVG
placeholder.
