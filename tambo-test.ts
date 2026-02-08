
import { TamboAI } from '@tambo-ai/typescript-sdk';

const client = new TamboAI({
    apiKey: process.env.NEXT_PUBLIC_TAMBO_API_KEY || process.env.TAMBO_API_KEY,
});

async function main() {
    try {
        const projectId = 'p_Qppv2Bfl.a61f4a'; // Full ID from getCurrent
        const contextKey = 'test-user-' + Date.now();

        console.log('Listing threads...');
        try {
            console.log('Skipping thread list...');
        } catch (e: any) {
            console.log('List threads failed:', e?.message || String(e));
        }

        console.log('Creating thread with contextKey...');
        const thread = await client.beta.threads.create({
            projectId,
            contextKey
        });
        console.log('Thread created:', thread.id);

        console.log('Sending message via advancestream...');
        // Use undocumted request to hit the new endpoint
        // Error instance was /threads/... so try without /beta
        const response = await client.post(`/threads/${thread.id}/advancestream`, {
            body: {
                messageToAppend: {
                    role: 'user',
                    content: [{ type: 'text', text: 'Hello, are you GPT-5.2? Return JSON with key "response".' }]
                },
                stream: false // Try to get non-streaming response if possible
            }
        });

        console.log('Response:', JSON.stringify(response, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
