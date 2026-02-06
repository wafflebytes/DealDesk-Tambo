"use client";

import { useTamboComponentState } from "@tambo-ai/react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { DealRiskSchema } from "@/components/genui/schemas";
import { CheckCircle } from "lucide-react";
import * as React from "react";

/**
 * TypeScript type inferred from the Zod schema
 */
export type RiskRadarProps = z.infer<typeof DealRiskSchema> &
  React.HTMLAttributes<HTMLDivElement> & {
    overallScore?: number; // Optional prop validation helper if not strictly in Zod
  };

/**
 * State for the RiskRadar component
 */
type RiskRadarState = {
  selectedRisk: string | null;
  acknowledgedRisks: string[];
};

export function RiskRadar({
  risks,
  followUps,
  overallScore,
  className,
  ...props
}: RiskRadarProps) {
  // Initialize Tambo component state for interactivity
  const [state, setState] = useTamboComponentState<RiskRadarState>(
    "risk-radar",
    {
      selectedRisk: null,
      acknowledgedRisks: [],
    }
  );

  // Calculate overall score if not provided in props (though usually it should be)
  // Fail gracefully if risks is undefined
  const safeRisks = risks || {};
  const riskValues = Object.values(safeRisks);

  // Calculate score or default to 0
  const calculatedScore = riskValues.length > 0
    ? Math.round((riskValues.reduce((a, b) => a + (1 - b), 0) / riskValues.length) * 100)
    : 0;

  // Use provided score or calculated one
  const displayScore = overallScore !== undefined ? overallScore : calculatedScore;

  // Deriving visual properties based on risk level
  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return "Critical";
    if (score >= 0.5) return "High";
    if (score >= 0.2) return "Medium";
    return "Low";
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "#ef4444"; // red-500
      case "high":
        return "#f97316"; // orange-500
      case "medium":
        return "#eab308"; // yellow-500
      case "low":
        return "#22c55e"; // green-500
      default:
        return "#94a3b8"; // slate-400
    }
  };

  const handleRiskClick = (riskCategory: string) => {
    setState({
      ...state,
      selectedRisk: state?.selectedRisk === riskCategory ? null : riskCategory,
    });
  };

  const handleAcknowledge = (riskCategory: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state) return;

    const isAcknowledged = state.acknowledgedRisks.includes(riskCategory);
    const newAcknowledged = isAcknowledged
      ? state.acknowledgedRisks.filter((r) => r !== riskCategory)
      : [...state.acknowledgedRisks, riskCategory];

    setState({
      ...state,
      acknowledgedRisks: newAcknowledged,
    });
  };

  // Format data for Recharts
  const chartData = Object.entries(safeRisks).map(([category, score]) => ({
    category,
    score: score * 100, // Convert 0-1 to 0-100
    fullMark: 100,
    level: getRiskLevel(score),
  }));

  // Helper to get description (mocked for now as schema doesn't have it per-risk in the simple object)
  const safeFollowUps = followUps || [];
  const getDescription = (category: string) => {
    return safeFollowUps.find(f => f.includes(category)) || `Review the ${category} terms carefully.`;
  };

  return (
    <div className={cn("rounded-xl card-skeu group relative overflow-hidden w-full bg-white", className)} {...props}>
      {/* Thread Indicator - Matching Style */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-3 h-3 text-amber-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 7h2a5 5 0 0 1 0 10h-2m-6 0H7A5 5 0 0 1 7 7h2" />
          </svg>
        </div>
      </div>

      {/* Header - Matching Gradient and Layout */}
      <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4 bg-[#20808D] rounded-full flex-shrink-0" />
          <div>
            <h3 className="font-serif text-base text-stone-900">Deal Risk Analysis</h3>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-medium mt-0.5">Overall Score: {displayScore}/100</p>
          </div>
        </div>

        {/* Score Badge - Matching Style */}
        <div className={cn(
          "px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase border shadow-sm",
          displayScore >= 80 ? "bg-green-50 text-green-700 border-green-200" :
            displayScore >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-red-50 text-red-700 border-red-200"
        )}>
          {displayScore >= 80 ? "Healthy" : displayScore >= 50 ? "Caution" : "High Risk"}
        </div>
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-6 bg-gradient-to-b from-stone-50/30 to-transparent">
        {/* Chart Section - Inset Look */}
        <div className="flex-1 min-h-[300px] relative rounded-xl inset-skeu p-2 bg-stone-50/50">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" strokeDasharray="4 4" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#57534e', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)' }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Risk Score"
                dataKey="score"
                stroke="#20808D"
                strokeWidth={2}
                fill="#20808D"
                fillOpacity={0.15}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -1px rgb(0 0 0 / 0.03)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#44403c' }}
                cursor={{ stroke: '#20808D', strokeWidth: 1 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Details/Interactive List Section */}
        <div className="flex-1 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {chartData.map((risk) => (
            <div
              key={risk.category}
              onClick={() => handleRiskClick(risk.category)}
              className={cn(
                "p-3 rounded-xl border cursor-pointer transition-all duration-200 relative group/item",
                state?.selectedRisk === risk.category
                  ? "bg-white border-[#20808D]/30 shadow-md ring-1 ring-[#20808D]/10"
                  : "bg-white border-stone-100 hover:border-stone-200 hover:shadow-sm hover:translate-y-[-1px]",
                state?.acknowledgedRisks.includes(risk.category) && "opacity-60 bg-stone-50"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "text-sm font-semibold transition-colors",
                    state?.selectedRisk === risk.category ? "text-[#20808D]" : "text-stone-700"
                  )}>{risk.category}</h4>
                  {state?.acknowledgedRisks.includes(risk.category) && (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border tracking-wider",
                  risk.level === "Critical" ? "bg-red-50 text-red-700 border-red-100" :
                    risk.level === "High" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      risk.level === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                        "bg-green-50 text-green-700 border-green-100"
                )}>
                  {risk.level}
                </span>
              </div>

              {/* Progress Bar - Skeuomorphic */}
              <div className="w-full h-2 rounded-full inset-skeu mb-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                  style={{
                    width: `${risk.score}%`,
                    backgroundColor: risk.level === 'Critical' ? '#ef4444' :
                      risk.level === 'High' ? '#f97316' :
                        risk.level === 'Medium' ? '#eab308' : '#22c55e'
                  }}
                />
              </div>

              {state?.selectedRisk === risk.category && (
                <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600 animate-in fade-in slide-in-from-top-1">
                  <p className="mb-3 leading-relaxed">{getDescription(risk.category)}</p>
                  <button
                    onClick={(e) => handleAcknowledge(risk.category, e)}
                    className="w-full py-1.5 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 hover:border-stone-300 text-stone-600 transition-all active:scale-[0.98]"
                  >
                    {state?.acknowledgedRisks.includes(risk.category) ? "Unmark Resolved" : "Mark as Resolved"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
