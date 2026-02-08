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
        "KnowledgeBank"
    ]).optional().describe(
        "Which GenUI component to render (only when intent='genui')"
    ),
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
 * Orchestrator Tool
 * 
 * This tool is called FIRST on every user message to decide how to respond.
 * The LLM uses the prompt to make the classification decision.
 * 
 * The tool itself doesn't contain classification logic - it's a structured
 * output format that the LLM fills in based on the system prompt.
 */
async function orchestrate(input: z.infer<typeof OrchestrationInputSchema>) {
    // The actual classification is done by the LLM via prompting
    // This function just provides the structure
    // The LLM will return the filled-in values when calling this tool

    const message = input.userMessage.toLowerCase();

    // Heuristic classification (LLM will override with better judgment)
    const genUIPatterns = [
        { pattern: /risk|analyze|health|profile|deal/, component: "RiskRadar" as const },
        { pattern: /edit|rewrite|revise|redline|tune|adjust|cap|negotiate|increase|decrease|liability/, component: "ClauseTuner" as const },
        { pattern: /obligation|task|checklist|duties|requirement|action/, component: "ExtractionChecklist" as const },
        { pattern: /defin|glossary|term|what does .+ mean/, component: "KnowledgeBank" as const }
    ];

    for (const { pattern, component } of genUIPatterns) {
        if (pattern.test(message)) {
            return {
                intent: "genui" as const,
                component,
                reasoning: `User is requesting interactive analysis. Rendering ${component}.`,
                confidence: 0.85
            };
        }
    }

    return {
        intent: "text" as const,
        component: undefined,
        reasoning: "User is asking a question or seeking an explanation. Providing text response.",
        confidence: 0.80
    };
}

export const orchestratorTool: TamboTool = {
    name: "orchestrate",
    description: `MANDATORY FIRST STEP: Call this tool FIRST before responding to ANY user message.

This tool classifies user intent and decides the response format:

→ GENUI (interactive component):
  • "analyze risk" / "deal health" / "risk profile" → RiskRadar
  • "edit clause" / "rewrite" / "adjust cap" / "negotiate" → ClauseTuner
  • "obligations" / "tasks" / "checklist" / "action items" → ExtractionChecklist
  • "definitions" / "what does X mean" / "glossary" → KnowledgeBank

→ TEXT (brief explanation):
  • "What is..." / "Explain..." / "Why..." / concept questions
  • Keep text responses ≤30 words. No markdown. Plain text only.

CRITICAL RULES:
1. ALWAYS call this tool first
2. When intent=genui: Render ONLY the component. ZERO text.
3. When intent=text: Maximum 30 words. No markdown formatting.
4. The component IS the response. It speaks for itself.`,
    tool: orchestrate,
    inputSchema: OrchestrationInputSchema,
    outputSchema: OrchestrationOutputSchema
};

export type OrchestrationResult = z.infer<typeof OrchestrationOutputSchema>;
