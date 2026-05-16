---
name: mis-finanzas-design
description: Use this skill to generate well-branded interfaces and assets for Mis Finanzas — a modular, mobile-first, gamified personal dashboard (Finance / Health / Nutrition / lifestyle modules). Warm earthy palette (terracotta, parchment, olive, espresso). Use for production code, prototypes, mocks, marketing visuals, or one-off design artifacts.
user-invocable: true
---

# Mis Finanzas — Design Skill

Read the **README.md** in this skill first. It defines:
- The product context (a Spanish-language personal finance + lifestyle dashboard, modular by design)
- Voice & content rules (informal, diagnostic, sentence case, no emoji in product chrome)
- Visual foundations (warm earthy palette, large pebble cards, Material Symbols, soft shadows)
- The component vocabulary

Then explore the other files:
- **`colors_and_type.css`** — every token. Always reference semantic vars (`--brand-primary`, `--fg-1`, `--bg-raised`, `--shadow-md`) rather than raw palette (`--clay-500`).
- **`preview/`** — visual cards showing each token in use.
- **`ui_kits/finance/`** — pixel-faithful interactive recreation of the Finance module. Components in `ui_kits/finance/components/` are the reference implementations; copy and adapt.
- **`assets/`** — logos, grain overlay, icon usage map.

## When invoked

If the user gave a clear ask (e.g. "design the Health module dashboard"), proceed:
1. Copy `colors_and_type.css` (and any needed assets) into a working folder.
2. Build static HTML for visual artifacts; production JSX if the user is working in the codebase.
3. Use Material Symbols Outlined for all iconography (loaded via Google Fonts).
4. Use Plus Jakarta Sans + Instrument Serif + JetBrains Mono. Substitute only if explicitly asked.
5. Module accents follow the README's module-hue table (Finance=clay, Health=olive, Nutrition=amber, Fitness=plum, Mind=ink).

If the user invokes the skill with no guidance:
- Ask what they want to design — a module, a marketing visual, a slide deck, a real component for the codebase.
- Ask which lifestyle module (or "all").
- Ask whether copy should be Spanish (production register) or English (demo / marketing).
- Then proceed as an expert designer producing HTML artifacts or production code.

## Non-negotiables
- **Mobile-first.** Design at 360px first, enhance upward.
- **One primary hue per screen** at ≤5% coverage. Never two terracotta CTAs competing.
- **Sentence case.** Eyebrows are the only uppercase.
- **No emoji in product chrome.** Material Symbols only.
- **No bluish-purple gradients.** Warm gradients only (clay→amber), low contrast.
- **No hand-drawn SVG illustrations.** Empty states use Material Symbols at hero size.
- **Shadows are warm-cast** (rgba of `--ink-700`). Never bluish.
- **Cards lean large-radius** (24–32px). Pebbles, not chiclets.
