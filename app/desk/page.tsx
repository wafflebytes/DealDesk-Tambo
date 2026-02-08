"use client"

import { useState } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import { DocumentEditor } from "@/components/deal-desk/document-editor"
import { TamboChat } from "@/components/deal-desk/tambo-chat"
import { CanvasPane } from "@/components/deal-desk/canvas-pane"
import { UploadZone } from "@/components/deal-desk/upload-zone"
import { ProcessingView } from "@/components/deal-desk/processing-view"
import { RiskRadar } from "@/components/deal-desk/risk-radar"
import { ClauseTuner } from "@/components/deal-desk/clause-tuner"
import { ExtractionChecklist } from "@/components/deal-desk/extraction-checklist"
import { DefinitionBank } from "@/components/deal-desk/definition-bank"
import { DefinitionExplainer } from "@/components/deal-desk/definition-explainer"
import { ScopingCard } from "@/components/deal-desk/scoping-card"
import { SmartDraftModal, type DraftData } from "@/components/deal-desk/smart-draft-modal"
import { ContractGeneratingView } from "@/components/deal-desk/contract-generating-view"
import { Scale, ChevronDown, Share2, Bell, Settings, X } from "lucide-react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useIsMobile } from "@/components/ui/use-mobile"

type AppState = 'empty' | 'processing' | 'active'

