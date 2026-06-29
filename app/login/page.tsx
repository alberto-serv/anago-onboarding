"use client"

import { useRouter } from "next/navigation"
import { PhoneVerification } from "@/components/phone-verification"
import Image from "next/image"
import { DollarSign, Clock, CreditCard, Building2, User, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const handleVerified = () => {
    const prefilledData = {
      customerName: "Adam Povlitz",
      businessName: "Anago Cleaning Systems",
      phoneNumber: "(555) 123-4567",
      mailingAddress: "20 SW 27th Ave. Suite 300 | Pompano Beach, FL 33069",
      email: "adam@anagocleaning.com",
      website: "https://anagocleaning.com/",
      crm: "Workiz",
      locationName: localStorage.getItem("locationName") || "",
    }
    localStorage.setItem("signupData", JSON.stringify(prefilledData))
    router.push("/onboarding")
  }

  const readyItems = [
    { icon: Building2, label: "Facility types you serve" },
    { icon: DollarSign, label: "Hourly wage and minimums" },
    { icon: Clock, label: "About 5 minutes" },
  ]

  const paymentItems = [
    { icon: Building2, label: "Bank routing & account number" },
    { icon: CreditCard, label: "EIN (Employer Identification Number)" },
    { icon: User, label: "Owner name, DOB & email" },
    { icon: ShieldCheck, label: "SSN last 4 digits" },
  ]

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

        {/* Form + checklists as a single flowing group */}
        <div className="px-8 sm:px-10 lg:px-14 py-10 lg:py-16 space-y-10">
          <PhoneVerification
            card={false}
            onVerified={handleVerified}
            subtitle="Let's get your Express page live. You'll be taking bookings in minutes."
            description="Enter your phone number to continue."
            unrecognizedPhones={["000"]}
          />

          {/* Preparation checklists */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Have these ready */}
            <div className="flex-1 rounded-2xl border border-border/60 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 mb-3.5">
                Have these ready
              </p>
              <div className="space-y-3">
                {readyItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.07] flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-primary/80" />
                    </div>
                    <span className="text-[13px] text-foreground/80">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* For payment setup */}
            <div className="flex-1 rounded-2xl border border-border/60 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 mb-3.5">
                For payment setup (optional)
              </p>
              <div className="space-y-3">
                {paymentItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.07] flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-primary/80" />
                    </div>
                    <span className="text-[13px] text-foreground/80">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                src="/anago-booking.webm"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
