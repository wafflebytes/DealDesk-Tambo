/**
 * @file scoping-specialist.ts
 * @description Scoping Specialist Sub-Agent (Elicitation Handler)
 * 
 * Specialized agent for handling ambiguous requests by asking clarifying questions.
 * Outputs data for the ScopingCard GenUI component.
 */

import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";
import { ScopingSchema } from "@/components/genui/schemas";

// ============================================================================
// SCHEMAS
// ============================================================================

export const ScopingSpecialistInputSchema = z.object({
    ambiguousRequest: z.string().describe("The user's ambiguous or vague request"),
    possibleInterpretations: z.array(z.string()).optional().describe(
        "Possible ways to interpret the request"
    ),
    contextHints: z.string().optional().describe(
        "Any context that might help narrow down the request"
    ),
    elicitationType: z.enum(["choice", "form", "confirm"]).optional().describe(
        "Type of elicitation UI to generate"
    )
});

export type ScopingSpecialistInput = z.infer<typeof ScopingSpecialistInputSchema>;

// Output uses the existing ScopingSchema
export type ScopingSpecialistOutput = z.infer<typeof ScopingSchema>;

// ============================================================================
// SCOPING TEMPLATES
// ============================================================================

/**
 * Common scoping scenarios and their templates
 */
const SCOPING_TEMPLATES: Record<string, {
    title: string;
    description: string;
    variant: "v1" | "v2" | "v3";
    submitLabel?: string;
    options?: Array<{ label: string; value: string; bias?: "Pro-Vendor" | "Neutral" | "Pro-Client" | "Critical"; destructive?: boolean }>;
    formFields?: Array<{ id: string; label: string; type: "text" | "number" | "boolean" | "date" | "select"; required: boolean; placeholder?: string }>;
}> = {
    "no_contract": {
        title: "Contract Required",
        description: "I need a contract to analyze. Would you like to:",
        variant: "v1",
        options: [
            { label: "Paste contract text", value: "paste_text" },
            { label: "Upload a document", value: "upload_doc" },
            { label: "Use sample contract", value: "use_sample" }
        ]
    },
    "analysis_type": {
        title: "Analysis Type",
        description: "What kind of analysis would you like me to perform?",
        variant: "v1",
        options: [
            { label: "Full Risk Analysis", value: "risk_analysis", bias: "Neutral" },
            { label: "Obligation Extraction", value: "obligations", bias: "Neutral" },
            { label: "Term Negotiation", value: "negotiation", bias: "Pro-Client" },
            { label: "Definition Lookup", value: "definitions", bias: "Neutral" }
        ]
    },
    "negotiation_stance": {
        title: "Negotiation Position",
        description: "What position should I optimize for?",
        variant: "v1",
        options: [
            { label: "Protect our interests", value: "pro_client", bias: "Pro-Client" },
            { label: "Balanced approach", value: "neutral", bias: "Neutral" },
            { label: "Accommodate vendor", value: "pro_vendor", bias: "Pro-Vendor" }
        ]
    },
    "clause_selection": {
        title: "Clause Selection",
        description: "Which clause would you like to focus on?",
        variant: "v2",
        submitLabel: "Analyze Clause",
        formFields: [
            { id: "section", label: "Section number", type: "text", required: false, placeholder: "e.g., 4.1" },
            { id: "clause_type", label: "Clause type", type: "text", required: true, placeholder: "e.g., Liability" }
        ]
    },
    "confirmation": {
        title: "Confirm Action",
        description: "This implementation step involves critical changes. Are you sure?",
        variant: "v3",
        options: [
            { label: "Yes, Proceed", value: "confirm", destructive: true, bias: "Critical" },
            { label: "Cancel", value: "cancel" }
        ]
    }
};

/**
 * Detect which scoping template to use based on the request
 */
