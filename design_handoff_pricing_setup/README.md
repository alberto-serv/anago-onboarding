# Handoff: Anago Pricing Setup (Rate Card Console)

## Overview
This package documents the **Pricing Setup** screen of the Anago Franchisee Console — the admin surface where a franchisee sets the two inputs that drive every instant quote their customers see:

1. An **hourly wage** per facility type (what the crew bills at), and
2. A set of **monthly minimums** per visit-frequency (price floors that protect small jobs).

These two inputs are set for each of the **12 priceable facility types**. Production rates (sq ft per labor-hour) and service packages are owned by Anago corporate and are **read-only** here. A live **Quote Preview** on each facility shows exactly how the franchisee's wage + minimums translate into per-visit and monthly prices across frequencies, for both after-hours and during-business-hours cleaning.

This is the upstream configuration screen for the customer-facing **Booking Flow** (handled in a separate handoff). The pricing math here must stay in sync with the booking app's quote engine.

## About the Design Files
The file in this bundle — `Anago Pricing Setup.html` — is a **design reference created in HTML/CSS/vanilla JS**. It is a working prototype that shows the intended look and behavior, **not production code to ship verbatim**. Recreate it inside the target codebase using that codebase's established environment and patterns (the surrounding app appears to be **Next.js + React**; pricing constants live in `lib/cleaning-data.ts`, referenced throughout the prototype). Lift the exact tokens, type rules, component specs, and — critically — the **pricing formulas** documented below, then re-implement with the codebase's real components, theme layer, and state management.

If the repo already has a theme/token layer (`globals.css`, `tailwind.config.*`, a `theme.ts`, CSS variables), update **that** layer first so the brand cascades rather than hand-styling each component. The pricing logic should be lifted into / kept consistent with `lib/cleaning-data.ts` — see **Pricing Engine** below.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, interactions, and pricing math are all specified. Recreate pixel-accurately using the codebase's existing libraries.

---

## Pricing Engine (most important section)

All money is computed client-side from a small number of inputs. There are **two pricing modes** depending on the cleaning time-window.

### Inputs
- `wage` — franchisee-set $/hr for the facility type (default **$25.00**).
- `minimum[freq]` — franchisee-set monthly floor for a given frequency (`0`/blank = no floor).
- `rates[density]` — **corporate-owned**, read-only. Per facility type, a `[fast, slow]` pair of **sq ft per labor-hour** for each density (`low` / `medium` / `high`). Higher density ⇒ slower ⇒ pricier. See the catalog table below.
- `sqft` — facility size (preview control).
- `density` — soil/traffic level: `low` (Light) / `medium` (Standard) / `high` (Busy).
- `visitsPerMonth` — derived from frequency (see frequency table).
- `hoursPerDay` — only for during-business-hours (day cleaning) mode.

### Mode A — After hours (production-rate based)
Mirrors `getProductionPrice` in `lib/cleaning-data.ts`. The job is priced from how many labor-hours it takes to clean `sqft` at the corporate production rate, billed at `wage`.

```
fast, slow   = rates[density]          // sq ft per labor-hour
perVisitLow  = (sqft / fast) * wage
perVisitHigh = (sqft / slow) * wage
perVisit     = (perVisitLow + perVisitHigh) / 2     // midpoint

rawMonthly   = perVisit * visitsPerMonth            // (computed via raw low/high midpoint)
monthly      = max(minimum, rawMonthly)             // floor applied
floored      = minimum > rawMonthly                 // true ⇒ highlight row
```
Exact prototype form (low/high computed then averaged, to avoid rounding drift):
```js
rawLow   = (sqft/fast) * visitsPerMonth * wage;
rawHigh  = (sqft/slow) * visitsPerMonth * wage;
rawPoint = (rawLow + rawHigh) / 2;
monthly  = Math.max(minimum, rawPoint);
```

### Mode B — During business hours / day cleaning (hours based)
Mirrors `getPriceForHours`. No production rate — the customer keys in **hours per day**, billed straight at the wage. Per-visit is **frequency-independent**.

```
perVisit   = hoursPerDay * wage
rawMonthly = hoursPerDay * visitsPerMonth * wage
monthly    = max(minimum, rawMonthly)
floored    = minimum > rawMonthly
```

