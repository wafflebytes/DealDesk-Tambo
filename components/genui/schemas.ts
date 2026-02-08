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


// --- B. Clause Tuner (Dynamic) ---
export const ClauseTunerSliderSchema = z.object({
    id: z.string().describe("Unique identifier for this slider"),
    label: z.string().describe("Display label, e.g., 'Net Days', 'Cap Amount'"),
    unit: z.string().optional().describe("Unit suffix, e.g., 'days', '$', '%'"),
    currentValue: z.number().describe("Current value"),
    min: z.number().describe("Minimum value"),
    max: z.number().describe("Maximum value"),
    step: z.number().optional().default(1).describe("Step increment"),
});

export const ClauseTunerToggleSchema = z.object({
    id: z.string().describe("Unique identifier for this toggle"),
    label: z.string().describe("Display label, e.g., 'Mutual Liability'"),
    currentValue: z.boolean().describe("Current toggle state"),
    description: z.string().optional().describe("Tooltip or helper text when enabled"),
});

export const ClauseTunerSchema = z.object({
    clauseType: z.string().describe("Title of the clause being tuned"),
    sliders: z.array(ClauseTunerSliderSchema).min(1).max(3).describe("1-3 sliders for tuning values"),
    toggles: z.array(ClauseTunerToggleSchema).max(2).optional().describe("0-2 toggles for boolean options"),
    tags: z.array(z.string()).optional().describe("Context tags to display (e.g. Party, Stance, Priority)"),
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