export default function DealDeskPage() {
  const [appState, setAppState] = useState<AppState>('empty')
  const [isDrafting, setIsDrafting] = useState(false)
  const [isContractGenerating, setIsContractGenerating] = useState(false)
  const [generatingContractType, setGeneratingContractType] = useState<string | null>(null)
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggingComponent, setDraggingComponent] = useState<React.ReactNode>(null)

  const [canvasItems, setCanvasItems] = useState<{ id: string; colSpan: number }[]>([])
  // Store the actual rendered components for the canvas to use
  const [storedComponents, setStoredComponents] = useState<Record<string, React.ReactNode>>({})
  const [docContent, setDocContent] = useState<string | null>(null)
  const [docFileName, setDocFileName] = useState<string | null>(null)

  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)

  const isMobile = useIsMobile()


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  function handleUpload(content: string, fileName: string) {
    setDocContent(content)
    setDocFileName(fileName)
    setAppState('processing')
  }

  function handleProcessingComplete() {
    setAppState('active')
  }

  function handleDraft() {
    setIsDrafting(true)
  }

  // Direct API call for contract generation (bypasses Maven chat)
  async function handleGenerate(data: DraftData) {
    console.log("Generating contract with:", data)

    // Close modal immediately
    setIsDrafting(false)

    // If form is empty, use boilerplate immediately
    if (data.isEmpty) {
      setDocContent(data.boilerplate)
      setDocFileName("Draft Contract.md")
      setAppState('active')
      return
    }

    // Show generating animation
    setIsContractGenerating(true)
    setGeneratingContractType(data.contractType || 'Contract')

    try {
      // Call direct API (no Maven/Tambo)
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.contract) {
        setDocContent(result.contract)
        setDocFileName(`${data.contractType || 'Draft'} Contract.md`)
      } else {
        // Fallback to boilerplate
        setDocContent(data.boilerplate)
        setDocFileName("Draft Contract.md")
      }

      setAppState('active')
    } catch (error) {
      console.error("Failed to generate contract:", error)
      // Fallback to boilerplate on error
      setDocContent(data.boilerplate)
      setDocFileName("Draft Contract.md")
      setAppState('active')
    } finally {
      setIsContractGenerating(false)
      setGeneratingContractType(null)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    if (appState !== 'active') return
    setActiveId(String(event.active.id))
    // Capture the rendered component from drag data for the overlay
    const component = (event.active.data.current as any)?.renderedComponent
    setDraggingComponent(component || null)
    setIsCanvasExpanded(true) // Auto-expand on drag
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event
    setActiveId(null)
    setDraggingComponent(null)
    setIsCanvasExpanded(false)

    // CanvasPane is droppable with id 'canvas-drop-zone'
    if (over && over.id === 'canvas-drop-zone') {
      // Get the rendered component from drag data
      const renderedComponent = (active.data.current as any)?.renderedComponent
      // Use the original drag ID directly
      const itemId = String(active.id)
      console.log('[Page] handleDragEnd - itemId:', itemId, 'hasComponent:', !!renderedComponent)

      // Check if item already exists to prevent duplicates
      const exists = canvasItems.some(item => item.id === itemId)
      if (!exists) {
        // Store the rendered component for canvas to use
        if (renderedComponent) {
          setStoredComponents(prev => ({ ...prev, [itemId]: renderedComponent }))
        }
        // Default to col-span-4 (1/3 width)
        setCanvasItems(prev => [...prev, { id: itemId, colSpan: 4 }])
      }
    }
  }

  // Callback to update item dimensions from CanvasPane
  const updateItemSpan = (id: string, newSpan: number) => {
    setCanvasItems(prev => prev.map(item =>
      item.id === id ? { ...item, colSpan: newSpan } : item
    ))
  }

  // Remove item from canvas
  const removeItem = (id: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== id))
    setStoredComponents(prev => {
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  // Bulk update layout (Auto Rearrange)
  const handleAutoLayout = () => {
    setCanvasItems(prev => prev.map(item => ({ ...item, colSpan: 6 })))
  }

  // Render Item Logic (Duplicated from CanvasPane for Overlay)
  const renderItem = (id: string) => {
    // First, check if we have a stored component
    if (storedComponents[id]) {
      return <div className="w-full">{storedComponents[id]}</div>
    }
    // Fallback: try to match by ID pattern
    const lowerId = id.toLowerCase()
    if (lowerId.includes('risk-radar') || lowerId.includes('riskradar') || lowerId.includes('risk')) return <RiskRadar risks={{ Liability: 0.2, IP: 0.1, Term: 0.3, Payment: 0.1 }} followUps={[]} />
    if (lowerId.includes('clause-tuner') || lowerId.includes('clausetuner') || lowerId.includes('clause')) return <ClauseTuner />
    if (lowerId.includes('extraction-checklist') || lowerId.includes('checklist') || lowerId.includes('extraction') || lowerId.includes('obligation')) return <ExtractionChecklist />
    if (lowerId.includes('knowledge-bank') || lowerId.includes('knowledgebank') || lowerId.includes('definition') || lowerId.includes('knowledge')) return <DefinitionBank />
    if (lowerId.includes('explainer')) return <DefinitionExplainer term="Term" />
    if (lowerId.includes('scoping') || lowerId.includes('scoping-card')) return <ScopingCard />
    return <div className="p-4 bg-white rounded-xl border border-dashed border-stone-300">Unknown Component: {id}</div>
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-[100svh] w-full overflow-hidden bg-gradient-to-br from-[#f4fafa] via-white to-[#edf3f3] flex flex-col">
        {/* Global Header - Immersive Skeuomorphic */}
        <header className="h-14 flex-none border-b border-[#20808D]/10 bg-gradient-to-r from-white via-[#f4fafa]/50 to-white flex items-center justify-between px-3 shadow-sm z-40 relative sm:px-5">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] -z-10" />
          {/* Left Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Logo - Minimal Design */}
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#20808D]" strokeWidth={2.0} />
              <h1
                className="font-serif text-[18px] tracking-[-0.03em] text-[#0d3d43] pt-0.5 leading-none sm:text-[22px]"
                style={{ fontWeight: 550 }}
              >
                The Deal Desk
              </h1>
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-gradient-to-b from-stone-100 via-stone-300 to-stone-100 sm:block" />

            {/* Context / Project Switcher - Skeuomorphic Dropdown */}
            <button className="hidden items-center gap-2 px-3 pl-3.5 py-1.5 rounded-lg inset-skeu bg-stone-50/50 hover:bg-white transition-all group sm:flex">
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                {appState === 'active' ? (docFileName || "Acme Corp MSA") : "New Project"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {/* Icon Buttons */}
              <button className="w-7 h-7 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700 transition-transform active:scale-95">
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700 transition-transform active:scale-95">
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-gradient-to-b from-stone-100 via-stone-300 to-stone-100 mx-1" />

              {/* Share Button - Compact Icon */}
              <button className="w-8 h-8 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700 transition-transform active:scale-95 group">
                <Share2 className="w-3.5 h-3.5 group-hover:text-stone-900 transition-colors" />
              </button>
            </div>

            {/* Profile Avatar - Smaller to match */}
            <div className="relative ml-1">
              <button className="w-8 h-8 rounded-full bg-gradient-to-b from-stone-700 to-stone-900 flex items-center justify-center text-white text-[10px] font-medium shadow-md ring-2 ring-white cursor-pointer hover:shadow-lg transition-shadow active:scale-95">
                JD
              </button>
              {/* Status Dot */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#20808D] rounded-full border-2 border-white shadow-sm" />
            </div>
          </div>
        </header>

        {/* Resizable Layout */}
        <div className="flex-1 overflow-hidden relative">
          <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
            {/* Left Panel: Editor & Upload & Canvas */}
            <ResizablePanel defaultSize={isMobile ? 62 : 50} minSize={isMobile ? 40 : 35}>
              <div className="h-full overflow-hidden pb-16 sm:pb-12 relative flex flex-col">
                <div className="flex-1 overflow-hidden">
                  {isContractGenerating && <ContractGeneratingView contractType={generatingContractType || undefined} />}
                  {!isContractGenerating && appState === 'empty' && <UploadZone onUpload={handleUpload} onDraft={handleDraft} />}
                  {!isContractGenerating && appState === 'processing' && <ProcessingView onComplete={handleProcessingComplete} />}
                  {!isContractGenerating && appState === 'active' && (
                    <DocumentEditor
                      content={docContent || undefined}
                      fileName={docFileName || undefined}
                    />
                  )}
                </div>

                <CanvasPane
                  forceExpanded={isCanvasExpanded}
                  items={canvasItems}
                  storedComponents={storedComponents}
                  onUpdateItem={updateItemSpan}
                  onRemoveItem={removeItem}
                  onAutoLayout={handleAutoLayout}
                  onFocusItem={setFocusedItemId}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel: Chat */}
            <ResizablePanel defaultSize={isMobile ? 38 : 28} minSize={isMobile ? 25 : 20} maxSize={isMobile ? 60 : 65}>
              <div
                className={
                  isMobile
                    ? "h-full overflow-hidden border-t border-stone-200 shadow-[0_-1px_4px_rgba(0,0,0,0.02)] z-10 bg-stone-50/50"
                    : "h-full overflow-hidden border-l border-stone-200 shadow-[-1px_0_4px_rgba(0,0,0,0.02)] z-10 bg-stone-50/50"
                }
              >
                <TamboChat appState={appState} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Drag Overlay for Visual Feedback - iOS Style */}
        <DragOverlay
          zIndex={10000}
          dropAnimation={null}
          className="z-[10000]"
        >
          {activeId && draggingComponent ? (
            <div
              className="opacity-95 scale-[0.5] origin-center pointer-events-none z-[10000] relative cursor-grabbing transition-transform duration-150"
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.35))',
                transform: 'rotate(2deg)',
              }}
            >
              {draggingComponent}
            </div>
          ) : null}
        </DragOverlay>

        {/* Global Focus Overlay - Rendered at Root to avoid z-index clipping */}
        {focusedItemId && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
            {/* Dimmed Background */}
            <div
              className="absolute inset-0 bg-stone-950/75 backdrop-blur-sm transition-all"
              onClick={() => setFocusedItemId(null)}
            />

            {/* Focused Content Wrapper */}
            <div
              className="relative w-full max-w-4xl max-h-[85vh] bg-transparent transform transition-all duration-300 animate-in zoom-in-95 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setFocusedItemId(null)}
                className="absolute top-3 right-3 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md text-xs font-medium transition-colors flex items-center gap-2 sm:-top-12 sm:right-0 sm:px-4 sm:text-sm"
              >
                Close View <X className="w-4 h-4" />
              </button>
              {/* Render the full-size component */}
              <div className="w-full h-full shadow-2xl rounded-2xl overflow-y-auto custom-scrollbar ring-1 ring-white/20 bg-white">
                {renderItem(focusedItemId)}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Smart Draft Modal */}
      {isDrafting && (
        <SmartDraftModal
          onClose={() => setIsDrafting(false)}
          onDraft={handleGenerate}
        />
      )}
    </DndContext>
  )
}
