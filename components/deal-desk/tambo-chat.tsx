"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, Search, AlertTriangle, FileSearch, Mic, Paperclip, Loader2, Github } from "lucide-react"
import { useTamboThread } from "@tambo-ai/react"
import { RiskRadar } from "./risk-radar"
import { ClauseTuner } from "./clause-tuner"
import { ScopingCard } from "./scoping-card"
import { ExtractionChecklist } from "./extraction-checklist"
import { DefinitionBank } from "./definition-bank"
import { DefinitionExplainer } from "./definition-explainer"
import { DraggableGenUI } from "./draggable-gen-ui"
import { ReasoningChain, ReasoningStep } from "./reasoning-chain"

const starterPrompts = [
  { icon: AlertTriangle, label: "Analyze Risk", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: FileSearch, label: "Find Missing Clauses", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Search, label: "Summarize Deal", color: "text-emerald-600", bg: "bg-emerald-50" },
]

// Helper to extract text content from message
function getMessageContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map(part => {
      if (typeof part === 'string') return part
      if (part && typeof part === 'object' && 'text' in part) return (part as { text: string }).text
      return ''
    }).join('')
  }
  return ''
}

export function TamboChat({ appState }: { appState?: 'empty' | 'processing' | 'active' }) {
  // Tambo SDK Hooks
  const { thread, sendThreadMessage, generationStage, isIdle } = useTamboThread()

  // Local UI State
  const [inputValue, setInputValue] = useState("")
  const [currentReasoning, setCurrentReasoning] = useState<ReasoningStep[]>([])
  const [messageReasoningMap, setMessageReasoningMap] = useState<Record<string, ReasoningStep[]>>({})
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Is the AI actively streaming a response?
  const isStreaming = generationStage === 'STREAMING_RESPONSE'

  // Determine if AI is "thinking" (before response starts streaming)
  const isThinking = !isIdle &&
    generationStage !== 'COMPLETE' &&
    generationStage !== 'ERROR' &&
    generationStage !== 'STREAMING_RESPONSE'

  // Update reasoning chain based on generation stage
  useEffect(() => {
    if (generationStage === 'CHOOSING_COMPONENT') {
      setCurrentReasoning([{ message: "Analyzing your request...", status: "processing" }])
    } else if (generationStage === 'FETCHING_CONTEXT') {
      setCurrentReasoning(prev => [
        { ...prev[0], status: "complete" },
        { message: "Gathering context...", status: "processing", tool: "ContextFetcher" }
      ])
    } else if (generationStage === 'HYDRATING_COMPONENT') {
      setCurrentReasoning(prev => [
        ...prev.map(s => ({ ...s, status: "complete" as const })),
        { message: "Preparing response...", status: "processing" }
      ])
    } else if (generationStage === 'STREAMING_RESPONSE') {
      // Mark all as complete but keep them for the message
      setCurrentReasoning(prev => prev.map(s => ({ ...s, status: "complete" as const })))
    } else if (generationStage === 'COMPLETE' || generationStage === 'IDLE') {
      // Clear for next message cycle
      setCurrentReasoning([])
      setPendingMessageId(null)
    }
  }, [generationStage])

  // Attach reasoning to the assistant message when streaming starts
  useEffect(() => {
    if (generationStage === 'STREAMING_RESPONSE' && thread?.messages && currentReasoning.length > 0) {
      const lastMessage = thread.messages[thread.messages.length - 1]
      if (lastMessage?.role === 'assistant' && lastMessage.id && pendingMessageId !== lastMessage.id) {
        setPendingMessageId(lastMessage.id)
        setMessageReasoningMap(prev => ({
          ...prev,
          [lastMessage.id!]: currentReasoning.map(s => ({ ...s, status: "complete" as const }))
        }))
      }
    }
  }, [generationStage, thread?.messages, currentReasoning, pendingMessageId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [thread?.messages, isThinking, currentReasoning])

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
    sendThreadMessage(`Explain "${term}"`, { streamResponse: true })
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMsg = inputValue
    setInputValue("")

    // Send message via Tambo SDK
    await sendThreadMessage(userMsg, { streamResponse: true })
  }

  const hasMessages = thread?.messages && thread.messages.length > 0

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#f4fafa] to-[#edf3f3]">
      {/* Header - Sticky & Translucent - Maven Redesign (Compact) */}
      <div className="flex-none px-5 py-3 bg-transparent z-20 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Left: Hamburger Menu */}
            <button className="h-8 w-8 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700 active:scale-95 transition-all">
              <div className="flex flex-col gap-0.5">
                <span className="w-4 h-0.5 bg-stone-600 rounded-full" />
                <span className="w-4 h-0.5 bg-stone-600 rounded-full" />
                <span className="w-4 h-0.5 bg-stone-600 rounded-full" />
              </div>
            </button>

            {/* GitHub Icon */}
            <button className="h-8 w-8 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700 active:scale-95 transition-all">
              <Github className="w-4 h-4" />
            </button>

            {/* Tambo Icon (Styled SVG) */}
            <button className="h-8 w-8 rounded-lg btn-skeu flex items-center justify-center text-emerald-600 hover:text-emerald-700 active:scale-95 transition-all">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
              </svg>
            </button>
          </div>

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

        {hasMessages ? (
          <div className="space-y-6 pb-4">
            {/* Render Tambo Thread Messages */}
            {thread?.messages?.map((message, index) => {
              if (message.role === "user") {
                return (
                  <div key={message.id || index} className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                    <div className="max-w-[80%] px-5 py-3 btn-skeu-dark rounded-2xl rounded-tr-sm text-sm leading-relaxed font-medium">
                      {getMessageContent(message.content)}
                    </div>
                  </div>
                )
              }

              if (message.role === "assistant") {
                const content = getMessageContent(message.content)
                const messageId = message.id || `msg-${index}`
                // Get reasoning: either from map (completed) or current (if this is the streaming message)
                const reasoning = messageReasoningMap[messageId] ||
                  (isStreaming && index === (thread?.messages?.length || 0) - 1 ? currentReasoning : [])

                return (
                  <div key={messageId} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 items-start">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Bot className="w-4 h-4 text-stone-600" />
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-[90%]">
                      {/* Reasoning Chain - collapsed by default for completed messages */}
                      {reasoning.length > 0 && (
                        <ReasoningChain
                          steps={reasoning}
                          isThinking={isStreaming && index === (thread?.messages?.length || 0) - 1 && !content}
                        />
                      )}

                      {/* Message Content */}
                      <div className="px-5 py-3.5 rounded-2xl rounded-tl-none card-skeu text-sm text-stone-700 leading-relaxed">
                        {content || (
                          <span className="flex items-center gap-2 text-stone-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating response...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              return null
            })}

            {/* Live Thinking Indicator - only show before assistant message is created */}
            {isThinking && !isStreaming && (
              <div className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 items-start">
                <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1 animate-pulse">
                  <Bot className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[90%]">
                  <ReasoningChain steps={currentReasoning} isThinking={true} />
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
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
                  onClick={() => sendThreadMessage(prompt.label, { streamResponse: true })}
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
                disabled={!inputValue.trim()}
                className="h-10 w-10 shrink-0 rounded-2xl bg-[#20808D] hover:bg-[#165a63] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-xl shadow-[#20808D]/20 hover:shadow-2xl hover:shadow-[#20808D]/30 hover:scale-105 active:scale-95 transition-all duration-300 group/send"
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
