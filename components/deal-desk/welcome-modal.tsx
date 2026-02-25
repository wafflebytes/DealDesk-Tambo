"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function WelcomeModal() {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const hasSeenWelcome = localStorage.getItem("dealDeskWelcomeSeen")
    if (!hasSeenWelcome) {
      setOpen(true)
    }
  }, [])

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      localStorage.setItem("dealDeskWelcomeSeen", "true")
    }
  }

  if (!isMounted) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-[1024px] p-0 overflow-hidden gap-0 border-stone-200 shadow-2xl bg-white card-skeu sm:rounded-2xl">
        <div className="flex flex-col md:flex-row w-full">

          {/* Left Side: Video — fills column height, no black bars */}
          <div className="w-full md:w-[55%] lg:w-[60%] shrink-0 relative border-b md:border-b-0 overflow-hidden">
            {/* Mobile: natural 16:9 aspect ratio */}
            <div className="block md:hidden w-full aspect-video relative">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/V0RTi8uorJM"
                title="Deal Desk Demo"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            {/* Desktop: stretch to fill full column height */}
            <div className="hidden md:block absolute inset-0">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/V0RTi8uorJM"
                title="Deal Desk Demo"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            {/* Invisible spacer on desktop so the column has minimum height */}
            <div className="hidden md:block w-full aspect-video pointer-events-none" aria-hidden="true" />
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-[45%] lg:w-[40%] p-8 lg:p-10 flex flex-col justify-center gap-5 md:gap-6 text-center md:text-left items-center md:items-start bg-gradient-to-br from-white to-stone-50/50">
            <DialogHeader className="items-center sm:text-center md:items-start md:text-left w-full space-y-0">
              <DialogTitle className="font-serif text-[32px] md:text-[34px] lg:text-[36px] tracking-tight text-[#0d3d43] leading-[1.15]" style={{ fontWeight: 550 }}>
                Welcome to<br className="hidden md:block" /> The Deal Desk
              </DialogTitle>
            </DialogHeader>

            <p className="text-stone-600 text-[15px] lg:text-[16px] leading-relaxed">
              Discover a new way to interact with your contracts. We highly encourage you to play the brief demo video to see how AI-driven analysis works.
            </p>

            <div className="mt-2 w-full sm:w-auto md:w-full lg:w-auto">
              <button
                onClick={() => handleOpenChange(false)}
                className="w-full px-8 py-3 rounded-xl btn-skeu-dark font-medium text-[15px] flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
