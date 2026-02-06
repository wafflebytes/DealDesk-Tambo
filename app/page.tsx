"use client"

import { useState, useRef } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import type { DropAnimation } from "@dnd-kit/core"
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
import { useTamboThread } from "@tambo-ai/react"
import { Scale, ChevronDown, Share2, Bell, Settings, X } from "lucide-react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

type AppState = 'empty' | 'processing' | 'active'

export default function DealDeskPage() {
  const [appState, setAppState] = useState<AppState>('empty')
  const [isDrafting, setIsDrafting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggingComponent, setDraggingComponent] = useState<React.ReactNode>(null)

  const [canvasItems, setCanvasItems] = useState<{ id: string; colSpan: number }[]>([])
  // Store the actual rendered components for the canvas to use
  const [storedComponents, setStoredComponents] = useState<Record<string, React.ReactNode>>({})
  const [docContent, setDocContent] = useState<string | null>(null)
  const [docFileName, setDocFileName] = useState<string | null>(null)

  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)


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

  // Access Tambo thread for AI generation
  const { sendThreadMessage } = useTamboThread()

  async function handleGenerate(data: DraftData) {
    console.log("Generating contract with:", data)

    // If form is empty, use boilerplate immediately
    if (data.isEmpty) {
      setDocContent(data.boilerplate)
      setDocFileName("Draft Contract.md")
      setIsDrafting(false)
      setAppState('active')
      return
    }

    // Otherwise, generate with AI using Tambo
    setIsGenerating(true)

    try {
      // Build the system prompt for contract generation
      const contractTypeNames: Record<string, string> = {
        'MSA': 'Master Services Agreement',
        'NDA': 'Non-Disclosure Agreement',
        'SOW': 'Statement of Work',
        'Employment': 'Employment Agreement',
        'SLA': 'Software License Agreement',
        'Consulting': 'Consulting Agreement',
        'Partnership': 'Partnership Agreement',
        'Lease': 'Lease Agreement'
      }

      const jurisdictionNames: Record<string, string> = {
        'US-DE': 'State of Delaware',
        'US-CA': 'State of California',
        'US-NY': 'State of New York',
        'US-TX': 'State of Texas',
        'UK': 'United Kingdom',
        'EU': 'European Union',
        'SG': 'Singapore',
        'CA-ON': 'Province of Ontario, Canada'
      }

      const prompt = `Generate a formal ${contractTypeNames[data.contractType] || data.contractType} contract in Markdown format.

FORMAT RULES (FOLLOW EXACTLY):
- Use # for main title (e.g., # MASTER SERVICES AGREEMENT)
- Use ## for section headers (e.g., ## 1. DEFINITIONS)
- Use numbered lists (1.1, 1.2) for subsections
- Use **bold** for defined terms and emphasis
- Use --- for horizontal rules between major sections
- End with [Signature blocks to follow]

CONTRACT DETAILS:
- Contract Type: ${contractTypeNames[data.contractType] || 'Master Services Agreement'}
- Governing Law: ${jurisdictionNames[data.jurisdiction] || 'State of Delaware'}
- Party A: ${data.partyA || 'Acme Corporation'}
- Party B: ${data.partyB || 'TechVentures LLC'}
- Term Length: ${data.termLength ? data.termLength + ' months' : '12 months'}
- Liability Cap: ${data.liabilityCap ? '$' + data.liabilityCap : '$50,000'}
- Payment Terms: ${data.paymentTerms || 'Net 30'}

${data.prompt ? 'SPECIAL INSTRUCTIONS:\n' + data.prompt : ''}

Generate the complete contract now. Output ONLY the markdown content, no explanations.`

      // Send message to Tambo for AI generation
      const response = await sendThreadMessage(prompt, { streamResponse: true })

      // Extract the generated contract from response
      // TamboThreadMessage has a content property directly
      if (response && response.content) {
        // Content could be string or array of content parts
        let generatedContent: string
        if (typeof response.content === 'string') {
          generatedContent = response.content
        } else if (Array.isArray(response.content)) {
          // Extract text from content array
          generatedContent = response.content
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text || '')
            .join('\n')
        } else {
          generatedContent = String(response.content)
        }
        setDocContent(generatedContent)
        setDocFileName(`${data.contractType || 'Draft'} Contract.md`)
      } else {
        // Fallback to boilerplate if something goes wrong
        setDocContent(data.boilerplate)
        setDocFileName("Draft Contract.md")
      }

      setIsDrafting(false)
      setAppState('active')
    } catch (error) {
      console.error("Failed to generate contract:", error)
      // Fallback to boilerplate on error
      setDocContent(data.boilerplate)
      setDocFileName("Draft Contract.md")
      setIsDrafting(false)
      setAppState('active')
    } finally {
      setIsGenerating(false)
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
            <ResizablePanel defaultSize={28} minSize={20} maxSize={65}>
              <div className="h-full overflow-hidden border-l border-stone-200 shadow-[-1px_0_4px_rgba(0,0,0,0.02)] z-10 bg-stone-50/50">
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
                className="absolute -top-12 right-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                Close View <X className="w-4 h-4" /> {/* X is probably not imported in page.tsx, need to verify */}
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
          isGenerating={isGenerating}
        />
      )}
    </DndContext>
  )
}
