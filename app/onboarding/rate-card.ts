"use client"

// Shared rate-card model for the preview section. The franchisee configures a
// wage + monthly minimums per facility type in the editor; the storefront preview
// consumes the same state so edits show up live. Pricing mirrors the Master sheet
// (production-rate model, $25 default wage) — see design_handoff_pricing_setup.

import { useCallback, useEffect, useState } from "react"

export type Density = "low" | "medium" | "high"
export type Win = "after" | "business"
export type ProfileId = "office" | "restaurant" | "warehouse" | "retail"

export interface Category {
  id: string
  name: string
  shortName: string
  profile: ProfileId
  rates: Record<Density, [number, number]> // sq ft per labor-hour [fast→low $, slow→high $]
}

export const CATEGORIES: Category[] = [
  { id: "office", name: "Office Building", shortName: "Office", profile: "office", rates: { low: [3500, 3000], medium: [3000, 2500], high: [2500, 2000] } },
  { id: "medical", name: "Medical Office", shortName: "Medical", profile: "office", rates: { low: [3500, 3000], medium: [3000, 2000], high: [2000, 1500] } },
  { id: "restaurant", name: "Restaurant", shortName: "Restaurant", profile: "restaurant", rates: { low: [3000, 2000], medium: [2000, 1500], high: [1500, 1000] } },
  { id: "retail", name: "Retail", shortName: "Retail", profile: "retail", rates: { low: [3000, 2000], medium: [2000, 1500], high: [1500, 1000] } },
  { id: "warehouse", name: "Warehouse", shortName: "Warehouse", profile: "warehouse", rates: { low: [3000, 2500], medium: [2500, 1500], high: [2000, 1000] } },
  { id: "fitness", name: "Fitness Center", shortName: "Fitness", profile: "retail", rates: { low: [2500, 2000], medium: [2000, 1500], high: [1500, 1000] } },
  { id: "school", name: "School / Educational", shortName: "School", profile: "office", rates: { low: [3000, 2500], medium: [2500, 1500], high: [2000, 1000] } },
  { id: "multiTenant", name: "Multi-Tenant Building", shortName: "Multi-Tenant", profile: "office", rates: { low: [3000, 2000], medium: [2500, 1500], high: [2000, 1000] } },
  { id: "autoDealership", name: "Auto / Car Dealership", shortName: "Dealership", profile: "retail", rates: { low: [3500, 2500], medium: [3000, 2000], high: [2000, 1500] } },
  { id: "worship", name: "Church / Worship", shortName: "Worship", profile: "office", rates: { low: [3500, 2500], medium: [3000, 2000], high: [2500, 1500] } },
  { id: "government", name: "Government Building", shortName: "Government", profile: "office", rates: { low: [3500, 3000], medium: [3000, 2500], high: [2500, 2000] } },
  { id: "manufacturing", name: "Manufacturing Facility", shortName: "Manufacturing", profile: "warehouse", rates: { low: [3000, 2500], medium: [2500, 1500], high: [2000, 1000] } },
]
export const CATEGORY_BY: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export const FAC_ICONS: Record<string, string> = {
  office:
    '<path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"/><path d="M16 9h3a1 1 0 0 1 1 1v11"/><path d="M3 21h18"/><path d="M8 7h2M8 11h2M8 15h2"/>',
  medical:
    '<path d="M12 21s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 6c-2.2 4.6-9.2 9-9.2 9z"/><path d="M12 9v6"/><path d="M9 12h6"/>',
  restaurant: '<path d="M6 3v7a2 2 0 0 0 4 0V3"/><path d="M8 10v11"/><path d="M16 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9"/>',
  retail: '<path d="M4 9h16l-1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  warehouse: '<path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-7h10v7"/><path d="M7 17h10"/>',
  fitness: '<path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M4 9v6"/><path d="M20 9v6"/><path d="M6.5 12h11"/>',
  school: '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v5c0 1 2 2.5 5 2.5s5-1.5 5-2.5v-5"/><path d="M21 9v5"/>',
  multiTenant:
    '<path d="M3 21V8l6-3v16"/><path d="M9 21V11l6-3v13"/><path d="M15 21V12l6 2v7"/><path d="M3 21h18"/>',
  autoDealership:
    '<path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="7" cy="15.5" r="1"/><circle cx="17" cy="15.5" r="1"/>',
  worship: '<path d="M12 2v5"/><path d="M9.5 4.5h5"/><path d="M5 21V11l7-4 7 4v10"/><path d="M9 21v-5h6v5"/>',
  government:
    '<path d="M3 21h18"/><path d="M5 21V10"/><path d="M19 21V10"/><path d="M9 21V10"/><path d="M15 21V10"/><path d="M3 10l9-6 9 6"/><path d="M3 10h18"/>',
  manufacturing: '<path d="M3 21V10l5 3V10l5 3V8l6 4v9z"/><path d="M3 21h18"/><path d="M7 17h.01"/><path d="M12 17h.01"/>',
}

