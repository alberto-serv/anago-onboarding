"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ServHeader } from "@/components/serv-header"
import {
  Check,
  HelpCircle,
  Rocket,
  CalendarCheck,
  CalendarX,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Building2,
  User,
  Plus,
  X,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react"
import { PreviewSection } from "./preview-section"

// Half-hour time options (00:00 → 23:30) shown in the business-hours selects.
// Values stay in 24h "HH:MM" form to match the stored schedule; labels render
// as 12-hour am/pm.
const TIME_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 48 },
  (_, i) => {
    const h = Math.floor((i * 30) / 60)
    const m = (i * 30) % 60
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    const ampm = h < 12 ? "am" : "pm"
    const h12 = h % 12 === 0 ? 12 : h % 12
    return { value, label: `${h12}:${String(m).padStart(2, "0")} ${ampm}` }
  }
)

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const

type DayKey = (typeof DAYS)[number]["key"]
type DayHours = { enabled: boolean; start: string; end: string }

const STEP_CONTENT = [
  "confirm-identity",
  "review-website",
  "confirm-business",
  "scheduling",
  "finish",
] as const
type StepContent = (typeof STEP_CONTENT)[number]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = STEP_CONTENT.length
  const currentContent: StepContent = STEP_CONTENT[step - 1]

  // --- Identity confirmation state ---
  const [identityData, setIdentityData] = useState({
    firstName: "Christian",
    lastName: "Betancourt",
    email: "christian@franchiseplaybook.com",
    locationName: "",
    phone: "(555) 123-4567",
  })

  // Hydrate the location chosen on a prior step, if present.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("signupData")
      const locationName =
        (raw ? JSON.parse(raw)?.locationName : "") || localStorage.getItem("locationName") || ""
      if (locationName) {
        setIdentityData((prev) => ({ ...prev, locationName }))
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  // --- Business details state ---
  const [businessDetails, setBusinessDetails] = useState({
    companyName: "",
    businessName: "Voda Cleaning & Restoration",
    contactPhone: "(555) 123-4567",
    supportPhone: "",
    supportEmail: "support@myvoda.com",
    businessAddress: "7400 Lockport Pl # J, Lorton, VA 22079",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })
  const [supportPhoneDifferent, setSupportPhoneDifferent] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // --- Scheduling state ---
  const [workingHours, setWorkingHours] = useState<Record<DayKey, DayHours>>({
    monday: { enabled: true, start: "08:00", end: "17:00" },
    tuesday: { enabled: true, start: "08:00", end: "17:00" },
    wednesday: { enabled: true, start: "08:00", end: "17:00" },
    thursday: { enabled: true, start: "08:00", end: "17:00" },
    friday: { enabled: true, start: "08:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "14:00" },
    sunday: { enabled: false, start: "09:00", end: "14:00" },
  })
  const [allowDoubleBooking, setAllowDoubleBooking] = useState(false)
  const [leadTimeHours, setLeadTimeHours] = useState("24")
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState("")

  const saveProgress = (next: number) => {
    try {
      localStorage.setItem("onboardingStep", next.toString())
      localStorage.setItem(
        "onboardingData",
        JSON.stringify({ identityData, businessDetails, workingHours, leadTimeHours }),
      )
    } catch {
      // ignore storage failures
    }
  }

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    window.scrollTo({ top: 0, behavior: "smooth" })
    if (step < totalSteps) {
      setStep(step + 1)
      saveProgress(step + 1)
    } else {
      router.push("/success")
    }
  }

  const handlePrevious = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    if (step > 1) {
      setStep(step - 1)
      saveProgress(step - 1)
    }
  }

  const setDay = (day: DayKey, patch: Partial<DayHours>) =>
    setWorkingHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))

  const addBlockedDate = () => {
    const value = newBlockedDate.trim()
    if (value && !blockedDates.includes(value)) {
      setBlockedDates((prev) => [...prev, value].sort())
    }
    setNewBlockedDate("")
  }

  const fmtDate = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
  }

  const NeedHelpLink = () => (
    <div className="flex justify-center pt-4">
      <a
        href="mailto:support@goserv.com"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        Need help?
      </a>
    </div>
  )

  const PrimaryButton = ({
    children,
    onClick,
    icon: Icon = Check,
  }: {
    children: React.ReactNode
    onClick: (e?: React.FormEvent) => void
    icon?: typeof Check
  }) => (
    <Button
      onClick={onClick}
      className="w-full h-14 text-base font-medium bg-foreground hover:bg-foreground/90 text-background shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl"
    >
      <Icon className="mr-2 h-5 w-5" />
      {children}
    </Button>
  )

  const BackButton = () => (
    <Button
      type="button"
      variant="outline"
      onClick={handlePrevious}
      className="w-full h-12 border border-border rounded-2xl bg-transparent hover:bg-muted transition-colors"
    >
      Back
    </Button>
  )

  return (
    <main className="min-h-screen bg-background">
      <ServHeader currentStep={step} totalSteps={totalSteps} />

      {/* Step 2 (Review Website) renders the Anago-branded Pricing Setup full-width;
          it carries its own design system, scoped so it doesn't touch the rest of the app. */}
      {currentContent === "review-website" ? (
        <div className="pt-16">
          <PreviewSection onContinue={handleNext} onBack={handlePrevious} />
        </div>
      ) : (
      <div className="max-w-4xl mx-auto px-6 pb-16 pt-28 sm:pt-32">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* Step 1: Confirm Identity */}
        {/* ═══════════════════════════════════════════════════════ */}
        {currentContent === "confirm-identity" && (
          <div className="space-y-10" style={{ animation: "fade-up 0.4s ease-out" }}>
            <div className="space-y-3">
              <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-bold">Is this You?</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                We found your account. Please verify your information is correct.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    First Name
                  </Label>
                  <Input value={identityData.firstName} disabled className="h-11 rounded-xl bg-muted/50 text-base" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Last Name
                  </Label>
                  <Input value={identityData.lastName} disabled className="h-11 rounded-xl bg-muted/50 text-base" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Work Email
                </Label>
                <Input
                  value={identityData.email}
                  onChange={(e) => setIdentityData((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-11 rounded-xl text-base"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Cell Phone Number
                </Label>
                <Input
                  value={identityData.phone}
                  onChange={(e) => setIdentityData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-11 rounded-xl text-base"
                  type="tel"
                />
              </div>

              {identityData.locationName && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Service Area
                  </Label>
                  <Input value={identityData.locationName} disabled className="h-11 rounded-xl bg-muted/50 text-base" />
                </div>
              )}
            </div>

            {/* Team members & billing admin */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-7">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Team Members &amp; Billing Admin</h2>
                <p className="text-base text-muted-foreground">
                  Invite teammates and assign who can manage billing for your account.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/40 p-5 sm:p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  What a Billing Admin can do
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                  {[
                    "View and pay invoices",
                    "Update card & payout account",
                    "Manage subscription & plan",
                    "Add or remove billing users",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Billing Admin
                </p>
                <div className="flex items-center gap-3 rounded-xl border border-border p-4 sm:p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {identityData.firstName} {identityData.lastName}
                      <span className="font-normal text-muted-foreground ml-1.5">(you)</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{identityData.email}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary flex-shrink-0">Billing admin</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add team members or change the billing admin role from your Stripe dashboard under{" "}
                  <span className="font-medium text-foreground">Settings → Team</span>.
                </p>
                <a
                  href="https://dashboard.stripe.com/settings/team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border-[1.5px] border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
                >
                  Manage team in Stripe
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <PrimaryButton onClick={handleNext}>Continue</PrimaryButton>

            <p className="text-sm text-center text-muted-foreground">
              Not you?{" "}
              <a href="mailto:help@goserv.com" className="text-primary hover:underline font-medium">
                Contact us
              </a>
            </p>

            <NeedHelpLink />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* Step 3: Confirm Business Details */}
        {/* ═══════════════════════════════════════════════════════ */}
        {currentContent === "confirm-business" && (
          <form onSubmit={handleNext} className="space-y-10" style={{ animation: "fade-up 0.4s ease-out" }}>
            <div className="space-y-3">
              <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-bold">Confirm Your Business Details</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                This information will appear on your storefront so customers can reach you.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Company Name (on EIN)
                </Label>
                <Input
                  value={businessDetails.companyName}
                  onChange={(e) => setBusinessDetails((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Legal entity name"
                  className="h-11 rounded-xl text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Doing Business As
                </Label>
                <Input
                  value={businessDetails.businessName}
                  onChange={(e) => setBusinessDetails((prev) => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Name shown to customers"
                  className="h-11 rounded-xl text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Contact Phone
                </Label>
                <Input
                  value={businessDetails.contactPhone}
                  onChange={(e) => setBusinessDetails((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className="h-11 rounded-xl text-base"
                  type="tel"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportPhoneDifferent}
                    onChange={(e) => {
                      setSupportPhoneDifferent(e.target.checked)
                      if (!e.target.checked) setBusinessDetails((prev) => ({ ...prev, supportPhone: "" }))
                    }}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-muted-foreground">Support phone is different from contact phone</span>
                </label>
                {supportPhoneDifferent && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      Support Phone (displayed on page)
                    </Label>
                    <Input
                      value={businessDetails.supportPhone}
                      onChange={(e) => setBusinessDetails((prev) => ({ ...prev, supportPhone: e.target.value }))}
                      className="h-11 rounded-xl text-base"
                      type="tel"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Support Email
                </Label>
                <Input
                  value={businessDetails.supportEmail}
                  onChange={(e) => setBusinessDetails((prev) => ({ ...prev, supportEmail: e.target.value }))}
                  className="h-11 rounded-xl text-base"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Business Address
                </Label>
                <Input
                  value={businessDetails.businessAddress}
                  onChange={(e) => setBusinessDetails((prev) => ({ ...prev, businessAddress: e.target.value }))}
                  className="h-11 rounded-xl text-base"
                />
              </div>
            </div>

            {/* Billing */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                  <CreditCard className="h-3.5 w-3.5" />
                  Billing
                </Label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your SERV plan starts at{" "}
                  <span className="font-semibold text-foreground">$250.00/month and $50 per additional territory</span>.
                </p>
              </div>

              <div className="pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm((v) => !v)}
                  className="flex items-center gap-2 pt-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {showPaymentForm ? "Hide card details" : "Add a card on file"}
                  <span className="ml-auto text-xs text-muted-foreground/60">{showPaymentForm ? "▲" : "▼"}</span>
                </button>

                {showPaymentForm && (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Name on Card</Label>
                      <Input
                        value={businessDetails.cardName}
                        onChange={(e) => setBusinessDetails((prev) => ({ ...prev, cardName: e.target.value }))}
                        placeholder="Full name as it appears on card"
                        className="h-11 rounded-xl text-base"
                        autoComplete="cc-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Card Number</Label>
                      <Input
                        value={businessDetails.cardNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 19)
                          const formatted = digits.replace(/(.{4})/g, "$1 ").trim()
                          setBusinessDetails((prev) => ({ ...prev, cardNumber: formatted }))
                        }}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        className="h-11 rounded-xl text-base font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Expiry (MM/YY)</Label>
                        <Input
                          value={businessDetails.cardExpiry}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 4)
                            const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
                            setBusinessDetails((prev) => ({ ...prev, cardExpiry: formatted }))
                          }}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          className="h-11 rounded-xl text-base font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">CVC</Label>
                        <Input
                          value={businessDetails.cardCvc}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 4)
                            setBusinessDetails((prev) => ({ ...prev, cardCvc: digits }))
                          }}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          className="h-11 rounded-xl text-base font-mono"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-green-600" />
                      Your card is encrypted and stored securely.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <PrimaryButton onClick={handleNext}>Continue</PrimaryButton>
            <BackButton />
            <NeedHelpLink />
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* Step 4: Scheduling */}
        {/* ═══════════════════════════════════════════════════════ */}
        {currentContent === "scheduling" && (
          <div className="space-y-10" style={{ animation: "fade-up 0.4s ease-out" }}>
            <div className="space-y-3">
              <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-bold">Set Your Availability</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Tell us when you take bookings so customers only schedule during the hours you work.
              </p>
            </div>

            {/* Working hours */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-bold">Business Hours</h2>
              </div>
              <div className="space-y-3">
                {DAYS.map(({ key, label }) => {
                  const day = workingHours[key]
                  return (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border border-border p-4"
                    >
                      <div className="flex items-center gap-3 sm:w-44">
                        <Switch checked={day.enabled} onCheckedChange={(v) => setDay(key, { enabled: v })} />
                        <span className={`text-sm font-medium ${day.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                      </div>
                      {day.enabled ? (
                        <div className="flex items-center gap-2">
                          <Select value={day.start} onValueChange={(v) => setDay(key, { start: v })}>
                            <SelectTrigger className="h-10 w-32 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-muted-foreground">to</span>
                          <Select value={day.end} onValueChange={(v) => setDay(key, { end: v })}>
                            <SelectTrigger className="h-10 w-32 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Closed</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Booking rules */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold">Booking Rules</h2>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Allow double booking</p>
                  <p className="text-sm text-muted-foreground">Let more than one job be booked in the same time slot.</p>
                </div>
                <Switch checked={allowDoubleBooking} onCheckedChange={setAllowDoubleBooking} />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2 pt-4">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Minimum lead time before first appointment
                </Label>
                <Select value={leadTimeHours} onValueChange={setLeadTimeHours}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { v: "0", l: "No minimum" },
                      { v: "2", l: "2 hours" },
                      { v: "4", l: "4 hours" },
                      { v: "12", l: "12 hours" },
                      { v: "24", l: "24 hours" },
                      { v: "48", l: "48 hours" },
                    ].map((o) => (
                      <SelectItem key={o.v} value={o.v}>
                        {o.l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Blocked dates */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <CalendarX className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-bold">Blocked Dates</h2>
              </div>
              <p className="text-sm text-muted-foreground">Add days you&apos;re unavailable and customers can&apos;t book.</p>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="h-11 rounded-xl text-base"
                />
                <Button
                  type="button"
                  onClick={addBlockedDate}
                  variant="outline"
                  className="h-11 rounded-xl px-4 border border-border bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {blockedDates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blockedDates.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium"
                    >
                      {fmtDate(d)}
                      <button
                        type="button"
                        onClick={() => setBlockedDates((prev) => prev.filter((x) => x !== d))}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${d}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <PrimaryButton onClick={handleNext}>Continue</PrimaryButton>
            <BackButton />
            <NeedHelpLink />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* Step 5: Finish */}
        {/* ═══════════════════════════════════════════════════════ */}
        {currentContent === "finish" && (
          <div className="space-y-10" style={{ animation: "fade-up 0.4s ease-out" }}>
            <div className="space-y-3">
              <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-bold">You&apos;re All Set!</h1>
              <p className="text-lg text-muted-foreground max-w-xl">Here are a few things you can do next.</p>
            </div>

            <div className="space-y-4">
              {/* Setup Recurring Subscriptions */}
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Setup Recurring Subscriptions</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You will receive a link shortly to complete setup (Bank, EIN, SSN needed). Set up Stripe Connect to
                      offer subscriptions, offer coupon codes and get paid fast.
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Training */}
              <div
                className="group bg-card border border-border rounded-2xl p-6 sm:p-8 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                onClick={() => window.open("https://meetings.hubspot.com/annee-belanger", "_blank")}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 flex-shrink-0">
                    <CalendarCheck className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Schedule Training</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Book a session with our team to learn how to get the most out of SERV.
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            </div>

            <PrimaryButton onClick={() => router.push("/success")} icon={Rocket}>
              Done
            </PrimaryButton>
            <BackButton />
            <NeedHelpLink />
          </div>
        )}
      </div>
      )}
    </main>
  )
}
