/**
 * @file contract-parser.ts
 * @description Shared utilities for parsing and processing contract text
 * 
 * Used by all sub-agents to extract relevant sections from contract documents.
 */

/**
 * Represents a parsed section of a contract
 */
export interface ContractSection {
    title: string;
    number: string;  // e.g., "4.1", "5.2.3"
    content: string;
    startIndex: number;
    endIndex: number;
}

/**
 * Keywords commonly associated with different risk categories
 */
export const RISK_KEYWORDS = {
    Liability: [
        'liability', 'liable', 'indemnify', 'indemnification', 'damages',
        'consequential', 'punitive', 'cap', 'limitation', 'exclude'
    ],
    IP: [
        'intellectual property', 'patent', 'copyright', 'trademark', 'trade secret',
        'license', 'ownership', 'work product', 'assignment', 'proprietary'
    ],
    Term: [
        'term', 'duration', 'renewal', 'termination', 'expiration', 'notice period',
        'auto-renewal', 'perpetual', 'effective date', 'commence'
    ],
    Payment: [
        'payment', 'fee', 'invoice', 'net 30', 'net 60', 'compensation',
        'price', 'cost', 'expense', 'reimburs', 'billing'
    ],
    Confidentiality: [
        'confidential', 'nda', 'non-disclosure', 'proprietary information',
        'trade secret', 'restricted', 'protected', 'private'
    ]
};

/**
 * Keywords indicating obligations or action items
 */
export const OBLIGATION_KEYWORDS = [
    'shall', 'must', 'will', 'agrees to', 'is required to', 'obligated',
    'responsible for', 'duty to', 'covenant', 'undertake', 'commit'
];

/**
 * Parse contract text into sections based on common legal document structure
 */
export function parseContractSections(contractText: string): ContractSection[] {
    const sections: ContractSection[] = [];

    // Pattern matches: "1.", "1.1", "Section 1", "ARTICLE I", etc.
    const sectionPattern = /(?:^|\n)(?:(?:Section|SECTION|Article|ARTICLE)\s*)?(\d+(?:\.\d+)*\.?)\s*([A-Z][A-Za-z\s]+?)(?:\.|:|\n)/gm;

    let match;
    let lastIndex = 0;
    let lastSection: ContractSection | null = null;

    while ((match = sectionPattern.exec(contractText)) !== null) {
        // Close previous section
        if (lastSection) {
            lastSection.endIndex = match.index;
            lastSection.content = contractText.slice(lastSection.startIndex, lastSection.endIndex).trim();
        }

        lastSection = {
            number: match[1].replace(/\.$/, ''),
            title: match[2].trim(),
            content: '',
            startIndex: match.index,
            endIndex: contractText.length
        };

        sections.push(lastSection);
        lastIndex = match.index + match[0].length;
    }

    // Close final section
    if (lastSection) {
        lastSection.content = contractText.slice(lastSection.startIndex).trim();
    }

    // If no sections found, treat entire text as one section
    if (sections.length === 0) {
        sections.push({
            number: '1',
            title: 'Full Document',
            content: contractText,
            startIndex: 0,
            endIndex: contractText.length
        });
    }

    return sections;
}

/**
 * Find sections containing specific keywords
 */
export function findSectionsByKeywords(
    sections: ContractSection[],
    keywords: string[]
): ContractSection[] {
    const lowerKeywords = keywords.map(k => k.toLowerCase());

    return sections.filter(section => {
        const lowerContent = section.content.toLowerCase();
        const lowerTitle = section.title.toLowerCase();

        return lowerKeywords.some(keyword =>
            lowerContent.includes(keyword) || lowerTitle.includes(keyword)
        );
    });
}

/**
 * Extract defined terms from contract (terms in quotes or with "means" definition)
 */
export function extractDefinedTerms(contractText: string): Array<{ term: string; definition: string }> {
    const terms: Array<{ term: string; definition: string }> = [];

    // Pattern 1: "Term" means/shall mean ...
    const meansPattern = /"([^"]+)"\s*(?:means|shall mean|refers to|is defined as)\s*([^.]+\.)/gi;

    // Pattern 2: Term: definition in a definitions section
    const colonPattern = /(?:^|\n)\s*"?([A-Z][a-zA-Z\s]+)"?\s*[:]\s*([^.]+\.)/gm;

    let match;

    while ((match = meansPattern.exec(contractText)) !== null) {
        terms.push({
            term: match[1].trim(),
            definition: match[2].trim()
        });
    }

    while ((match = colonPattern.exec(contractText)) !== null) {
        // Avoid duplicates
        const termName = match[1].trim();
        if (!terms.some(t => t.term.toLowerCase() === termName.toLowerCase())) {
            terms.push({
                term: termName,
                definition: match[2].trim()
            });
        }
    }

    return terms;
}

/**
 * Extract sentences containing obligation keywords
 */
export function extractObligations(contractText: string): Array<{ text: string; source: string }> {
    const obligations: Array<{ text: string; source: string }> = [];

    // Split into sentences
    const sentences = contractText.split(/(?<=[.!?])\s+/);

    sentences.forEach((sentence, index) => {
        const lower = sentence.toLowerCase();

        if (OBLIGATION_KEYWORDS.some(keyword => lower.includes(keyword))) {
            // Try to find the section reference
            const sectionMatch = sentence.match(/(?:Section|§)\s*(\d+(?:\.\d+)*)/i);

            obligations.push({
                text: sentence.trim(),
                source: sectionMatch ? `Section ${sectionMatch[1]}` : `Paragraph ${Math.floor(index / 5) + 1}`
            });
        }
    });

    return obligations;
}

/**
 * Calculate a simple risk score based on keyword density
 * Returns 0-1 where higher = more risk
 */
export function calculateKeywordRiskScore(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    const wordCount = lowerText.split(/\s+/).length;

    if (wordCount === 0) return 0;

    let keywordHits = 0;

    keywords.forEach(keyword => {
        const regex = new RegExp(keyword.toLowerCase(), 'gi');
        const matches = lowerText.match(regex);
        if (matches) keywordHits += matches.length;
    });

    // Normalize: assume ~1 keyword per 50 words is "medium" risk (0.5)
    const density = keywordHits / (wordCount / 50);

    // Cap at 1.0
    return Math.min(density, 1.0);
}

/**
 * Get a text summary/excerpt (first N characters)
 */
export function getExcerpt(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return truncated.slice(0, lastSpace) + '...';
}
