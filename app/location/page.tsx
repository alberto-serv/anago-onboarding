"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import Image from "next/image"
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Anago franchise locations (anagocleaning.com), sourced from the extract.
interface LocationOption {
  label: string
  phone: string
}

const LOCATION_OPTIONS: LocationOption[] = [
  { label: "Atlanta, GA", phone: "(770) 766-7039" },
  { label: "Austin, TX", phone: "(512) 980-3741" },
  { label: "Baltimore, MD", phone: "(410) 561-6503" },
  { label: "Boise, ID", phone: "(208) 514-4786" },
  { label: "Charleston, SC", phone: "(843) 874-8997" },
  { label: "Charlotte, NC", phone: "(704) 326-7576" },
  { label: "Cincinnati, OH", phone: "(513) 718-4841" },
  { label: "Clarksville, TN", phone: "(931) 904-7710" },
  { label: "Cleveland, OH", phone: "(440) 298-2116" },
  { label: "Colorado, CO", phone: "(720) 738-4875" },
  { label: "Columbus, OH", phone: "(614) 902-4859" },
  { label: "Dallas, TX", phone: "(214) 915-0531" },
  { label: "Dayton, OH", phone: "(937) 932-2520" },
  { label: "Hampton Roads, VA", phone: "(757) 656-3022" },
  { label: "Hawaii, HI", phone: "(808) 400-9181" },
  { label: "Houston, TX", phone: "(713) 581-6303" },
  { label: "Hudson Valley, NY", phone: "(914) 292-3115" },
  { label: "Jacksonville, FL", phone: "(904) 601-1391" },
  { label: "Las Vegas, NV", phone: "(702) 478-3398" },
  { label: "Long Island, NY", phone: "(516) 701-1843" },
  { label: "Metro Detroit, MI", phone: "(248) 270-5533" },
  { label: "Minneapolis, MN", phone: "(952) 260-7307" },
  { label: "Nebraska, NE", phone: "(402) 382-9073" },
  { label: "Newark, NJ", phone: "(973) 847-2881" },
  { label: "North Florida, FL", phone: "(352) 449-3665" },
  { label: "Northern California, CA", phone: "(408) 335-4255" },
  { label: "Oklahoma City, OK", phone: "(405) 463-1902" },
  { label: "Orlando, FL", phone: "(407) 603-3533" },
  { label: "Philadelphia, PA", phone: "(610) 463-0251" },
  { label: "Phoenix, AZ", phone: "(480) 771-2703" },
  { label: "Portland, OR", phone: "(503) 714-9987" },
  { label: "San Antonio, TX", phone: "(210) 529-8457" },
  { label: "South Florida, FL", phone: "(954) 289-6250" },
  { label: "South Jersey, NJ", phone: "(856) 606-0980" },
  { label: "Southern California, CA", phone: "(949) 518-0660" },
  { label: "Southwest Connecticut, CT", phone: "(203) 902-8431" },
  { label: "Southwest Florida, FL", phone: "(239) 237-5475" },
  { label: "St Paul, MN", phone: "(952) 260-7307" },
  { label: "Tampa, FL", phone: "(727) 330-3580" },
  { label: "Triangle, NC", phone: "(919) 925-4337" },
  { label: "Tulsa, OK", phone: "(918) 779-3315" },
  { label: "Vancouver, BC", phone: "(604) 670-3443" },
  { label: "Washington DC, DC", phone: "(301) 900-5303" },
  { label: "Western PA, PA", phone: "(412) 453-8352" },
]

export default function LocationPage() {
  const router = useRouter()
  const [locationName, setLocationName] = useState("")
  const [open, setOpen] = useState(false)

  const handleContinue = () => {
    if (!locationName) return
    const selected = LOCATION_OPTIONS.find((o) => o.label === locationName)
    localStorage.setItem("locationName", locationName)
    if (selected) localStorage.setItem("locationPhone", selected.phone)
    router.push("/login")
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* ─── Left: Action panel ─── */}
      <div className="lg:w-[42%] lg:flex-shrink-0 relative flex flex-col justify-center lg:min-h-screen">
        {/* Logo */}
        <div className="px-8 sm:px-10 lg:px-14 pt-10 lg:pt-12 lg:absolute lg:top-0 lg:left-0">
          <Image
            src="/logo.png"
            alt="SERV"
            width={120}
            height={48}
            className="h-7 w-auto"
            priority
          />
        </div>

        {/* Form */}
        <div className="px-8 sm:px-10 lg:px-14 py-10 lg:py-16 space-y-8">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Step 1 of 2</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Select your location name
            </h2>
            <p className="text-muted-foreground">
              Choose your SERV location from the list to get started.
            </p>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground/80">
              Location name
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "h-12 w-full justify-between rounded-xl text-base font-normal border-border bg-background",
                    !locationName && "text-muted-foreground"
                  )}
                >
                  {locationName || "Select your location"}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Filter locations..." />
                  <CommandList>
                    <CommandEmpty>No location found.</CommandEmpty>
                    {LOCATION_OPTIONS.map((loc) => (
                      <CommandItem
                        key={loc.label}
                        value={loc.label}
                        onSelect={() => {
                          setLocationName(loc.label === locationName ? "" : loc.label)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            locationName === loc.label ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="flex-1">{loc.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{loc.phone}</span>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!locationName}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── Right: Brand panel ─── */}
      <div className="relative flex-1 overflow-hidden lg:m-3 lg:rounded-3xl">
        {/* Gradient background — refined, deeper */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent"
          style={{ backgroundSize: "200% 200%", animation: "gradient 15s ease infinite" }}
        />

        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Single refined geometric accent */}
        <div className="absolute top-[-10%] right-[-8%] w-[500px] h-[500px] rounded-full border-[48px] border-white/[0.03] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-12%] w-[400px] h-[400px] rounded-full bg-white/[0.02] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-10 sm:px-14 lg:px-16 xl:px-20 py-12 lg:py-20">
          <div className="max-w-lg">
            {/* Eyebrow */}
            <p className="text-white/50 text-sm font-medium tracking-wide uppercase mb-4">
              Get started
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-white leading-[1.1] tracking-tight">
              Get your Express site live in 5 minutes
            </h1>

            <p className="mt-5 text-white/50 text-base lg:text-lg leading-relaxed max-w-md">
              A beautiful booking page, instant payments, and seamless CRM sync — all set up in one sitting.
            </p>

            {/* Video */}
            <div className="mt-10 lg:mt-12 rounded-2xl overflow-hidden ring-1 ring-white/[0.08] shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto block"
                src="/Voda.mp4"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
