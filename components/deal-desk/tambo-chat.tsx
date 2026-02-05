"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, BrainCircuit, Search, AlertTriangle, FileSearch, Mic, Paperclip } from "lucide-react"
import { RiskRadar } from "./risk-radar"
import { ClauseTuner } from "./clause-tuner"
import { ScopingCard } from "./scoping-card"
import { ExtractionChecklist } from "./extraction-checklist"
import { DefinitionBank } from "./definition-bank"
import { DefinitionExplainer } from "./definition-explainer"
import { DraggableGenUI } from "./draggable-gen-ui"

interface ChatMessage {
  type: "bot" | "component" | "user"
  content?: string
  component?: "risk-radar" | "clause-tuner" | "scoping" | "checklist" | "definitions" | "explainer"
  data?: any
}

const initialMessages: ChatMessage[] = [
  { type: "user", content: "Can you analyze the liability cap?" },
  { type: "bot", content: "Would you like to adjust the liability cap? Use the tuner below." },
  { type: "component", component: "clause-tuner" },
  { type: "user", content: "What about the risks?" },
  { type: "bot", content: "I've analyzed the contract. Risk level is elevated in liability provisions." },
  { type: "component", component: "risk-radar" },
  { type: "bot", content: "I've also extracted key obligations and defined terms for your review." },
  { type: "component", component: "checklist" },
  { type: "component", component: "definitions" },
  { type: "component", component: "scoping" },
]

const starterPrompts = [
  { icon: AlertTriangle, label: "Analyze Risk", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: FileSearch, label: "Find Missing Clauses", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Search, label: "Summarize Deal", color: "text-emerald-600", bg: "bg-emerald-50" },
]

