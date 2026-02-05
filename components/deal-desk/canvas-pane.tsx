"use client"

import { useState, useEffect } from "react"
import { LayoutGrid, Plus, ChevronUp, Table, BarChart3, Kanban, Layers, Sparkles, Pin, Check, Search } from "lucide-react"

import { useDroppable } from "@dnd-kit/core"

import { RiskRadar } from "./risk-radar"
import { ClauseTuner } from "./clause-tuner"
import { ExtractionChecklist } from "./extraction-checklist"
import { DefinitionBank } from "./definition-bank"
import { DefinitionExplainer } from "./definition-explainer"
import { ScopingCard } from "./scoping-card"

export function CanvasPane({
  forceExpanded,
  items = [],
  onUpdateItem,
  onAutoLayout
}: {
  forceExpanded?: boolean,
  items?: { id: string; colSpan: number }[],
  onUpdateItem?: (id: string, span: number) => void,
  onAutoLayout?: () => void
}) {
  const [activeTab, setActiveTab] = useState("analysis")
  // Pin and Hover State
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasAutoPinned, setHasAutoPinned] = useState(false)

  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  })

  const hasContent = items.length > 0

  // Auto-pin logic: When content arrives, pin it automatically (once).
  useEffect(() => {
    if (hasContent && !hasAutoPinned) {
      setIsPinned(true)
      setHasAutoPinned(true)
    }
  }, [hasContent, hasAutoPinned])

  // Mock rendering of dropped items
  const renderItem = (id: string) => {
    // Very basic parsing for demo
    if (id.includes('risk-radar')) return <RiskRadar />
    if (id.includes('clause-tuner')) return <ClauseTuner />
    if (id.includes('checklist')) return <ExtractionChecklist />
    if (id.includes('definitions')) return <DefinitionBank />
    if (id.includes('explainer')) return <DefinitionExplainer term="Term" /> // Mock term
    if (id.includes('scoping')) return <ScopingCard />
    return <div className="p-4 bg-white rounded-xl border border-dashed border-stone-300">Unknown Component</div>
  }

  const tabs = [
    { id: "analysis", label: "Analysis View", icon: LayoutGrid },
    { id: "definitions", label: "Definitions", icon: null },
    { id: "tasks", label: "Tasks", icon: null },
  ]

  // Expansion Logic
  // Logic 1 (Empty): Expands on hover. Pinned = stays open.
  // Logic 2 (Content): Auto-pinned (stays open). Unpinning reverts to Empty behavior.
  const shouldExpand = isPinned || isHovered || isOver || forceExpanded

  const heightClass = shouldExpand ? 'h-[45vh]' : 'h-16'
  const bgStyle = isOver ? { backgroundColor: '#F5F5F4' } : { backgroundColor: '#FDFCF8' }
  const borderColor = isOver ? 'border-emerald-400/50' : 'border-stone-200'
  const glow = isOver ? 'shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'shadow-2xl'

  // Resize Logic
  const [resizingItem, setResizingItem] = useState<{ id: string, startX: number, startSpan: number, currentSpan: number } | null>(null)

  // Grid Configuration
  const TOTAL_COLS = 12
  const GAP_REM = 1.5 // 24px gap = 1.5rem

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  // Auto Rearrange Feedback
  const [isRearranging, setIsRearranging] = useState(false)

  // Better Search Mapping
  const getComponentName = (id: string) => {
    if (id.includes('risk-radar')) return "Risk Radar Analysis"
    if (id.includes('clause-tuner')) return "Clause Tuner Adjustment"
    if (id.includes('checklist')) return "Extraction Checklist"
    if (id.includes('definitions')) return "Definition Bank"
    if (id.includes('explainer')) return "Definition Explainer"
    if (id.includes('scoping')) return "Scoping Card Confirmation"
    return id
  }

  // Filter items
  const displayItems = items.filter(item => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    const nameLower = getComponentName(item.id).toLowerCase()
    return nameLower.includes(searchLower) || item.id.toLowerCase().includes(searchLower)
  })

  const handleAutoLayoutClick = () => {
    if (onAutoLayout) {
      onAutoLayout()
      setIsRearranging(true)
      setTimeout(() => setIsRearranging(false), 2000)
    }
  }

  const handleResizeStart = (e: React.MouseEvent, itemId: string, currentSpan: number) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingItem({
      id: itemId,
      startX: e.clientX,
      startSpan: currentSpan,
      currentSpan: currentSpan
    })
  }

  // Handle global mouse move / up for resizing
  useEffect(() => {
    if (!resizingItem) return

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate delta X
      const deltaX = e.clientX - resizingItem.startX

      // Determine Grid Column Width (approximate)
      // See context for implementation detail
      const sensitivity = 70
      const spanDelta = Math.round(deltaX / sensitivity)

      const newSpan = Math.max(2, Math.min(TOTAL_COLS, resizingItem.startSpan + spanDelta))

      if (newSpan !== resizingItem.currentSpan) {
        setResizingItem(prev => prev ? ({ ...prev, currentSpan: newSpan }) : null)
      }
    }

    const handleMouseUp = () => {
      if (onUpdateItem && resizingItem) {
        onUpdateItem(resizingItem.id, resizingItem.currentSpan)
      }
      setResizingItem(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingItem, onUpdateItem])

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute bottom-6 left-6 right-6 ${heightClass} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden group rounded-2xl border ${borderColor} ${glow} z-30`}
      style={{
        ...bgStyle,
        // Dotted Grid Visualization (Static Background to show structure)
        backgroundImage: `radial-gradient(${isOver ? '#20808D' : '#d6d3d1'} 2px, transparent 2px)`,
        backgroundSize: 'calc((100% - 48px) / 12) 24px', // 48px = padding roughly. Approximated for visual guide.
        backgroundPosition: '24px 24px'
      }}
    >
      {/* View Bar - Skeuomorphic */}



      {/* View Bar - Skeuomorphic */}
      <div className="flex items-center justify-between px-4 h-12 bg-gradient-to-b from-white to-stone-50 border-t border-stone-200/80 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] relative z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs tracking-tight rounded-lg transition-all font-medium ${activeTab === tab.id
                  ? 'btn-skeu-dark'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
                  }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar - Compact */}
          <div className="relative group/search">
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-stone-400 group-hover/search:text-stone-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Filter view..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-40 pl-8 pr-3 text-xs bg-stone-100/50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200 focus:bg-white transition-all placeholder:text-stone-400 text-stone-700 shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">




          {/* AUTO REARRANGE BUTTON */}
          <button
            onClick={handleAutoLayoutClick}
            disabled={isRearranging}
            className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium active:scale-95 transition-all duration-300 ${isRearranging
              ? 'bg-[#20808D] text-white shadow-inner'
              : 'btn-skeu text-stone-600'}`}
            title="Auto-arrange items (2 per row)"
          >
            {isRearranging ? (
              <Check className="w-3.5 h-3.5 animate-in zoom-in spin-in-90 duration-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span className="min-w-[80px] text-center">
              {isRearranging ? 'Rearranged' : 'Auto Rearrange'}
            </span>
          </button>

          {/* PIN INDICATOR (Replaces Chevron) */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all active:scale-95 ${isPinned
              ? 'btn-skeu-dark text-white shadow-inner'
              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
            title={isPinned ? "Unpin Canvas" : "Keep Canvas Open"}
          >
            <Pin className="w-3.5 h-3.5" strokeWidth={isPinned ? 2 : 1.5} />
          </button>
        </div>
      </div>

      {/* Canvas Content */}
      <div className={`h-[calc(100%-48px)] p-6 overflow-y-auto custom-scrollbar custom-scrollbar-teal transition-opacity duration-300 delay-100 ${shouldExpand ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {!hasContent ? (
          <div className="h-full flex items-center justify-center">
            <div className={`w-full max-w-lg h-52 border-2 border-dashed ${isOver ? 'border-[#20808D] bg-[#20808D]/5' : 'border-stone-300 bg-white/60'} rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-sm`}>
              <div className={`w-14 h-14 mb-4 rounded-xl flex items-center justify-center shadow-inner ${isOver ? 'bg-[#20808D]/10 text-[#20808D]' : 'bg-gradient-to-b from-stone-100 to-stone-200 text-stone-500'}`}>
                <Layers className="w-6 h-6" />
              </div>
              <p className={`text-sm font-medium tracking-tight ${isOver ? 'text-[#20808D]' : 'text-stone-700'}`}>
                {isOver ? 'Drop to add to view' : 'Drag intelligence cards here'}
              </p>
              <p className="text-xs text-stone-400 mt-1 tracking-tight">Cards snap to grid automatically</p>
            </div>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-sm font-medium text-stone-900">No components found</p>
            <p className="text-xs text-stone-500">Try searching for something else</p>
          </div>
        ) : (
          /* Grid Layout - 12 Columns */
          <div className="grid grid-cols-12 gap-6 pb-20 relative">
            {displayItems.map((item, index) => {
              // Resize state
              const isResizingThis = resizingItem?.id === item.id
              const isResizingAny = resizingItem !== null
              const displaySpan = isResizingThis ? resizingItem.currentSpan : item.colSpan

              return (
                <div
                  key={index}
                  className={`relative group/item transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isResizingThis ? 'z-50' : 'z-auto'}`}
                  style={{
                    gridColumn: `span ${displaySpan}`,
                  }}
                >
                  {/* 
                   CONTENT RENDERING 
                   If resizing ANY item, turn others into grey ghosts for "collage" feel.
                   If resizing THIS item, show it fully with the Green Overlay.
                */}
                  <div className={`relative z-10 h-full transition-opacity duration-200 ${isResizingAny && !isResizingThis ? 'opacity-0' : 'opacity-100'}`}>
                    {renderItem(item.id)}
                  </div>

                  {/* GREY GHOST (Simplified Placeholder for Reflow Animation) */}
                  {isResizingAny && !isResizingThis && (
                    <div className="absolute inset-0 z-20 bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-center">
                      <div className="w-8 h-1 bg-stone-300 rounded-full opacity-50" />
                    </div>
                  )}

                  {/* ACTIVE RESIZE FEEDBACK (Teal Ghost) */}
                  {isResizingThis && (
                    <div className="absolute inset-0 z-0 bg-[#20808D]/5 border-2 border-dashed border-[#20808D]/40 rounded-xl pointer-events-none animate-pulse" />
                  )}

                  {/* Resize Handle - Right Edge trigger (Only visible if NOT resizing something else) */}
                  {!isResizingAny && (
                    <div
                      className="absolute top-2 right-[-10px] bottom-2 w-6 cursor-col-resize z-50 group-hover/item:opacity-100 opacity-0 transition-opacity flex items-center justify-center"
                      onMouseDown={(e) => handleResizeStart(e, item.id, item.colSpan)}
                    >
                      {/* Handle Visual */}
                      <div className="w-1.5 h-8 rounded-full bg-stone-300 hover:bg-emerald-400 shadow-sm transition-colors" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Drop Placeholder */}
            {isOver && (
              <div className="col-span-12 border-2 border-dashed border-[#20808D]/40 bg-[#20808D]/5 rounded-2xl h-40 flex items-center justify-center animate-pulse">
                <p className="text-[#20808D] text-sm font-medium">Drop here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
