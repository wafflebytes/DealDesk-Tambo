import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";
import { calculateKeywordRiskScore, RISK_KEYWORDS } from "@/lib/contract-parser";

const InputSchema = z.object({
    contractText: z.string().describe("The full text content of the contract to analyze"),
});

const OutputSchema = z.object({
    risks: z.object({
        Liability: z.number().min(0).max(1),
        IP: z.number().min(0).max(1),
        Term: z.number().min(0).max(1),
        Payment: z.number().min(0).max(1),
        Confidentiality: z.number().min(0).max(1).optional()
    }),
    followUps: z.array(z.string()),
    overallScore: z.number().min(0).max(100)
});

/**
 * Functional implementation of contract risk analysis.
 */
async function analyzeRisks(input: z.infer<typeof InputSchema>) {
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const text = input.contractText;

    // Use our parsing library to calculate real scores
    const risks = {
        Liability: calculateKeywordRiskScore(text, RISK_KEYWORDS.Liability),
        IP: calculateKeywordRiskScore(text, RISK_KEYWORDS.IP),
        Term: calculateKeywordRiskScore(text, RISK_KEYWORDS.Term),
        Payment: calculateKeywordRiskScore(text, RISK_KEYWORDS.Payment),
        Confidentiality: calculateKeywordRiskScore(text, RISK_KEYWORDS.Confidentiality)
    };

    // Calculate overall health score (0 = high risk, 100 = healthy)
    const riskValues = Object.values(risks);
    const avgRisk = riskValues.reduce((a, b) => a + b, 0) / riskValues.length;
    const overallScore = Math.round((1 - avgRisk) * 100);

    // Generate smart follow-ups based on high risk areas
    const followUps: string[] = [];
    if (risks.Liability > 0.6) followUps.push("Liability exposure is high. Recommend adding a super cap for data breach.");
    if (risks.Payment > 0.5) followUps.push("Payment terms seem aggressive. Should we push for Net 45?");
    if (risks.Term > 0.4) followUps.push("Check auto-renewal clauses to avoid lock-in.");
    if (followUps.length === 0) followUps.push("Contract looks healthy overall. Proceed to signature?");

    return {
        risks,
        followUps,
        overallScore
    };
}

export const analyzeContractRisksTool: TamboTool = {
    name: "analyzeContractRisks",
    description: `Analyzes the provided contract text to identify risks across key categories (Liability, IP, etc.) and returns a risk score profile.
    
    CRITICAL: The output of this tool is a visual Radar Chart.
    DO NOT generate ANY text explanation of the risks.
    DO NOT summarize the findings.
    The chart explains itself. Your text response should be empty.`,
    tool: analyzeRisks,
    inputSchema: InputSchema,
    outputSchema: OutputSchema
};
