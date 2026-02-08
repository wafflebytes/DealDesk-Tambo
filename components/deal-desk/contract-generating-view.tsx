"use client"

import { FileText, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface ContractGeneratingViewProps {
    contractType?: string
}

export function ContractGeneratingView({ contractType }: ContractGeneratingViewProps) {
    const [progress, setProgress] = useState(5)
    const [stage, setStage] = useState("Initializing intelligence...")

    // Psychological Progress Logic
    useEffect(() => {
        const steps = [
            { pct: 25, label: "Analyzing requirements...", delay: 800 },
            { pct: 45, label: "Drafting core clauses...", delay: 1800 },
            { pct: 65, label: "Optimizing legal language...", delay: 3200 },
            { pct: 82, label: "Formatting structure...", delay: 4800 },
            { pct: 94, label: "Finalizing details...", delay: 6500 },
        ]

        const timeouts = steps.map(step =>
            setTimeout(() => {
                setProgress(step.pct)
                setStage(step.label)
            }, step.delay)
        )

        return () => timeouts.forEach(clearTimeout)
    }, [])

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#FDFCF8] animate-in fade-in duration-700 relative overflow-hidden">

            {/* Animated Icon Container */}
            <div className="relative mb-12 transform scale-110 lg:scale-125 transition-transform duration-500">

                {/* Main Card - Premium Skeuomorphic */}
                <div className="relative w-28 h-28 rounded-[2.5rem] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.02)] ring-1 ring-stone-900/5 flex items-center justify-center group overflow-hidden">
                    {/* Inner Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#20808D]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <FileText className="w-12 h-12 text-[#20808D] animate-pulse" strokeWidth={1.5} />
                </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-5 z-10 max-w-sm px-8">
                <div className="space-y-3">
                    <h2 className="font-serif text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-800 via-stone-500 to-stone-800 animate-gradient-x tracking-tight">
                        {contractType ? `Drafting ${contractType}` : "Drafting Your Contract"}
                    </h2>
                    <div className="space-y-1">
                        <p className="text-sm lg:text-base text-stone-500 leading-relaxed font-medium">
                            Our intelligence engine is meticulously assembling your document.
                        </p>
                        <p className="text-xs text-stone-400 font-medium animate-pulse delay-700">
                            Please have some patience, precision takes a moment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Premium Progress Section */}
            <div className="mt-14 w-64 lg:w-80 space-y-3">
                <div className="h-2 w-full bg-stone-100/80 rounded-full overflow-hidden ring-1 ring-stone-900/5 p-0.5 shadow-inner backdrop-blur-sm">
                    <div
                        className="h-full bg-gradient-to-r from-[#20808D] via-[#2CE4B6] to-[#20808D] rounded-full relative overflow-hidden animate-gradient-x bg-[length:200%_auto]"
                        style={{
                            width: `${progress}%`,
                            transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer scale-x-150" />
                    </div>
                </div>
                <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300 key={stage}">
                        {stage}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest tabular-nums">
                        {progress}%
                    </span>
                </div>
            </div>

            {/* Inline Keyframes & Custom Animations */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-150%); }
                    100% { transform: translateX(150%); }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% auto;
                    animation: gradient-x 4s ease infinite;
                }
            `}</style>
        </div>
    )
}
