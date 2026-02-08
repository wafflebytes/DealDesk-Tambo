import { TamboAI } from '@tambo-ai/typescript-sdk';

// Allow longer generation time for contracts
export const maxDuration = 60;

const TAMBO_PROJECT_ID = 'p_kJceIaYZ.418673';

const client = new TamboAI({
    apiKey: process.env.NEXT_PUBLIC_TAMBO_API_KEY || process.env.TAMBO_API_KEY,
});

interface DraftRequest {
    prompt: string;
    contractType: string;
    jurisdiction: string;
    partyA: string;
    partyB: string;
    termLength: string;
    liabilityCap: string;
    paymentTerms: string;
}

const CONTRACT_TYPE_NAMES: Record<string, string> = {
    'MSA': 'Master Services Agreement',
    'NDA': 'Non-Disclosure Agreement',
    'SOW': 'Statement of Work',
    'Employment': 'Employment Agreement',
    'SLA': 'Software License Agreement',
    'Consulting': 'Consulting Agreement',
    'Partnership': 'Partnership Agreement',
    'Lease': 'Lease Agreement'
};

const JURISDICTION_NAMES: Record<string, string> = {
    'US-DE': 'State of Delaware',
    'US-CA': 'State of California',
    'US-NY': 'State of New York',
    'US-TX': 'State of Texas',
    'UK': 'United Kingdom',
    'EU': 'European Union',
    'SG': 'Singapore',
    'CA-ON': 'Province of Ontario, Canada'
};

export async function POST(req: Request) {
    try {
        const data: DraftRequest = await req.json();

        const contractType = CONTRACT_TYPE_NAMES[data.contractType] || 'Master Services Agreement';
        const jurisdiction = JURISDICTION_NAMES[data.jurisdiction] || 'State of Delaware';

        // 1. Create a Thread
        const thread = await client.beta.threads.create({
            projectId: TAMBO_PROJECT_ID,
            contextKey: 'draft-' + Date.now(),
        });

        // 2. Construct Prompt
        const systemPrompt = `You are a legal contract drafting expert. Generate professional, legally-sound contracts in Markdown format.

FORMAT RULES (FOLLOW EXACTLY):
- Use # for main title (e.g., # MASTER SERVICES AGREEMENT)
- Use ## for section headers (e.g., ## 1. DEFINITIONS)
- Use numbered lists (1.1, 1.2) for subsections
- Use **bold** for defined terms and emphasis
- Use --- for horizontal rules between major sections
- End with [Signature blocks to follow]

OUTPUT ONLY THE CONTRACT. No explanations, no preamble, no markdown code fences.`;

        const userPrompt = `Generate a formal ${contractType} contract.

CONTRACT DETAILS:
- Contract Type: ${contractType}
- Governing Law: ${jurisdiction}
- Party A: ${data.partyA || 'Acme Corporation'}
- Party B: ${data.partyB || 'TechVentures LLC'}
- Term Length: ${data.termLength ? data.termLength + ' months' : '12 months'}
- Liability Cap: ${data.liabilityCap ? '$' + data.liabilityCap : '$50,000'}
- Payment Terms: ${data.paymentTerms || 'Net 30'}

${data.prompt ? 'SPECIAL INSTRUCTIONS:\n' + data.prompt : ''}

Generate the complete contract now.`;

        // 3. Call Tambo advancestream
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
                    const parsed = JSON.parse(dataStr);
                    if (parsed.generationStage === 'COMPLETE' || parsed.statusMessage === 'Complete') {
                        lastValidJson = parsed;
                    }
                } catch {
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

        // Clean up markdown fences if present
        let contract = contentPart.text;
        contract = contract.replace(/```markdown\n?|```/g, '').trim();

        return Response.json({ contract });

    } catch (error) {
        console.error('Draft API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate contract', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
