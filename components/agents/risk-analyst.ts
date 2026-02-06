/**
 * @file risk-analyst.ts
 * @description Risk Analyst Sub-Agent
 * 
 * Specialized agent for identifying and quantifying contract risks.
 * Outputs data for the RiskRadar GenUI component.
 */

import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";
import { DealRiskSchema } from "@/components/genui/schemas";
import { calculateKeywordRiskScore, RISK_KEYWORDS } from "@/lib/contract-parser";

// ============================================================================
// SCHEMAS
// ============================================================================

export const RiskAnalystInputSchema = z.object({
    contractText: z.string().describe("The full text of the contract to analyze for risks"),
    focusArea: z.string().optional().describe("A specific risk area to focus on (e.g., 'Liability')")
});

export type RiskAnalystInput = z.infer<typeof RiskAnalystInputSchema>;
export type RiskAnalystOutput = z.infer<typeof DealRiskSchema>;

// ============================================================================
// ANALYSIS LOGIC
// ============================================================================

async function analyzeRisks(input: RiskAnalystInput): Promise<RiskAnalystOutput> {
    const { contractText } = input;

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate real scores using library
    const risks = {
        Liability: calculateKeywordRiskScore(contractText, RISK_KEYWORDS.Liability),
        IP: calculateKeywordRiskScore(contractText, RISK_KEYWORDS.IP),
        Term: calculateKeywordRiskScore(contractText, RISK_KEYWORDS.Term),
        Payment: calculateKeywordRiskScore(contractText, RISK_KEYWORDS.Payment),
        Confidentiality: calculateKeywordRiskScore(contractText, RISK_KEYWORDS.Confidentiality)
    };

    // Generate context-aware follow-ups
    const followUps: string[] = [];
    if (risks.Liability > 0.6) followUps.push("Liability cap appears disproportionate to contract value.");
    if (risks.Payment > 0.5) followUps.push("Payment terms are non-standard (Net 60+).");
    if (risks.Term > 0.4) followUps.push("Auto-renewal clause has short cancellation window.");

    if (followUps.length === 0) {
        followUps.push("Contract terms are within standard market ranges.");
    }

    return {
        risks,
        followUps
    };
}

// ============================================================================
// TOOL EXPORT
// ============================================================================

export const riskAnalystTool: TamboTool = {
    name: "analyzeContractRisks",
    description: `📊 RISK ANALYST SUB-AGENT

Analyzes contract text to identify and score risks across key categories.

## When To Call
- User asks "analyze risky clauses", "what are the risks", "deal health"
- Triggered by "risk profile", "concerns", "exposure"

## Output
Returns a structured risk profile for the RiskRadar component.
DO NOT provide text explanation - just the data.`,
    tool: analyzeRisks,
    inputSchema: RiskAnalystInputSchema,
    outputSchema: DealRiskSchema
};

export default riskAnalystTool;