export interface Freq {
  id: string
  label: string
  short: string
  v: number
  grp: "monthly" | "weekly"
}

export const FREQS: Freq[] = [
  { id: "1x-month", label: "1× / Month", short: "1×/mo", v: 1, grp: "monthly" },
  { id: "2x-month", label: "2× / Month", short: "2×/mo", v: 2, grp: "monthly" },
  { id: "1x-week", label: "1× / Week", short: "1×", v: 4.33, grp: "weekly" },
  { id: "2x-week", label: "2× / Week", short: "2×", v: 8.66, grp: "weekly" },
  { id: "3x-week", label: "3× / Week", short: "3×", v: 13, grp: "weekly" },
  { id: "4x-week", label: "4× / Week", short: "4×", v: 17.33, grp: "weekly" },
  { id: "5x-week", label: "5× / Week", short: "5×", v: 21.65, grp: "weekly" },
  { id: "6x-week", label: "6× / Week", short: "6×", v: 26, grp: "weekly" },
  { id: "7x-week", label: "7× / Week", short: "7×", v: 30.33, grp: "weekly" },
]
export const FREQ_BY: Record<string, Freq> = Object.fromEntries(FREQS.map((f) => [f.id, f]))
export const MONTHLY_FREQ_IDS = FREQS.filter((f) => f.grp === "monthly").map((f) => f.id)
export const WEEKLY_FREQ_IDS = FREQS.filter((f) => f.grp === "weekly").map((f) => f.id)

export const DEFAULT_MIN: Record<string, number> = {
  "1x-month": 155,
  "2x-month": 295,
  "1x-week": 385,
  "2x-week": 0,
  "3x-week": 0,
  "4x-week": 0,
  "5x-week": 825,
  "6x-week": 0,
  "7x-week": 0,
}
export const DEFAULT_WAGE = 25
export const PREV_FREQS = ["1x-month", "2x-month", "1x-week", "3x-week", "5x-week"]
export const STORE_KEY = "anago-pricing-setup-v1"

// Square-footage bounds for the storefront slider.
export const SQFT_MIN = 2000
export const SQFT_MAX = 20000
export const SQFT_STEP = 500

// ─── Density copy (per pricing profile + per-facility overrides) ──────────────
export interface DensityCopy {
  low: { label: string; copy: string; cues: string[] }
  medium: { label: string; copy: string; cues: string[] }
  high: { label: string; copy: string; cues: string[] }
}

const DENSITY_BY_PROFILE: Record<ProfileId, DensityCopy> = {
  office: {
    low: { label: "Spacious", copy: "Private offices or lots of open space", cues: ["Quiet space", "Minimal foot traffic"] },
    medium: { label: "Standard", copy: "Typical team setup", cues: ["Regular daily use", "Balanced traffic"] },
    high: { label: "Busy / Packed", copy: "Tightly packed or high-occupancy", cues: ["Constant activity", "High daily usage"] },
  },
  restaurant: {
    low: { label: "Light Traffic", copy: "Slow-paced or upscale dining", cues: ["Lower customer turnover"] },
    medium: { label: "Steady Flow", copy: "Consistent daily traffic", cues: ["Typical restaurant activity"] },
    high: { label: "High Traffic / Fast Turnover", copy: "Fast casual or very busy", cues: ["High turnover and heavy use"] },
  },
  retail: {
    low: { label: "Light Foot Traffic", copy: "Boutique or low-traffic store", cues: ["Customers browse slowly"] },
    medium: { label: "Moderate Traffic", copy: "Regular daily shoppers", cues: ["Balanced traffic"] },
    high: { label: "Busy Store", copy: "High foot traffic", cues: ["Frequent mess and turnover"] },
  },
  warehouse: {
    low: { label: "Storage Focused", copy: "Mostly storage, limited activity", cues: ["Low movement"] },
    medium: { label: "Active Operations", copy: "Regular operations and movement", cues: ["Moderate activity"] },
    high: { label: "High Activity", copy: "Heavy operations / logistics hub", cues: ["Constant movement and use"] },
  },
}