export function TamboChat({ appState }: { appState?: 'empty' | 'processing' | 'active' }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [showMessages] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [inputValue])

  const handleExplainDefinition = (term: string) => {
    setMessages(prev => [
      ...prev,
      { type: "user", content: `Explain "${term}"` },
      { type: "bot", content: `Here is a detailed breakdown of "${term}".` },
      { type: "component", component: "explainer", data: term }
    ])
  }

  // ... (rest of component)

  const handleSend = () => {
    if (!inputValue.trim()) return
    setMessages(prev => [...prev, { type: "user", content: inputValue }])
    setInputValue("")
    // Height reset handled by useEffect on inputValue change
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#f4fafa] to-[#edf3f3]">
      {/* Header - Sticky & Translucent - Maven Redesign (Compact) */}
      <div className="flex-none px-5 py-3 bg-transparent z-20 relative">
        <div className="flex items-center justify-between">
          {/* Left: Hamburger Menu */}
          <button className="h-8 w-8 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700 active:scale-95 transition-all">
            <div className="flex flex-col gap-0.5">
              <span className="w-4 h-0.5 bg-stone-600 rounded-full" />
              <span className="w-4 h-0.5 bg-stone-600 rounded-full" />
              <span className="w-4 h-0.5 bg-stone-600 rounded-full" />
            </div>
          </button>

          {/* Center: Maven Branding (Absolute Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
            <h2 className="font-serif text-lg font-bold text-[#20808D] leading-none mb-0.5 tracking-tight">Maven</h2>
            <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest scale-90">Your Legal Assistant</p>
          </div>

          {/* Right: Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-32 pl-8 pr-3 text-xs bg-stone-100/50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200 focus:bg-white transition-all placeholder:text-stone-400 text-stone-700 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-12 scroll-smooth relative custom-scrollbar-teal">
        {/* Top Fade Mask */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#f4fafa] via-[#f4fafa]/80 to-transparent z-10 pointer-events-none" />
        {showMessages ? (
          <div className="space-y-6 pb-4">
            {messages.map((message, index) => {
              if (message.type === "user") {
                return (
                  <div key={index} className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                    <div className="max-w-[80%] px-5 py-3 btn-skeu-dark rounded-2xl rounded-tr-sm text-sm leading-relaxed font-medium">
                      {message.content}
                    </div>
                  </div>
                )
              }

              if (message.type === "bot") {
                return (
                  <div key={index} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Bot className="w-4 h-4 text-stone-600" />
                    </div>
                    <div className="px-5 py-3.5 rounded-2xl rounded-tl-none card-skeu text-sm text-stone-700 leading-relaxed max-w-[90%]">
                      {message.content}
                    </div>
                  </div>
                )
              }

              if (message.component === "risk-radar") {
                return (
                  <div key={index} className="pl-12 animate-in fade-in slide-in-from-bottom-4">
                    <DraggableGenUI id={`risk-radar-${index}`}>
                      <RiskRadar />
                    </DraggableGenUI>
                  </div>
                )
              }

              if (message.component === "clause-tuner") {
                return (
                  <div key={index} className="pl-12 animate-in fade-in slide-in-from-bottom-4">
                    <DraggableGenUI id={`clause-tuner-${index}`}>
                      <ClauseTuner />
                    </DraggableGenUI>
                  </div>
                )
              }

              if (message.component === "checklist") {
                return (
                  <div key={index} className="pl-12 animate-in fade-in slide-in-from-bottom-4">
                    <DraggableGenUI id={`checklist-${index}`}>
                      <ExtractionChecklist />
                    </DraggableGenUI>
                  </div>
                )
              }

              if (message.component === "definitions") {
                return (
                  <div key={index} className="pl-12 animate-in fade-in slide-in-from-bottom-4">
                    <DraggableGenUI id={`definitions-${index}`}>
                      <DefinitionBank onExplain={handleExplainDefinition} />
                    </DraggableGenUI>
                  </div>
                )
              }

              if (message.component === "explainer") {
                return (
                  <div key={index} className="pl-12 animate-in fade-in slide-in-from-bottom-4">
                    <DraggableGenUI id={`explainer-${index}`}>
                      <DefinitionExplainer term={message.data} />
                    </DraggableGenUI>
                  </div>
                )
              }

              if (message.component === "scoping") {
                return (
                  <div key={index} className="pl-12 animate-in fade-in slide-in-from-bottom-4">
                    <DraggableGenUI id={`scoping-${index}`} disableDrag={true}>
                      <ScopingCard />
                    </DraggableGenUI>
                  </div>
                )
              }

              return null
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 mb-6 rounded-2xl inset-skeu flex items-center justify-center opacity-50">
              <Scale className="w-8 h-8 text-stone-400" />
            </div>

            <h3 className="text-stone-900 font-serif text-lg mb-2">Welcome to The Deal Desk</h3>
            <p className="text-sm text-stone-500 mb-8 max-w-xs mx-auto leading-relaxed">
              I can analyze risks, tune clauses, and summarize terms. Pick a starter to begin.
            </p>

            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
              {starterPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl card-skeu hover:translate-y-[-2px] transition-all group text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${prompt.bg} inset-skeu flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <prompt.icon className={`w-4 h-4 ${prompt.color} drop-shadow-sm`} />
                  </div>
                  <span className="text-sm text-stone-700 font-medium">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Deck (Input Area) - Floating Pill */}
      <div className="flex-none p-6 bg-gradient-to-t from-[#edf3f3] via-[#edf3f3]/95 to-transparent z-20 relative">
        {/* Bottom Blur Mask Overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] -z-10 pointer-events-none rounded-t-[2rem]" />
        <div className="max-w-3xl mx-auto relative group/input">
          {/* Main Pill - Skeuomorphic */}
          <div className="flex items-center gap-2 p-1.5 rounded-[2rem] bg-white border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] ring-4 ring-stone-50/50 transition-all duration-300 ease-out transform group-hover/input:-translate-y-0.5">

            {/* Attachment Button */}
            <button className="h-10 w-10 shrink-0 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors ml-1 active:scale-95">
              <Paperclip className="w-5 h-5 -rotate-45" />
            </button>

            {/* Input Field */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                adjustHeight()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask about the contract..."
              className="flex-1 bg-transparent min-h-[40px] max-h-32 py-2 px-2 text-base text-stone-800 placeholder:text-stone-400 font-medium outline-none resize-none leading-relaxed overflow-y-auto custom-scrollbar"
              rows={1}
            />

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 pr-1.5">
              <button className="h-10 w-10 shrink-0 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors active:scale-95">
                <Mic className="w-5 h-5" />
              </button>

              <div className="h-6 w-px bg-stone-100/80 mx-1" />

              {/* Enhanced Send Button */}
              <button
                onClick={handleSend}
                className="h-10 w-10 shrink-0 rounded-2xl bg-[#20808D] hover:bg-[#165a63] flex items-center justify-center text-white shadow-xl shadow-[#20808D]/20 hover:shadow-2xl hover:shadow-[#20808D]/30 hover:scale-105 active:scale-95 transition-all duration-300 group/send"
              >
                <Send className="w-4 h-4 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Improved Soft Glow/Fade */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-stone-200/40 to-transparent rounded-[2.2rem] -z-10 blur-xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-700" />
        </div>
      </div>
    </div>
  )
}

function Scale({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
      <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  )
}
