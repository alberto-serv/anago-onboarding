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
const LOCATION_OPTIONS = [
  "Atlanta, GA",
  "Austin, TX",
  "Baltimore, MD",
  "Boise, ID",
  "Charleston, SC",
  "Charlotte, NC",
  "Cincinnati, OH",
  "Clarksville, TN",
  "Cleveland, OH",
  "Colorado, CO",
  "Columbus, OH",
  "Dallas, TX",
  "Dayton, OH",
  "Hampton Roads, VA",
  "Hawaii, HI",
  "Houston, TX",
  "Hudson Valley, NY",
  "Jacksonville, FL",
  "Las Vegas, NV",
  "Long Island, NY",
  "Metro Detroit, MI",
  "Minneapolis, MN",
  "Nebraska, NE",
  "Newark, NJ",
  "North Florida, FL",
  "Northern California, CA",
  "Oklahoma City, OK",
  "Orlando, FL",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "Portland, OR",
  "San Antonio, TX",
  "South Florida, FL",
  "South Jersey, NJ",
  "Southern California, CA",
  "Southwest Connecticut, CT",
  "Southwest Florida, FL",
  "St Paul, MN",
  "Tampa, FL",
  "Triangle, NC",
  "Tulsa, OK",
  "Vancouver, BC",
  "Washington DC, DC",
  "Western PA, PA",
]

export default function LocationPage() {
  const router = useRouter()
  const [locationName, setLocationName] = useState("")
  const [open, setOpen] = useState(false)

  const handleContinue = () => {
    if (!locationName) return
    localStorage.setItem("locationName", locationName)
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
                        key={loc}
                        value={loc}
                        onSelect={() => {
                          setLocationName(loc === locationName ? "" : loc)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            locationName === loc ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {loc}
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