const DENSITY_OVERRIDES: Record<string, DensityCopy> = {
  medical: {
    low: { label: "Spacious", copy: "Specialty office or low-volume clinic with calm, controlled patient flow", cues: ["Fewer patients per day"] },
    medium: { label: "Standard", copy: "Steady appointment schedule — a typical primary care practice", cues: ["Regular daily patient flow"] },
    high: { label: "Busy / Packed", copy: "Urgent care or multi-provider practice with back-to-back rooms", cues: ["High patient turnover all day"] },
  },
  fitness: {
    low: { label: "Light Use", copy: "Boutique studio or off-peak gym with lighter attendance", cues: ["Fewer members at a time"] },
    medium: { label: "Standard", copy: "Typical gym traffic with regular class and equipment use", cues: ["Balanced daily attendance"] },
    high: { label: "High Traffic", copy: "Busy gym with packed classes and heavy locker-room turnover", cues: ["Constant member activity"] },
  },
  school: {
    low: { label: "Lighter Use", copy: "Smaller school or limited-enrollment program with calm hallways", cues: ["Fewer classrooms in daily use"] },
    medium: { label: "Standard", copy: "Typical campus — classrooms, common areas, and cafeteria in daily use", cues: ["Regular student foot traffic"] },
    high: { label: "High Traffic", copy: "Large or packed campus with constant hallway and facility use", cues: ["Heavy daily use across the building"] },
  },
  multiTenant: {
    low: { label: "Quiet", copy: "Few tenants or light common-area traffic", cues: ["Minimal lobby and hallway use"] },
    medium: { label: "Standard", copy: "Typical occupancy with steady lobby, elevator, and hallway traffic", cues: ["Balanced daily foot traffic"] },
    high: { label: "Busy", copy: "Fully leased with heavy lobby, hallway, and shared-space use", cues: ["Constant tenant and visitor traffic"] },
  },
  autoDealership: {
    low: { label: "Light Traffic", copy: "Quieter showroom and service area with steady customer flow", cues: ["Fewer visitors per day"] },
    medium: { label: "Standard", copy: "Typical showroom and service-bay activity day to day", cues: ["Regular customer and service traffic"] },
    high: { label: "High Traffic", copy: "Busy showroom with high test-drive and service-department volume", cues: ["Heavy daily foot and service traffic"] },
  },
  worship: {
    low: { label: "Light Use", copy: "Smaller congregation or mostly weekend services", cues: ["Limited weekday activity"] },
    medium: { label: "Standard", copy: "Regular services plus some weekday meetings and classes", cues: ["Steady weekly attendance"] },
    high: { label: "High Traffic", copy: "Large congregation with frequent services, events, and classes", cues: ["Heavy use throughout the week"] },
  },
  government: {
    low: { label: "Lighter Use", copy: "Mostly back-office work with limited public visitors", cues: ["Low daily foot traffic"] },
    medium: { label: "Standard", copy: "Typical mix of staff offices and public-facing counters", cues: ["Regular visitor and staff traffic"] },
    high: { label: "High Traffic", copy: "Busy public building with heavy counter and lobby use", cues: ["Constant visitor flow"] },
  },
  manufacturing: {
    low: { label: "Lighter Operations", copy: "Limited production with mostly single-shift or stationary work", cues: ["Lower floor activity"] },
    medium: { label: "Active Production", copy: "Regular production lines and routine floor movement", cues: ["Moderate daily activity"] },
    high: { label: "High Activity", copy: "Heavy multi-shift production with constant floor movement", cues: ["Continuous operation and traffic"] },
  },
}

export function densityOptionsFor(id: string): DensityCopy {
  return DENSITY_OVERRIDES[id] ?? DENSITY_BY_PROFILE[CATEGORY_BY[id].profile]
}

// All density imagery is served as WebP (the few PNG originals were converted
// down — ~19 MB → ~4 MB).
export function densityImage(id: string, density: Density): string {
  return `/images/density/${id}_${density}.webp`
}

// ─── Pricing engine ───────────────────────────────────────────────────────────
export const money = (n: number) => Math.round(n).toLocaleString("en-US")
export const fmtWage = (w: number) => (w % 1 ? w.toFixed(2) : String(w))
export const num = (s: string) => (s === "" ? 0 : Math.max(0, parseFloat(s) || 0))

export interface PriceResult {
  perVisit: number
  rawMonthly: number
  minimum: number
  monthly: number
  perVisitLow: number
  perVisitHigh: number
  monthlyLow: number
  monthlyHigh: number
  floored: boolean
  minApplied: boolean
}

