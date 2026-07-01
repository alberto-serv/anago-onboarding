"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { ChevronDown, Eye, RotateCcw, GripVertical, ArrowDownAZ, Undo2, Check } from "lucide-react"
import styles from "./pricing-setup.module.css"
import {
  CATEGORIES,
  FAC_ICONS,
  FREQS,
  FREQ_BY,
  PREV_FREQS,
  ADDONS,
  addOnsFor,
  orderedCategories,
  type Density,
  type RateCard,
  type Win,
  fmtWage,
  num,
  priceHours,
  priceProduction,
  rangeStr,
} from "./rate-card"

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ")

// A number input keeps a leading zero the user types (e.g. "025") because it
// parses back to the same value the field already holds, so React never re-syncs
// the DOM. Normalize the field text in place before parsing.
const cleanNum = (e: ChangeEvent<HTMLInputElement>): string => {
  const cleaned = e.target.value.replace(/^0+(?=\d)/, "")
  if (cleaned !== e.target.value) e.currentTarget.value = cleaned
  return cleaned
}

interface PrevState {
  sqft: number
  density: Density
  window: Win
  hours: number
}

export function PricingEditor({ rc }: { rc: RateCard }) {
  // Quote-preview UI state is editor-local (it doesn't affect the saved rate card).
  const [prev, setPrev] = useState<Record<string, PrevState>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, { sqft: 10000, density: "medium" as Density, window: "after" as Win, hours: 2 }])),
  )
  const [openCards, setOpenCards] = useState<Record<string, boolean>>(() => ({ [rc.order[0]]: true }))
  const [openPrev, setOpenPrev] = useState<Record<string, boolean>>({})
  // Per-card add-on list is collapsed until the master "Offer all add-ons" row is opened.
  const [openAddOns, setOpenAddOns] = useState<Record<string, boolean>>({})
  // Id of the card currently being dragged for reordering (null when idle).
  const [dragId, setDragId] = useState<string | null>(null)
  // Reset flow: a branded confirmation modal, then a self-dismissing success toast.
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetToast, setResetToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const patchPrev = (id: string, patch: Partial<PrevState>) =>
    setPrev((p) => ({ ...p, [id]: { ...p[id], ...patch } }))

  const cards = orderedCategories(rc.order)
  const shownCount = CATEGORIES.filter((c) => rc.shown[c.id]).length

  // Close the confirmation modal on Escape while it's open.
  useEffect(() => {
    if (!confirmReset) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmReset(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [confirmReset])

  // Clear any pending toast timer on unmount.
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  const confirmResetAll = () => {
    rc.resetAll()
    setConfirmReset(false)
    setResetToast(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setResetToast(false), 3200)
  }

  return (
    <>
      <div className={cx(styles.wrap, styles.head)}>
        <h1>Set Your Rates</h1>
        <p>
          Set one <strong>hourly wage</strong> your crews bill at, then the <strong>monthly minimums</strong> that
          protect small jobs — for each of your 12 facility types.
        </p>
      </div>

      <div className={styles.wrap}>
        {/* toolbar */}
        <div className={styles.toolbar}>
          <span className={styles.tlab}>Hourly wage</span>
          <div className={styles.wagebox}>
            <div className={cx(styles.moneyfield, styles.sm)}>
              <span className={styles.pre}>$</span>
              <input
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                value={rc.wage}
                onChange={(e) => rc.setWage(num(cleanNum(e)))}
              />
              <span className={styles.post}>/ hr</span>
            </div>
            <span className={styles.wageNote}>Applies to all 12 facility types</span>
          </div>
          <div className={styles.grow} />
          <button type="button" className={styles.lnk} onClick={rc.sortAlphabetical}>
            <ArrowDownAZ strokeWidth={2} />
            Sort A–Z
          </button>
          {rc.hasPrevOrder && (
            <button type="button" className={styles.lnk} onClick={rc.restorePrevOrder}>
              <Undo2 strokeWidth={2} />
              Restore previous order
            </button>
          )}
          <span className={styles.countPill}>{shownCount} of 12 shown</span>
          <button type="button" className={styles.lnk} onClick={() => setConfirmReset(true)}>
            <RotateCcw strokeWidth={2} />
            Reset to Anago defaults
          </button>
        </div>

        {/* facility cards — drag the handle to reorder; the order drives the storefront preview */}
        <div className={styles.stack}>
          {cards.map((cat) => {
            const isOpen = !!openCards[cat.id]
            const isShown = rc.shown[cat.id]
            const pv = prev[cat.id]
            const monthlyFreqs = FREQS.filter((f) => f.grp === "monthly")
            const weeklyFreqs = FREQS.filter((f) => f.grp === "weekly")

            return (
              <section
                key={cat.id}
                className={cx(styles.fac, isOpen && styles.open, !isShown && styles.hiddenFac, dragId === cat.id && styles.dragging)}
                onDragOver={(e) => {
                  if (!dragId || dragId === cat.id) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "move"
                  rc.reorder(dragId, cat.id)
                }}
                onDrop={(e) => e.preventDefault()}
              >
                {/* bar */}
                <div
                  className={styles.facBar}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest(`.${styles.switch}, .${styles.facDrag}`)) return
                    setOpenCards((o) => ({ ...o, [cat.id]: !o[cat.id] }))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setOpenCards((o) => ({ ...o, [cat.id]: !o[cat.id] }))
                    }
                  }}
                >
                  <span
                    className={styles.facDrag}
                    draggable
                    role="button"
                    aria-label={`Drag to reorder ${cat.name}`}
                    title="Drag to reorder"
                    onClick={(e) => e.stopPropagation()}
                    onDragStart={(e) => {
                      setDragId(cat.id)
                      e.dataTransfer.effectAllowed = "move"
                      // Firefox requires data to be set for a drag to start.
                      e.dataTransfer.setData("text/plain", cat.id)
                    }}
                    onDragEnd={() => setDragId(null)}
                  >
                    <GripVertical strokeWidth={2} />
                  </span>
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
                  </div>
                  <div className={styles.facSnap}>
                    <div className={styles.sv}>
                      ${fmtWage(rc.wage)} <span>/ hr</span>
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
                        rc.toggleShown(cat.id)
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
                    {/* minimums column */}
                    <div>
                      <div className={styles.ctrlH}>
                        <span className={styles.n}>1</span>Monthly minimums
                      </div>
                      <div className={styles.minGrid}>
                        {[
                          { title: "Weekly visits", freqs: weeklyFreqs },
                          { title: "Monthly visits", freqs: monthlyFreqs },
                        ].map((group) => (
                          <div key={group.title} className={styles.minGrp}>
                            <div className={styles.gh}>
                              {group.title} <small>floor</small>
                            </div>
                            <div className={styles.minRow}>
                              {group.freqs.map((f) => {
                                const val = rc.min[cat.id][f.id] || 0
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
                                        onChange={(e) => rc.setCatMin(cat.id, f.id, num(cleanNum(e)))}
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

                    {/* add-ons offered by this facility */}
                    <div>
                      <div className={styles.ctrlH}>
                        <span className={styles.n}>2</span>Add-ons offered
                      </div>
                      {(() => {
                        const applicable = addOnsFor(cat.id)
                        const allOn = applicable.every((a) => rc.addOnEnabled[cat.id]?.[a.id])
                        const open = !!openAddOns[cat.id]
                        return (
                          <>
                            <div
                              className={cx(styles.addonPickRow, styles.addonPickAll, open && styles.open)}
                              role="button"
                              tabIndex={0}
                              aria-expanded={open}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest(`.${styles.switch}`)) return
                                setOpenAddOns((o) => ({ ...o, [cat.id]: !o[cat.id] }))
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  setOpenAddOns((o) => ({ ...o, [cat.id]: !o[cat.id] }))
                                }
                              }}
                            >
                              <span className={styles.addonPickName}>
                                {allOn ? "All add-ons offered" : "Offer all add-ons"}
                              </span>
                              <div className={styles.addonAllRight}>
                                <button
                                  type="button"
                                  className={cx(styles.switch, allOn && styles.on)}
                                  role="switch"
                                  aria-checked={allOn}
                                  aria-label={`Offer all add-ons for ${cat.name}`}
                                  onClick={() => rc.setAllAddOns(cat.id, !allOn)}
                                >
                                  <span className={styles.knob} />
                                </button>
                                <span className={styles.addonChev}>
                                  <ChevronDown strokeWidth={2.4} />
                                </span>
                              </div>
                            </div>
                            {open && (
                              <div className={styles.addonPickList}>
                                {applicable.map((a) => {
                                  const on = !!rc.addOnEnabled[cat.id]?.[a.id]
                                  const price = rc.addOnPrice[a.id] || 0
                                  return (
                                    <div key={a.id} className={cx(styles.addonPickRow, !on && styles.off)}>
                                      <div className={styles.addonPickInfo}>
                                        <span className={styles.addonPickName}>{a.name}</span>
                                        <span className={styles.addonPickPrice}>
                                          {price ? `$${fmtWage(price)}` : "Price not set"}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        className={cx(styles.switch, on && styles.on)}
                                        role="switch"
                                        aria-checked={on}
                                        aria-label={`Offer ${a.name} for ${cat.name}`}
                                        onClick={() => rc.toggleAddOn(cat.id, a.id)}
                                      >
                                        <span className={styles.knob} />
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </>
                        )
                      })()}
                      <div className={styles.minNote}>
                        Choose which add-ons this facility offers. Set each add-on&apos;s price below.
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
                            <div className={styles.sqftField} data-role="sqft">
                              <input
                                type="number"
                                min={500}
                                step={500}
                                inputMode="numeric"
                                aria-label="Square footage"
                                list={`sqft-presets-${cat.id}`}
                                value={pv.sqft}
                                onChange={(e) => patchPrev(cat.id, { sqft: parseInt(cleanNum(e), 10) || 0 })}
                              />
                              <span className={styles.sqftSuffix}>sq ft</span>
                              <datalist id={`sqft-presets-${cat.id}`}>
                                <option value={3000} />
                                <option value={5000} />
                                <option value={7000} />
                                <option value={9000} />
                                <option value={12000} />
                                <option value={15000} />
                              </datalist>
                            </div>
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
                              <th>Billed / mo</th>
                              <th>Per visit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PREV_FREQS.map((fid) => {
                              const minimum = rc.min[cat.id][fid] || 0
                              const p =
                                pv.window === "business"
                                  ? priceHours(fid, pv.hours, rc.wage || 0, minimum)
                                  : priceProduction(cat, fid, pv.sqft, pv.density, rc.wage || 0, minimum)
                              return (
                                <tr key={fid} className={cx(p.floored && styles.floored)}>
                                  <td>{FREQ_BY[fid].label}</td>
                                  <td>
                                    <span className={styles.bill}>${rangeStr(p.monthlyLow, p.monthlyHigh)}</span>
                                    {p.floored && <span className={styles.flag}>min</span>}
                                  </td>
                                  <td>
                                    <span className={styles.pv}>${rangeStr(p.perVisitLow, p.perVisitHigh)}</span>
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
                                {pv.hours} hr/day × ${fmtWage(rc.wage || 0)}/hr
                              </b>{" "}
                              per visit, the same at every frequency; monthly is hours × visits × wage, floored to your
                              minimum.
                            </>
                          ) : (
                            <>
                              After hours —{" "}
                              <b>
                                {pv.sqft.toLocaleString()} sq ft ÷ production rate × ${fmtWage(rc.wage || 0)}/hr
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

        {/* special services / add-ons — one price per add-on, shared across all facility types */}
        <div className={styles.addonSection}>
          <div className={styles.addonHead}>
            <h2>Add-on pricing</h2>
            <p>
              Set the price you charge for each add-on. Prices are shared across all facility types; choose which
              facilities offer each add-on from the cards above. Add-ons are for your quotes only — they don&apos;t
              appear on your public booking page.
            </p>
          </div>
          <div className={styles.addonList}>
            {ADDONS.map((a) => {
              const price = rc.addOnPrice[a.id] || 0
              return (
                <div key={a.id} className={styles.addonRow}>
                  <div className={styles.addonInfo}>
                    <div className={styles.addonName}>
                      {a.name}
                      {a.medicalOnly && <span className={styles.addonTag}>Medical only</span>}
                    </div>
                    <div className={styles.addonDesc}>{a.desc}</div>
                    {a.medicalOnly && (
                      <div className={styles.addonNote}>Applies to Medical Office facilities only.</div>
                    )}
                  </div>
                  <div className={styles.addonPrice}>
                    <div className={styles.moneyfield}>
                      <span className={styles.pre}>$</span>
                      <input
                        type="number"
                        min={0}
                        step={5}
                        inputMode="decimal"
                        placeholder="Not set"
                        aria-label={`Price for ${a.name}`}
                        value={price ? price : ""}
                        onChange={(e) => rc.setAddOnPrice(a.id, num(cleanNum(e)))}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reset confirmation — branded modal in place of window.confirm */}
      {confirmReset && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
          onClick={() => setConfirmReset(false)}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <RotateCcw strokeWidth={2} />
            </div>
            <h3 id="reset-title" className={styles.modalTitle}>
              Reset to Anago defaults?
            </h3>
            <p className={styles.modalBody}>
              This restores the default hourly wage, monthly minimums, add-on prices and selections, and every
              facility&apos;s visibility and order. Any changes you&apos;ve made will be lost.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setConfirmReset(false)} autoFocus>
                Cancel
              </button>
              <button type="button" className={styles.modalConfirm} onClick={confirmResetAll}>
                <RotateCcw strokeWidth={2.2} />
                Reset to defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast after a reset */}
      <div className={cx(styles.toast, resetToast && styles.toastShow)} role="status" aria-live="polite">
        <span className={styles.toastIcon}>
          <Check strokeWidth={2.6} />
        </span>
        Rates reset to Anago defaults
      </div>
    </>
  )
}
