/**
 * @file obligation-extractor.ts
 * @description Obligation Extractor Sub-Agent
 * 
 * Specialized agent for identifying duties, requirements, and action items.
 * Outputs data for the ExtractionChecklist GenUI component.
 */

import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";
import { ChecklistSchema } from "@/components/genui/schemas";
import { extractObligations } from "@/lib/contract-parser";

// ============================================================================
// SCHEMAS
// ============================================================================

export const ObligationExtractorInputSchema = z.object({
    contractText: z.string().describe("The contract text to scan for obligations"),
    priority: z.enum(["all", "high", "medium", "low"]).optional().default("all")
});

export type ObligationExtractorInput = z.infer<typeof ObligationExtractorInputSchema>;
export type ObligationExtractorOutput = z.infer<typeof ChecklistSchema>;

// ============================================================================
// EXTRACTION LOGIC
// ============================================================================

async function extractContractObligations(input: ObligationExtractorInput): Promise<ObligationExtractorOutput> {
    const { contractText, priority } = input;

    // 📋 OBLIGATION EXTRACTOR LOG
    console.log('%c   📋 [Obligation Extractor] Starting extraction...', 'color: #10b981');
    console.log('%c      Priority filter:', 'color: #10b981', priority);

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Use library to find real obligations
    const rawObligations = extractObligations(contractText);

    // Convert to checklist format with priority assignment metadata
    const tasks = rawObligations.map((ob, index) => {
        const text = ob.text.toLowerCase();
        let p: "high" | "medium" | "low" = "medium";

        if (text.includes("payment") || text.includes("indemnification") || text.includes("terminate")) {
            p = "high";
        } else if (text.includes("notice") || text.includes("report") || text.includes("audit")) {
            p = "medium";
        } else {
            p = "low";
        }

        return {
            id: `task-${index}`,
            text: ob.text,
            source: ob.source,
            priority: p,
            completed: false
        };
    });

    // Filter by priority if requested
    let filteredTasks = tasks;
    if (priority !== "all") {
        filteredTasks = tasks.filter(t => t.priority === priority);
    }

    return {
        title: "Contractual Obligations",
        tasks: filteredTasks.slice(0, 10) // Limit to top 10 for UI
    };
}

// ============================================================================
// TOOL EXPORT
// ============================================================================

export const obligationExtractorTool: TamboTool = {
    name: "extractObligations",
    description: `📋 OBLIGATION EXTRACTOR SUB-AGENT

Scans contract for duties, 'shall' statements, and action items.

## When To Call
- User asks "what do I need to do", "obligations", "checklist", "tasks"
- Triggered by "requirements", "duties", "action items"

## Output
Returns a structured checkist for the ExtractionChecklist component.

CRITICAL: DO NOT provide text explanation.
DO NOT list the obligations in text.
The UI component displays them all.
Your text response should be EMPTY.`,
    tool: extractContractObligations,
    inputSchema: ObligationExtractorInputSchema,
    outputSchema: ChecklistSchema
};

export default obligationExtractorTool;
