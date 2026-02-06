import { z } from "zod";

// --- A. Deal Health Radar Chart ---
export const DealRiskSchema = z.object({
    risks: z.object({
        Liability: z.number().min(0).max(1).describe("0-1 score for Liability"),
        IP: z.number().min(0).max(1),
        Term: z.number().min(0).max(1),
        Payment: z.number().min(0).max(1),
        Confidentiality: z.number().min(0).max(1).optional()
    }),
    followUps: z.array(z.string()).describe("Suggested follow-up questions")
});

export type DealRiskData = z.infer<typeof DealRiskSchema>;


// --- B. Clause Tuner ---
export const ClauseTunerSchema = z.object({
    clauseType: z.string().describe("e.g. Liability Cap"),
    currentValue: z.number().describe("Current numerical value"),
    multiplier: z.number().describe("Current multiplier (e.g. 2.5x)"),
    isMutual: z.boolean(),
    alternatives: z.array(z.number()).describe("Suggested alternative caps")
});

export type ClauseTunerData = z.infer<typeof ClauseTunerSchema>;


// --- C. Extraction Checklist ---
export const ChecklistSchema = z.object({
    title: z.string().describe("Title of the checklist").optional(),
    tasks: z.array(z.object({
        id: z.string(),
        text: z.string(),
        source: z.string().describe("e.g. Section 4.1"),
        priority: z.enum(["high", "medium", "low"]),
        completed: z.boolean().default(false)
    }))
});

export type ChecklistData = z.infer<typeof ChecklistSchema>;


// --- D. Scoping Interceptor ---
export const ScopingSchema = z.object({
    variant: z.enum(['v1', 'v2', 'v3']).describe("v1=Enum (Choice), v2=Form (Input), v3=Destructive/Confirm"),
    title: z.string(),
    description: z.string(),
    submitLabel: z.string().optional().describe("Label for the submit button (default: 'Submit')"),
    options: z.array(z.object({
        label: z.string(),
        value: z.string(),
        bias: z.enum(["Pro-Vendor", "Neutral", "Pro-Client", "Critical"]).optional(),
        destructive: z.boolean().optional().describe("If true, this option performs a destructive action")
    })).optional(),
    formFields: z.array(z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["text", "number", "boolean", "date", "select"]),
        options: z.array(z.string()).optional().describe("Options for select type"),
        placeholder: z.string().optional(),
        required: z.boolean()
    })).optional()
});

export type ScopingData = z.infer<typeof ScopingSchema>;


// --- E. Definition Bank ---
export const DefinitionBankSchema = z.object({
    definitions: z.array(z.object({
        term: z.string(),
        definition: z.string(),
        tags: z.array(z.string())
    })).describe("List of defined terms found in the contract")
});

export type DefinitionBankData = z.infer<typeof DefinitionBankSchema>;
