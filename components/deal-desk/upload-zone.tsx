"use client"

import { useRef } from "react"
import { UploadCloud, FileText, ArrowUp, PenTool } from "lucide-react"

interface UploadZoneProps {
    onUpload: (content: string, fileName: string) => void
    onDraft?: () => void
}

export function UploadZone({ onUpload, onDraft }: UploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            onUpload(content, file.name)
        }
        reader.readAsText(file)
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }
    return (
        <div className="h-full flex items-center justify-center p-4 sm:p-8">
            <div
                onClick={handleClick}
                className="w-full max-w-2xl min-h-[60svh] sm:min-h-0 sm:aspect-[4/3] rounded-[2rem] border-4 border-dashed border-stone-300 bg-stone-50/30 hover:bg-[#20808D]/5 has-[button:hover]:bg-stone-50/30 hover:border-[#20808D]/40 has-[button:hover]:border-stone-300 transition-all duration-500 cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-xl has-[button:hover]:shadow-sm hover:shadow-[#20808D]/10 has-[button:hover]:shadow-none"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".md,.txt,.pdf"
                />
                <div className="absolute inset-0 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none group-hover:opacity-30 group-hover:bg-[radial-gradient(#20808D_1px,transparent_1px)] group-has-[button:hover]:opacity-20 group-has-[button:hover]:bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] transition-all duration-500" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-7 sm:space-y-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white shadow-2xl flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500 ring-8 ring-white">
                        <div className="absolute inset-0 bg-gradient-to-br from-white to-[#f4fafa] rounded-3xl" />
                        <UploadCloud className="w-11 h-11 sm:w-14 sm:h-14 text-stone-400 group-hover:text-[#20808D] transition-colors duration-500 relative z-10" />

                        {/* Skeuomorphic active indicator */}
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#20808D] flex items-center justify-center shadow-lg border-4 border-white group-hover:translate-y-[-4px] transition-transform duration-500">
                            <ArrowUp className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3 max-w-sm">
                        <h3 className="font-serif text-3xl sm:text-4xl text-stone-800 font-medium tracking-tight group-hover:text-[#0d3d43] transition-colors duration-500">Upload Contract</h3>
                        <p className="text-base sm:text-lg text-stone-500 leading-relaxed font-medium">
                            Drag and drop your .txt or .md here, or click to browse files.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-3 delay-100">
                        {onDraft && (
                            <>
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">OR</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDraft()
                                    }}
                                    className="px-5 sm:px-6 py-3 rounded-xl bg-white border border-stone-200 shadow-[0_4px_0_0_#e7e5e4,0_2px_4px_rgba(0,0,0,0.1)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#20808D,0_1px_2px_rgba(0,0,0,0.1)] hover:border-[#20808D]/40 active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2.5 group/btn relative z-20"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-[#f4fafa] flex items-center justify-center group-hover/btn:bg-[#20808D]/10 transition-colors">
                                        <PenTool className="w-4 h-4 text-[#20808D]" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold text-stone-700 group-hover/btn:text-[#0d3d43]">Draft with AI</span>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
