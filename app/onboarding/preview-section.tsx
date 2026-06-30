"use client"

import { useState } from "react"
import { Monitor, Smartphone, Eye, SlidersHorizontal, Check, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./pricing-setup.module.css"
import { useRateCard } from "./rate-card"
import { PricingEditor } from "./pricing-setup"
import { StorefrontPreview } from "./storefront-preview"

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ")

interface PreviewSectionProps {
  onContinue: () => void
  onBack: () => void
}

/**
 * Step 2 of onboarding. The franchisee's booking page is shown first (Preview),
 * with an Edit mode for the rate card. Both share one rate-card state, so any
 * pricing change is reflected live in the preview. A device toggle switches the
 * preview between desktop and mobile widths (container-query driven).
 *
 * The Anago brand is scoped to this `.page` wrapper via a CSS module so it never
 * leaks into the rest of the (Voda-themed) app. The app header sits above this,
 * and the Continue/Back buttons keep the app's styling — per spec.
 */
export function PreviewSection({ onContinue, onBack }: PreviewSectionProps) {
  const rc = useRateCard()
  const [mode, setMode] = useState<"preview" | "edit">("preview")
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")

  const goTo = (next: "preview" | "edit") => {
    setMode(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className={styles.page}>
      {/* Anago fonts — React hoists these to <head>; scoped usage keeps them out of the rest of the app. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Special+Gothic+Condensed+One&family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Preview / Edit toggle (+ device toggle in preview), sticky under the app header */}
      <div className={styles.previewBar}>
        <div className={styles.wrap}>
          <div className={styles.previewBarIn}>
            <div className={styles.modeTabs}>
              <button
                type="button"
                className={cx(styles.modeTab, mode === "preview" && styles.on)}
                onClick={() => goTo("preview")}
              >
                <Eye strokeWidth={2} />
                Preview
              </button>
              <button
                type="button"
                className={cx(styles.modeTab, mode === "edit" && styles.on)}
                onClick={() => goTo("edit")}
              >
                <SlidersHorizontal strokeWidth={2} />
                Edit pricing
              </button>
            </div>

            {mode === "preview" && (
              <div className={styles.deviceTabs}>
                <button
                  type="button"
                  className={cx(styles.deviceTab, device === "desktop" && styles.on)}
                  onClick={() => setDevice("desktop")}
                  aria-label="Desktop preview"
                  title="Desktop"
                >
                  <Monitor strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className={cx(styles.deviceTab, device === "mobile" && styles.on)}
                  onClick={() => setDevice("mobile")}
                  aria-label="Mobile preview"
                  title="Mobile"
                >
                  <Smartphone strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mode === "preview" ? (
        <>
          <div className={cx(styles.wrap, styles.head)}>
            <h1>Your Booking Page</h1>
            <p>This is the live page your customers see. Select Edit to adjust your pricing.</p>
          </div>
          <div className={styles.wrap}>
            <div className={cx(styles.deviceStage, device === "mobile" && styles.mobile)}>
              <div className={cx(styles.deviceFrame, device === "mobile" && styles.mobile)}>
                <StorefrontPreview rc={rc} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <PricingEditor rc={rc} />
      )}

      {/* host-app Continue / Back (shared by both modes) */}
      <div className={styles.wrap}>
        <div className={styles.actions}>
          <div className="flex gap-3">
            {mode === "preview" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => goTo("edit")}
                className="h-14 px-5 text-base font-medium border border-border rounded-2xl bg-transparent hover:bg-muted transition-colors shrink-0"
              >
                <SlidersHorizontal className="mr-2 h-5 w-5" />
                Edit pricing
              </Button>
            )}
            <Button
              onClick={onContinue}
              className="flex-1 h-14 text-base font-medium bg-foreground hover:bg-foreground/90 text-background shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl"
            >
              <Check className="mr-2 h-5 w-5" />
              Continue
            </Button>
          </div>
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
