"use client"

import { ServHeader } from "@/components/serv-header"
import { Check } from "lucide-react"

export default function SuccessPage() {
  return (
    <>
      <ServHeader />
      <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Animated gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent"
          style={{ backgroundSize: "200% 200%", animation: "gradient 15s ease infinite" }}
        />

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Decorative shapes */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full border-[48px] border-white/[0.04] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-8%] w-[500px] h-[500px] rounded-full bg-white/[0.025] pointer-events-none" />

        <div
          className="relative z-10 max-w-xl w-full text-center py-16"
          style={{ animation: "fade-up 0.6s ease-out" }}
        >
          {/* Check mark */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
            <Check className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Thank you!</h1>
          <p className="text-lg text-white/70 max-w-sm mx-auto leading-relaxed">
            Everything is in place to streamline your sales process and close customers faster.
          </p>
        </div>
      </main>
    </>
  )
}
