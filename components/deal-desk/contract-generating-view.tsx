"use client"

import { FileText, Sparkles } from "lucide-react"

interface ContractGeneratingViewProps {
    contractType?: string
}

export function ContractGeneratingView({ contractType }: ContractGeneratingViewProps) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#f4fafa] via-white to-[#edf3f3] animate-in fade-in duration-500">
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 w-24 h-24 -m-4 rounded-full bg-[#20808D]/10 animate-ping opacity-50" />

                {/* Middle Glow */}
                <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-gradient-to-br from-[#20808D]/20 to-transparent animate-pulse" />

                {/* Main Icon */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-[#f4fafa] ring-1 ring-black/5 shadow-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[#20808D] animate-pulse" />

                    {/* Sparkle Accent */}
                    <div className="absolute -top-1 -right-1">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-3">
                <h2 className="font-serif text-xl font-semibold text-stone-800 tracking-tight">
                    Drafting Your Contract
                </h2>
                <div className="space-y-1">
                    <p className="text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
                        {contractType
                            ? `Generating a professional ${contractType}...`
                            : "Generating a professional contract for you..."
                        }
                    </p>
                    <p className="text-xs text-stone-400 italic animate-pulse">
                        Please serve yourself a coffee, this might take a moment...
                    </p>
                </div>
            </div>

            {/* Progress Shimmer */}
            <div className="mt-8 w-48 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#20808D] via-[#20808D]/60 to-[#20808D] rounded-full animate-shimmer"
                    style={{
                        width: '50%',
                        animation: 'shimmer 1.5s ease-in-out infinite'
                    }}
                />
            </div>

            {/* Inline Keyframes for Shimmer */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    )
}
