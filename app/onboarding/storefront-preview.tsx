"use client"

import { useState } from "react"
import { ArrowRight, Shield, Star, Phone } from "lucide-react"
import styles from "./pricing-setup.module.css"
import {
  CATEGORIES,
  FAC_ICONS,
  FREQ_BY,
  WEEKLY_FREQ_IDS,
  MONTHLY_FREQ_IDS,
  SQFT_MIN,
  SQFT_MAX,
  SQFT_STEP,
  densityImage,
  densityOptionsFor,
  priceHours,
  priceProduction,
  rangeStr,
  type Density,
  type RateCard,
} from "./rate-card"

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ")

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className={styles.sfStepHead}>
      <div className={styles.sfStepRow}>
        <span className={styles.sfStepNum}>{step}</span>
        <h2 className={styles.sfStepTitle}>{title}</h2>
      </div>
      {subtitle && <p className={styles.sfStepSub}>{subtitle}</p>}
    </div>
  )
}

export function StorefrontPreview({ rc }: { rc: RateCard }) {
  const visible = CATEGORIES.filter((c) => rc.shown[c.id]).sort((a, b) => a.shortName.localeCompare(b.shortName))

  const [selectedId, setSelectedId] = useState<string>(visible[0]?.id ?? CATEGORIES[0].id)
  const [timeWindow, setTimeWindow] = useState<"after" | "business">("after")
  const [sqft, setSqft] = useState(SQFT_MIN)
  const [hoursPerDay, setHoursPerDay] = useState(4)
  const [frequency, setFrequency] = useState<string>("5x-week")
  const [density, setDensity] = useState<Density>("medium")
  const [showMonthly, setShowMonthly] = useState(false)

  // If the selected facility was just hidden in the editor, fall back to the first visible one.
  const selectedCat = visible.find((c) => c.id === selectedId) ?? visible[0] ?? CATEGORIES[0]
  const businessHours = timeWindow === "business"
  const wage = rc.wage[selectedCat.id] || 0
  const minimum = rc.min[selectedCat.id]?.[frequency] || 0

  const pricing = businessHours
    ? priceHours(frequency, hoursPerDay, wage, minimum)
    : priceProduction(selectedCat, frequency, sqft, density, wage, minimum)

  // Show a single figure only when the low and high genuinely coincide (fully
  // floored or hours-based). When the minimum lifts just the low end, keep the
  // real range so this matches the editor's quote exactly.
  const monthlyText =
    pricing.monthlyLow === pricing.monthlyHigh
      ? `$${pricing.monthlyLow.toLocaleString()}`
      : `$${rangeStr(pricing.monthlyLow, pricing.monthlyHigh)}`

  const dens = densityOptionsFor(selectedCat.id)
  const sliderPct = ((Math.min(sqft, SQFT_MAX) - SQFT_MIN) / (SQFT_MAX - SQFT_MIN)) * 100

  return (
    <div className={styles.sf}>
      {/* storefront header (Anago logo) */}
      <div className={styles.sfHeader}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.sfLogo} src="/images/anago-logo.png" alt="Anago Cleaning Systems" />
      </div>

      {/* hero */}
      <section className={styles.sfHero}>
        <h1 className={styles.sfTitle}>High-Quality Cleaning for Your Commercial Space</h1>
        <p className={styles.sfLead}>Recurring service, flexible scheduling, and professional crews.</p>
        <span className={styles.sfSkip}>
          Already know what you need? Skip to booking
          <ArrowRight />
        </span>
      </section>

      {/* Step 1 — facility type */}
      <section className={styles.sfSection}>
        <StepHeader step={1} title="What type of space needs cleaning?" subtitle="Pick the closest fit — you can fine-tune the details during your walkthrough." />
        <div className={styles.sfFacGrid}>
          {visible.map((cat) => {
            const sel = cat.id === selectedCat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={cx(styles.sfFacCard, sel && styles.sel)}
                onClick={() => setSelectedId(cat.id)}
              >
                <span className={styles.sfFacIc}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: FAC_ICONS[cat.id] }}
                  />
                </span>
                <span className={styles.sfFacName}>{cat.shortName}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Step 2 — time window */}
      <section className={styles.sfSection}>
        <StepHeader step={2} title="When should we clean?" subtitle="Pick the window that works best for your facility." />
        <div className={styles.sfWindowGrid}>
          {(
            [
              { id: "after", label: "After Hours", copy: "We clean when you're closed", badge: "Most popular" },
              { id: "business", label: "During Business Hours", copy: "We staff your space during business hours", badge: null },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={cx(styles.sfWindowCard, timeWindow === opt.id && styles.sel)}
              onClick={() => setTimeWindow(opt.id)}
            >
              <p className={styles.sfWindowLabel}>{opt.label}</p>
              <p className={styles.sfWindowCopy}>{opt.copy}</p>
              {opt.badge && <span className={styles.sfBadge}>{opt.badge}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Step 3 — size or hours */}
      <section className={styles.sfSection}>
        {businessHours ? (
          <>
            <StepHeader step={3} title="How many hours of cleaning per day?" subtitle="Tell us how many hours a day you need." />
            <div className={styles.sfHoursRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  className={cx(styles.sfHourPill, hoursPerDay === h && styles.sel)}
                  onClick={() => setHoursPerDay(h)}
                >
                  {h}
                  <span>hr{h === 1 ? "" : "s"}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <StepHeader step={3} title="How large is your space?" subtitle="Drag the slider or type your square footage — over 20,000 sq ft, we'll build you a custom quote." />
            <div className={styles.sfSliderWrap}>
              <div className={styles.sfSliderValue}>
                {sqft.toLocaleString()} <span>sq ft</span>
              </div>
              <input
                type="range"
                className={styles.sfSlider}
                min={SQFT_MIN}
                max={SQFT_MAX}
                step={SQFT_STEP}
                value={sqft}
                onChange={(e) => setSqft(parseInt(e.target.value, 10))}
                style={{ background: `linear-gradient(90deg, var(--orange) ${sliderPct}%, #e7e3da ${sliderPct}%)` }}
              />
              <div className={styles.sfSliderEnds}>
                <span>{SQFT_MIN.toLocaleString()}</span>
                <span>{SQFT_MAX.toLocaleString()}+</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Step 4 — frequency */}
      <section className={styles.sfSection}>
        <StepHeader step={4} title="How often should we clean your space?" subtitle="Sets how many visits per month — more visits, more value." />
        <p className={styles.sfEyebrow}>Per week</p>
        <div className={styles.sfFreqGrid}>
          {WEEKLY_FREQ_IDS.map((key) => {
            const sel = frequency === key
            return (
              <button
                key={key}
                type="button"
                className={cx(styles.sfFreqPill, sel && styles.sel)}
                onClick={() => setFrequency(key)}
              >
                <span className={styles.sfFreqBig}>{FREQ_BY[key].short}</span>
                <span className={styles.sfFreqSub}>/week</span>
              </button>
            )
          })}
        </div>
        {showMonthly ? (
          <>
            <p className={cx(styles.sfEyebrow, styles.sfEyebrowMt)}>Per month</p>
            <div className={styles.sfMonthlyGrid}>
              {MONTHLY_FREQ_IDS.map((key) => {
                const sel = frequency === key
                return (
                  <button
                    key={key}
                    type="button"
                    className={cx(styles.sfFreqPill, sel && styles.sel)}
                    onClick={() => setFrequency(key)}
                  >
                    <span className={styles.sfFreqBig}>{FREQ_BY[key].v}×</span>
                    <span className={styles.sfFreqSub}>/month</span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <button type="button" className={styles.sfShowMonthly} onClick={() => setShowMonthly(true)}>
            Need a less-than-weekly schedule? Show monthly options
            <ArrowRight />
          </button>
        )}
      </section>

      {/* Step 5 — density (after hours only) */}
      {!businessHours && (
        <section className={styles.sfSection}>
          <StepHeader step={5} title="How busy is your space on a typical day?" />
          <div className={styles.sfDensityGrid}>
            {(["low", "medium", "high"] as Density[]).map((d) => {
              const opt = dens[d]
              const sel = density === d
              return (
                <button
                  key={d}
                  type="button"
                  className={cx(styles.sfDensityCard, sel && styles.sel)}
                  onClick={() => setDensity(d)}
                >
                  <span className={styles.sfDensityImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={densityImage(selectedCat.id, d)} alt={`${opt.label} — ${selectedCat.name}`} />
                  </span>
                  <span className={styles.sfDensityBody}>
                    <span className={cx(styles.sfDensityLabel, sel && styles.sel)}>{opt.label}</span>
                    <span className={styles.sfDensityCopy}>{opt.copy}</span>
                    {d === "medium" && <span className={styles.sfBadge}>Most common</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Estimate */}
      <section className={styles.sfSection}>
        <div className={styles.sfEstimate}>
          <div>
            <div className={styles.sfPriceRow}>
              <span className={styles.sfPrice}>{monthlyText}</span>
              <span className={styles.sfPriceUnit}>/mo</span>
            </div>
            {pricing.minApplied && <p className={styles.sfMinNote}>Monthly minimum applies</p>}
          </div>
          <span className={styles.sfEstimateBtn}>
            Get Your Estimate
            <ArrowRight />
          </span>
        </div>
      </section>

      {/* Trust strip */}
      <section className={cx(styles.sfSection, styles.sfTrustSection)}>
        <div className={styles.sfTrust}>
          {[
            { icon: Shield, title: "Insured & Bonded", text: "Full coverage for your peace of mind" },
            { icon: Star, title: "35+ Years of Service", text: "Trusted by thousands of businesses" },
            { icon: Phone, title: "Free Consultation", text: "Call (800) 213-5857 anytime" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.sfTrustItem}>
              <Icon className={styles.sfTrustIcon} strokeWidth={1.8} />
              <p className={styles.sfTrustTitle}>{title}</p>
              <p className={styles.sfTrustText}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
