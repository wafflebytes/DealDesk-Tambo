"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"

// GenUI Components - Dynamic Import for SSR Disabling
const RiskRadar = dynamic(() => import("@/components/deal-desk/risk-radar").then(mod => mod.RiskRadar), { ssr: false })
const ClauseTuner = dynamic(() => import("@/components/deal-desk/clause-tuner").then(mod => mod.ClauseTuner), { ssr: false })
const ScopingCard = dynamic(() => import("@/components/deal-desk/scoping-card").then(mod => mod.ScopingCard), { ssr: false })
const ExtractionChecklist = dynamic(() => import("@/components/deal-desk/extraction-checklist").then(mod => mod.ExtractionChecklist), { ssr: false })
const DefinitionBank = dynamic(() => import("@/components/deal-desk/definition-bank").then(mod => mod.DefinitionBank), { ssr: false })
const DefinitionExplainer = dynamic(() => import("@/components/deal-desk/definition-explainer").then(mod => mod.DefinitionExplainer), { ssr: false })
const DraggableGenUI = dynamic(() => import("@/components/deal-desk/draggable-gen-ui").then(mod => mod.DraggableGenUI), { ssr: false })
import { BrainCircuit, Layers, ShieldAlert, Sliders, CheckSquare, BookOpen, Search } from "lucide-react"

export default function ComponentGallery() {
    return (
        <div className="min-h-screen bg-[#f4fafa] p-4 sm:p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#20808D] flex items-center justify-center shadow-lg shadow-[#20808D]/20">
                            <Layers className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">GenUI Gallery</h1>
                    </div>
                    <p className="text-stone-500 max-w-2xl font-medium">
                        Explore and interact with the intelligence components that power the Deal Desk experience.
                        These components are designed to be context-aware and draggable.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Risk Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1 text-amber-600">
                            <ShieldAlert className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-xs">Risk Assessment</h2>
                        </div>
                        <div className="card-skeu p-6 rounded-3xl bg-white border border-stone-200">
                            <RiskRadar />
                        </div>
                    </section>

                    {/* Liability Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1 text-blue-600">
                            <Sliders className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-xs">Clause Editing</h2>
                        </div>
                        <div className="card-skeu p-6 rounded-3xl bg-white border border-stone-200">
                            <ClauseTuner />
                        </div>
                    </section>

                    {/* Elicitation Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1 text-[#20808D]">
                            <BrainCircuit className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-xs">Elicitation (Scoping)</h2>
                        </div>
                        <div className="card-skeu p-6 rounded-3xl bg-white border border-stone-200">
                            <ScopingCard />
                        </div>
                    </section>

                    {/* Tasks Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1 text-emerald-600">
                            <CheckSquare className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-xs">Obligation Tracking</h2>
                        </div>
                        <div className="card-skeu p-6 rounded-3xl bg-white border border-stone-200">
                            <ExtractionChecklist />
                        </div>
                    </section>

                    {/* Definitions Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1 text-purple-600">
                            <BookOpen className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-xs">Knowledge Bank</h2>
                        </div>
                        <div className="card-skeu p-6 rounded-3xl bg-white border border-stone-200">
                            <DefinitionBank />
                        </div>
                    </section>

                    {/* Explainer Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1 text-stone-600">
                            <Search className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-wider text-xs">Term Explainer</h2>
                        </div>
                        <div className="card-skeu p-6 rounded-3xl bg-white border border-stone-200">
                            <DefinitionExplainer term="Indemnification" />
                        </div>
                    </section>
                </div>

                <footer className="mt-20 pt-8 border-t border-stone-200 text-center">
                    <p className="text-stone-400 text-sm italic">
                        All components utilize the skeuomorphic design system defined in globals.css
                    </p>
                </footer>
            </div>
        </div>
    )
}
