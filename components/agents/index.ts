// Coordinator (Orchestrator) Agent
export {
    coordinatorTool
} from "./coordinator";

// Clause Negotiator Sub-Agent
export {
    clauseNegotiatorTool,
    ClauseNegotiatorInputSchema,
    type ClauseNegotiatorInput,
    type ClauseNegotiatorOutput
} from "./clause-negotiator";

// Definition Curator Sub-Agent
export {
    definitionCuratorTool,
    DefinitionCuratorInputSchema,
    type DefinitionCuratorInput,
    type DefinitionCuratorOutput
} from "./definition-curator";

// Risk Analyst Sub-Agent
export {
    riskAnalystTool,
    RiskAnalystInputSchema,
    type RiskAnalystInput,
    type RiskAnalystOutput
} from "./risk-analyst";

// Obligation Extractor Sub-Agent
export {
    obligationExtractorTool,
    ObligationExtractorInputSchema,
    type ObligationExtractorInput,
    type ObligationExtractorOutput
} from "./obligation-extractor";

// Scoping Specialist Sub-Agent (Elicitation)
export {
    scopingSpecialistTool,
    ScopingSpecialistInputSchema,
    type ScopingSpecialistInput,
    type ScopingSpecialistOutput
} from "./scoping-specialist";

// Convenience array of all tools for TamboProvider registration
import { coordinatorTool } from "./coordinator";
import { clauseNegotiatorTool } from "./clause-negotiator";
import { definitionCuratorTool } from "./definition-curator";
import { riskAnalystTool } from "./risk-analyst";
import { obligationExtractorTool } from "./obligation-extractor";
import { scopingSpecialistTool } from "./scoping-specialist";

/**
 * All MCP agent tools ready for registration
 */
export const allAgentTools = [
    coordinatorTool,
    clauseNegotiatorTool,
    definitionCuratorTool,
    riskAnalystTool,
    obligationExtractorTool,
    scopingSpecialistTool
];

/**
 * Agent tool lookup by name
 */
export const agentToolMap = {
    coordinate: coordinatorTool,
    negotiateClause: clauseNegotiatorTool,
    curateDefinitions: definitionCuratorTool,
    analyzeContractRisks: riskAnalystTool,
    extractObligations: obligationExtractorTool,
    scopeRequest: scopingSpecialistTool
};

export type AgentToolName = keyof typeof agentToolMap;
