/**
 * @file clause-negotiator.ts
 * @description Clause Negotiator Sub-Agent
 * 
 * Specialized agent for tuning and negotiating specific contract clauses.
 * Outputs data for the ClauseTuner GenUI component.
 */

import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";
import { ClauseTunerSchema } from "@/components/genui/schemas";

// ============================================================================
// SCHEMAS
// ============================================================================

export const ClauseNegotiatorInputSchema = z.object({
    clauseText: z.string().describe("The specific clause text to analyze and tune"),
    clauseType: z.string().describe("Type of clause, e.g., 'Liability Cap', 'Payment Terms'"),
    contractValue: z.number().optional().describe("Total contract value for calculating caps"),
    direction: z.enum(["increase", "decrease", "neutral"]).optional().describe(
        "Direction of negotiation"
    ),
    targetPosition: z.enum(["Pro-Vendor", "Neutral", "Pro-Client", "Aggressive", "Balanced", "Conservative"]).optional().describe(
        "Desired negotiation stance"
    ),
    partyRole: z.string().optional().describe(
        "User's party role, e.g., 'Acme (Client)', 'TechVentures (Service Provider)'"
    ),
    priority: z.enum(["Low", "Medium", "High", "Critical"]).optional().describe(
        "Priority level for this negotiation"
    )
});

export type ClauseNegotiatorInput = z.infer<typeof ClauseNegotiatorInputSchema>;

// Output uses the existing ClauseTunerSchema
export type ClauseNegotiatorOutput = z.infer<typeof ClauseTunerSchema>;

// ============================================================================
// NEGOTIATION LOGIC
// ============================================================================

/**
 * Common clause patterns and their typical values
 */
const CLAUSE_TEMPLATES = {
    "Liability Cap": {
        defaultMultiplier: 1.0,
        standardAlternatives: [0.5, 1.0, 2.0, 3.0],
        typicalMutual: false
    },
    "Indemnification": {
        defaultMultiplier: 2.0,
        standardAlternatives: [1.0, 2.0, 3.0, 5.0],
        typicalMutual: true
    },
    "Termination Notice": {
        defaultMultiplier: 1.0,
        standardAlternatives: [30, 60, 90, 120], // These are days, not multipliers
        typicalMutual: true
    },
    "Payment Terms": {
        defaultMultiplier: 1.0,
        standardAlternatives: [15, 30, 45, 60], // Days
        typicalMutual: false
    }
};

/**
 * Extract numerical value from clause text
 */
function extractValue(clauseText: string): number {
    // Look for currency amounts
    const currencyMatch = clauseText.match(/\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|dollars?)/i);
    if (currencyMatch) {
        const value = currencyMatch[0].replace(/[$,\s]|USD|dollars?/gi, '');
        return parseFloat(value) || 0;
    }

    // Look for percentages
    const percentMatch = clauseText.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentMatch) {
        return parseFloat(percentMatch[1]) || 0;
    }

    // Look for multipliers
    const multiplierMatch = clauseText.match(/(\d+(?:\.\d+)?)\s*[xX×]/);
    if (multiplierMatch) {
        return parseFloat(multiplierMatch[1]) || 1;
    }

    // Look for any number
    const numberMatch = clauseText.match(/\b(\d+(?:,\d{3})*(?:\.\d+)?)\b/);
    if (numberMatch) {
        return parseFloat(numberMatch[1].replace(/,/g, '')) || 0;
    }

    return 100000; // Default placeholder
}

/**
 * Determine if clause appears to be mutual
 */
