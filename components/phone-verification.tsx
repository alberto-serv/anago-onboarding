"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PhoneVerificationProps {
  onVerified: () => void
  title?: string
  subtitle?: string
  description?: string
  card?: boolean
  prePhoneSlot?: React.ReactNode
  unrecognizedPhones?: string[]
}

const normalizePhone = (raw: string) => raw.replace(/\D/g, "")

export function PhoneVerification({
  onVerified,
  title = "Welcome",
  subtitle,
  description,
  card = true,
  prePhoneSlot,
  unrecognizedPhones,
}: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [notRecognized, setNotRecognized] = useState(false)

  const SIMULATED_OTP = "123456"

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNotRecognized(false)

    if (!phoneNumber) {
      setError("Please enter a phone number")
      return
    }

    if (unrecognizedPhones && unrecognizedPhones.length > 0) {
      const entered = normalizePhone(phoneNumber)
      const blocked = unrecognizedPhones.some((p) => normalizePhone(p) === entered)
      if (blocked) {
        setNotRecognized(true)
        return
      }
    }

    setOtpSent(true)
  }

  const requestAccessHref = `mailto:help@goserv.com?subject=${encodeURIComponent(
    "Voda Express signup access request"
  )}&body=${encodeURIComponent(
    `Hi Voda team,\n\nI'd like access to the Voda Express signup. The phone number I tried (${phoneNumber}) wasn't recognized.\n\nThanks!`
  )}`

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsVerifying(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    if (otp === SIMULATED_OTP) {
      onVerified()
    } else {
      setError("Invalid OTP code. Please try again.")
      setIsVerifying(false)
    }
  }

  const inner = (
    <>
      <div className={`${card ? "mb-8 sm:mb-10" : "mb-8"}`}>
        <h1 className={`font-semibold tracking-tight ${card ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}>{title}</h1>
        {subtitle && (
          <p className={`text-muted-foreground/80 leading-relaxed mt-3 ${card ? "text-base sm:text-lg" : "text-[15px]"}`}>
            {subtitle}
          </p>
        )}
        <p className={`text-muted-foreground/60 leading-relaxed mt-2 ${card ? "text-sm sm:text-base" : "text-sm"}`}>
          {otpSent
            ? "Enter the verification code sent to your phone"
            : description || "Enter your phone number to sign up"}
        </p>
      </div>

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          {prePhoneSlot}

          <div className="space-y-2.5">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground/80">
              Mobile Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              required
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                if (notRecognized) setNotRecognized(false)
              }}
              className={`h-12 text-base rounded-xl transition-all ${
                card
                  ? "border-border/40 bg-background/60 focus:bg-background focus:border-primary"
                  : "border-border bg-background focus:border-primary"
              }`}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {notRecognized ? (
            <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-4">
              <p className="text-sm font-medium text-destructive">
                We don&apos;t recognize this phone number.
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Request access and the Voda team will reach out to get you set up.
              </p>
              <a
                href={requestAccessHref}
                className="mt-2 inline-flex w-full h-12 items-center justify-center rounded-xl bg-foreground hover:bg-foreground/90 text-background text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                Request Access
              </a>
            </div>
          ) : (
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-foreground hover:bg-foreground/90 text-background rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Continue
            </Button>
          )}

          <p className="text-xs sm:text-sm text-center text-muted-foreground/70 leading-relaxed pt-1">
            By continuing, you agree to our{" "}
            <a
              href="https://app.goserv.com/terms"
              className="text-foreground/70 font-medium hover:text-primary transition-colors"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="https://app.goserv.com/privacy"
              className="text-foreground/70 font-medium hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="otp" className="text-sm font-medium text-foreground/80">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`h-12 text-center text-lg tracking-[0.5em] rounded-xl transition-all ${
                card
                  ? "border-border/40 bg-background/60 focus:bg-background focus:border-primary"
                  : "border-border bg-background focus:border-primary"
              }`}
              maxLength={6}
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-foreground hover:bg-foreground/90 text-background rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      )}
    </>
  )

  if (!card) {
    return <div className="w-full max-w-sm">{inner}</div>
  }

  return (
    <div
      className="w-full max-w-md bg-card/92 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.2)] px-8 sm:px-10 py-10 sm:py-12 border border-white/15 rounded-3xl"
      style={{ animation: "scale-in 0.5s ease-out" }}
    >
      {inner}
    </div>
  )
}
