/**
 * @file definition-curator.ts
 * @description Definition Curator Sub-Agent
 * 
 * Specialized agent for extracting and explaining legal terminology.
 * Outputs data for the DefinitionBank GenUI component.
 */

import { z } from "zod";
import { TamboTool } from "@tambo-ai/react";
import { DefinitionBankSchema } from "@/components/genui/schemas";
import { extractDefinedTerms } from "@/lib/contract-parser";

// ============================================================================
// SCHEMAS
// ============================================================================

export const DefinitionCuratorInputSchema = z.object({
    contractText: z.string().describe("The contract text to extract definitions from"),
    specificTerm: z.string().optional().describe(
        "A specific term to look up (e.g., 'Confidential Information')"
    ),
    extractAll: z.boolean().optional().default(false).describe(
        "Whether to extract all defined terms"
    ),
    category: z.enum(["all", "financial", "legal", "technical", "parties"]).optional().describe(
        "Category of terms to focus on"
    )
});

export type DefinitionCuratorInput = z.infer<typeof DefinitionCuratorInputSchema>;

// Output uses the existing DefinitionBankSchema
export type DefinitionCuratorOutput = z.infer<typeof DefinitionBankSchema>;

// ============================================================================
// CURATION LOGIC
// ============================================================================

/**
 * Category-specific keywords for tagging
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    financial: [
        'payment', 'fee', 'price', 'cost', 'compensation', 'revenue', 'profit',
        'invoice', 'billing', 'tax', 'expense', 'reimbursement', 'budget'
    ],
    legal: [
        'liability', 'indemnification', 'warranty', 'breach', 'termination',
        'confidential', 'proprietary', 'intellectual property', 'rights', 'obligation'
    ],
    technical: [
        'software', 'system', 'data', 'api', 'service', 'platform', 'technology',
        'specification', 'deliverable', 'documentation', 'integration'
    ],
    parties: [
        'vendor', 'client', 'customer', 'provider', 'contractor', 'employee',
        'affiliate', 'representative', 'agent', 'partner', 'subsidiary'
    ]
};

/**
 * Generate tags for a defined term based on its content
 */
function generateTags(term: string, definition: string): string[] {
    const tags: string[] = [];
    const combined = `${term} ${definition}`.toLowerCase();

    // Check each category
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => combined.includes(kw))) {
            tags.push(category);
        }
    }

    // Add structural tags
    if (definition.length > 200) {
        tags.push("complex");
    }

    if (definition.includes("means") && definition.includes("includes")) {
        tags.push("expanded");
    }

    // Ensure at least one tag
    if (tags.length === 0) {
        tags.push("general");
    }

    return tags.slice(0, 3); // Limit to 3 tags
}

/**
 * Common legal terms with standard definitions (fallback)
 */
const COMMON_LEGAL_TERMS: Record<string, string> = {
    "Confidential Information": "Any information disclosed by one party to the other that is marked as confidential or should reasonably be understood to be confidential.",
    "Intellectual Property": "Patents, copyrights, trademarks, trade secrets, and any other proprietary rights.",
    "Force Majeure": "Events beyond reasonable control including acts of God, war, terrorism, natural disasters, or government actions.",
    "Material Breach": "A significant violation of contract terms that substantially undermines the purpose of the agreement.",
    "Indemnification": "The obligation of one party to compensate another for losses or damages.",
    "Limitation of Liability": "A cap or restriction on the amount of damages that can be claimed.",
    "Governing Law": "The jurisdiction and legal framework that applies to the interpretation of the contract.",
    "Term": "The duration or period during which the contract is in effect.",
    "Termination": "The ending of the contract, either upon expiration or due to breach or mutual agreement."
};

/**
 * Extract and curate definitions from contract
 */
async function curateDefinitions(input: DefinitionCuratorInput): Promise<DefinitionCuratorOutput> {
    const { contractText, specificTerm, extractAll, category } = input;

    // Extract all defined terms from the contract
    const extractedTerms = extractDefinedTerms(contractText);

    // Create the definitions array
    let definitions: Array<{ term: string; definition: string; tags: string[] }> = [];

    if (specificTerm) {
        // Looking for a specific term
        const found = extractedTerms.find(
            t => t.term.toLowerCase() === specificTerm.toLowerCase()
        );

        if (found) {
            definitions.push({
                term: found.term,
                definition: found.definition,
                tags: generateTags(found.term, found.definition)
            });
        } else {
            // Check common legal terms as fallback
            const commonDef = COMMON_LEGAL_TERMS[specificTerm];
            if (commonDef) {
                definitions.push({
                    term: specificTerm,
                    definition: `[Standard Definition] ${commonDef}`,
                    tags: generateTags(specificTerm, commonDef)
                });
            } else {
                // Term not found - provide helpful message
                definitions.push({
                    term: specificTerm,
                    definition: `This term is not explicitly defined in the contract. Consider adding a definition clause.`,
                    tags: ["undefined", "attention"]
                });
            }
        }
    } else if (extractAll || !specificTerm) {
        // Extract all or default behavior
        definitions = extractedTerms.map(t => ({
            term: t.term,
            definition: t.definition,
            tags: generateTags(t.term, t.definition)
        }));

        // Apply category filter if specified
        if (category && category !== "all") {
            definitions = definitions.filter(d => d.tags.includes(category));
        }

        // Sort alphabetically
        definitions.sort((a, b) => a.term.localeCompare(b.term));

        // Limit for UI
        definitions = definitions.slice(0, 20);
    }

    // If no definitions found, provide fallback with common terms
    if (definitions.length === 0) {
        definitions = Object.entries(COMMON_LEGAL_TERMS)
            .slice(0, 5)
            .map(([term, definition]) => ({
                term,
                definition: `[Standard Definition] ${definition}`,
                tags: generateTags(term, definition)
            }));
    }

    return { definitions };
}

// ============================================================================
// TOOL EXPORT
// ============================================================================

export const definitionCuratorTool: TamboTool = {
    name: "curateDefinitions",
    description: `📖 DEFINITION CURATOR SUB-AGENT

Extracts and explains legal terminology from contract documents.

## When To Call
- User asks "what does X mean", "definitions", "glossary", "terminology"
- The Coordinator routes to DefinitionCurator

## What It Does
1. Scans for defined terms (quoted terms with "means")
2. Parses definition sections
3. Tags terms by category (financial, legal, technical, parties)
4. Provides standard definitions for common legal terms
5. Flags undefined terms that may need attention

## Term Categories
• financial - payment, fee, revenue terms
• legal - liability, breach, warranty terms
• technical - software, data, API terms
• parties - vendor, client, affiliate terms

## Options
• specificTerm: Look up one specific term
• extractAll: Get all defined terms
• category: Filter by term category

## Output
Returns data structured for DefinitionBank component.
DO NOT add any text - just render DefinitionBank with this data.`,
    tool: curateDefinitions,
    inputSchema: DefinitionCuratorInputSchema,
    outputSchema: DefinitionBankSchema
};

export default definitionCuratorTool;
