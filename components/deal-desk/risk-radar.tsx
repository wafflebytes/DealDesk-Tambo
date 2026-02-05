"use client"

import { useState } from "react"
import { GripVertical, ChevronDown, Link2 } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const followUps = [
  "How does this compare to market data?",
  "Draft a waiver for the liability clause",
  "Show similar clauses from past contracts",
]

export function RiskRadar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [data, setData] = useState({
    Liability: 0.9,
    IP: 0.4,
    Term: 0.6,
    Payment: 0.5,
  })

  const centerX = 80
  const centerY = 80
  const radius = 55

  const angles = [
    { label: "Liability", value: data.Liability, angle: -90 },
    { label: "IP", value: data.IP, angle: 0 },
    { label: "Term", value: data.Term, angle: 90 },
    { label: "Payment", value: data.Payment, angle: 180 },
  ]

  const handleSliderChange = (label: string, newVal: number) => {
    setData(prev => ({ ...prev, [label]: newVal }))
  }

  const points = angles.map(({ value, angle }) => {
    const rad = (angle * Math.PI) / 180
    const x = centerX + Math.cos(rad) * radius * value
    const y = centerY + Math.sin(rad) * radius * value
    return { x, y, value }
  })

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ')

  const gridPoints = [1, 0.66, 0.33].map(scale =>
    angles.map(({ angle }) => {
      const rad = (angle * Math.PI) / 180
      const x = centerX + Math.cos(rad) * radius * scale
      const y = centerY + Math.sin(rad) * radius * scale
      return `${x},${y}`
    }).join(' ')
  )

  return (
    <div className="rounded-xl card-skeu group relative overflow-hidden min-w-0 w-full">


      {/* Thread Indicator */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link2 className="w-3 h-3 text-amber-500" />
      </div>

      {/* Header */}
      <div className="px-5 py-3 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex items-center gap-2.5">
        <div className="w-1.5 h-4 bg-[#20808D] rounded-full" />
        <h3 className="font-serif text-base text-stone-900">Risk Analysis</h3>
      </div>

      {/* Content */}
      <div className="p-4 bg-gradient-to-b from-stone-50/30 to-transparent">
        <svg viewBox="0 0 160 160" className="w-full max-w-[180px] mx-auto">
          {/* Grid lines */}
          {gridPoints.map((gp, i) => (
            <polygon
              key={i}
              points={gp}
              fill="none"
              stroke="#e7e5e4"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {angles.map(({ angle }, i) => {
            const rad = (angle * Math.PI) / 180
            const x = centerX + Math.cos(rad) * radius
            const y = centerY + Math.sin(rad) * radius
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#d6d3d1"
                strokeWidth="1"
              />
            )
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(28,25,23,0.05)"
            stroke="#1c1917"
            strokeWidth="2"
          />

          {/* Data points */}
          {points.map((point, i) => (
            <g key={i}>
              {point.value > 0.7 && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={8}
                  fill="rgba(220,38,38,0.15)"
                />
              )}
              <circle
                cx={point.x}
                cy={point.y}
                r={point.value > 0.7 ? 5 : 4}
                fill={point.value > 0.7 ? "#dc2626" : "#1c1917"}
                stroke="white"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Labels */}
          <text x={centerX} y="12" textAnchor="middle" className="text-[10px] fill-stone-500 tracking-tight font-medium" style={{ fontFamily: 'var(--font-geist)' }}>Liability</text>
          <text x="152" y={centerY + 4} textAnchor="end" className="text-[10px] fill-stone-500 tracking-tight font-medium" style={{ fontFamily: 'var(--font-geist)' }}>IP</text>
          <text x={centerX} y="156" textAnchor="middle" className="text-[10px] fill-stone-500 tracking-tight font-medium" style={{ fontFamily: 'var(--font-geist)' }}>Term</text>
          <text x="8" y={centerY + 4} textAnchor="start" className="text-[10px] fill-stone-500 tracking-tight font-medium" style={{ fontFamily: 'var(--font-geist)' }}>Payment</text>
        </svg>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs tracking-tight">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" />
            <span className="text-stone-500 font-medium">High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#20808D] rounded-full shadow-sm" />
            <span className="text-stone-500 font-medium">Normal</span>
          </div>
        </div>

        {/* Follow-up / Edit Section */}
        <div className="border-t border-stone-100 p-4 pt-0">
          {!isEditing ? (
            <div className="pt-4 space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-stone-200 shadow-sm"
              >
                Adjust Risk Factors
              </button>

              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between text-xs text-stone-400 hover:text-stone-600 transition-colors font-medium py-1">
                  <span className="tracking-tight">View Suggested Follow-ups</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-2 space-y-1.5">
                    {followUps.map((query, i) => (
                      <button key={i} className="w-full text-left px-3 py-2 text-xs text-stone-600 rounded-md hover:bg-stone-50 transition-colors truncate">
                        {query}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ) : (
            <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-3">
                {angles.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <label className="text-[10px] uppercase font-bold text-stone-400 w-12">{item.label}</label>
                    <input
                      type="range"
                      min="0" max="1" step="0.1"
                      value={item.value}
                      onChange={(e) => handleSliderChange(item.label, parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-stone-100 rounded-full appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stone-400 [&::-webkit-slider-thumb]:appearance-none cursor-pointer hover:[&::-webkit-slider-thumb]:bg-stone-600 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-[2] py-2 bg-[#20808D] hover:bg-[#165a63] text-white text-xs font-bold rounded-lg shadow-lg shadow-[#20808D]/10 active:scale-[0.98] transition-all"
                >
                  Submit Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
