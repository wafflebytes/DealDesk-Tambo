"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Check, Loader2, Hammer, Search, FileText, Zap, Bot } from "lucide-react"

export interface ReasoningStep {
    message: string
    tool?: string
    status: 'pending' | 'processing' | 'complete'
    type?: 'analysis' | 'tool_call' | 'decision' | 'sub_agent'
    agentName?: string  // Display name for the agent
    decision?: {
        intent: 'text' | 'genui'
        component?: string
        reasoning: string
    }
}

interface ReasoningChainProps {
    steps: ReasoningStep[]
    isThinking: boolean
    className?: string
    persistAfterComplete?: boolean
}

// Agent display names for the UI
const AGENT_DISPLAY_NAMES: Record<string, string> = {
    coordinate: 'Coordinator',
    analyzeContractRisks: 'Risk Analyst',
    negotiateClause: 'Clause Negotiator',
    extractObligations: 'Obligation Extractor',
    curateDefinitions: 'Definition Curator',
    scopeRequest: 'Scoping Specialist'
}

// Icons for different agent types
const AGENT_ICONS: Record<string, string> = {
    coordinate: '🎯',
    analyzeContractRisks: '📊',
    negotiateClause: '⚖️',
    extractObligations: '📋',
    curateDefinitions: '📖',
    scopeRequest: '🔍'
}

export function ReasoningChain({ steps, isThinking, className, persistAfterComplete }: ReasoningChainProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [hasCompleted, setHasCompleted] = useState(false)

    // Auto-expand during thinking, optionally collapse on complete
    useEffect(() => {
        if (isThinking) {
            setIsExpanded(true)
            setHasCompleted(false)
        } else if (steps.length > 0 && !isThinking) {
            if (!persistAfterComplete) {
                const timer = setTimeout(() => {
                    setIsExpanded(false)
                    setHasCompleted(true)
                }, 800)
                return () => clearTimeout(timer)
            } else {
                setHasCompleted(true)
            }
        }
    }, [isThinking, steps.length, persistAfterComplete])

    // Filter out any empty/undefined steps (fixes blank checkmark issue)
    const validSteps = steps.filter(step => step && step.message && step.message.trim().length > 0)

    if (validSteps.length === 0 && !isThinking) return null

    return (
        <div className={`w-full text-left ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-1 py-1 rounded hover:bg-stone-100 transition-colors group ${isThinking ? 'animate-pulse' : ''}`}
            >
                {isThinking && (
                    <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />
                )}

                <span className="text-[11px] font-medium text-stone-500">
                    {isThinking ? "Thinking..." : "View thought process"}
                </span>

                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className="pl-3 border-l-2 border-stone-100 ml-1.5 space-y-3 py-1">
                    {validSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            {/* Status indicator */}
                            <div className={`mt-0.5 w-4 h-4 rounded shadow-sm flex items-center justify-center shrink-0 ${step.status === 'processing'
                                ? 'bg-[#20808D] text-white'
                                : step.status === 'complete'
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-stone-100 text-stone-400'
                                }`}>
                                {step.status === 'processing' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                {step.status === 'complete' && <Check className="w-2.5 h-2.5" />}
                                {step.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />}
                            </div>

                            <div className="flex flex-col flex-1">
                                {/* Main message */}
                                <span className={`text-xs font-medium ${step.status === 'pending' ? 'text-stone-400' : 'text-stone-700'}`}>
                                    {step.message}
                                </span>

                                {/* Tool/Agent badge */}
                                {step.tool && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Hammer className="w-2.5 h-2.5 text-stone-400" />
                                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                                            {AGENT_ICONS[step.tool] || '🔧'} {AGENT_DISPLAY_NAMES[step.tool] || step.tool}
                                        </span>
                                    </div>
                                )}

                                {/* Agent name display for sub-agent invocations */}
                                {step.type === 'sub_agent' && step.agentName && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Zap className="w-2.5 h-2.5 text-amber-500" />
                                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                            {AGENT_ICONS[step.agentName] || '⚡'} {AGENT_DISPLAY_NAMES[step.agentName] || step.agentName}
                                        </span>
                                    </div>
                                )}

                                {/* Decision display */}
                                {step.type === 'decision' && step.decision && (
                                    <div className="mt-1 p-2 bg-stone-50 rounded border border-stone-200 text-[10px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-1.5 py-0.5 rounded font-medium ${step.decision.intent === 'genui'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-stone-200 text-stone-600'
                                                }`}>
                                                {step.decision.intent === 'genui' ? '🎨 GenUI' : '💬 Text'}
                                            </span>
                                            {step.decision.component && (
                                                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                                                    → {step.decision.component}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-stone-500 italic">{step.decision.reasoning}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
