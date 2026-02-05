"use client"

import { UploadCloud, FileText, ArrowUp } from "lucide-react"

interface UploadZoneProps {
    onUpload: () => void
}

export function UploadZone({ onUpload }: UploadZoneProps) {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <div
                onClick={onUpload}
                className="w-full max-w-2xl aspect-[4/3] rounded-[2rem] border-4 border-dashed border-stone-300 bg-stone-50/30 hover:bg-[#20808D]/5 hover:border-[#20808D]/40 transition-all duration-500 cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#20808D]/10"
            >
                <div className="absolute inset-0 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none group-hover:opacity-30 group-hover:bg-[radial-gradient(#20808D_1px,transparent_1px)] transition-all duration-500" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    <div className="w-32 h-32 rounded-3xl bg-white shadow-2xl flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500 ring-8 ring-white">
                        <div className="absolute inset-0 bg-gradient-to-br from-white to-[#f4fafa] rounded-3xl" />
                        <UploadCloud className="w-14 h-14 text-stone-400 group-hover:text-[#20808D] transition-colors duration-500 relative z-10" />

                        {/* Skeuomorphic active indicator */}
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#20808D] flex items-center justify-center shadow-lg border-4 border-white group-hover:translate-y-[-4px] transition-transform duration-500">
                            <ArrowUp className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3 max-w-sm">
                        <h3 className="font-serif text-4xl text-stone-800 font-medium tracking-tight group-hover:text-[#0d3d43] transition-colors duration-500">Upload Contract</h3>
                        <p className="text-lg text-stone-500 leading-relaxed font-medium">
                            Drag and drop your PDF here,<br />or click to browse files.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="px-5 py-2.5 rounded-xl bg-white/60 border border-stone-200 flex items-center gap-2.5 shadow-sm group-hover:border-[#20808D]/20 transition-colors">
                            <FileText className="w-5 h-5 text-stone-500 group-hover:text-[#20808D] transition-colors" />
                            <span className="text-xs uppercase tracking-wider font-bold text-stone-600">PDF</span>
                        </div>
                        <div className="px-5 py-2.5 rounded-xl bg-white/60 border border-stone-200 flex items-center gap-2.5 shadow-sm group-hover:border-[#20808D]/20 transition-colors">
                            <FileText className="w-5 h-5 text-stone-500 group-hover:text-[#20808D] transition-colors" />
                            <span className="text-xs uppercase tracking-wider font-bold text-stone-600">DOCX</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
