"use client"

import { useState, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Link2 } from "lucide-react"
import { ClauseTunerData } from "@/components/genui/schemas"

export function ClauseTuner(props: Partial<ClauseTunerData>) {
  const clauseTitle = props.clauseType ?? "Clause"
  const sliders = props.sliders ?? []
  const toggles = props.toggles ?? []

  // Dynamic slider states
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    sliders.forEach(s => { initial[s.id] = s.currentValue })
    return initial
  })

  // Dynamic toggle states
  const [toggleValues, setToggleValues] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    toggles.forEach(t => { initial[t.id] = t.currentValue })
    return initial
  })

  // Format value with unit - handle undefined/null safely
  const formatValue = (value: number | undefined | null, unit?: string) => {
    if (value === undefined || value === null) return "—"
    if (unit === '$') return `$${value.toLocaleString()}`
    if (unit === '%') return `${value}%`
    if (unit) return `${value} ${unit}`
    return value.toString()
  }

  // Detect if any value has changed from initial
  const hasChanged = useMemo(() => {
    const sliderChanged = sliders.some(s => sliderValues[s.id] !== s.currentValue)
    const toggleChanged = toggles.some(t => toggleValues[t.id] !== t.currentValue)
    return sliderChanged || toggleChanged
  }, [sliders, sliderValues, toggles, toggleValues])

  return (
    <div className="rounded-xl card-skeu group relative overflow-hidden min-w-0 w-full bg-white">
      {/* Thread Indicator */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link2 className="w-3 h-3 text-amber-500" />
      </div>

      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4 bg-[#20808D] rounded-full flex-shrink-0" />
          <h3 className="font-serif text-base text-stone-900 truncate">{clauseTitle}</h3>
        </div>

        {/* Context Tags */}
        {props.tags && props.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-4">
            {props.tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[10px] font-medium text-stone-600 tracking-tight">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 bg-gradient-to-b from-stone-50/30 to-transparent">

        {/* Dynamic Sliders */}
        {sliders.map((slider) => {
          const value = sliderValues[slider.id] ?? slider.currentValue ?? 0
          const min = slider.min ?? 0
          const max = slider.max ?? 100
          const percent = max > min ? ((value - min) / (max - min)) * 100 : 0

          return (
            <div key={slider.id} className="space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] text-stone-500 tracking-wider uppercase font-semibold">
                  {slider.label}
                </span>
                <span className="text-base font-semibold text-stone-900 tracking-tight font-mono">
                  {formatValue(value, slider.unit)}
                </span>
              </div>

              {/* Slider Track */}
              <div className="relative py-4">
                <div className="relative h-3 rounded-full inset-skeu">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-[#20808D] shadow-[0_1px_2px_rgba(32,128,141,0.3)_inset] opacity-90 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={slider.step ?? 1}
                  value={value}
                  onChange={(e) => setSliderValues(prev => ({ ...prev, [slider.id]: Number(e.target.value) }))}
                  className="absolute top-0 left-0 w-full h-11 opacity-0 cursor-pointer z-20"
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full knob-skeu pointer-events-none transition-all z-10"
                  style={{ left: `calc(${percent}% - 14px)` }}
                >
                  <div className="absolute inset-2 rounded-full bg-stone-100 shadow-sm" />
                </div>
              </div>

              {/* Min/Max Labels */}
              <div className="flex justify-between text-[10px] text-stone-500 tracking-tight font-medium px-1">
                <span>{formatValue(min, slider.unit)}</span>
                <span>{formatValue(max, slider.unit)}</span>
              </div>
            </div>
          )
        })}

        {/* Dynamic Toggles */}
        {toggles.map((toggle) => {
          const isEnabled = toggleValues[toggle.id] ?? toggle.currentValue

          return (
            <div key={toggle.id} className="space-y-2">
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <Label htmlFor={toggle.id} className="text-sm text-stone-600 cursor-pointer tracking-tight font-medium select-none">
                  {toggle.label}
                </Label>
                <button
                  id={toggle.id}
                  onClick={() => setToggleValues(prev => ({ ...prev, [toggle.id]: !isEnabled }))}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${isEnabled
                    ? 'bg-[#20808D] shadow-[0_2px_4px_rgba(32,128,141,0.4)_inset]'
                    : 'inset-skeu'
                    }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 rounded-full knob-skeu transition-all duration-300 flex items-center justify-center ${isEnabled ? 'left-[26px]' : 'left-1'
                      }`}
                  />
                </button>
              </div>
              {isEnabled && toggle.description && (
                <p className="text-xs text-stone-500 tracking-tight bg-stone-50 rounded-lg p-3 border border-stone-100">
                  {toggle.description}
                </p>
              )}
            </div>
          )
        })}

        {/* Action Footer */}
        {hasChanged && (
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
