"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { GripVertical, Link2 } from "lucide-react"
import { useTamboComponentState } from "@tambo-ai/react"
import { ClauseTunerData } from "@/components/genui/schemas"

export function ClauseTuner(props: Partial<ClauseTunerData>) {

  const [multiplier, setMultiplier] = useTamboComponentState(
    "multiplier",
    props.multiplier ?? 1,
    props.multiplier
  )

  const [isMutual, setIsMutual] = useTamboComponentState(
    "isMutual",
    props.isMutual ?? false,
    props.isMutual
  )

  // Use props.currentValue for the base amount - NO hardcoding
  const baseAmount = props.currentValue ?? 0
  const clauseTitle = props.clauseType ?? "Clause"

  // Handle potentially undefined states safely
  const safeMultiplier = multiplier ?? 1
  const safeIsMutual = isMutual ?? false

  const currentCap = Math.round(baseAmount * safeMultiplier)

  const sliderPercent = ((safeMultiplier - 1) / 4) * 100
  const hasChanged = safeMultiplier !== (props.multiplier ?? 1) || safeIsMutual !== (props.isMutual ?? false)

  return (
    <div className="rounded-xl card-skeu group relative overflow-hidden min-w-0 w-full bg-white">

      {/* Thread Indicator */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link2 className="w-3 h-3 text-amber-500" />
      </div>

      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex items-center gap-2.5">
        <div className="w-1.5 h-4 bg-[#20808D] rounded-full flex-shrink-0" />
        <h3 className="font-serif text-base text-stone-900 truncate">{clauseTitle}</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 bg-gradient-to-b from-stone-50/30 to-transparent">
        <div className="space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-[10px] text-stone-500 tracking-wider uppercase font-semibold">Cap Amount</span>
            <span className="text-base font-semibold text-stone-900 tracking-tight font-mono">
              ${currentCap.toLocaleString()}
            </span>
          </div>

          {/* Skeuomorphic Slider */}
          <div className="relative py-4">
            {/* Track background - inset look */}
            <div className="relative h-3 rounded-full inset-skeu">
              {/* Active track - vibrant gradient */}
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-[#20808D] shadow-[0_1px_2px_rgba(32,128,141,0.3)_inset] opacity-90 transition-all"
                style={{ width: `${sliderPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={safeMultiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              className="absolute top-0 left-0 w-full h-11 opacity-0 cursor-pointer z-20"
            />
            {/* Thumb - tactile knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full knob-skeu pointer-events-none transition-all z-10"
              style={{ left: `calc(${sliderPercent}% - 14px)` }}
            >
              <div className="absolute inset-2 rounded-full bg-stone-100 shadow-sm" />
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-stone-500 tracking-tight font-medium px-1">
            <span>$50k</span>
            <span>$250k</span>
          </div>
        </div>

        {/* Live Diff Preview - Skeuomorphic inset */}
        <div className="p-4 rounded-xl inset-skeu">
          <p className="text-[10px] text-stone-500 tracking-wider uppercase mb-2 font-semibold">Live Preview</p>
          <p className="text-sm text-stone-700 tracking-tight font-mono leading-relaxed">
            {"Liability cap shall not exceed "}
            <span className="line-through text-red-400/70 opacity-60 decoration-2 decoration-red-400">$50,000</span>
            {" "}
            <span className="text-[#20808D] font-bold bg-white/50 px-1.5 py-0.5 rounded-md shadow-[0_1px_1px_rgba(32,128,141,0.1)_inset,0_1px_2px_rgba(0,0,0,0.05)]">${currentCap.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <Label htmlFor="mutual" className="text-sm text-stone-600 cursor-pointer tracking-tight font-medium select-none">
            Mutual Liability
          </Label>

          {/* Skeuomorphic Toggle */}
          <button
            id="mutual"
            onClick={() => setIsMutual(!safeIsMutual)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${safeIsMutual
              ? 'bg-[#20808D] shadow-[0_2px_4px_rgba(32,128,141,0.4)_inset]'
              : 'inset-skeu'
              }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full knob-skeu transition-all duration-300 flex items-center justify-center ${safeIsMutual ? 'left-[26px]' : 'left-1'
                }`}
            />
          </button>
        </div>

        {safeIsMutual && (
          <p className="text-xs text-stone-500 tracking-tight bg-stone-50 rounded-lg p-3 border border-stone-100">
            Both parties will be subject to the same liability cap.
          </p>
        )}

        {/* Action Footer - Conditional */}
        {(hasChanged) && (
          <div className="pt-2 animate-in slide-in-from-top-1 fade-in duration-200">
            <button className="w-full py-2.5 bg-[#20808D] hover:bg-[#165a63] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#20808D]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Update Clause
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
