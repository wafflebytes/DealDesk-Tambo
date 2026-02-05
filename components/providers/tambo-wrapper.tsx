"use client"

import { TamboProvider } from "@tambo-ai/react"
import { z } from "zod"

// Define components that Tambo can render (GenUI)
const tamboComponents = [
    {
        name: "RiskRadar",
        description: "A visual risk assessment component that shows contract risks with severity levels",
        component: null, // Will be lazy-loaded
        propsSchema: z.object({
            risks: z.array(z.object({
                category: z.string(),
                severity: z.enum(["low", "medium", "high"]),
                description: z.string()
            })).optional()
        })
    },
    {
        name: "ClauseTuner",
        description: "Interactive slider to adjust contract clause values like liability caps",
        component: null,
        propsSchema: z.object({
            clauseType: z.string().optional(),
            currentValue: z.number().optional(),
            recommendedValue: z.number().optional()
        })
    }
]

interface TamboWrapperProps {
    children: React.ReactNode
}

export function TamboWrapper({ children }: TamboWrapperProps) {
    return (
        <TamboProvider
            apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY || ""}
            components={[]}
            tools={[]}
            streaming={true}
        >
            {children}
        </TamboProvider>
    )
}
