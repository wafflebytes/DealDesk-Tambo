import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

/**
 * Orchestration Decision Schema
 * 
 * The orchestrator classifies each user query into:
 * - TEXT: Provide a brief text explanation (≤30 words, no markdown)
 * - GENUI: Render a specific interactive component with no text
 */
const OrchestrationOutputSchema = z.object({
    intent: z.enum(["text", "genui"]).describe(
        "The response type. 'text' for explanations/questions, 'genui' for interactive components"
    ),
    component: z.enum([
        "RiskRadar",
        "ClauseTuner",
        "ExtractionChecklist",
        "DefinitionBank",
        "ScopingCard"
    ]).optional().describe(
        "Which GenUI component to render (only when intent='genui')"
    ),
    agent: z.enum([
        "analyzeContractRisks",
        "negotiateClause",
        "extractObligations",
        "curateDefinitions",
        "scopeRequest"
    ]).optional().describe("Which sub-agent to invoke"),
    reasoning: z.string().describe(
        "Brief explanation of why this intent was chosen (shown in thought process UI)"
    ),
    confidence: z.number().min(0).max(1).describe(
        "Confidence score for the classification (0-1)"
    )
});

const OrchestrationInputSchema = z.object({
    userMessage: z.string().describe("The user's message to classify")
});

/**
 * Coordinator Tool
 * 
 * This tool is the BRAIN of the system. It is called FIRST for every message.
 */
async function coordinate(input: z.infer<typeof OrchestrationInputSchema>) {
    const message = input.userMessage.toLowerCase();

    // Heuristics for routing
    if (message.includes("risk") || message.includes("health") || message.includes("profile")) {
        return {
            intent: "genui" as const,
            component: "RiskRadar" as const,
            agent: "analyzeContractRisks" as const,
            reasoning: "User is asking for a risk assessment. Routing to Risk Analyst.",
            confidence: 0.95
        };
    }

    if (message.includes("tune") || message.includes("adjust") || message.includes("negotiate") || message.includes("cap")) {
        return {
            intent: "genui" as const,
            component: "ClauseTuner" as const,
            agent: "negotiateClause" as const,
            reasoning: "User wants to negotiate clause terms. Routing to Clause Negotiator.",
            confidence: 0.95
        };
    }

    if (message.includes("obligation") || message.includes("task") || message.includes("checklist")) {
        return {
            intent: "genui" as const,
            component: "ExtractionChecklist" as const,
            agent: "extractObligations" as const,
            reasoning: "User is asking for obligations or action items. Routing to Obligation Extractor.",
            confidence: 0.95
        };
    }

    if (message.includes("define") || message.includes("definition") || message.includes("what does") || message.includes("glossary")) {
        return {
            intent: "genui" as const,
            component: "DefinitionBank" as const,
            agent: "curateDefinitions" as const,
            reasoning: "User is asking for terminology definitions. Routing to Definition Curator.",
            confidence: 0.95
        };
    }

    // Default to scoping if ambiguous
    if (message.length < 10) {
        return {
            intent: "genui" as const,
            component: "ScopingCard" as const,
            agent: "scopeRequest" as const,
            reasoning: "Request is too short/ambiguous. Routing to Scoping Specialist for clarification.",
            confidence: 0.7
        };
    }

    return {
        intent: "text" as const,
        reasoning: "User is seeking general information or explanation. Providing direct text response.",
        confidence: 0.8
    };
}

export const coordinatorTool: TamboTool = {
    name: "coordinate",
    description: `🎯 PRIMARY COORDINATION PROTOCOL
    
MANDATORY: You MUST call this tool FIRST before responding to ANY user message.

This tool defines the entire behavioral logic for Maven:

1. ORCHESTRATION:
   Decide if the response should be TEXT (brief answer) or GENUI (interactive component).

2. ROUTING (when intent="genui"):
   • "analyze risk" / "profile" → RiskRadar (RiskAnalyst)
   • "tune clause" / "negotiate" → ClauseTuner (ClauseNegotiator)
   • "obligations" / "tasks" → ExtractionChecklist (ObligationExtractor)
   • "definitions" / "glossary" → DefinitionBank (DefinitionCurator)
   • Ambiguous / Elicitation → ScopingCard (ScopingSpecialist)

3. ZERO-TEXT POLICY:
   If intent="genui", you output the tool result and NO text. The component IS the response.

4. CONCISENESS POLICY:
   If intent="text", maximum 30 words. Plain text only. No markdown formatting.`,
    tool: coordinate,
    inputSchema: OrchestrationInputSchema,
    outputSchema: OrchestrationOutputSchema
};

export type OrchestrationResult = z.infer<typeof OrchestrationOutputSchema>;
