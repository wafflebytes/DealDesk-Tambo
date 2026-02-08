"use client"

import { TamboProvider } from "@tambo-ai/react"
import { z } from "zod"

// Schemas
import {
    DealRiskSchema,
    ClauseTunerSchema,
    ChecklistSchema,
    DefinitionBankSchema,
    ScopingSchema
} from "@/components/genui/schemas"

// Components
import { RiskRadar } from "@/components/deal-desk/risk-radar"
import { ClauseTuner } from "@/components/deal-desk/clause-tuner"
import { ExtractionChecklist } from "@/components/deal-desk/extraction-checklist"
import { DefinitionBank } from "@/components/deal-desk/definition-bank"
import { ScopingCard } from "@/components/deal-desk/scoping-card"

// Tools - Import ALL agent tools for proper orchestration
import { analyzeContractRisksTool } from "@/components/tools/contract-analysis"
import { coordinatorTool } from "@/components/agents/coordinator"
import { clauseNegotiatorTool } from "@/components/agents/clause-negotiator"
import { definitionCuratorTool } from "@/components/agents/definition-curator"
import { riskAnalystTool } from "@/components/agents/risk-analyst"
import { obligationExtractorTool } from "@/components/agents/obligation-extractor"
import { scopingSpecialistTool } from "@/components/agents/scoping-specialist"

// Define components that Tambo can render (GenUI)
// Each has explicit trigger keywords for better prompt matching
const tamboComponents = [
    {
        name: "RiskRadar",
        description: `TRIGGER: "analyze risk", "risk analysis", "what are the risks", "deal health", "risk profile", "risky clauses"
        PURPOSE: Visualizes contract risk scores across categories (Liability, IP, Term, Payment, Confidentiality) as a radar chart.
        OUTPUT: Render this component with risk scores (0-1) and follow-up suggestions. NO text explanation needed.`,
        component: RiskRadar,
        propsSchema: DealRiskSchema
    },
    {
        name: "ClauseTuner",
        description: `TRIGGER: "edit clause", "rewrite clause", "revise clause", "redline", "tune clause", "adjust liability", "change cap", "modify terms", "negotiate", "increase/decrease"
        PURPOSE: Interactive slider/toggle to adjust clause parameters (Liability Cap multiplier, mutual liability).
        OUTPUT: Render with clauseType, currentValue, multiplier. NO text explanation needed.`,
        component: ClauseTuner,
        propsSchema: ClauseTunerSchema
    },
    {
        name: "ExtractionChecklist",
        description: `TRIGGER: "obligations", "tasks", "checklist", "what do I need to do", "requirements", "action items", "duties"
        PURPOSE: Checklist of extracted obligations/tasks from the contract with priority levels.
        OUTPUT: Render with tasks array containing id, text, source, priority. NO text explanation needed.`,
        component: ExtractionChecklist,
        propsSchema: ChecklistSchema
    },
    {
        name: "KnowledgeBank",
        description: `TRIGGER: "definitions", "define", "what does X mean", "glossary", "terminology", "defined terms"
        PURPOSE: Searchable bank of defined terms extracted from the contract.
        OUTPUT: Render with definitions array containing term, definition, tags. NO text explanation needed.`,
        component: DefinitionBank,
        propsSchema: DefinitionBankSchema
    },
    {
        name: "ScopingCard",
        description: `TRIGGER: "clarify", "ambiguous request", "delete", "clear", "help me", "choose option"
        PURPOSE: Ask the user for clarification or confirmation using interactive UI (Choice, Form, or Confirm).
        OUTPUT: Render with variant, title, and options/formFields.`,
        component: ScopingCard,
        propsSchema: ScopingSchema
    }
]

// Define tools available to the agent
// CRITICAL: Coordinator MUST come first - it orchestrates the others
const tamboTools = [
    coordinatorTool,           // 🎯 Primary orchestrator - called FIRST
    analyzeContractRisksTool,  // 📊 External risk analysis tool
    riskAnalystTool,           // 📊 Risk Analyst sub-agent
    clauseNegotiatorTool,      // ⚖️ Clause Negotiator sub-agent
    definitionCuratorTool,     // 📖 Definition Curator sub-agent
    obligationExtractorTool,   // 📋 Obligation Extractor sub-agent
    scopingSpecialistTool      // 🎯 Scoping/Elicitation sub-agent
]

interface TamboWrapperProps {
    children: React.ReactNode
}

export function TamboWrapper({ children }: TamboWrapperProps) {
    const systemPrompt = `You are Maven, the legal AI for "The Deal Desk". You communicate through UI components, not text.

ABSOLUTE RULES:
1. When rendering a component: output ZERO text. Just render the component.
2. Never use markdown (**bold**, *italic*, ##headers). Plain text only.
3. Maximum response length: 30 words. Prefer 0 words when showing a component.
4. The component IS your response. It contains all the information.

PROMPT → COMPONENT MAPPING:
• "analyze risk" / "risks" / "deal health" → RiskRadar
• "edit" / "rewrite" / "revise" / "redline" / "tune" / "adjust" / "cap" / "negotiate" → ClauseTuner
• "obligations" / "tasks" / "checklist" / "duties" → ExtractionChecklist
• "definitions" / "glossary" / "what does X mean" → KnowledgeBank

You are ultra-concise. Components speak for themselves.`

    return (
        <TamboProvider
            apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY || "demo-key"}
            components={tamboComponents}
            tools={tamboTools}
            streaming={true}
        >
            {children}
        </TamboProvider>
    )
}
