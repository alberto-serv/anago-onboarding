"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Eye, Download, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import styles from "./pricing-setup.module.css"

// ── Facility catalog (12 priceable types from lib/cleaning-data.ts) ──
// rates = sq ft per labor-hour [fast → low price, slow → high price]. Corporate-owned.
const FAC_ICONS: Record<string, string> = {
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

type Density = "low" | "medium" | "high"
type Win = "after" | "business"

interface Category {
  id: string
  name: string
  profile: string
  rates: Record<Density, [number, number]>
}

const CATEGORIES: Category[] = [
  { id: "office", name: "Office Building", profile: "Office profile", rates: { low: [3500, 3000], medium: [3000, 2500], high: [2500, 2000] } },
  { id: "medical", name: "Medical Office", profile: "Office profile · sterile", rates: { low: [3500, 3000], medium: [3000, 2000], high: [2000, 1500] } },
  { id: "restaurant", name: "Restaurant", profile: "Restaurant profile", rates: { low: [3000, 2000], medium: [2000, 1500], high: [1500, 1000] } },
  { id: "retail", name: "Retail", profile: "Retail profile", rates: { low: [3000, 2000], medium: [2000, 1500], high: [1500, 1000] } },
  { id: "warehouse", name: "Warehouse", profile: "Warehouse profile", rates: { low: [3000, 2500], medium: [2500, 1500], high: [2000, 1000] } },
  { id: "fitness", name: "Fitness Center", profile: "Retail profile", rates: { low: [2500, 2000], medium: [2000, 1500], high: [1500, 1000] } },
  { id: "school", name: "School / Educational", profile: "Office profile", rates: { low: [3000, 2500], medium: [2500, 1500], high: [2000, 1000] } },
  { id: "multiTenant", name: "Multi-Tenant Building", profile: "Office profile", rates: { low: [3000, 2000], medium: [2500, 1500], high: [2000, 1000] } },
  { id: "autoDealership", name: "Auto / Car Dealership", profile: "Retail profile", rates: { low: [3500, 2500], medium: [3000, 2000], high: [2000, 1500] } },
  { id: "worship", name: "Church / Worship", profile: "Office profile", rates: { low: [3500, 2500], medium: [3000, 2000], high: [2500, 1500] } },
  { id: "government", name: "Government Building", profile: "Office profile", rates: { low: [3500, 3000], medium: [3000, 2500], high: [2500, 2000] } },
  { id: "manufacturing", name: "Manufacturing Facility", profile: "Warehouse profile", rates: { low: [3000, 2500], medium: [2500, 1500], high: [2000, 1000] } },
]

interface Freq {
  id: string
  label: string
  short: string
  v: number
  grp: "monthly" | "weekly"
}

const FREQS: Freq[] = [
  { id: "1x-month", label: "1× / Month", short: "1×/mo", v: 1, grp: "monthly" },
  { id: "2x-month", label: "2× / Month", short: "2×/mo", v: 2, grp: "monthly" },
  { id: "1x-week", label: "1× / Week", short: "1×/wk", v: 4.33, grp: "weekly" },
  { id: "2x-week", label: "2× / Week", short: "2×/wk", v: 8.66, grp: "weekly" },
  { id: "3x-week", label: "3× / Week", short: "3×/wk", v: 13, grp: "weekly" },
  { id: "4x-week", label: "4× / Week", short: "4×/wk", v: 17.33, grp: "weekly" },
  { id: "5x-week", label: "5× / Week", short: "5×/wk", v: 21.65, grp: "weekly" },
  { id: "6x-week", label: "6× / Week", short: "6×/wk", v: 26, grp: "weekly" },
  { id: "7x-week", label: "7× / Week", short: "7×/wk", v: 30.33, grp: "weekly" },
]
const FREQ_BY: Record<string, Freq> = Object.fromEntries(FREQS.map((f) => [f.id, f]))

const DEFAULT_MIN: Record<string, number> = {
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
const DEFAULT_WAGE = 25
const PREV_FREQS = ["1x-month", "2x-month", "1x-week", "3x-week", "5x-week"]
const STORE_KEY = "anago-pricing-setup-v1"

type WageMap = Record<string, number>
type MinMap = Record<string, Record<string, number>>
type ShownMap = Record<string, boolean>
interface PrevState {
  sqft: number
  density: Density
  window: Win
  hours: number
}

function freshWage(): WageMap {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, DEFAULT_WAGE]))
}
function freshMin(): MinMap {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, Object.fromEntries(FREQS.map((f) => [f.id, DEFAULT_MIN[f.id]]))]))
}
function freshShown(): ShownMap {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, true]))
}
function freshPrev(): Record<string, PrevState> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, { sqft: 5000, density: "medium", window: "after", hours: 2 }]))
}

const money = (n: number) => Math.round(n).toLocaleString("en-US")

