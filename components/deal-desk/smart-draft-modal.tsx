"use client"

import { useState } from "react"
import { PenTool, Globe, FileText, X, Clock, DollarSign, CreditCard, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

// Boilerplate contract for empty form submissions
const BOILERPLATE_CONTRACT = `# MASTER SERVICES AGREEMENT

This Master Services Agreement (**"Agreement"**) is entered into as of the **Effective Date** by and between:

**PARTY A:** Acme Corporation, a Delaware corporation
**PARTY B:** TechVentures LLC, a California limited liability company

---

## 1. DEFINITIONS

1.1 **"Services"** means the consulting and advisory services described in each Statement of Work.
1.2 **"Deliverables"** means all work product created under this Agreement.
1.3 **"Confidential Information"** includes all non-public information.

## 2. TERM AND TERMINATION

2.1 This Agreement shall commence on the **Effective Date** and continue for a period of **twelve (12)** months.
2.2 Either party may terminate with **thirty (30)** days written notice.

## 3. COMPENSATION

3.1 Client shall pay Service Provider at the rates specified in each Statement of Work.
3.2 Payment terms: **Net 30** from invoice date.

## 4. LIABILITY

4.1 **LIMITATION OF LIABILITY:** Liability cap shall not exceed **$50,000** regardless of the form of action, whether in contract, tort, negligence, strict liability or otherwise.
4.2 Neither party shall be liable for indirect, incidental, special, consequential, or punitive damages.

## 5. INTELLECTUAL PROPERTY

5.1 Pre-existing IP remains with the original owner.
5.2 Work product IP transfers upon full payment.

## 6. CONFIDENTIALITY

6.1 Each party agrees to maintain confidentiality of the other party's Confidential Information for a period of **five (5)** years.

## 7. GOVERNING LAW

7.1 This Agreement shall be governed by the laws of the **State of Delaware**, without regard to conflict of law principles.

---

[Signature blocks to follow]`

interface SmartDraftModalProps {
    onClose: () => void
    onDraft: (data: DraftData) => void
    isGenerating?: boolean
}

export interface DraftData {
    prompt: string
    contractType: string
    jurisdiction: string
    partyA: string
    partyB: string
    termLength: string
    liabilityCap: string
    paymentTerms: string
    isEmpty: boolean
    boilerplate: string
}

export function SmartDraftModal({ onClose, onDraft, isGenerating = false }: SmartDraftModalProps) {
    const [prompt, setPrompt] = useState("")
    const [contractType, setContractType] = useState("")
    const [jurisdiction, setJurisdiction] = useState("")
    const [partyA, setPartyA] = useState("")
    const [partyB, setPartyB] = useState("")
    const [termLength, setTermLength] = useState("")
    const [liabilityCap, setLiabilityCap] = useState("")
    const [paymentTerms, setPaymentTerms] = useState("")

    // Check if form is essentially empty
    const isFormEmpty = !prompt && !partyA && !partyB && !termLength && !liabilityCap

    const handleGenerate = () => {
        onDraft({
            prompt,
            contractType: contractType || "MSA",
            jurisdiction: jurisdiction || "US-DE",
            partyA,
            partyB,
            termLength,
            liabilityCap,
            paymentTerms,
            isEmpty: isFormEmpty,
            boilerplate: BOILERPLATE_CONTRACT
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl bg-[#FDFCF8] rounded-2xl shadow-2xl card-skeu animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 overflow-hidden border border-white/50 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-200/60 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between shrink-0">
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

                {/* Body - Scrollable */}
                <div className="p-6 space-y-5 bg-stone-50/30 overflow-y-auto flex-1">

                    {/* Row 1: Contract Type + Jurisdiction */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Contract Type</Label>
                            <div className="relative group">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-[#20808D] transition-colors" />
                                <select
                                    className="w-full h-11 pl-10 pr-4 input-skeu bg-white text-sm font-medium text-stone-700 appearance-none cursor-pointer"
                                    value={contractType}
                                    onChange={(e) => setContractType(e.target.value)}
                                >
                                    <option value="">Select type...</option>
                                    <option value="MSA">Master Services Agreement</option>
                                    <option value="NDA">Non-Disclosure Agreement</option>
                                    <option value="SOW">Statement of Work</option>
                                    <option value="Employment">Employment Agreement</option>
                                    <option value="SLA">Software License Agreement</option>
                                    <option value="Consulting">Consulting Agreement</option>
                                    <option value="Partnership">Partnership Agreement</option>
                                    <option value="Lease">Lease Agreement</option>
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
                                    <option value="">Select jurisdiction...</option>
                                    <option value="US-DE">Delaware (USA)</option>
                                    <option value="US-CA">California (USA)</option>
                                    <option value="US-NY">New York (USA)</option>
                                    <option value="US-TX">Texas (USA)</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="EU">European Union</option>
                                    <option value="SG">Singapore</option>
                                    <option value="CA-ON">Canada (Ontario)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-[5px] border-t-stone-400 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Parties */}
                    <div className="space-y-2">
                        <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Parties</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Your Company Name"
                                value={partyA}
                                onChange={(e) => setPartyA(e.target.value)}
                                className="w-full h-11 px-4 input-skeu bg-white text-sm placeholder:text-stone-400"
                            />
                            <input
                                type="text"
                                placeholder="Counterparty Name"
                                value={partyB}
                                onChange={(e) => setPartyB(e.target.value)}
                                className="w-full h-11 px-4 input-skeu bg-white text-sm placeholder:text-stone-400"
                            />
                        </div>
                    </div>

                    {/* Row 3: Term, Liability Cap, Payment Terms */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Term Length</Label>
                            <div className="relative group">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-[#20808D] transition-colors" />
                                <select
                                    className="w-full h-11 pl-10 pr-4 input-skeu bg-white text-sm font-medium text-stone-700 appearance-none cursor-pointer"
                                    value={termLength}
                                    onChange={(e) => setTermLength(e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    <option value="6">6 months</option>
                                    <option value="12">12 months</option>
                                    <option value="24">24 months</option>
                                    <option value="36">36 months</option>
                                    <option value="perpetual">Perpetual</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-[5px] border-t-stone-400 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Liability Cap</Label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-[#20808D] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="e.g. 50,000"
                                    value={liabilityCap}
                                    onChange={(e) => setLiabilityCap(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 input-skeu bg-white text-sm placeholder:text-stone-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Payment Terms</Label>
                            <div className="relative group">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-[#20808D] transition-colors" />
                                <select
                                    className="w-full h-11 pl-10 pr-4 input-skeu bg-white text-sm font-medium text-stone-700 appearance-none cursor-pointer"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    <option value="Net 15">Net 15</option>
                                    <option value="Net 30">Net 30</option>
                                    <option value="Net 45">Net 45</option>
                                    <option value="Net 60">Net 60</option>
                                    <option value="Due on Receipt">Due on Receipt</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-[5px] border-t-stone-400 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Prompt Area */}
                    <div className="space-y-2 pt-1">
                        <Label className="text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">Drafting Instructions <span className="text-stone-400 font-normal">(optional)</span></Label>
                        <div className="relative">
                            <textarea
                                className="w-full h-28 p-4 input-skeu bg-white text-sm leading-relaxed placeholder:text-stone-400 resize-none"
                                placeholder="Any specific terms, clauses, or requirements you want to include..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-stone-400 font-mono pointer-events-none">
                                {prompt.length} chars
                            </div>
                        </div>
                    </div>

                    {/* Empty form hint */}
                    {isFormEmpty && (
                        <p className="text-xs text-stone-400 text-center italic">
                            Leave all fields empty to generate the standard boilerplate contract
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-stone-200/50 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="px-5 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-wide disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-[#20808D] hover:bg-[#165a63] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#20808D]/20 active:scale-[0.98] transition-all flex items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <span>{isFormEmpty ? "Use Boilerplate" : "Generate Contract"}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