All displayed dollars are **rounded to whole dollars** (`Math.round`) and formatted `en-US` with thousands separators.

### Facility catalog (12 types — `id`, name, profile, corporate `rates`)
`rates` = `{ density: [fast, slow] }` in **sq ft per labor-hour**. These are read-only / corporate-owned.

| id | Name | Profile | low [fast,slow] | medium | high |
|---|---|---|---|---|---|
| `office` | Office Building | Office | 3500, 3000 | 3000, 2500 | 2500, 2000 |
| `medical` | Medical Office | Office · sterile | 3500, 3000 | 3000, 2000 | 2000, 1500 |
| `restaurant` | Restaurant | Restaurant | 3000, 2000 | 2000, 1500 | 1500, 1000 |
| `retail` | Retail | Retail | 3000, 2000 | 2000, 1500 | 1500, 1000 |
| `warehouse` | Warehouse | Warehouse | 3000, 2500 | 2500, 1500 | 2000, 1000 |
| `fitness` | Fitness Center | Retail | 2500, 2000 | 2000, 1500 | 1500, 1000 |
| `school` | School / Educational | Office | 3000, 2500 | 2500, 1500 | 2000, 1000 |
| `multiTenant` | Multi-Tenant Building | Office | 3000, 2000 | 2500, 1500 | 2000, 1000 |
| `autoDealership` | Auto / Car Dealership | Retail | 3500, 2500 | 3000, 2000 | 2000, 1500 |
| `worship` | Church / Worship | Office | 3500, 2500 | 3000, 2000 | 2500, 1500 |
| `government` | Government Building | Office | 3500, 3000 | 3000, 2500 | 2500, 2000 |
| `manufacturing` | Manufacturing Facility | Warehouse | 3000, 2500 | 2500, 1500 | 2000, 1000 |

### Frequency table (`visitsPerMonth` is verbatim from the source sheet)
Two groups: **monthly** and **weekly**.

| id | Label | Short | visitsPerMonth (`v`) | group |
|---|---|---|---|---|
| `1x-month` | 1× / Month | 1×/mo | 1 | monthly |
| `2x-month` | 2× / Month | 2×/mo | 2 | monthly |
| `1x-week` | 1× / Week | 1×/wk | 4.33 | weekly |
| `2x-week` | 2× / Week | 2×/wk | 8.66 | weekly |
| `3x-week` | 3× / Week | 3×/wk | 13 | weekly |
| `4x-week` | 4× / Week | 4×/wk | 17.33 | weekly |
| `5x-week` | 5× / Week | 5×/wk | 21.65 | weekly |
| `6x-week` | 6× / Week | 6×/wk | 26 | weekly |
| `7x-week` | 7× / Week | 7×/wk | 30.33 | weekly |

### Anago default minimums (sheet column K — identical on every industry tab)
Default wage is **$25**. Defaults only set floors on four frequencies; the rest are unfloored (`0`/blank):
```
1x-month: 155    2x-month: 295    1x-week: 385
2x-week:  0      3x-week:  0      4x-week: 0
5x-week:  825    6x-week:  0      7x-week: 0
```

The preview table shows a fixed subset of frequencies: `["1x-month","2x-month","1x-week","3x-week","5x-week"]`.

---

## Design Tokens

### Color
| Token | Hex | Role |
|---|---|---|
| `--navy` | `#193253` | Primary. Headlines, primary buttons, facility icons (closed), avatar, billed amounts |
| `--navy-deep` | `#102138` | Hover on navy buttons |
| `--orange` | `#F7A11D` | Accent. Active facility icon, ON toggles, floored-row highlight, save CTA, brand spark |
| `--orange-deep` | `#E08F12` | Links, small accent labels, floored billed text, "min" flag |
| `--cream` | `#FDE09A` | Warm anchor of brand gradient |
| `--sky` | `#DCF1F9` | Cool anchor of brand gradient |
| `--ink` | `#193253` | Heading text (= navy) |
| `--body` | `#41506A` | Body text (slate) |
| `--muted` | `#8893A6` | Captions, labels, placeholders, raw/labor numbers |
| `--line` | `#E7E3DA` | Card borders, dividers, field borders |
| `--line-soft` | `#EFECE4` | Subtle separators, panel top borders |
| `--paper` | `#F7F6F1` | Inset blocks (wage block, count pill, chev hover) |
| Page bg | `#F4F2EC` | App background (warm off-white, NOT pure white) |

