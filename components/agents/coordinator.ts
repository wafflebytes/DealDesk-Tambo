import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";

// Import sub-agent tools for direct invocation
import { riskAnalystTool, RiskAnalystInputSchema } from "./risk-analyst";
import { clauseNegotiatorTool, ClauseNegotiatorInputSchema } from "./clause-negotiator";
import { obligationExtractorTool, ObligationExtractorInputSchema } from "./obligation-extractor";
import { definitionCuratorTool, DefinitionCuratorInputSchema } from "./definition-curator";
import { scopingSpecialistTool, ScopingSpecialistInputSchema } from "./scoping-specialist";
import { getContractText } from "@/lib/contract-parser";

/**
 * Orchestration Decision Schema
 * 
 * The orchestrator classifies each user query and returns:
 * - The routing decision (which agent was chosen)
 * - The sub-agent's actual output (for GenUI rendering)
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
    ]).optional().describe("Which sub-agent was invoked"),
    reasoning: z.string().describe(
        "Brief explanation of why this intent was chosen (shown in thought process UI)"
    ),
    confidence: z.number().min(0).max(1).describe(
        "Confidence score for the classification (0-1)"
    ),
    subAgentResult: z.any().optional().describe(
        "The actual output from the invoked sub-agent (for component rendering)"
    )
});

const OrchestrationInputSchema = z.object({
    userMessage: z.string().describe("The user's message to classify")
});

/**
 * Available sub-agents mapped by their routing key
 */
const SUB_AGENTS = {
    analyzeContractRisks: {
        tool: riskAnalystTool,
        component: "RiskRadar" as const,
        prepareInput: (contractText: string) => ({ contractText })
    },
    negotiateClause: {
        tool: clauseNegotiatorTool,
        component: "ClauseTuner" as const,
        prepareInput: (contractText: string, userMessage: string) => ({
            contractText,
            instruction: userMessage,
            clauseType: "Liability"
        })
    },
    extractObligations: {
        tool: obligationExtractorTool,
        component: "ExtractionChecklist" as const,
        prepareInput: (contractText: string) => ({ contractText, priority: "all" })
    },
    curateDefinitions: {
        tool: definitionCuratorTool,
        component: "DefinitionBank" as const,
        prepareInput: (contractText: string, userMessage: string) => {
            // Extract specific term if mentioned
            const match = userMessage.match(/what (?:does|is) ["']?([^"']+)["']? mean/i);
            return {
                contractText,
                specificTerm: match ? match[1] : undefined,
                extractAll: !match
            };
        }
    },
    scopeRequest: {
        tool: scopingSpecialistTool,
        component: "ScopingCard" as const,
        prepareInput: (_: string, userMessage: string) => ({
            userMessage,
            context: "ambiguous"
        })
    }
};

/**
 * Classify user intent and determine routing
 */
function classifyIntent(message: string): {
    routeToAgent: keyof typeof SUB_AGENTS | null;
    isTextResponse: boolean;
    reasoning: string;
    confidence: number;
} {
    const lowerMessage = message.toLowerCase();

    // Risk analysis patterns
    if (lowerMessage.includes("risk") || lowerMessage.includes("health") || lowerMessage.includes("profile") || lowerMessage.includes("analyze")) {
        return {
            routeToAgent: "analyzeContractRisks",
            isTextResponse: false,
            reasoning: "User is asking for a risk assessment. Routing to Risk Analyst.",
            confidence: 0.95
        };
    }

    // Clause negotiation patterns
    if (lowerMessage.includes("tune") || lowerMessage.includes("adjust") || lowerMessage.includes("negotiate") || lowerMessage.includes("cap") || lowerMessage.includes("modify")) {
        return {
            routeToAgent: "negotiateClause",
            isTextResponse: false,
            reasoning: "User wants to negotiate clause terms. Routing to Clause Negotiator.",
            confidence: 0.95
        };
    }

    // Obligation extraction patterns
    if (lowerMessage.includes("obligation") || lowerMessage.includes("task") || lowerMessage.includes("checklist") || lowerMessage.includes("duties") || lowerMessage.includes("requirements")) {
        return {
            routeToAgent: "extractObligations",
            isTextResponse: false,
            reasoning: "User is asking for obligations or action items. Routing to Obligation Extractor.",
            confidence: 0.95
        };
    }

    // Definition patterns
    if (lowerMessage.includes("define") || lowerMessage.includes("definition") || lowerMessage.includes("what does") || lowerMessage.includes("glossary") || lowerMessage.includes("mean")) {
        return {
            routeToAgent: "curateDefinitions",
            isTextResponse: false,
            reasoning: "User is asking for terminology definitions. Routing to Definition Curator.",
            confidence: 0.95
        };
    }

    // Ambiguous - route to scoping specialist
    if (message.length < 15) {
        return {
            routeToAgent: "scopeRequest",
            isTextResponse: false,
            reasoning: "Request is too short/ambiguous. Routing to Scoping Specialist for clarification.",
            confidence: 0.7
        };
    }

    // Default to text response
    return {
        routeToAgent: null,
        isTextResponse: true,
        reasoning: "User is seeking general information or explanation. Providing direct text response.",
        confidence: 0.8
    };
}

/**
 * Coordinator Tool
 * 
 * This tool is the BRAIN of the system. It:
 * 1. Classifies the user's intent
 * 2. Routes to the appropriate sub-agent
 * 3. Invokes the sub-agent and returns its result
 * 4. Provides orchestration metadata for the thought process UI
 */
