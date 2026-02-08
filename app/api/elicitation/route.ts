import { TamboAI } from '@tambo-ai/typescript-sdk';
import { z } from 'zod';
import { ScopingSchema } from '@/components/genui/schemas';

// Allow streaming responses up to 60 seconds (Tambo might be slower)
export const maxDuration = 60;

const TAMBO_PROJECT_ID = 'p_kJceIaYZ.418673';

const client = new TamboAI({
    apiKey: process.env.NEXT_PUBLIC_TAMBO_API_KEY || process.env.TAMBO_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { ambiguousRequest, contextHints, possibleInterpretations } = await req.json();

        // 1. Create a Thread
        const thread = await client.beta.threads.create({
            projectId: TAMBO_PROJECT_ID,
            contextKey: 'user-' + Date.now(),
        });

        // 2. Construct Prompt for JSON
        const systemPrompt = `You are a Legal Scoping Specialist AI for a contract analysis tool.
Your job is to generate a "Scoping Card" (Elicitation UI) to help users clarify their intent.

**STRICT VARIANT SELECTION RULES:**

**USE 'v1' (Choice Card)** when the user's request is HIGH-LEVEL or AMBIGUOUS, meaning they haven't specified WHICH tool/analysis they want.
  - Examples: "help me", "help me with this contract", "what can you do?", "analyze this"
  - The options should route to specific GenUI components: "Analyze Risk", "Tune a Clause", "Extract Obligations", "Check Definitions".
  - v1 options have: label (short, like "Analyze Risk"), value (like "risk_analysis").

**USE 'v2' (Form Card)** when the user has ALREADY CHOSEN a specific action/tool (like "tune the clause") and you need to collect PARAMETERS before executing.
  - Examples: "tune the clause", "negotiate liability", "adjust the cap"
  - The form MUST have exactly 4 SHORT fields:
    1. "Your Party" (select: EXTRACT FROM CONTEXT. Look for the two main parties in the contract. Format: "Name (Role)". Fallback: ["Client", "Service Provider"])
    2. "Target Clause" (text, placeholder: "e.g., Liability Cap")
    3. "Stance" (select: ["Aggressive", "Balanced", "Conservative"])
    4. "Priority" (select: ["Low", "Medium", "High"])
  - Labels must be SHORT (2-3 words max). Use 'select' type for dropdowns.

**USE 'v3' (Confirmation Card)** when the user is about to perform a DESTRUCTIVE or IRREVERSIBLE action.
  - Examples: "delete the contract", "remove all clauses", "reset everything"
  - v3 options should be simple Yes/No: { label: "Yes, Delete", value: "confirm", destructive: true }, { label: "Cancel", value: "cancel" }.

**CRITICAL JSON RULES:**
- Return ONLY valid JSON. No markdown, no explanations.
- Schema: { title, description, variant, options?, formFields?, submitLabel? }
- For v1: use 'options' array. For v2: use 'formFields' array + 'submitLabel'. For v3: use 'options' (Yes/No).
- formFields have: { id, label, type, required, placeholder?, options? }. If type='select', options is a string array.`;

        const userPrompt = `User Request: "${ambiguousRequest}"
Context: "${contextHints || 'Contract loaded'}"

Determine the correct variant (v1, v2, or v3) based on the rules above, then generate the JSON.`;

        // 3. Call Advance Stream (Manual)
        const response = await client.post(`/threads/${thread.id}/advancestream`, {
            body: {
                messageToAppend: {
                    role: 'user',
                    content: [{ type: 'text', text: systemPrompt + '\n\n' + userPrompt }]
                },
                stream: false
            }
        }) as string;

        // 4. Parse SSE Response
        const lines = response.split('\n');
        let lastValidJson = null;

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const dataStr = line.substring(6).trim();
                if (dataStr === 'DONE') continue;
                try {
                    const data = JSON.parse(dataStr);
                    if (data.generationStage === 'COMPLETE' || data.statusMessage === 'Complete') {
                        lastValidJson = data;
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
        }

        if (!lastValidJson) {
            throw new Error('No complete generation found in response');
        }

        const contentPart = lastValidJson.responseMessageDto.content.find((c: any) => c.type === 'text');
        if (!contentPart) {
            throw new Error('No text content in response');
        }

        // 6. Parse JSON from Text
        let generatedJson;
        try {
            const text = contentPart.text.replace(/```json\n?|```/g, '').trim();
            console.log('Raw LLM Response Text:', text); // DEBUG LOG
            generatedJson = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON from model output:', contentPart.text);
            throw new Error(`Model output was not valid JSON: ${contentPart.text.substring(0, 100)}...`);
        }

        // 7. Validate with Zod
        const cleanedJson = JSON.parse(JSON.stringify(generatedJson), (key, value) => {
            if (value === null) return undefined;
            // Map common model variations to valid enum types
            if (key === 'type' && value === 'multiselect') return 'select';
            return value;
        });

        // Additional robust cleanup for formFields options (must be strings)
        if (cleanedJson.formFields && Array.isArray(cleanedJson.formFields)) {
            cleanedJson.formFields = cleanedJson.formFields.map((field: any) => {
                if (field.type === 'select' && field.options && Array.isArray(field.options)) {
                    field.options = field.options.map((opt: any) =>
                        typeof opt === 'object' ? (opt.label || opt.value || JSON.stringify(opt)) : opt
                    );
                }
                return field;
            });
        }

        const validated = ScopingSchema.parse(cleanedJson);

        return Response.json(validated);

    } catch (error) {
        console.error('AI Elicitation Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate elicitation', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
