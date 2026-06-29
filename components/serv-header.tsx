import Image from "next/image"
import Link from "next/link"

interface ServHeaderProps {
  currentStep?: number
  totalSteps?: number
}

export function ServHeader({ currentStep, totalSteps }: ServHeaderProps) {
  const showProgress = currentStep !== undefined && totalSteps !== undefined

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <Image src="/logo.png" alt="SERV" width={80} height={32} className="h-7 w-auto" priority />
        </Link>
        {showProgress && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {currentStep} of {totalSteps}
          </span>
        )}
      </div>
      {showProgress && (
        <div className="w-full h-0.5 bg-border/50">
          <div
            className="h-full transition-all duration-700 ease-out bg-gradient-to-r from-primary via-secondary to-accent"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      )}
    </header>
  )
}
