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
import { SmartDraftModal } from "@/components/deal-desk/smart-draft-modal"
import { Scale, ChevronDown, Share2, Bell, Settings } from "lucide-react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

type AppState = 'empty' | 'processing' | 'active'

export default function DealDeskPage() {
  const [appState, setAppState] = useState<AppState>('empty')
  const [isDrafting, setIsDrafting] = useState(false)
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const [canvasItems, setCanvasItems] = useState<{ id: string; colSpan: number }[]>([])
  const [docContent, setDocContent] = useState<string | null>(null)
  const [docFileName, setDocFileName] = useState<string | null>(null)


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

  function handleGenerate(data: any) {
    console.log("Generating contract with:", data)
    setIsDrafting(false)
    setAppState('processing')
    // Simulate processing time is handled by ProcessingView internally usually, 
    // or we can let it run its course.
  }

  function handleDragStart(event: DragStartEvent) {
    if (appState !== 'active') return
    setActiveId(String(event.active.id))
    setIsCanvasExpanded(true) // Auto-expand on drag
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event
    setActiveId(null)
    setIsCanvasExpanded(false)

    // CanvasPane is droppable with id 'canvas-drop-zone'
    if (over && over.id === 'canvas-drop-zone') {
      const itemId = String(active.id)
      // Check if item already exists to prevent duplicates
      const exists = canvasItems.some(item => item.id === itemId)
      if (!exists) {
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

  // Bulk update layout (Auto Rearrange)
  const handleAutoLayout = () => {
    setCanvasItems(prev => prev.map(item => ({ ...item, colSpan: 6 })))
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f4fafa] via-white to-[#edf3f3] flex flex-col">
        {/* Global Header - Immersive Skeuomorphic */}
        <header className="h-14 flex-none border-b border-[#20808D]/10 bg-gradient-to-r from-white via-[#f4fafa]/50 to-white flex items-center justify-between px-5 shadow-sm z-40 relative">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] -z-10" />
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Logo - Minimal Design */}
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#20808D]" strokeWidth={2.0} />
              <h1
                className="font-serif text-[22px] tracking-[-0.03em] text-[#0d3d43] pt-0.5 leading-none"
                style={{ fontWeight: 550 }}
              >
                The Deal Desk
              </h1>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gradient-to-b from-stone-100 via-stone-300 to-stone-100" />

            {/* Context / Project Switcher - Skeuomorphic Dropdown */}
            <button className="flex items-center gap-2 px-3 pl-3.5 py-1.5 rounded-lg inset-skeu bg-stone-50/50 hover:bg-white transition-all group">
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                {appState === 'active' ? (docFileName || "Acme Corp MSA") : "New Project"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
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
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel: Editor & Upload & Canvas */}
            <ResizablePanel defaultSize={50} minSize={35}>
              <div className="h-full overflow-hidden pb-12 relative flex flex-col">
                <div className="flex-1 overflow-hidden">
                  {appState === 'empty' && <UploadZone onUpload={handleUpload} onDraft={handleDraft} />}
                  {appState === 'processing' && <ProcessingView onComplete={handleProcessingComplete} />}
                  {appState === 'active' && (
                    <DocumentEditor
                      content={docContent || undefined}
                      fileName={docFileName || undefined}
                    />
                  )}
                </div>


                <CanvasPane
                  forceExpanded={isCanvasExpanded}
                  items={canvasItems}
                  onUpdateItem={updateItemSpan}
                  onAutoLayout={handleAutoLayout}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel: Chat */}
            <ResizablePanel defaultSize={28} minSize={20} maxSize={65}>
              <div className="h-full overflow-hidden border-l border-stone-200 shadow-[-1px_0_4px_rgba(0,0,0,0.02)] z-10 bg-stone-50/50">
                <TamboChat appState={appState} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Drag Overlay for Visual Feedback */}
        <DragOverlay zIndex={10000} dropAnimation={null} className="z-[10000]">
          {activeId ? (
            <div className="opacity-95 scale-[0.6] origin-top-right pointer-events-none shadow-[0_30px_60px_rgba(0,0,0,0.5)] rotate-3 z-[10000] relative cursor-grabbing">
              {(() => {
                const id = activeId
                if (id.includes('risk-radar')) return <RiskRadar />
                if (id.includes('clause-tuner')) return <ClauseTuner />
                if (id.includes('checklist')) return <ExtractionChecklist />
                if (id.includes('definitions')) return <DefinitionBank />
                if (id.includes('explainer')) return <DefinitionExplainer term="Term" />
                if (id.includes('scoping')) return <ScopingCard />
                return <div className="p-4 bg-white rounded-xl shadow-lg border border-stone-200">Unknown Item</div>
              })()}
            </div>
          ) : null}
        </DragOverlay>
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
