"use client"

import { useEffect, useState } from "react"
import { FileText, Loader2, Sparkles, CheckCircle2 } from "lucide-react"

interface ProcessingViewProps {
    onComplete: () => void
}

export function ProcessingView({ onComplete }: ProcessingViewProps) {
    const [progress, setProgress] = useState(0)
    const [stage, setStage] = useState("Uploading...")

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 2 // 50 ticks = approx 2.5s ?? adjust speed
            })
        }, 40) // 100 * 40ms = 4000ms total

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (progress > 20) setStage("Parsing text content...")
        if (progress > 50) setStage("Identifying clauses...")
        if (progress > 80) setStage("Finalizing analysis...")
        if (progress === 100) {
            setTimeout(onComplete, 800) // Slight delay at 100% before switch
        }
    }, [progress, onComplete])

    return (
        <div className="h-full flex items-center justify-center p-8 bg-stone-50/30">
            <div className="w-full max-w-md space-y-8 text-center">

                {/* Animated Icon */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="46"
                            fill="none"
                            stroke="#1c1917"
                            strokeWidth="4"
                            strokeDasharray="289" // 2 * pi * 46
                            strokeDashoffset={289 - (289 * progress) / 100}
                            className="transition-all duration-100 ease-linear"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {progress < 100 ? (
                            <FileText className="w-8 h-8 text-stone-700 animate-pulse" />
                        ) : (
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 scale-110 transition-transform" />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="font-serif text-2xl text-stone-900 font-medium animate-in fade-in slide-in-from-bottom-2">
                        {progress < 100 ? "Analyzing Contract" : "Ready to Review"}
                    </h2>
                    <p className="text-sm text-stone-500 font-mono h-5">
                        {stage}
                    </p>
                </div>

                {/* Progress Bar (Visual only, redundant with circle but nice for detail) */}
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-stone-800 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
