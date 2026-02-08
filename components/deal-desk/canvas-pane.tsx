"use client"

import { useState, useEffect, useRef } from "react"
import { LayoutGrid, Plus, ChevronUp, Table, BarChart3, Kanban, Layers, Sparkles, Pin, Check, Search, X } from "lucide-react"

import { useDroppable } from "@dnd-kit/core"

import { useIsMobile } from "@/components/ui/use-mobile"

import { RiskRadar } from "./risk-radar"
import { ClauseTuner } from "./clause-tuner"
import { ExtractionChecklist } from "./extraction-checklist"
import { DefinitionBank } from "./definition-bank"
import { DefinitionExplainer } from "./definition-explainer"
import { ScopingCard } from "./scoping-card"

export function CanvasPane({
  forceExpanded,
  items = [],
  storedComponents = {},
  onUpdateItem,
  onRemoveItem,
  onAutoLayout,
  onFocusItem
}: {
  forceExpanded?: boolean,
  items?: { id: string; colSpan: number }[],
  storedComponents?: Record<string, React.ReactNode>,
  onUpdateItem?: (id: string, span: number) => void,
  onRemoveItem?: (id: string) => void,
  onAutoLayout?: () => void,
  onFocusItem?: (id: string | null) => void
}) {
  const isMobile = useIsMobile()

  const [activeTab, setActiveTab] = useState("analysis")
  // Pin and Hover State
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasAutoPinned, setHasAutoPinned] = useState(false)

  // iOS-style edit/wiggle mode
  const [isEditMode, setIsEditMode] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  })

  const hasContent = items.length > 0

  // Auto-pin logic: When content arrives, pin it automatically (once).
  useEffect(() => {
    if (!isMobile && hasContent && !hasAutoPinned) {
      setIsPinned(true)
      setHasAutoPinned(true)
    }
  }, [hasContent, hasAutoPinned, isMobile])

  // Long press handlers for edit mode
  const handleLongPressStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsEditMode(true)
    }, 800) // 800ms for long press
  }

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Handle click to focus (if not editing and not dragging)
  // Handle click to focus (if not editing and not dragging)
  const handleItemClick = (e: React.MouseEvent, id: string) => {
    // Check if the click target is an interactive element
    // We want to allow interaction with buttons/inputs without triggering the "Focus Mode"
    const target = e.target as HTMLElement
    const isInteractive = target.closest('button, input, select, textarea, a, [role="button"], [role="checkbox"], [role="menuitem"], label')

    if (isInteractive) {
      return
    }

    if (!isEditMode && !resizingItem && onFocusItem) {
      onFocusItem(id)
    }
  }

  // Exit edit mode when clicking outside or pressing escape
  const handleExitEditMode = () => {
    setIsEditMode(false)
  }

  // Render dropped items - prefer stored component, fall back to ID-based rendering
  const renderItem = (id: string) => {
    // console.log('[Canvas] renderItem called with ID:', id, 'hasStoredComponent:', !!storedComponents[id])

    // First, check if we have a stored component from the drag
    if (storedComponents[id]) {
      return (
        <div className="w-full">
          {storedComponents[id]}
        </div>
      )
    }

    const lowerId = id.toLowerCase()
    if (lowerId.includes('risk-radar') || lowerId.includes('riskradar') || lowerId.includes('risk')) return <RiskRadar risks={{ Liability: 0.2, IP: 0.1, Term: 0.3, Payment: 0.1 }} followUps={[]} />
    if (lowerId.includes('clause-tuner') || lowerId.includes('clausetuner') || lowerId.includes('clause')) return <ClauseTuner />
    if (lowerId.includes('extraction-checklist') || lowerId.includes('checklist') || lowerId.includes('extraction') || lowerId.includes('obligation')) return <ExtractionChecklist />
    if (lowerId.includes('knowledge-bank') || lowerId.includes('knowledgebank') || lowerId.includes('definition') || lowerId.includes('knowledge')) return <DefinitionBank />
    if (lowerId.includes('explainer')) return <DefinitionExplainer term="Term" />
    if (lowerId.includes('scoping') || lowerId.includes('scoping-card')) return <ScopingCard />

    console.warn('[Canvas] Unknown component ID:', id)
    return <div className="p-4 bg-white rounded-xl border border-dashed border-stone-300">Unknown Component: {id}</div>
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

  const heightClass = shouldExpand
    ? (isMobile ? 'h-[38svh]' : 'h-[45vh]')
    : (isMobile ? 'h-14' : 'h-16')
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
      className={`absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 ${heightClass} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden group rounded-2xl border ${borderColor} ${glow} z-30`}
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
      <div className="flex items-center justify-between px-3 sm:px-4 h-12 bg-gradient-to-b from-white to-stone-50 border-t border-stone-200/80 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] relative z-20 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs tracking-tight rounded-lg transition-all font-medium ${activeTab === tab.id
                  ? 'btn-skeu-dark'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
                  }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{tab.label}</span>
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
              className="h-7 w-28 sm:w-40 pl-8 pr-3 text-xs bg-stone-100/50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200 focus:bg-white transition-all placeholder:text-stone-400 text-stone-700 shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-none">




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
            <span className="hidden sm:inline min-w-[80px] text-center">
              {isRearranging ? 'Rearranged' : 'Auto Rearrange'}
            </span>
            <span className="sm:hidden text-center">
              {isRearranging ? 'Done' : 'Auto'}
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
      <div className={`h-[calc(100%-48px)] p-4 sm:p-6 overflow-y-auto custom-scrollbar custom-scrollbar-teal transition-opacity duration-300 delay-100 ${shouldExpand ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
          <div className="relative">
            {/* Edit Mode Overlay - Bottom Callout */}
            {/* Edit Mode Overlay - Bottom Callout */}
            {isEditMode && (
              <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* Semi-transparent overlay */}
                <div className="absolute inset-0 bg-stone-900/5" />

                {/* Bottom Callout */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto w-[90%] max-w-md">
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/60 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 ring-1 ring-red-200/50 flex items-center justify-center shadow-inner">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-800 tracking-tight">Edit Mode</p>
                        <p className="text-[11px] text-stone-500">Tap × on any card to remove</p>
                      </div>
                    </div>
                    <button
                      onClick={handleExitEditMode}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_2px_4px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,0.2)_inset] bg-gradient-to-b from-stone-800 to-stone-900 text-white active:scale-95 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}



            <div className="grid grid-cols-12 gap-4 sm:gap-6 pb-20 relative">
              {displayItems.map((item, index) => {
                // Resize state
                const isResizingThis = resizingItem?.id === item.id
                const isResizingAny = resizingItem !== null
                const displaySpan = isResizingThis ? resizingItem.currentSpan : item.colSpan

                return (
                  <div
                    key={index}
                    className={`relative group/item transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isResizingThis ? 'z-50' : 'z-auto'} ${isEditMode ? 'animate-wiggle' : ''}`}
                    style={{
                      gridColumn: `span ${displaySpan}`,
                    }}
                    onMouseDown={handleLongPressStart}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={handleLongPressStart}
                    onTouchEnd={handleLongPressEnd}
                  >
                    {/* 
                   CONTENT RENDERING 
                   If resizing ANY item, turn others into grey ghosts for "collage" feel.
                   If resizing THIS item, show it fully with the Green Overlay.
                   Components are scaled to 75% to fit canvas.
                */}
                    <div
                      className={`relative z-10 h-full transition-opacity duration-200 ${isResizingAny && !isResizingThis ? 'opacity-0' : 'opacity-100'}`}
                      onClick={(e) => handleItemClick(e, item.id)}
                    >
                      <div className="origin-top-left scale-[0.9] w-[111%] cursor-pointer hover:ring-2 hover:ring-[#20808D]/20 hover:shadow-lg rounded-xl transition-all duration-300">
                        {renderItem(item.id)}
                      </div>
                    </div>

                    {/* Dismiss X Button - Only visible in edit mode */}
                    {onRemoveItem && isEditMode && !isResizingAny && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveItem(item.id)
                        }}
                        className="absolute -top-2 -right-2 z-30 w-6 h-6 rounded-full bg-stone-700 hover:bg-red-500 text-white transition-all duration-200 flex items-center justify-center shadow-lg hover:scale-110"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

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
          </div>
        )}
      </div>
    </div>
  )
}
