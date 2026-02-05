"use client"

import { useState, useEffect } from "react"
import { ChevronDown, BrainCircuit, Check, Loader2, Hammer, Search, FileText } from "lucide-react"

export interface ReasoningStep {
    message: string
    tool?: string
    status: 'pending' | 'processing' | 'complete'
}

interface ReasoningChainProps {
    steps: ReasoningStep[]
    isThinking: boolean
    className?: string
}

export function ReasoningChain({ steps, isThinking, className }: ReasoningChainProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [hasCompleted, setHasCompleted] = useState(false)

    // Auto-expand during thinking, collapse on complete
    useEffect(() => {
        if (isThinking) {
            setIsExpanded(true)
            setHasCompleted(false)
        } else if (steps.length > 0 && !isThinking) {
            const timer = setTimeout(() => {
                setIsExpanded(false)
                setHasCompleted(true)
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [isThinking, steps.length])

    if (steps.length === 0 && !isThinking) return null

    return (
        <div className={`w-full text-left ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-1 py-1 rounded hover:bg-stone-100 transition-colors group ${isThinking ? 'animate-pulse' : ''}`}
            >
                {isThinking ? (
                    <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />
                ) : null}

                <span className="text-[11px] font-medium text-stone-500">
                    {isThinking ? "Thinking..." : "View thought process"}
                </span>

                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className="pl-3 border-l-2 border-stone-100 ml-1.5 space-y-3 py-1">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
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

                            <div className="flex flex-col">
                                <span className={`text-xs font-medium ${step.status === 'pending' ? 'text-stone-400' : 'text-stone-700'}`}>
                                    {step.message}
                                </span>
                                {step.tool && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Hammer className="w-2.5 h-2.5 text-stone-400" />
                                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1 py-0.5 rounded border border-stone-200">
                                            {step.tool}
                                        </span>
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