interface PriceResult {
  perVisit: number
  rawMonthly: number
  minimum: number
  monthly: number
  floored: boolean
}

// Mode A — after hours (production-rate based). Mirrors getProductionPrice.
function priceProduction(cat: Category, freqId: string, sqft: number, density: Density, wage: number, minimum: number): PriceResult {
  const [fast, slow] = cat.rates[density]
  const v = FREQ_BY[freqId].v
  const perVisitPoint = ((sqft / fast) * wage + (sqft / slow) * wage) / 2
  const rawPoint = ((sqft / fast) * v * wage + (sqft / slow) * v * wage) / 2
  const monthly = Math.max(minimum, rawPoint)
  return {
    perVisit: Math.round(perVisitPoint),
    rawMonthly: Math.round(rawPoint),
    minimum,
    monthly: Math.round(monthly),
    floored: minimum > rawPoint + 1e-9,
  }
}

// Mode B — during business hours / day cleaning. Mirrors getPriceForHours.
function priceHours(freqId: string, hoursPerDay: number, wage: number, minimum: number): PriceResult {
  const v = FREQ_BY[freqId].v
  const perVisit = hoursPerDay * wage
  const rawMonthly = hoursPerDay * v * wage
  const monthly = Math.max(minimum, rawMonthly)
  return {
    perVisit: Math.round(perVisit),
    rawMonthly: Math.round(rawMonthly),
    minimum,
    monthly: Math.round(monthly),
    floored: minimum > rawMonthly + 1e-9,
  }
}

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ")
const fmtWage = (w: number) => (w % 1 ? w.toFixed(2) : String(w))

interface PricingSetupProps {
  onContinue: () => void
  onBack: () => void
}

