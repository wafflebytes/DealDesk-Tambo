"use client"

import { GripVertical, Link2, BookOpen, ExternalLink, Image as ImageIcon } from "lucide-react"

interface DefinitionExplainerProps {
    term?: string
}

export function DefinitionExplainer({ term = "Confidential Information" }: DefinitionExplainerProps) {
    return (
        <div className="rounded-xl card-skeu group relative overflow-hidden w-full max-w-sm bg-white">
            {/* Drag Handle */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10">
                <div className="w-6 h-6 rounded-md btn-skeu flex items-center justify-center">
                    <GripVertical className="w-3.5 h-3.5 text-stone-400" />
                </div>
            </div>

            {/* Thread Indicator */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link2 className="w-3 h-3 text-amber-500" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-4 bg-stone-800 rounded-full" />
                    <h3 className="font-serif text-base text-stone-900 leading-none mt-0.5">Concept Explainer</h3>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 bg-gradient-to-b from-stone-50/30 to-transparent">

                {/* Term Title */}
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1 block">Defined Term</span>
                    <h4 className="text-lg font-bold text-stone-800 tracking-tight">{term}</h4>
                </div>

                {/* Detailed Explanation */}
                <div className="text-sm text-stone-600 leading-relaxed font-medium bg-stone-50/80 p-3 rounded-xl border border-stone-100">
                    <p>
                        Refers to non-public information shared between parties that is designated as confidential or should reasonably be understood as such.
                    </p>
                    <p className="mt-2 text-stone-500 text-xs">
                        Key inclusions: Trade secrets, business plans, customer data, and financial records.
                    </p>
                </div>

                {/* Sources */}
                <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Context Sources</span>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg shadow-sm w-full">
                            <div className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-[10px]">
                                4.2
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-stone-700 truncate">NDA Section</p>
                                <p className="text-[10px] text-stone-400 truncate">MSA_Acme.pdf</p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                        </div>
                    </div>
                </div>

                {/* Fetched Visual (Placeholder) */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex flex-col items-center justify-center group/image cursor-pointer">
                    <ImageIcon className="w-6 h-6 text-stone-300 mb-2 group-hover/image:text-indigo-400 transition-colors" />
                    <p className="text-[10px] font-medium text-stone-400 group-hover/image:text-stone-600 transition-colors">Visualizing data flow...</p>

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-[10px] font-bold text-white tracking-wide">View Diagram</p>
                    </div>
                </div>

            </div>
        </div>
    )
}
