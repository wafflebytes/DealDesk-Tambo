"use client"

import React, { useState, useRef, useEffect } from "react"
import { Bot, Send, Search, AlertTriangle, FileSearch, Mic, Paperclip, Loader2, Github, ChevronDown } from "lucide-react"
import { useTamboThread } from "@tambo-ai/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// GenUI Components
import { RiskRadar } from "./risk-radar"
import { ClauseTuner } from "./clause-tuner"
import { ExtractionChecklist } from "./extraction-checklist"
import { DefinitionBank } from "./definition-bank"
import { ScopingCard } from "./scoping-card"
import { ReasoningChain, ReasoningStep } from "./reasoning-chain"
import { DraggableGenUI } from "./draggable-gen-ui"
import { ThreadDrawer } from "./thread-drawer"
import { DealRiskData, ClauseTunerData, ChecklistData, DefinitionBankData, ScopingData } from "@/components/genui/schemas"

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

// Strip markdown formatting for clean display
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
    .replace(/\*([^*]+)\*/g, '$1')       // *italic* -> italic
    .replace(/__([^_]+)__/g, '$1')       // __bold__ -> bold
    .replace(/_([^_]+)_/g, '$1')         // _italic_ -> italic
    .replace(/`([^`]+)`/g, '$1')         // `code` -> code
    .replace(/^#+\s+/gm, '')             // ## Heading -> Heading
    .replace(/^[-*]\s+/gm, '• ')         // - list -> • list
    .replace(/\n{3,}/g, '\n\n')          // Multiple newlines -> double
    .trim()
}

// Components that are GenUI (plus the coordinator meta-tool)
const GENUI_COMPONENTS = ['RiskRadar', 'ClauseTuner', 'ExtractionChecklist', 'DefinitionBank', 'KnowledgeBank', 'ScopingCard', 'coordinate', 'orchestrate']

// Map sub-agents to user-friendly display names
const AGENT_DISPLAY_NAMES: Record<string, string> = {
  coordinate: 'Coordinator',
  analyzeContractRisks: 'Risk Analyst',
  negotiateClause: 'Clause Negotiator',
  extractObligations: 'Obligation Extractor',
  curateDefinitions: 'Definition Curator',
  scopeRequest: 'Scoping Specialist',
  orchestrate: 'Coordinator'
}

// Detect if content is an orchestrator "thought" that should go in reasoning chain
function isOrchestratorThought(content: string): boolean {
  const text = content.trim()

  // Direct thought patterns
  const directPatterns = [
    /^I'll\s/i,
    /^I will\s/i,
    /^Let me\s/i,
    /^(Analyzing|Classifying|Processing|Assessing)/i
  ]

  // Patterns with common prefixes (Got it, Sure, Okay, etc.)
  const prefixedPatterns = [
    /^(Got it|Sure|Okay|Alright|OK)[—–\-,.:!]?\s*(I'll|I will|Let me)/i,
    /^(Got it|Sure|Okay|Alright|OK)[—–\-,.:!]?\s*\w/i // "Got it—" followed by anything
  ]

  // Content patterns (these indicate orchestrator explanation regardless of start)
  const contentPatterns = [
    /risk profile/i,
    /assess the (agreement|contract|deal)/i,
    /analyze the (MSA|agreement|contract)/i,
    /score the.*risk/i,
    /pull up.*view/i,
    /render.*component/i,
    /visualize the/i,
    /classify your request/i,
    /summarize the contract/i, // Added: Raw JSON detection
    /"risks":/i, // Catch the specific risks JSON
    /"Liability":/i,
    /"intent":/i
  ]

  // Aggressive JSON detection: If it looks like a JSON object, treat it as a thought/background data
  if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
    return true
  }

  return directPatterns.some(p => p.test(text)) ||
    prefixedPatterns.some(p => p.test(text)) ||
    contentPatterns.some(p => p.test(text))
}

export function TamboChat({ appState }: { appState?: 'empty' | 'processing' | 'active' }) {
  // Tambo SDK Hooks
  const { thread, sendThreadMessage, generationStage, isIdle } = useTamboThread()

  // Local UI State
  const [inputValue, setInputValue] = useState("")
  const [currentReasoning, setCurrentReasoning] = useState<ReasoningStep[]>([])
  const [messageReasoningMap, setMessageReasoningMap] = useState<Record<string, ReasoningStep[]>>({})
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Is the AI actively streaming a response?
  const isStreaming = generationStage === 'STREAMING_RESPONSE'

  // Determine if AI is "thinking" (before response starts streaming)
  const isThinking = !isIdle &&
    generationStage !== 'COMPLETE' &&
    generationStage !== 'ERROR' &&
    generationStage !== 'STREAMING_RESPONSE'

  // Update reasoning chain based on generation stage - MCP Agent labels
  // Uses deduplication to prevent React Strict Mode from causing duplicate steps
  useEffect(() => {
    // 🔍 DEBUG: Log every stage transition
    console.log('%c[ReasoningChain] Stage:', 'color: #6366f1', generationStage);

    if (generationStage === 'CHOOSING_COMPONENT') {
      console.log('%c   → Adding analysis step', 'color: #6366f1');
      // Initialize with analysis step - only if not already set
      setCurrentReasoning(prev => {
        if (prev.some(s => s.type === 'analysis')) return prev
        return [{
          message: "Maven is analyzing your request...",
          status: "processing",
          type: "analysis"
        }]
      })
    } else if (generationStage === 'FETCHING_CONTEXT') {
      console.log('%c   → Adding coordinator step', 'color: #6366f1');
      setCurrentReasoning(prev => {
        // Check if we already added the coordinator step (deduplication)
        if (prev.some(s => s.tool === 'coordinate')) {
          console.log('%c   → (skipped - already exists)', 'color: #9ca3af');
          return prev // Already have coordinator step, don't add another
        }

        // Complete the analysis step if it exists
        const updatedSteps = prev.map(s =>
          s.type === 'analysis' ? { ...s, status: "complete" as const } : s
        )

        // Add coordinator step
        return [
          ...updatedSteps,
          {
            message: "📋 Calling Coordinator agent...",
            status: "processing",
            tool: "coordinate",
            type: "tool_call"
          }
        ]
      })
    } else if (generationStage === 'HYDRATING_COMPONENT') {
      console.log('%c   → 🎉 HYDRATING_COMPONENT triggered! Adding sub-agent step', 'color: #10b981; font-weight: bold');
      setCurrentReasoning(prev => {
        // Check if we already added the sub-agent step (deduplication)
        if (prev.some(s => s.type === 'sub_agent')) {
          console.log('%c   → (skipped - already exists)', 'color: #9ca3af');
          return prev
        }

        // Complete all previous steps and add sub-agent step
        const completedSteps = prev.filter(s => s && s.message).map(s => ({ ...s, status: "complete" as const }))
        return [
          ...completedSteps,
          {
            message: "⚡ Invoking specialized sub-agent...",
            status: "processing",
            type: "sub_agent" as const
          }
        ]
      })
    } else if (generationStage === 'STREAMING_RESPONSE') {
      console.log('%c   → Marking all steps complete', 'color: #6366f1');
      // Mark all steps as complete
      setCurrentReasoning(prev => {
        return prev.filter(s => s && s.message).map(s => ({ ...s, status: "complete" as const }))
      })
    } else if (generationStage === 'COMPLETE' || generationStage === 'IDLE') {
      // Don't clear reasoning - keep it for persistence
      // Only clear pendingMessageId for next cycle
      setPendingMessageId(null)
    }
  }, [generationStage])

  // Attach reasoning to the assistant message when streaming starts
  // Also extract orchestrator decision from tool_calls
  useEffect(() => {
    if (generationStage === 'STREAMING_RESPONSE' && thread?.messages && currentReasoning.length > 0) {
      const lastMessage = thread.messages[thread.messages.length - 1] as any
      if (lastMessage?.role === 'assistant' && lastMessage.id && pendingMessageId !== lastMessage.id) {
        setPendingMessageId(lastMessage.id)

        // 🔍 DEBUG: Log what tool_calls we have
        console.log('%c[ToolCalls Extractor] Processing message:', 'color: #f59e0b');
        console.log('%c   Message ID:', 'color: #f59e0b', lastMessage.id);
        console.log('%c   Tool calls:', 'color: #f59e0b', lastMessage.tool_calls);

        // Filter valid steps and mark complete
        let reasoningWithDecision = currentReasoning
          .filter(s => s && s.message)
          .map(s => ({ ...s, status: "complete" as const }))

        if (lastMessage.tool_calls?.length > 0) {
          // Sub-agent tool names that Tambo might call directly
          const SUB_AGENT_TOOLS = ['analyzeContractRisks', 'negotiateClause', 'extractObligations', 'curateDefinitions', 'scopeRequest']

          // Look for the coordinator tool call
          const coordinateCall = lastMessage.tool_calls.find((tc: any) =>
            tc.function?.name === 'coordinate' || tc.function?.name === 'orchestrate'
          )

          // Look for direct sub-agent tool call
          const subAgentCall = lastMessage.tool_calls.find((tc: any) =>
            SUB_AGENT_TOOLS.includes(tc.function?.name)
          )

          // Check if there's a GenUI component call
          const genUICall = lastMessage.tool_calls.find((tc: any) =>
            GENUI_COMPONENTS.includes(tc.function?.name)
          )

          // 🔍 DEBUG: Log what we found
          console.log('%c   Coordinate call found:', 'color: #f59e0b', !!coordinateCall);
          console.log('%c   Sub-agent call found:', 'color: #f59e0b', subAgentCall?.function?.name);
          console.log('%c   GenUI call found:', 'color: #f59e0b', genUICall?.function?.name);
          if (coordinateCall?.result) {
            console.log('%c   Coordinate result:', 'color: #10b981', coordinateCall.result);
          }

          // Determine the agent that was invoked
          let agentName: string | undefined
          let componentName: string | undefined
          let reasoning: string = 'Processing request'

          if (coordinateCall) {
            try {
              const args = JSON.parse(coordinateCall.function.arguments || '{}')
              // Try to get result if available
              let result = null
              if (coordinateCall.result) {
                try { result = JSON.parse(coordinateCall.result) } catch { }
              }

              agentName = result?.agent || args.agent || subAgentCall?.function?.name
              componentName = result?.component || args.component || genUICall?.function?.name
              reasoning = result?.reasoning || args.reasoning || 'Routing to specialized agent'
            } catch (e) {
              console.error('[TamboChat] Failed to parse coordinator call:', e)
            }
          } else if (subAgentCall) {
            // No coordinator call but a sub-agent was called directly
            agentName = subAgentCall.function.name
            componentName = genUICall?.function?.name
            reasoning = 'Direct sub-agent invocation'
          }

          // Update sub-agent step with actual agent name if we have one
          if (agentName) {
            // Check if there's already a generic sub-agent step and update it
            const subAgentStepIndex = reasoningWithDecision.findIndex(s => s.type === 'sub_agent')

            if (subAgentStepIndex >= 0) {
              // Update the existing step with the actual agent name
              console.log('%c   → Updating existing sub-agent step', 'color: #10b981');
              reasoningWithDecision[subAgentStepIndex] = {
                ...reasoningWithDecision[subAgentStepIndex],
                message: `⚡ ${AGENT_DISPLAY_NAMES[agentName] || agentName} processing...`,
                tool: agentName,
                agentName: agentName,
                status: "complete" as const
              }
            } else {
              // FALLBACK: Add new sub-agent step if it was missed during HYDRATING_COMPONENT
              console.log('%c   → Adding MISSING sub-agent step (fallback)', 'color: #f59e0b');

              // Insert it before the decision step if possible, or just append
              reasoningWithDecision.push({
                message: `⚡ ${AGENT_DISPLAY_NAMES[agentName] || agentName} processing...`,
                status: "complete" as const,
                type: "sub_agent" as const,
                tool: agentName,
                agentName: agentName
              })
            }
          }

          // Add decision step if we have component info
          if (componentName || agentName) {
            // Check if decision step already exists
            if (!reasoningWithDecision.some(s => s.type === 'decision')) {
              console.log('%c   → Adding decision step', 'color: #10b981');
              reasoningWithDecision.push({
                message: "✨ Rendering response",
                status: "complete" as const,
                type: "decision" as const,
                decision: {
                  intent: componentName ? 'genui' as const : 'text' as const,
                  component: componentName,
                  reasoning: reasoning
                }
              })
            }
          }
        }

        setMessageReasoningMap(prev => ({
          ...prev,
          [lastMessage.id!]: reasoningWithDecision
        }))
      }
    }
  }, [generationStage, thread?.messages, currentReasoning, pendingMessageId])

  const lastMessageCount = useRef(0)

  const scrollToBottom = (force = false) => {
    if (force || (thread?.messages?.length || 0) > lastMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    lastMessageCount.current = thread?.messages?.length || 0
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

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMsg = inputValue
    setInputValue("")

    // Send message via Tambo SDK
    await sendThreadMessage(userMsg, { streamResponse: true })
  }

  const hasMessages = thread?.messages && thread.messages.length > 0

  // Helper to render tools based on tool_calls
  const renderToolCall = (toolCall: any) => {
    if (!toolCall || !toolCall.function || !toolCall.function.name) return null;

    try {
      let args = JSON.parse(toolCall.function.arguments || "{}")
      let toolName = toolCall.function.name

      // 🧠 Handle Coordinator meta-tool (extracts routing result)
      if (toolName === 'coordinate' || toolName === 'orchestrate') {
        if (!toolCall.result) return null; // Wait for result
        try {
          const result = JSON.parse(toolCall.result);
          if (result.intent === 'genui' && result.component && result.subAgentResult) {
            toolName = result.component;
            args = result.subAgentResult;
          } else {
            return null; // Not a GenUI intent
          }
        } catch (e) {
          console.error("Failed to parse coordinator result", e);
          return null;
        }
      }

      const Component = (() => {
        switch (toolName) {
          case "RiskRadar":
            return <RiskRadar {...(args as unknown as DealRiskData)} />
          case "ClauseTuner":
            return <ClauseTuner {...args as Partial<ClauseTunerData>} />
          case "ExtractionChecklist":
            return <ExtractionChecklist {...args as Partial<ChecklistData>} />
          case "DefinitionBank":
          case "KnowledgeBank":
            return <DefinitionBank {...args as Partial<DefinitionBankData>} />
          case "ScopingCard":
            return <ScopingCard {...args as Partial<ScopingData>} />
          default:
            return null
        }
      })()

      if (!Component) return null

      return (
        <DraggableGenUI id={`${toolCall.function.name}-${toolCall.id || Math.random()}`} type={toolCall.function.name}>
          {Component}
        </DraggableGenUI>
      )
    } catch (e) {
      console.error("Failed to parse tool args", e)
      return null
    }
  }


  return (
    <div className="relative flex flex-col h-full bg-slate-50 overflow-hidden border-l border-slate-200">
      {/* Thread Drawer */}
      <ThreadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Header - Fixed in Flow */}
      {/* Header - Fixed in Flow - Premium Polish */}
      <div className="flex-none px-5 py-3 bg-[#fcfaf8]/95 backdrop-blur-xl border-b border-stone-200/60 z-30 supports-[backdrop-filter]:bg-[#fcfaf8]/80">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 transition-all duration-300 ${isSearchFocused ? 'hidden' : 'flex'}`}>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="h-8 w-8 rounded-lg border border-stone-200/60 bg-white flex items-center justify-center text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-all shadow-sm"
            >
              <div className="flex flex-col gap-0.5">
                <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
                <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
                <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
              </div>
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/wafflebytes/DealDesk-Tambo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg border border-stone-200/60 bg-white flex items-center justify-center text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-all shadow-sm"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Build using Tambo, check out github</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className={`flex flex-col items-center flex-1 ${isSearchFocused ? 'hidden' : 'flex'}`}>
            <h2 className="font-serif text-lg font-bold text-stone-800 leading-none mb-0.5 tracking-tight">Maven</h2>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em]">Assistant</p>
          </div>

          <div className={`relative flex items-center gap-2 transition-all duration-300 ${isSearchFocused ? 'flex-1' : 'w-32'}`}>
            <div className={`relative group w-full`}>
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => !searchQuery && setIsSearchFocused(false)}
                placeholder="Search..."
                className={`h-8 pl-8 pr-7 text-xs bg-stone-100/50 border-0 ring-1 ring-stone-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20808D]/20 focus:bg-white transition-all w-full placeholder:text-stone-400 font-medium`}
              />
            </div>
            {isSearchFocused && (
              <button
                onClick={() => { setSearchQuery(""); setIsSearchFocused(false) }}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 scroll-smooth relative custom-scrollbar-teal">
        {/* Top Fade Mask - Removed or simplified */}

        {hasMessages ? (
          <div className="space-y-6 pb-4">
            {/* Render Tambo Thread Messages - Group consecutive assistant messages */}
            {(() => {
              const allMessages = thread?.messages || []

              // Filter messages based on search query
              const messages = searchQuery.trim()
                ? allMessages.filter(msg => {
                  const content = getMessageContent(msg.content).toLowerCase()
                  return content.includes(searchQuery.toLowerCase())
                })
                : allMessages

              const renderedMessages: React.ReactNode[] = []
              let i = 0

              while (i < messages.length) {
                const message = messages[i]

                if (message.role === "user") {
                  renderedMessages.push(
                    <div key={message.id || i} className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                      <div className="max-w-[80%] px-5 py-3 btn-skeu-dark rounded-2xl rounded-tr-sm text-sm leading-relaxed font-medium">
                        {getMessageContent(message.content)}
                      </div>
                    </div>
                  )
                  i++
                  continue
                }

                // Collect ALL consecutive non-user messages (assistant, tool, system)
                const assistantGroup: typeof messages = []
                while (i < messages.length && messages[i].role !== "user") {
                  assistantGroup.push(messages[i])
                  i++
                }

                // Check if ANY message in this group has a REAL GenUI component
                const hasGenUIInGroup = assistantGroup.some(
                  m => (m as any).renderedComponent ||
                    (m as any).tool_calls?.some((tc: any) => GENUI_COMPONENTS.includes(tc.function?.name))
                )

                // Check if there's any non-thought text content to display
                const nonThoughtTextMessages = assistantGroup.filter(m => {
                  const content = getMessageContent(m.content)
                  return content && !isOrchestratorThought(content)
                })

                // Check if still loading
                const isStillLoading = assistantGroup.every(m => {
                  const content = getMessageContent(m.content)
                  const toolCalls = (m as any).tool_calls || []
                  return !content && toolCalls.length === 0 && !(m as any).renderedComponent
                })

                // Check if there are any orchestrator thoughts to show
                const hasThoughts = assistantGroup.some(m => {
                  const content = getMessageContent(m.content)
                  return content && isOrchestratorThought(content)
                })

                // SKIP this group ONLY if it has no content, no loading state, and no thoughts
                if (!hasGenUIInGroup && nonThoughtTextMessages.length === 0 && !isStillLoading && !hasThoughts) {
                  continue
                }

                // Render the grouped messages with ONE avatar
                const firstMessageWithId = assistantGroup.find(m => m.id)
                const groupKey = firstMessageWithId?.id || `group-${i}`

                renderedMessages.push(
                  <div key={groupKey} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 items-start">
                    {/* Single avatar for the entire group */}
                    <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Bot className="w-4 h-4 text-stone-600" />
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-[90%]">
                      {/* Show reasoning chain for this message group if available */}
                      {/* Check all messages in group for reasoning, but usually attached to first assistant msg */}
                      {(() => {
                        const msgWithReasoning = assistantGroup.find(m => m.id && messageReasoningMap[m.id])
                        if (msgWithReasoning?.id) {
                          return (
                            <ReasoningChain
                              steps={messageReasoningMap[msgWithReasoning.id]}
                              isThinking={false}
                              persistAfterComplete={true}
                            />
                          )
                        }
                        return null
                      })()}

                      {(() => {
                        const results: React.ReactNode[] = []

                        // 1. Identify the GenUI message index (if any)
                        // We use the same finding logic as before but get the INDEX
                        const genUIMessageIndex = assistantGroup.findIndex(m =>
                          (m as any).renderedComponent ||
                          (m as any).tool_calls?.some((tc: any) => GENUI_COMPONENTS.includes(tc.function?.name))
                        )

                        // Helper to render a text message
                        // Helper to render a text message
                        const renderTextMsg = (msg: any, i: number) => {
                          // Hide "tool" role messages (which contain raw JSON output) and system messages
                          if (msg.role === 'tool' || msg.role === 'system') return null

                          const content = getMessageContent(msg.content)
                          if (!content || content.trim().length === 0) return null
                          // Basic "thought" filter if not handled by getMessageContent
                          if (content.startsWith('<thought>')) return null

                          // Hide raw JSON dumps (e.g. tool results echoed as text)
                          const trimmed = content.trim()
                          if (trimmed.startsWith('{') && trimmed.endsWith('}')) return null

                          return (
                            <div key={msg.id || `text-${i}`} className="px-5 py-3.5 rounded-2xl rounded-tl-none card-skeu text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                              {stripMarkdown(content)}
                            </div>
                          )
                        }

                        // 2. Render messages in order
                        if (genUIMessageIndex === -1) {
                          // No GenUI, just render all valid text
                          assistantGroup.forEach((msg, i) => {
                            const el = renderTextMsg(msg, i)
                            if (el) results.push(el)
                          })
                        } else {
                          // Render Pre-GenUI Text
                          assistantGroup.slice(0, genUIMessageIndex).forEach((msg, i) => {
                            const el = renderTextMsg(msg, i)
                            if (el) results.push(el)
                          })

                          // Render GenUI
                          const genUIMessage = assistantGroup[genUIMessageIndex]
                          const messageId = genUIMessage.id || 'genui-msg'
                          let componentName = 'genui'

                          // ... (Exact extraction logic as before) ...
                          for (const msg of [genUIMessage]) { // scope to just this msg
                            const msgToolCalls = (msg as any).tool_calls || []
                            const genUICall = msgToolCalls.find((tc: any) => GENUI_COMPONENTS.includes(tc.function?.name))
                            if (genUICall) { componentName = genUICall.function.name; break }
                            const orchestrateCall = msgToolCalls.find((tc: any) => tc.function?.name === 'orchestrate')
                            if (orchestrateCall) {
                              try {
                                const args = JSON.parse(orchestrateCall.function?.arguments || '{}')
                                if (args.component && GENUI_COMPONENTS.includes(args.component)) { componentName = args.component; break }
                              } catch (e) { }
                            }
                            const compDef = (msg as any).component?.componentDefinition?.name
                            if (compDef && GENUI_COMPONENTS.includes(compDef)) { componentName = compDef; break }
                          }

                          const componentType = componentName.replace(/([A-Z])/g, (match: string, p1: string, offset: number) => offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase())

                          if ((genUIMessage as any).renderedComponent) {
                            const theComponent = (genUIMessage as any).renderedComponent
                            results.push(
                              <DraggableGenUI key="genui-rendered" id={messageId} type={componentType} renderedComponent={theComponent}>
                                <div className="w-full animate-in fade-in slide-in-from-bottom-2">{theComponent}</div>
                              </DraggableGenUI>
                            )
                          } else {
                            const genUIToolCalls = ((genUIMessage as any).tool_calls || []).filter((tc: any) => GENUI_COMPONENTS.includes(tc.function?.name))
                            if (genUIToolCalls.length > 0) {
                              results.push(
                                <div key="genui-tools" className="space-y-4 w-full">
                                  {genUIToolCalls.map((tc: any, idx: number) => <div key={idx} className="w-full">{renderToolCall(tc)}</div>)}
                                </div>
                              )
                            }
                          }

                          // Render Post-GenUI Text
                          assistantGroup.slice(genUIMessageIndex + 1).forEach((msg, i) => {
                            const el = renderTextMsg(msg, genUIMessageIndex + 1 + i)
                            if (el) results.push(el)
                          })
                        }

                        if (results.length > 0) return results

                        // Default loading state
                        if (isStillLoading) return (
                          <div key="loading" className="px-5 py-3.5 rounded-2xl rounded-tl-none card-skeu text-sm text-stone-700 leading-relaxed">
                            <span className="flex items-center gap-2 text-stone-400"><Loader2 className="w-4 h-4 animate-spin" />Generating response...</span>
                          </div>
                        )

                        return null
                      })()}
                    </div>
                  </div>
                )
                continue
              }

              return renderedMessages
            })()}

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

      {/* Control Deck (Input Area) - Flush to bottom */}
      <div className="flex-none p-3 px-4 bg-white border-t border-slate-200 z-20 relative">
        <div className="max-w-3xl mx-auto relative group/input">
          {/* Main Pill - Skeuomorphic */}
          <div className="flex items-center gap-2 p-1.5 rounded-[2rem] bg-white border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] ring-4 ring-stone-50/50 transition-shadow duration-300 ease-out">

            {/* Attachment Button - Anchored to bottom */}
            <div className="pb-0.5 pl-0.5">
              <button className="h-10 w-10 shrink-0 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors active:scale-95">
                <Paperclip className="w-5 h-5 -rotate-45" />
              </button>
            </div>

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
              className="flex-1 bg-transparent min-h-[44px] max-h-32 py-3 px-2 text-base text-stone-800 placeholder:text-stone-400 font-medium outline-none resize-none leading-relaxed overflow-y-auto custom-scrollbar self-center"
              rows={1}
            />

            {/* Right Actions - Anchored to bottom */}
            <div className="flex items-center gap-1.5 pr-1.5 pb-0.5">
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
      </div >
    </div >
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