**Brand gradients:**
```css
--band:      linear-gradient(100deg, #FBE4B0 0%, #FFFDF8 48%, #DDF0FA 100%); /* formula strip */
--band-soft: linear-gradient(100deg, #FFF6E2 0%, #FFFFFF 50%, #EFF8FC 100%); /* quote preview panel */
```

**Shadows:**
```css
--shadow:    0 18px 50px rgba(25,50,83,.10);   /* open facility card */
--shadow-sm: 0 6px 20px  rgba(25,50,83,.07);   /* default cards, toolbar, formula strip */
```

### Typography
```html
<link href="https://fonts.googleapis.com/css2?family=Special+Gothic+Condensed+One&family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
```
- **Display — `Special Gothic Condensed One`** (weight 400 only, UPPERCASE, line-height 0.94, letter-spacing 0.01em): page H1 ("Set Your Rates"), facility names, save/collapse button labels.
- **Text — `Libre Franklin`** (300–800 + italic 400): everything else. Body 17px / line-height 1.6.
- Eyebrow/label pattern: 11px, weight 800, letter-spacing 0.13–0.16em, UPPERCASE, `--muted` (or `--orange-deep` for active).

### Radius & spacing
- Card / panel radius **18px**; toolbar/formula strip **16–18px**; inset blocks **14px**; fields **10px**; pills/buttons **30–44px** (fully round).
- Content max-width **1080px**, side padding **28px**.
- Facility icon tile **50×50**, radius 13px. Avatar **38px** circle. Toggle switch **42×24**, knob 18px.

---

## Screen anatomy

The page is a single scrolling column (max-width 1080px) with a sticky top bar and a fixed bottom save bar.

### 1. Top bar (sticky)
- Left: Anago logo (`assets/anago-logo.png`, height 42px) · 1px divider · portal label "Franchisee Console" (11px/800/uppercase muted) with "Pricing Setup" beneath (14px/700 navy).
- Right: account block — "Riverside Anago" (13.5px/700 navy) / "Master franchise · Region 14" (12px muted), then a 38px navy avatar circle reading "RA".
- Background `rgba(255,255,255,.94)` + `backdrop-filter: blur(8px)`, 1px soft bottom border, height 72px.

### 2. Page header
- Breadcrumb "**Pricing** / Rate Card Setup" (12px/700; "Pricing" in `--orange-deep`).
- H1 "Set Your Rates" (display, `clamp(38px,5.4vw,58px)`, navy).
- Intro paragraph (17px, `--body`, max 62ch) explaining the two-number model and that production rates/packages are corporate-fixed.

### 3. Toolbar (white card)
- Label "Default hourly wage" + a small money field (`$ [25] / hr`).
- Navy **"Apply to all 12"** button (down-into-tray icon) — pushes the default wage to all facilities.
- Right side: a **count pill** ("12 of 12 shown", orange dot ::before) and a text link **"Reset to Anago defaults"** (circular-arrow icon, `--orange-deep`).

### 4. Facility cards (×12, accordion)
Each is a collapsible `section.fac`. **Collapsed bar** is a 5-column grid: icon tile · name+tag · snapshot (right-aligned "$25 / hr") · visibility toggle ("Shown/Hidden" label + switch) · 34px circular chevron. Open state lifts shadow, turns the icon tile orange, rotates chevron 180°.

**Open panel** is a 2-column grid (`300px 1fr`, collapses to 1 col under 820px):
- **Column 1 — Hourly wage** (badge "1"): inset `--paper` block with a large money field (24px/800 input, `$ [25] / hr`) + hint text.
- **Column 2 — Monthly minimums** (badge "2"): a 2×N grid, "Monthly visits" group and "Weekly visits" group, each row = short freq label + money field (`$ [v] / mo`, placeholder "None"). Blank/zero rows render with a **dashed** border + tinted bg (`.off`) and the note: "Leave a field blank for no floor — that frequency then bills at pure labor cost."
- **Quote Preview** (full-width, `--band-soft` panel, collapsible): controls row = After hours / Business hours pill toggle, density pills (Light/Standard/Busy), sqft `<select>`, hours/day `<select>`. A `data-win` attribute on the preview swaps which controls show (business hours hides density+sqft; after hours hides hours). Table columns: **Frequency · Per visit · Labor / mo · Your min · Billed / mo**. Rows where the minimum lifts the price get the `.floored` class (orange billed text + "min" flag chip + tinted row). A basis line below restates the formula in words; a footer legend explains the highlight.