function isMutualClause(clauseText: string): boolean {
    const mutualKeywords = ['mutual', 'both parties', 'each party', 'either party', 'reciprocal'];
    const lowerText = clauseText.toLowerCase();
    return mutualKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Generate alternative values based on clause type and direction
 */
function generateAlternatives(
    currentValue: number,
    clauseType: string,
    direction?: "increase" | "decrease" | "neutral"
): number[] {
    const template = CLAUSE_TEMPLATES[clauseType as keyof typeof CLAUSE_TEMPLATES];

    if (template) {
        // Use template alternatives, scaled to current value
        return template.standardAlternatives.map(alt => {
            if (clauseType === "Termination Notice" || clauseType === "Payment Terms") {
                return alt; // These are absolute values (days)
            }
            return Math.round(currentValue * alt / template.defaultMultiplier);
        });
    }

    // Generate based on direction
    const base = currentValue;
    switch (direction) {
        case "increase":
            return [base, base * 1.25, base * 1.5, base * 2.0].map(Math.round);
        case "decrease":
            return [base * 0.5, base * 0.75, base, base * 1.25].map(Math.round);
        default:
            return [base * 0.5, base * 0.75, base, base * 1.5, base * 2.0].map(Math.round);
    }
}

/**
 * Analyze and prepare clause for tuning (dynamic sliders/toggles)
 */
async function negotiateClause(input: ClauseNegotiatorInput): Promise<ClauseNegotiatorOutput> {
    const { clauseText, clauseType, contractValue, direction, targetPosition, partyRole, priority } = input;

    // ⚖️ CLAUSE NEGOTIATOR LOG
    console.log('%c   ⚖️ [Clause Negotiator] Starting negotiation...', 'color: #ec4899');
    console.log('%c      Clause Type:', 'color: #ec4899', clauseType);
    console.log('%c      Party Role:', 'color: #ec4899', partyRole || 'unknown');
    console.log('%c      Stance:', 'color: #ec4899', targetPosition || 'neutral');
    console.log('%c      Priority:', 'color: #ec4899', priority || 'Medium');

    // Extract the current value from the clause
    let currentValue = extractValue(clauseText);

    // If we have a contract value and the clause looks like a cap, adjust
    if (contractValue && clauseType.toLowerCase().includes("cap")) {
        currentValue = currentValue || contractValue;
    }

    // Determine clause-specific configuration
    const lowerType = clauseType.toLowerCase();
    const isDaysClause = lowerType.includes("payment") || lowerType.includes("termination") || lowerType.includes("notice");
    const isCapClause = lowerType.includes("cap") || lowerType.includes("liability") || lowerType.includes("indemnif");

    // Determine if user is the client (Acme) or service provider (TechVentures)
    const isClient = partyRole?.toLowerCase().includes("acme") || partyRole?.toLowerCase().includes("client");
    const isAggressive = targetPosition === "Aggressive" || targetPosition === "Pro-Client";
    const isConservative = targetPosition === "Conservative" || targetPosition === "Pro-Vendor";
    const isHighPriority = priority === "High" || priority === "Critical";

    // Build dynamic sliders based on clause type
    const sliders: Array<{
        id: string;
        label: string;
        unit?: string;
        currentValue: number;
        min: number;
        max: number;
        step: number;
    }> = [];

    if (isDaysClause) {
        // Primary: Net Days slider
        sliders.push({
            id: "days",
            label: "Net Days",
            unit: "days",
            currentValue: currentValue || 30,
            min: 15,
            max: 90,
            step: 5
        });
        // Secondary: Grace Period slider (for aggressive negotiation)
        if (isAggressive || isHighPriority) {
            sliders.push({
                id: "grace",
                label: "Grace Period",
                unit: "days",
                currentValue: 5,
                min: 0,
                max: 15,
                step: 1
            });
        }
    } else if (isCapClause) {
        // Primary: Cap Amount slider
        sliders.push({
            id: "amount",
            label: "Cap Amount",
            unit: "$",
            currentValue: currentValue || 50000,
            min: 10000,
            max: 250000,
            step: 5000
        });
        // Secondary: Deductible slider (for high priority or aggressive)
        if (isAggressive || isHighPriority) {
            sliders.push({
                id: "deductible",
                label: "Deductible",
                unit: "$",
                currentValue: 5000,
                min: 0,
                max: 25000,
                step: 1000
            });
        }
    } else {
        // Generic clause -> value slider
        sliders.push({
            id: "value",
            label: "Value",
            currentValue: currentValue || 100,
            min: 0,
            max: Math.max(currentValue * 3, 1000),
            step: 1
        });
    }

    // Build dynamic toggles based on clause type, party role, and stance
    const toggles: Array<{
        id: string;
        label: string;
        currentValue: boolean;
        description?: string;
    }> = [];

    // Toggle 1: Mutual Liability (for cap clauses)
    if (isCapClause) {
        toggles.push({
            id: "mutual",
            label: "Mutual Liability",
            currentValue: isMutualClause(clauseText),
            description: "Both parties will be subject to the same liability cap."
        });
    }

    // Toggle 2: Party-specific toggle based on role
    if (isClient && isCapClause) {
        toggles.push({
            id: "carveouts",
            label: "Include Carve-Outs",
            currentValue: isAggressive,
            description: "Excludes gross negligence, fraud, and IP infringement from the cap."
        });
    } else if (!isClient && isCapClause) {
        toggles.push({
            id: "limitedLiabilityEvents",
            label: "Limited Liability Events",
            currentValue: isConservative,
            description: "Caps apply only to direct damages; excludes consequential damages."
        });
    }

    // For days clauses, add late fee toggle
    if (isDaysClause && isClient) {
        toggles.push({
            id: "lateFee",
            label: "Waive Late Fees",
            currentValue: isAggressive,
            description: "Request waiver of late fees for the first 30 days past due."
        });
    }

    // Generate context tags
    const tags: string[] = [];
    if (partyRole) tags.push(partyRole);
    if (targetPosition) tags.push(targetPosition);
    if (priority) tags.push(`${priority} Priority`);

    return {
        clauseType,
        sliders,
        toggles: toggles.length > 0 ? toggles : undefined,
        tags: tags.length > 0 ? tags : undefined,
    };
}

// ============================================================================
// TOOL EXPORT
// ============================================================================

export const clauseNegotiatorTool: TamboTool = {
    name: "negotiateClause",
    description: `⚙️ CLAUSE NEGOTIATOR SUB-AGENT

Analyzes specific contract clauses and prepares them for interactive tuning.

## When To Call
- User asks to "tune a clause", "adjust the cap", "negotiate terms", "modify liability"
- The Coordinator routes to ClauseNegotiator

## What It Does
1. Parses the clause text
2. Extracts current numerical values
3. Determines if clause is mutual
4. Generates alternative values
5. Prepares data for interactive ClauseTuner

## Clause Types Supported
• Liability Cap - dollar caps on damages
• Indemnification - protection clauses
• Termination Notice - notice periods (days)
• Payment Terms - payment timing (days)
• Custom - any clause with numerical values

## Output
Returns data structured for ClauseTuner component.

CRITICAL: DO NOT add any text explanation.
The ClauseTuner component is the entire response.
DO NOT summarize the current value or alternatives.
Your text response should be EMPTY.`,
    tool: negotiateClause,
    inputSchema: ClauseNegotiatorInputSchema,
    outputSchema: ClauseTunerSchema
};

export default clauseNegotiatorTool;