async function coordinate(input: z.infer<typeof OrchestrationInputSchema>) {
    const { userMessage } = input;

    // 🎯 COORDINATOR ENTRY LOG
    console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: #20808D; font-weight: bold');
    console.log('%c🎯 COORDINATOR TOOL FIRED', 'color: #20808D; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #20808D; font-weight: bold');
    console.log('%c📨 User Message:', 'color: #666; font-weight: bold', userMessage);
    console.log('%c⏰ Timestamp:', 'color: #666', new Date().toISOString());

    // Step 1: Classify intent
    const classification = classifyIntent(userMessage);

    console.log('\n%c📊 CLASSIFICATION RESULT:', 'color: #f59e0b; font-weight: bold');
    console.table({
        'Route To Agent': classification.routeToAgent || '(text response)',
        'Is Text Response': classification.isTextResponse,
        'Confidence': `${(classification.confidence * 100).toFixed(0)}%`,
        'Reasoning': classification.reasoning
    });

    // Step 2: If text response, return early
    if (classification.isTextResponse || !classification.routeToAgent) {
        console.log('%c💬 Returning TEXT response (no sub-agent invoked)', 'color: #6b7280; font-style: italic');
        console.log('%c═══════════════════════════════════════════════════════════════\n', 'color: #20808D');
        return {
            intent: "text" as const,
            reasoning: classification.reasoning,
            confidence: classification.confidence
        };
    }

    // Step 3: Get the sub-agent configuration
    const subAgentConfig = SUB_AGENTS[classification.routeToAgent];
    if (!subAgentConfig) {
        console.log('%c❌ Sub-agent not found!', 'color: #ef4444; font-weight: bold');
        console.log('%c═══════════════════════════════════════════════════════════════\n', 'color: #20808D');
        return {
            intent: "text" as const,
            reasoning: `Sub-agent '${classification.routeToAgent}' not found. Falling back to text.`,
            confidence: 0.5
        };
    }

    // Step 4: Get contract text for sub-agent
    const contractText = getContractText();

    // 🚀 SUB-AGENT INVOCATION LOG
    console.log('\n%c🚀 INVOKING SUB-AGENT:', 'color: #8b5cf6; font-size: 14px; font-weight: bold');
    console.log('%c   Agent:', 'color: #8b5cf6', classification.routeToAgent);
    console.log('%c   Component:', 'color: #8b5cf6', subAgentConfig.component);
    console.log('%c   Tool Name:', 'color: #8b5cf6', subAgentConfig.tool.name);

    const startTime = performance.now();

    // Step 5: Invoke the sub-agent
    try {
        const subAgentInput = subAgentConfig.prepareInput(contractText, userMessage);
        console.log('%c   Input:', 'color: #8b5cf6', subAgentInput);

        const subAgentResult = await (subAgentConfig.tool.tool as Function)(subAgentInput);

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(0);

        // ✅ SUB-AGENT SUCCESS LOG
        console.log('\n%c✅ SUB-AGENT COMPLETED:', 'color: #10b981; font-size: 14px; font-weight: bold');
        console.log('%c   Duration:', 'color: #10b981', `${duration}ms`);
        console.log('%c   Result:', 'color: #10b981', subAgentResult);
        console.log('%c═══════════════════════════════════════════════════════════════\n', 'color: #20808D');

        // Step 6: Return the orchestration result with sub-agent output
        return {
            intent: "genui" as const,
            component: subAgentConfig.component,
            agent: classification.routeToAgent,
            reasoning: classification.reasoning,
            confidence: classification.confidence,
            subAgentResult: subAgentResult
        };
    } catch (error) {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(0);

        // ❌ SUB-AGENT ERROR LOG
        console.log('\n%c❌ SUB-AGENT FAILED:', 'color: #ef4444; font-size: 14px; font-weight: bold');
        console.log('%c   Duration:', 'color: #ef4444', `${duration}ms`);
        console.error('%c   Error:', 'color: #ef4444', error);
        console.log('%c═══════════════════════════════════════════════════════════════\n', 'color: #20808D');

        return {
            intent: "text" as const,
            reasoning: `Sub-agent '${classification.routeToAgent}' encountered an error.`,
            confidence: 0.3
        };
    }
}

export const coordinatorTool: TamboTool = {
    name: "coordinate",
    description: `🎯 PRIMARY COORDINATION PROTOCOL - MULTI-AGENT ORCHESTRATOR

MANDATORY: You MUST call this tool FIRST before responding to ANY user message.

This tool is the BRAIN of the multi-agent system:

1️⃣ CLASSIFICATION:
   Analyzes the user message to determine intent (text vs genui)

2️⃣ ROUTING:
   • "analyze risk" / "profile" → Risk Analyst → RiskRadar
   • "tune clause" / "negotiate" → Clause Negotiator → ClauseTuner
   • "obligations" / "tasks" → Obligation Extractor → ExtractionChecklist
   • "definitions" / "glossary" → Definition Curator → DefinitionBank
   • Ambiguous / Elicitation → Scoping Specialist → ScopingCard

3️⃣ INVOCATION:
   The coordinator ACTUALLY CALLS the sub-agent and returns its result.
   You will receive the sub-agent's output in 'subAgentResult'.

4️⃣ ZERO-TEXT POLICY:
   If intent="genui", render the component with subAgentResult data.
   Output NO additional text - the component IS the response.

5️⃣ THOUGHT PROCESS:
   The 'reasoning' field explains the routing decision for the UI.
   The 'agent' field shows which sub-agent was invoked.`,
    tool: coordinate,
    inputSchema: OrchestrationInputSchema,
    outputSchema: OrchestrationOutputSchema
};

export type OrchestrationResult = z.infer<typeof OrchestrationOutputSchema>;