export function PricingSetup({ onContinue, onBack }: PricingSetupProps) {
  const [wage, setWage] = useState<WageMap>(freshWage)
  const [min, setMin] = useState<MinMap>(freshMin)
  const [shown, setShown] = useState<ShownMap>(freshShown)
  const [prev, setPrev] = useState<Record<string, PrevState>>(freshPrev)
  const [defWage, setDefWage] = useState<number>(DEFAULT_WAGE)
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({ [CATEGORIES[0].id]: true })
  const [openPrev, setOpenPrev] = useState<Record<string, boolean>>({})
  const [hydrated, setHydrated] = useState(false)

  // Hydrate saved rate card (client-only to avoid SSR mismatch).
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

  // Persist on change (the saved payload is wage/min/shown only).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ wage, min, shown }))
    } catch {
      // ignore storage failures
    }
  }, [wage, min, shown, hydrated])

  const shownCount = CATEGORIES.filter((c) => shown[c.id]).length

  const applyAll = () => setWage(Object.fromEntries(CATEGORIES.map((c) => [c.id, defWage])))

  const resetAll = () => {
    if (!window.confirm("Reset wage, minimums and visibility back to Anago defaults?")) return
    setWage(freshWage())
    setMin(freshMin())
    setShown(freshShown())
    setPrev(freshPrev())
    setDefWage(DEFAULT_WAGE)
  }

  const setCatWage = (id: string, val: number) => setWage((w) => ({ ...w, [id]: val }))
  const setCatMin = (id: string, freq: string, val: number) =>
    setMin((m) => ({ ...m, [id]: { ...m[id], [freq]: val } }))
  const toggleShown = (id: string) => setShown((s) => ({ ...s, [id]: !s[id] }))
  const patchPrev = (id: string, patch: Partial<PrevState>) =>
    setPrev((p) => ({ ...p, [id]: { ...p[id], ...patch } }))

  const num = (s: string) => (s === "" ? 0 : Math.max(0, parseFloat(s) || 0))

  return (
    <div className={styles.page}>
      {/* Anago fonts — React hoists these to <head>; scoped usage keeps them out of the rest of the app. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Special+Gothic+Condensed+One&family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
        rel="stylesheet"
      />

      <div className={cx(styles.wrap, styles.head)}>
        <div className={styles.crumb}>
          <b>Pricing</b> &nbsp;/&nbsp; Rate Card Setup
        </div>
        <h1>Set Your Rates</h1>
        <p>
          Two numbers drive every instant quote your customers see. Set the <strong>hourly wage</strong> your crews bill
          at and the <strong>monthly minimums</strong> that protect small jobs — for each of your 12 facility types.
          Production rates and packages are set by Anago corporate and stay fixed.
        </p>
      </div>

      <div className={styles.wrap}>
        {/* toolbar */}
        <div className={styles.toolbar}>
          <span className={styles.tlab}>Default hourly wage</span>
          <div className={styles.wagebox}>
            <div className={cx(styles.moneyfield, styles.sm)}>
              <span className={styles.pre}>$</span>
              <input
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                value={defWage}
                onChange={(e) => setDefWage(num(e.target.value))}
              />
              <span className={styles.post}>/ hr</span>
            </div>
            <button type="button" className={styles.btnApply} onClick={applyAll}>
              <Download strokeWidth={2.1} />
              Apply to all 12
            </button>
          </div>
          <div className={styles.grow} />
          <span className={styles.countPill}>{shownCount} of 12 shown</span>
          <button type="button" className={styles.lnk} onClick={resetAll}>
            <RotateCcw strokeWidth={2} />
            Reset to Anago defaults
          </button>
        </div>

        {/* facility cards */}
        <div className={styles.stack}>
          {CATEGORIES.map((cat) => {
            const isOpen = !!openCards[cat.id]
            const isShown = shown[cat.id]
            const pv = prev[cat.id]
            const monthlyFreqs = FREQS.filter((f) => f.grp === "monthly")
            const weeklyFreqs = FREQS.filter((f) => f.grp === "weekly")

            return (
              <section key={cat.id} className={cx(styles.fac, isOpen && styles.open, !isShown && styles.hiddenFac)}>
                {/* bar */}
                <div
                  className={styles.facBar}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest(`.${styles.switch}`)) return
                    setOpenCards((o) => ({ ...o, [cat.id]: !o[cat.id] }))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setOpenCards((o) => ({ ...o, [cat.id]: !o[cat.id] }))
                    }
                  }}
                >
                  <div className={styles.facIc}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dangerouslySetInnerHTML={{ __html: FAC_ICONS[cat.id] }}
                    />
                  </div>
                  <div className={styles.facId}>
                    <div className={styles.nm}>{cat.name}</div>
                    <span className={styles.tag}>
                      <span className={styles.dot} />
                      {cat.profile}
                    </span>
                  </div>
                  <div className={styles.facSnap}>
                    <div className={styles.sv}>
                      ${fmtWage(wage[cat.id])} <span>/ hr</span>
                    </div>
                  </div>
                  <div className={styles.vis}>
                    <span className={styles.vlab}>{isShown ? "Shown" : "Hidden"}</span>
                    <button
                      type="button"
                      className={cx(styles.switch, isShown && styles.on)}
                      role="switch"
                      aria-checked={isShown}
                      title="Show or hide this facility type in the booking flow"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleShown(cat.id)
                      }}
                    >
                      <span className={styles.knob} />
                    </button>
                  </div>
                  <div className={styles.chev}>
                    <ChevronDown strokeWidth={2.4} />
                  </div>
                </div>

                {/* panel */}
                <div className={styles.panel}>
                  <div className={styles.panelIn}>
                    {/* wage column */}
                    <div>
                      <div className={styles.ctrlH}>
                        <span className={styles.n}>1</span>Hourly wage
                      </div>
                      <div className={styles.wageBlock}>
                        <div className={styles.big}>
                          <div className={styles.moneyfield}>
                            <span className={styles.pre}>$</span>
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              inputMode="decimal"
                              value={wage[cat.id]}
                              onChange={(e) => setCatWage(cat.id, num(e.target.value))}
                            />
                            <span className={styles.post}>/ hr</span>
                          </div>
                        </div>
                        <div className={styles.hint}>
                          Billed against the labor hours each visit takes. Raising it lifts every quote for this facility
                          proportionally.
                        </div>
                      </div>
                    </div>

                    {/* minimums column */}
                    <div>
                      <div className={styles.ctrlH}>
                        <span className={styles.n}>2</span>Monthly minimums
                      </div>
                      <div className={styles.minGrid}>
                        {[
                          { title: "Monthly visits", freqs: monthlyFreqs },
                          { title: "Weekly visits", freqs: weeklyFreqs },
                        ].map((group) => (
                          <div key={group.title} className={styles.minGrp}>
                            <div className={styles.gh}>
                              {group.title} <small>floor</small>
                            </div>
                            <div className={styles.minRow}>
                              {group.freqs.map((f) => {
                                const val = min[cat.id][f.id] || 0
                                return (
                                  <div key={f.id} className={cx(styles.minLine, !val && styles.off)}>
                                    <span className={styles.fl}>{f.short}</span>
                                    <div className={styles.moneyfield}>
                                      <span className={styles.pre}>$</span>
                                      <input
                                        type="number"
                                        min={0}
                                        step={5}
                                        inputMode="decimal"
                                        placeholder="None"
                                        value={val ? val : ""}
                                        onChange={(e) => setCatMin(cat.id, f.id, num(e.target.value))}
                                      />
                                      <span className={styles.post}>/ mo</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.minNote}>
                        Leave a field blank for no floor — that frequency then bills at pure labor cost.
                      </div>
                    </div>

                    {/* quote preview (full width) */}
                    <div className={cx(styles.prev, openPrev[cat.id] && styles.open)} data-win={pv.window}>
                      <button
                        type="button"
                        className={styles.prevToggle}
                        onClick={() => setOpenPrev((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
                      >
                        <span className={styles.ptH}>
                          <Eye strokeWidth={2} />
                          Quote preview
                        </span>
                        <span className={styles.prevChev}>
                          <ChevronDown strokeWidth={2.4} />
                        </span>
                      </button>

                      <div className={styles.prevBody}>
                        <div className={styles.prevTop}>
                          <div className={styles.prevCtl}>
                            <div className={cx(styles.segPills, styles.win)} data-role="window">
                              <button
                                type="button"
                                className={cx(pv.window === "after" && styles.on)}
                                onClick={() => patchPrev(cat.id, { window: "after" })}
                              >
                                After hours
                              </button>
                              <button
                                type="button"
                                className={cx(pv.window === "business" && styles.on)}
                                onClick={() => patchPrev(cat.id, { window: "business" })}
                              >
                                Business hours
                              </button>
                            </div>
                            <div className={styles.segPills} data-role="density">
                              {(
                                [
                                  ["low", "Light"],
                                  ["medium", "Standard"],
                                  ["high", "Busy"],
                                ] as [Density, string][]
                              ).map(([d, label]) => (
                                <button
                                  key={d}
                                  type="button"
                                  className={cx(pv.density === d && styles.on)}
                                  onClick={() => patchPrev(cat.id, { density: d })}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <select
                              data-role="sqft"
                              value={pv.sqft}
                              onChange={(e) => patchPrev(cat.id, { sqft: parseInt(e.target.value, 10) })}
                            >
                              <option value={3000}>3,000 sq ft</option>
                              <option value={5000}>5,000 sq ft</option>
                              <option value={7000}>7,000 sq ft</option>
                              <option value={9000}>9,000 sq ft</option>
                            </select>
                            <select
                              data-role="hours"
                              value={pv.hours}
                              onChange={(e) => patchPrev(cat.id, { hours: parseInt(e.target.value, 10) })}
                            >
                              <option value={1}>1 hr / day</option>
                              <option value={2}>2 hrs / day</option>
                              <option value={3}>3 hrs / day</option>
                              <option value={4}>4 hrs / day</option>
                            </select>
                          </div>
                        </div>

                        <table className={styles.ptab}>
                          <thead>
                            <tr>
                              <th>Frequency</th>
                              <th>Per visit</th>
                              <th>Labor / mo</th>
                              <th>Your min</th>
                              <th>Billed / mo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PREV_FREQS.map((fid) => {
                              const minimum = min[cat.id][fid] || 0
                              const p =
                                pv.window === "business"
                                  ? priceHours(fid, pv.hours, wage[cat.id] || 0, minimum)
                                  : priceProduction(cat, fid, pv.sqft, pv.density, wage[cat.id] || 0, minimum)
                              return (
                                <tr key={fid} className={cx(p.floored && styles.floored)}>
                                  <td>{FREQ_BY[fid].label}</td>
                                  <td>
                                    <span className={styles.pv}>${money(p.perVisit)}</span>
                                  </td>
                                  <td>
                                    <span className={styles.raw}>${money(p.rawMonthly)}</span>
                                  </td>
                                  <td>{p.minimum ? `$${money(p.minimum)}` : <span className={styles.dash}>—</span>}</td>
                                  <td>
                                    <span className={styles.bill}>${money(p.monthly)}</span>
                                    {p.floored && <span className={styles.flag}>min</span>}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>

                        <div className={styles.prevBasis}>
                          {pv.window === "business" ? (
                            <>
                              Day cleaning —{" "}
                              <b>
                                {pv.hours} hr/day × ${fmtWage(wage[cat.id] || 0)}/hr
                              </b>{" "}
                              per visit, the same at every frequency; monthly is hours × visits × wage, floored to your
                              minimum.
                            </>
                          ) : (
                            <>
                              After hours —{" "}
                              <b>
                                {pv.sqft.toLocaleString()} sq ft ÷ production rate × ${fmtWage(wage[cat.id] || 0)}/hr
                              </b>{" "}
                              per visit; monthly floored to your minimum.
                            </>
                          )}
                        </div>
                        <div className={styles.prevFoot}>
                          <span className={styles.sw} /> Highlighted rows are lifted to your monthly minimum.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        {/* Host-app Continue / Back (kept in the app's style, per spec). */}
        <div className={styles.actions}>
          <Button
            onClick={onContinue}
            className="w-full h-14 text-base font-medium bg-foreground hover:bg-foreground/90 text-background shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl"
          >
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full h-12 border border-border rounded-2xl bg-transparent hover:bg-muted transition-colors"
          >
            Back
          </Button>
          <div className="flex justify-center pt-4">
            <a
              href="mailto:support@goserv.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Need help?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