function detectScopingScenario(request: string, contextHints?: string): string {
    const lowerRequest = request.toLowerCase();
    const lowerContext = contextHints?.toLowerCase() || "";

    // Check for no contract loaded
    if (lowerContext.includes("no contract") || lowerContext.includes("not loaded")) {
        return "no_contract";
    }

    // Check for vague "help" requests
    if (lowerRequest.includes("help") || lowerRequest.includes("what can you")) {
        return "analysis_type";
    }

    // Check for negotiation without stance
    if (lowerRequest.includes("negotiate") && !lowerRequest.includes("pro-") && !lowerRequest.includes("protect")) {
        return "negotiation_stance";
    }

    // Check for clause tuning without specific clause
    if ((lowerRequest.includes("tune") || lowerRequest.includes("adjust")) &&
        !lowerRequest.includes("section") && !lowerRequest.includes("clause")) {
        return "clause_selection";
    }

    // Check for destructive/confirmation actions
    if (lowerRequest.includes("delete") || lowerRequest.includes("clear") || lowerRequest.includes("reset")) {
        return "confirmation";
    }

    // Default to analysis type selection
    return "analysis_type";
}

/**
 * Generate scoping card data for ambiguous request
 */
async function scopeRequest(input: ScopingSpecialistInput): Promise<ScopingSpecialistOutput> {
    const { ambiguousRequest, possibleInterpretations, contextHints, elicitationType } = input;

    // 🎯 SCOPING SPECIALIST LOG
    console.log('%c   🎯 [Scoping Specialist] Handling ambiguous request...', 'color: #a855f7');
    console.log('%c      Request:', 'color: #a855f7', ambiguousRequest.substring(0, 50) + '...');

    // Detect the scoping scenario
    const scenario = detectScopingScenario(ambiguousRequest, contextHints);
    const template = SCOPING_TEMPLATES[scenario] || SCOPING_TEMPLATES["analysis_type"];

    console.log('%c      Detected Scenario:', 'color: #a855f7', scenario);

    // If caller provided specific interpretations, use those instead
    if (possibleInterpretations && possibleInterpretations.length > 0) {
        return {
            variant: elicitationType === "form" ? "v2" : elicitationType === "confirm" ? "v3" : "v1",
            title: "Clarification Needed",
            description: `I want to make sure I understand correctly. Did you mean:`,
            options: possibleInterpretations.map((interp, i) => ({
                label: interp,
                value: `interpretation_${i}`
            }))
        };
    }

    // Use the template
    return {
        variant: template.variant,
        title: template.title,
        description: template.description,
        submitLabel: template.submitLabel,
        options: template.options,
        formFields: template.formFields
    };
}

// ============================================================================
// TOOL EXPORT
// ============================================================================

export const scopingSpecialistTool: TamboTool = {
    name: "scopeRequest",
    description: `🎯 SCOPING SPECIALIST SUB-AGENT (Elicitation Handler)

Handles ambiguous requests by generating clarifying questions.

## When To Call
- User request is vague ("help me with this")
- No contract is loaded but analysis requested
- Multiple valid interpretations exist
- Need user confirmation before proceeding

## What It Does
1. Analyzes the ambiguous request
2. Identifies possible interpretations
3. Generates appropriate elicitation UI
4. Returns structured options for user to choose

## Elicitation Types (Variants)
• v1 (Choice): Button options to pick from
• v2 (Form): Input fields to fill in
• v3 (Confirmation): Yes/No confirmation

## Common Scenarios
• no_contract: Prompt to provide contract
• analysis_type: Choose between analysis modes
• negotiation_stance: Select Pro-Client/Neutral/Pro-Vendor
• clause_selection: Specify which clause to work on
• confirmation: Confirm before making changes

## Output
Returns data structured for ScopingCard component.
This IS the conversation - render the card to continue the dialogue.

## CRITICAL INSTRUCTION
Do NOT list the options or fields in your text response. The UI card already displays them.
Your text response should be EMPTY or a max 3-word headline like "Clarification Needed".
NEVER repeat the content of the card in the chat.`,
    tool: scopeRequest,
    inputSchema: ScopingSpecialistInputSchema,
    outputSchema: ScopingSchema
};

export default scopingSpecialistTool;