**Hidden facility** (`shown=false`): card bg `#FBFAF7`, icon tile goes grey, name greys out, snapshot at 50% opacity. Switch label flips to "Hidden".

### 5. Save bar (fixed bottom)
- Left: status indicator — dot + text. **Saved** = green dot + "All changes saved"; **Dirty** = orange dot + "**Unsaved changes** — review and save your rate card".
- Right: ghost **"Collapse all"** (toggles to "Expand all") + orange **"Save rate card"** (display font, disk icon, disabled when not dirty).
- `rgba(255,255,255,.95)` + blur, 1px top border, upward shadow. Body has `padding-bottom: 140px` so content clears it.

### 6. Toast
Navy pill, bottom-center, slides up + fades in for ~2.2s on apply / reset / save / etc.

---

## Interactions & Behavior
- **Accordion:** clicking a facility bar toggles `.open` (but clicks on the visibility switch are stopped from toggling). First card opens by default on load.
- **Live recompute:** any wage or minimum input fires `renderFac(id)` — recomputes the snapshot + the whole preview table for that facility only (event-delegated `input`; inputs are never re-rendered, preserving focus/caret).
- **Apply to all 12:** copies the toolbar default wage into every facility's wage (state + inputs) and re-renders.
- **Reset to Anago defaults:** `confirm()` then restores wage ($25), all minimums, density (medium), sqft (5000), window (after), hours (2), visibility (all shown).
- **Visibility toggle:** flips `shown[id]`, regreys the card, updates the "N of 12 shown" pill, marks dirty.
- **Preview controls** (per facility): window pill / density pills / sqft select / hours select each update `state._prev[id]` and re-render just that table. These are preview-only and do **not** mark the rate card dirty.
- **Dirty tracking:** any wage/min/visibility change sets dirty → status flips to orange, Save enabled. Save persists and flips back to green.
- **Quote-preview collapse:** independent chevron toggles `.prev.open`.

## State Management
Single in-memory `state` object, persisted to `localStorage`:
- `wage[catId]` — number ($/hr)
- `min[catId][freqId]` — number ($/mo, 0 = no floor)
- `shown[catId]` — boolean
- `_prev[catId]` — `{ sqft, density, window, hours }` (preview UI state; **not** persisted in the saved payload)
- `dirty` — boolean

**Persistence key:** `localStorage["anago-pricing-setup-v1"]`. Saved payload = `{ wage, min, shown }` only. On load, the prototype merges any saved values over `freshState()` defaults. In the real app this should be a server-side rate-card record per franchisee, not localStorage.

## Assets
- `assets/anago-logo.png` — full-color Anago logo (included). A white variant (`anago-logo-white.png`) exists in the brand system if a dark surface needs it.
- All icons are inline SVG (1.8–2.4 stroke, `currentColor`, round caps/joins): 12 facility glyphs (`FAC_ICONS` map), plus chevron, gear, eye, gauge, apply, reset, save, check. No icon library — reuse the codebase's icon system or port these paths.

## Screenshots
Reference renders of the prototype are in `screenshots/`:
- `01-page-overview.png` — top bar, page header, and toolbar (default wage + apply-to-all + count pill).
- `02-facility-card-open.png` — an expanded facility card showing the two control columns: **Hourly wage** ($25/hr) and **Monthly minimums** (defaults: 155 / 295 / 385 monthly+weekly floors).
- `03-quote-preview.png` — the live Quote Preview table with after-hours pricing, including floored rows (orange "min" flag) where the monthly minimum lifts the price.

## Files
- `Anago Pricing Setup.html` — the complete hifi prototype (markup, CSS tokens, and the full pricing JS — the authoritative reference for the formulas).
- `assets/anago-logo.png` — logo asset.
- `screenshots/` — reference renders (see above).

See the companion **Brand Guidelines** and **Booking Flow** handoffs for the shared brand system and the downstream customer-facing quote screens that consume this rate card.