// Mode A — after hours (production-rate based). Mirrors getProductionPrice.
export function priceProduction(
  cat: Category,
  freqId: string,
  sqft: number,
  density: Density,
  wage: number,
  minimum: number,
): PriceResult {
  const [fast, slow] = cat.rates[density]
  const v = FREQ_BY[freqId].v
  const perVisitLow = (sqft / fast) * wage
  const perVisitHigh = (sqft / slow) * wage
  const perVisitPoint = (perVisitLow + perVisitHigh) / 2
  const rawLow = (sqft / fast) * v * wage
  const rawHigh = (sqft / slow) * v * wage
  const rawPoint = (rawLow + rawHigh) / 2
  return {
    perVisit: Math.round(perVisitPoint),
    rawMonthly: Math.round(rawPoint),
    minimum,
    monthly: Math.round(Math.max(minimum, rawPoint)),
    perVisitLow: Math.round(perVisitLow),
    perVisitHigh: Math.round(perVisitHigh),
    monthlyLow: Math.round(Math.max(minimum, rawLow)),
    monthlyHigh: Math.round(Math.max(minimum, rawHigh)),
    floored: minimum > rawPoint + 1e-9,
    minApplied: minimum > rawLow + 1e-9,
  }
}

// Mode B — during business hours / day cleaning. Mirrors getPriceForHours.
export function priceHours(freqId: string, hoursPerDay: number, wage: number, minimum: number): PriceResult {
  const v = FREQ_BY[freqId].v
  const perVisit = Math.round(hoursPerDay * wage)
  const rawMonthly = hoursPerDay * v * wage
  const monthly = Math.round(Math.max(minimum, rawMonthly))
  return {
    perVisit,
    rawMonthly: Math.round(rawMonthly),
    minimum,
    monthly,
    perVisitLow: perVisit,
    perVisitHigh: perVisit,
    monthlyLow: monthly,
    monthlyHigh: monthly,
    floored: minimum > rawMonthly + 1e-9,
    minApplied: minimum > rawMonthly + 1e-9,
  }
}

export const rangeStr = (low: number, high: number) =>
  low === high ? low.toLocaleString() : `${low.toLocaleString()} – $${high.toLocaleString()}`

// ─── Shared state hook ────────────────────────────────────────────────────────
export type WageMap = Record<string, number>
export type MinMap = Record<string, Record<string, number>>
export type ShownMap = Record<string, boolean>

function freshWage(): WageMap {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, DEFAULT_WAGE]))
}
function freshMin(): MinMap {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, Object.fromEntries(FREQS.map((f) => [f.id, DEFAULT_MIN[f.id]]))]))
}
function freshShown(): ShownMap {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, true]))
}

export interface RateCard {
  wage: WageMap
  min: MinMap
  shown: ShownMap
  defWage: number
  setDefWage: (n: number) => void
  setCatWage: (id: string, val: number) => void
  setCatMin: (id: string, freq: string, val: number) => void
  toggleShown: (id: string) => void
  applyAll: () => void
  resetAll: () => void
  minimumFor: (id: string, freq: string) => number
}

export function useRateCard(): RateCard {
  const [wage, setWage] = useState<WageMap>(freshWage)
  const [min, setMin] = useState<MinMap>(freshMin)
  const [shown, setShown] = useState<ShownMap>(freshShown)
  const [defWage, setDefWage] = useState<number>(DEFAULT_WAGE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null")
      if (saved && saved.wage && saved.min) {
        setWage((w) => ({ ...w, ...saved.wage }))
        setMin((m) => {
          const next = { ...m }
          CATEGORIES.forEach((c) => {
            if (saved.min[c.id]) next[c.id] = { ...next[c.id], ...saved.min[c.id] }
          })
          return next
        })
        if (saved.shown) setShown((s) => ({ ...s, ...saved.shown }))
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ wage, min, shown }))
    } catch {
      // ignore storage failures
    }
  }, [wage, min, shown, hydrated])

  const setCatWage = useCallback((id: string, val: number) => setWage((w) => ({ ...w, [id]: val })), [])
  const setCatMin = useCallback(
    (id: string, freq: string, val: number) => setMin((m) => ({ ...m, [id]: { ...m[id], [freq]: val } })),
    [],
  )
  const toggleShown = useCallback((id: string) => setShown((s) => ({ ...s, [id]: !s[id] })), [])
  const applyAll = useCallback(() => setWage(Object.fromEntries(CATEGORIES.map((c) => [c.id, defWage]))), [defWage])
  const resetAll = useCallback(() => {
    setWage(freshWage())
    setMin(freshMin())
    setShown(freshShown())
    setDefWage(DEFAULT_WAGE)
  }, [])
  const minimumFor = useCallback((id: string, freq: string) => min[id]?.[freq] || 0, [min])

  return { wage, min, shown, defWage, setDefWage, setCatWage, setCatMin, toggleShown, applyAll, resetAll, minimumFor }
}
