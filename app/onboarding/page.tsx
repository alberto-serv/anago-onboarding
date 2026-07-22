"use client"

import type React from "react"

import { useState, useEffect, Fragment } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ServHeader } from "@/components/serv-header"
import {
  Check,
  HelpCircle,
  Rocket,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Building2,
  User,
  Plus,
  X,
  Pencil,
  SlidersHorizontal,
  Info,
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

// US federal holidays offered on the scheduling step. Bookings are blocked on
// any the owner marks as observed.
const HOLIDAYS = [
  { key: "newYearsDay",     label: "New Year's Day",             date: "Jan 1" },
  { key: "mlkDay",          label: "Martin Luther King Jr. Day", date: "3rd Mon of Jan" },
  { key: "presidentsDay",   label: "Presidents' Day",            date: "3rd Mon of Feb" },
  { key: "memorialDay",     label: "Memorial Day",               date: "Last Mon of May" },
  { key: "juneteenth",      label: "Juneteenth",                 date: "Jun 19" },
  { key: "independenceDay", label: "Independence Day",           date: "Jul 4" },
  { key: "laborDay",        label: "Labor Day",                  date: "1st Mon of Sep" },
  { key: "columbusDay",     label: "Columbus Day",               date: "2nd Mon of Oct" },
  { key: "veteransDay",     label: "Veterans Day",               date: "Nov 11" },
  { key: "thanksgiving",    label: "Thanksgiving Day",           date: "4th Thu of Nov" },
  { key: "christmas",       label: "Christmas Day",              date: "Dec 25" },
] as const
type HolidayKey = (typeof HOLIDAYS)[number]["key"]

type StepContent = "confirm-identity" | "review-website" | "confirm-business" | "scheduling" | "finish"

// Active onboarding steps.
const STEP_CONTENT: StepContent[] = ["confirm-identity", "review-website", "confirm-business", "scheduling", "finish"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = STEP_CONTENT.length
  const currentContent: StepContent = STEP_CONTENT[step - 1]

  // --- Identity confirmation state ---
  const [identityData, setIdentityData] = useState({
    firstName: "Adam",
    lastName: "Povlitz",
    email: "adam@anagocleaning.com",
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
    businessName: "Anago Cleaning Systems",
    contactPhone: "(555) 123-4567",
    supportPhone: "",
    supportEmail: "support@anagocleaning.com",
    businessAddress: "20 SW 27th Ave. Suite 300 | Pompano Beach, FL 33069",
  })
  const [supportPhoneDifferent, setSupportPhoneDifferent] = useState(false)

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
  const [includeScheduling, setIncludeScheduling] = useState(true)
  const [liveBookings, setLiveBookings] = useState(false)
  const [availabilityPreference, setAvailabilityPreference] = useState("Use tech availability")
  const [jobsPerSlot, setJobsPerSlot] = useState(8)
  const [advanceNotice, setAdvanceNotice] = useState("None")
  const [useSlotsByJobType, setUseSlotsByJobType] = useState(false)
  const [bookingSlotDuration, setBookingSlotDuration] = useState("1:00 hours")
  const [open247, setOpen247] = useState(false)
  const [openOnHolidays, setOpenOnHolidays] = useState(true)
  const [observedHolidays, setObservedHolidays] = useState<Record<HolidayKey, boolean>>({
    newYearsDay: true,
    mlkDay: false,
    presidentsDay: false,
    memorialDay: true,
    juneteenth: false,
    independenceDay: true,
    laborDay: true,
    columbusDay: false,
    veteransDay: false,
    thanksgiving: true,
    christmas: true,
  })
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState("")

  // Business-hours dialog. We snapshot on open so Cancel can roll back edits to
  // the working hours and the two open-24/7 / open-on-holidays toggles.
  const [businessHoursOpen, setBusinessHoursOpen] = useState(false)
  const [hoursSnapshot, setHoursSnapshot] = useState<{
    workingHours: Record<DayKey, DayHours>
    open247: boolean
    openOnHolidays: boolean
  } | null>(null)
  const openBusinessHours = () => {
    setHoursSnapshot({ workingHours, open247, openOnHolidays })
    setBusinessHoursOpen(true)
  }
  const cancelBusinessHours = () => {
    if (hoursSnapshot) {
      setWorkingHours(hoursSnapshot.workingHours)
      setOpen247(hoursSnapshot.open247)
      setOpenOnHolidays(hoursSnapshot.openOnHolidays)
    }
    setBusinessHoursOpen(false)
  }

  const saveProgress = (next: number) => {
    try {
      localStorage.setItem("onboardingStep", next.toString())
      localStorage.setItem(
        "onboardingData",
        JSON.stringify({
          identityData,
          businessDetails,
          workingHours,
          open247,
          openOnHolidays,
          availabilityPreference,
          jobsPerSlot,
          advanceNotice,
          useSlotsByJobType,
          bookingSlotDuration,
          observedHolidays,
          blockedDates,
        }),
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
              <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-bold">Scheduling</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Set your availability, holidays, and booking capacity. You can update these anytime from your dashboard.
              </p>
            </div>

            {/* Scheduling options */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Include scheduling</p>
                <Switch checked={includeScheduling} onCheckedChange={setIncludeScheduling} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Switch to live bookings</p>
                <Switch checked={liveBookings} onCheckedChange={setLiveBookings} />
              </div>
            </div>

            {/* Availability */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium text-muted-foreground">Availability</Label>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={openBusinessHours}
                className="rounded-full h-9 px-4 gap-2 text-sm"
              >
                Edit business hours
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              {/* Availability preference */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Availability preference</Label>
                <Select value={availabilityPreference} onValueChange={setAvailabilityPreference}>
                  <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Use tech availability", "Set number of jobs per slot", "Allow double booking"].map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Display availability based on your team&apos;s schedule or a set number of slots
                </p>
              </div>

              {/* Jobs per slot — only when "Set number of jobs per slot" is chosen */}
              {availabilityPreference === "Set number of jobs per slot" && (
                <div className="space-y-1.5">
                  <Label htmlFor="jobs-per-slot" className="text-sm font-medium">
                    Jobs per slot
                  </Label>
                  <Input
                    id="jobs-per-slot"
                    type="number"
                    min={1}
                    value={jobsPerSlot}
                    onChange={(e) => setJobsPerSlot(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 w-24 rounded-xl text-sm"
                  />
                </div>
              )}

              {/* Advance notice required */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Advance notice required</Label>
                <Select value={advanceNotice} onValueChange={setAdvanceNotice}>
                  <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["None", "1 hour", "2 hours", "4 hours", "6 hours", "8 hours", "10 hours", "1 day", "2 days", "3 days", "7 days"].map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Specify the buffer time you need for new bookings</p>
              </div>

              {/* Use slots by job type */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Use slots by job type</Label>
                  <Switch checked={useSlotsByJobType} onCheckedChange={setUseSlotsByJobType} />
                </div>
                <p className="text-xs text-muted-foreground">Use job type specific slot durations</p>
              </div>

              {/* Booking slot duration — hidden when slots are set per job type */}
              {!useSlotsByJobType && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Booking slot duration</Label>
                  <Select value={bookingSlotDuration} onValueChange={setBookingSlotDuration}>
                    <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["0:30 hours", "1:00 hours", "1:30 hours", "2:00 hours", "2:30 hours", "3:00 hours", "3:30 hours", "4:00 hours"].map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Set the default booking slot length</p>
                </div>
              )}
            </div>

            {/* Edit business hours dialog */}
            <Dialog open={businessHoursOpen} onOpenChange={(o) => (o ? setBusinessHoursOpen(true) : cancelBusinessHours())}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit business hours of operation</DialogTitle>
                </DialogHeader>

                <div
                  className={`grid grid-cols-[4.5rem_4.5rem_1fr_1fr] items-center gap-x-3 gap-y-2.5 ${
                    open247 ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <span className="text-sm font-semibold text-muted-foreground">Day:</span>
                  <span className="text-sm font-semibold text-muted-foreground">Working?</span>
                  <span className="text-sm font-semibold text-muted-foreground">Start at:</span>
                  <span className="text-sm font-semibold text-muted-foreground">End at:</span>
                  {DAYS.map(({ key, label }) => {
                    const day = workingHours[key]
                    return (
                      <Fragment key={key}>
                        <span className="text-sm font-medium">{label}</span>
                        <Checkbox
                          checked={day.enabled}
                          onCheckedChange={(c) => setDay(key, { enabled: c === true })}
                        />
                        <Select value={day.start} onValueChange={(v) => setDay(key, { start: v })}>
                          <SelectTrigger className="h-10 rounded-lg text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={day.end} onValueChange={(v) => setDay(key, { end: v })}>
                          <SelectTrigger className="h-10 rounded-lg text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Fragment>
                    )
                  })}
                </div>

                <div className="mt-2 space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Open 24/7</span>
                    <Switch checked={open247} onCheckedChange={setOpen247} className="data-[state=checked]:bg-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Open on holidays</span>
                    <Switch checked={openOnHolidays} onCheckedChange={setOpenOnHolidays} className="data-[state=checked]:bg-green-500" />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={cancelBusinessHours} className="rounded-full px-6">
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setBusinessHoursOpen(false)} className="rounded-full px-6">
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* US Holidays */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium text-muted-foreground">US Holidays</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                Select the holidays you observe. Bookings will automatically be blocked on these dates.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOLIDAYS.map(({ key, label, date }) => {
                  const observed = observedHolidays[key]
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                        observed
                          ? "border-primary/40 bg-primary/[0.03]"
                          : "border-border/60 bg-background/50 hover:border-primary/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={observed}
                        onChange={(e) =>
                          setObservedHolidays((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="rounded border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{label}</p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-4">
                <Info className="h-3.5 w-3.5 shrink-0 mt-px" />
                This change will only take effect on your SERV booking calendar.
              </p>
            </div>

            {/* Blocked Business Days */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CalendarX className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium text-muted-foreground">Blocked Business Days</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                Add specific dates when your business will be closed (vacations, company events, etc.).
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="h-11 rounded-xl text-base flex-1"
                />
                <Button
                  type="button"
                  onClick={addBlockedDate}
                  variant="outline"
                  disabled={!newBlockedDate}
                  className="h-11 rounded-xl px-4 border border-border bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {blockedDates.length > 0 ? (
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
              ) : (
                <p className="text-xs text-muted-foreground italic">No blocked days added yet.</p>
              )}
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-4">
                <Info className="h-3.5 w-3.5 shrink-0 mt-px" />
                This change will only take effect on your SERV booking calendar.
              </p>
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
