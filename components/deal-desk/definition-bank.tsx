"use client"

import { useState } from "react"
import { Book, Search, ArrowUpDown, Tag, GripVertical, Link2, Filter, ArrowRight } from "lucide-react"

type Definition = {
    term: string
    definition: string
    tags: string[]
}

const definitionsData: Definition[] = [
    {
        term: "Confidential Information",
        definition: "Means all non-public info disclosed by a party...",
        tags: ["Legal"]
    },
    {
        term: "Services",
        definition: "Means the professional services described in SOW.",
        tags: ["Ops"]
    },
    {
        term: "Effective Date",
        definition: "Means the date first written above.",
        tags: ["Date"]
    },
]

interface DefinitionBankProps {
    onExplain?: (term: string) => void
}

export function DefinitionBank({ onExplain }: DefinitionBankProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedTerm, setExpandedTerm] = useState<string | null>(null)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeTag, setActiveTag] = useState<string | null>(null)

    const uniqueTags = Array.from(new Set(definitionsData.flatMap(d => d.tags)))

    const filteredDefs = definitionsData.filter(d => {
        const matchesSearch = d.term.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTag = activeTag ? d.tags.includes(activeTag) : true
        return matchesSearch && matchesTag
    })

    return (
        <div className="rounded-xl card-skeu group relative overflow-hidden w-full min-w-0 bg-white">


            {/* Thread Indicator */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link2 className="w-3 h-3 text-amber-500" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between relative">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
                    <h3 className="font-serif text-base text-stone-900">Definition Bank</h3>
                </div>
                <div className="flex gap-2 transition-transform duration-300 ease-out group-hover:-translate-x-8 will-change-transform">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border active:scale-95 ${isFilterOpen ? 'bg-sky-50 border-sky-200 text-sky-600' : 'hover:bg-stone-100 border-transparent hover:border-stone-200 text-stone-400'}`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Filter Bar (Conditional) */}
            {isFilterOpen && (
                <div className="px-5 py-2 bg-stone-50/50 border-b border-stone-100 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                    <button
                        onClick={() => setActiveTag(null)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${!activeTag ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}
                    >
                        All
                    </button>
                    <div className="w-px h-3 bg-stone-200 mx-1" />
                    {uniqueTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all border ${activeTag === tag
                                ? 'bg-sky-50 border-sky-200 text-sky-700 shadow-sm'
                                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="p-0 bg-gradient-to-b from-stone-50/30 to-transparent">
                {/* Search Input (Inset) */}
                <div className="px-5 py-3 border-b border-stone-100/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search terms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 h-9 text-xs bg-stone-100/50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300 transition-all placeholder:text-stone-400 shadow-inner font-medium text-stone-700"
                        />
                    </div>
                </div>

                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredDefs.length > 0 ? (
                        filteredDefs.map((def, idx) => {
                            const isExpanded = expandedTerm === def.term
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setExpandedTerm(isExpanded ? null : def.term)}
                                    className={`group/row px-5 py-3.5 border-b border-stone-100/50 transition-all cursor-pointer last:border-0 ${isExpanded ? 'bg-sky-50/40 relative z-10' : 'hover:bg-white/80'}`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-sm font-bold transition-colors ${isExpanded ? 'text-sky-700' : 'text-stone-700'}`}>{def.term}</span>
                                        <div className="flex gap-1">
                                            {def.tags.map(tag => (
                                                <span key={tag} className="text-[9px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 uppercase tracking-wide">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <p className={`text-xs text-stone-600 leading-relaxed font-medium transition-all ${isExpanded ? '' : 'line-clamp-1 opacity-70'}`}>
                                        {def.definition}
                                    </p>

                                    {/* Expanded Action Area */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-3 border-t border-sky-100/50 flex justify-end animate-in fade-in slide-in-from-top-1 duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onExplain?.(def.term)
                                                }}
                                                className="px-4 py-2 bg-gradient-to-b from-sky-50 to-sky-100 text-sky-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border border-sky-200 shadow-sm hover:shadow-md active:translate-y-[1px] hover:bg-sky-50 flex items-center gap-2 group/btn"
                                            >
                                                Explain Concept
                                                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <div className="py-8 text-center text-stone-400 text-xs font-medium">
                            No definitions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
