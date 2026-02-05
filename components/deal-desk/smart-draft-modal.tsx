"use client"

import { useState } from "react"
import { PenTool, Globe, Briefcase, FileText, X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface SmartDraftModalProps {
    onClose: () => void
    onDraft: (data: any) => void
}

export function SmartDraftModal({ onClose, onDraft }: SmartDraftModalProps) {
    const [prompt, setPrompt] = useState("")
    const [contractType, setContractType] = useState("MSA")
    const [jurisdiction, setJurisdiction] = useState("US-DE")

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl bg-[#FDFCF8] rounded-2xl shadow-2xl card-skeu animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 overflow-hidden border border-white/50">

                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-200/60 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-[#f4fafa] ring-1 ring-black/5 shadow-sm flex items-center justify-center">
                            <PenTool className="w-5 h-5 text-[#20808D]" />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-bold text-stone-900 tracking-[-0.01em]">Draft New Contract</h2>
                            <p className="text-xs text-stone-500 font-medium">Configure parameters for AI generation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg btn-skeu flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 bg-stone-50/30">

                    {/* Configuration Grid */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Contract Type</Label>
                            <div className="relative group">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-[#20808D] transition-colors" />
                                <select
                                    className="w-full h-11 pl-10 pr-4 input-skeu bg-white text-sm font-medium text-stone-700 appearance-none cursor-pointer"
                                    value={contractType}
                                    onChange={(e) => setContractType(e.target.value)}
                                >
                                    <option value="MSA">Master Services Agreement</option>
                                    <option value="NDA">Non-Disclosure Agreement</option>
                                    <option value="SOW">Statement of Work</option>
                                    <option value="Emp">Employment Agreement</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-[5px] border-t-stone-400 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Jurisdiction</Label>
                            <div className="relative group">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-[#20808D] transition-colors" />
                                <select
                                    className="w-full h-11 pl-10 pr-4 input-skeu bg-white text-sm font-medium text-stone-700 appearance-none cursor-pointer"
                                    value={jurisdiction}
                                    onChange={(e) => setJurisdiction(e.target.value)}
                                >
                                    <option value="US-DE">Delaware (USA)</option>
                                    <option value="US-CA">California (USA)</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="EU">European Union</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-[5px] border-t-stone-400 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Parties</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Client / Company Name"
                                className="w-full h-11 px-4 input-skeu bg-white text-sm placeholder:text-stone-400"
                            />
                            <input
                                type="text"
                                placeholder="Counterparty Name"
                                className="w-full h-11 px-4 input-skeu bg-white text-sm placeholder:text-stone-400"
                            />
                        </div>
                    </div>

                    {/* Prompt Area */}
                    <div className="space-y-2 pt-2">
                        <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Drafting Instructions</Label>
                        <div className="relative">
                            <textarea
                                className="w-full h-32 p-4 input-skeu bg-white text-sm leading-relaxed placeholder:text-stone-400 resize-none"
                                placeholder="Describe the specific terms, payment structure ($50k/mo), termination clauses, and any special addendums..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-stone-400 font-mono pointer-events-none">
                                {prompt.length} chars
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-stone-200/50 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-wide"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onDraft({ prompt, contractType, jurisdiction })}
                        className="px-6 py-2.5 bg-[#20808D] hover:bg-[#165a63] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#20808D]/20 active:scale-[0.98] transition-all flex items-center gap-2 group"
                    >
                        <span>Generate Contract</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
