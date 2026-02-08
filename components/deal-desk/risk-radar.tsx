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
  Legend
} from "recharts";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { DealRiskSchema } from "@/components/genui/schemas";
import { CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { Slider } from "@/components/ui/slider";

export type RiskRadarProps = z.infer<typeof DealRiskSchema> &
  React.HTMLAttributes<HTMLDivElement> & {
    overallScore?: number;
  };

type RiskRadarState = {
  // Overrides for risk scores (user adjusted)
  riskOverrides: Record<string, number>;
  // Set of resolved risks
  resolvedRisks: string[];
  // Expanded card for details
  expandedCategory: string | null;
  // Sections collapse state
  isFactorsCollapsed: boolean;
  // Tracking if changes were made
  hasChanges: boolean;
};

// Mock suggestions for the demo
const FAILSAFE_SUGGESTIONS: Record<string, string> = {
  "Liability": "Cap liability at 2x fees paid in the last 12 months instead of unlimited. Add a super cap for data breach.",
  "Indemnification": "Limit IP indemnification to final deliverables only. Remove 'all claims' broad language.",
  "Termination": "Add a 30-day cure period before termination for cause. Ensure mutual termination for convenience.",
  "Payment": "Adjust payment terms to Net 45 to align with company standard. Add late fee cap.",
  "IP Rights": "Retain background IP rights. Grant license only for deliverables upon full payment.",
  "Confidentiality": "Limit duration to 3 years post-term. Exclude standard residuals.",
  "SLA": "Reduce uptime guarantee to 99.5% excluding maintenance windows. Cap service credits at 10% monthly fees."
};

export function RiskRadar({
  risks,
  followUps,
  overallScore,
  className,
  ...props
}: RiskRadarProps) {
  const [state, setState] = useTamboComponentState<RiskRadarState>(
    "risk-radar-premium-v2",
    {
      riskOverrides: {},
      resolvedRisks: [],
      expandedCategory: null,
      isFactorsCollapsed: true,
      hasChanges: false
    }
  );

  const safeRisks = risks || {};

  // Merge initial risks with overrides
  const currentRisks = { ...safeRisks, ...(state?.riskOverrides || {}) };
  const riskValues = Object.values(currentRisks);

  const hasResolvedAll = Object.keys(currentRisks).length > 0 &&
    Object.keys(currentRisks).every(k => state?.resolvedRisks.includes(k));

  const calculatedScore = riskValues.length > 0
    ? Math.round((riskValues.reduce((a, b) => a + (1 - b), 0) / riskValues.length) * 100)
    : 0;

  const displayScore = overallScore !== undefined ? overallScore : (hasResolvedAll ? 100 : calculatedScore);

  // Grade Calculation
  const getGrade = (score: number) => {
    if (score >= 95) return { grade: "A+", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 90) return { grade: "A", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 80) return { grade: "B", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    if (score >= 70) return { grade: "C", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    if (score >= 60) return { grade: "D", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    return { grade: "F", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const currentGrade = getGrade(displayScore);

  // Handlers
  const toggleExpand = (category: string) => {
    setState({
      ...state!,
      expandedCategory: state?.expandedCategory === category ? null : category
    });
  };

  const toggleFactors = () => {
    setState({
      ...state!,
      isFactorsCollapsed: !state?.isFactorsCollapsed
    });
  };

  const handleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState({
      ...state!,
      isFactorsCollapsed: true,
      hasChanges: false
    });
  };

  const applyAiFix = () => {
    // "Balance" sliders: Set all to a low risk value (e.g. 0.15)
    const balancedOverrides: Record<string, number> = {};
    Object.keys(safeRisks).forEach(cat => {
      balancedOverrides[cat] = 0.15;
    });

    setState({
      ...state!,
      riskOverrides: balancedOverrides,
      isFactorsCollapsed: false, // Expand to show the change
      hasChanges: true
    });
  };

  const applyFix = (category: string) => {
    // "Applying fix" means setting risk to 0 (resolved)
    const current = state?.resolvedRisks || [];
    const isResolved = current.includes(category);

    if (!isResolved) {
      setState({
        ...state!,
        riskOverrides: state?.riskOverrides || {},
        resolvedRisks: [...current, category],
        expandedCategory: null, // Close after fixing
        hasChanges: true
      });
    }
  };

  const undoFix = (category: string) => {
    const current = state?.resolvedRisks || [];
    setState({
      ...state!,
      riskOverrides: state?.riskOverrides || {},
      resolvedRisks: current.filter(c => c !== category),
      expandedCategory: null,
      hasChanges: true
    });
  };

  const updateRiskScore = (category: string, newVal: number[]) => {
    const value = newVal[0] / 100;
    setState({
      ...state!,
      riskOverrides: {
        ...(state?.riskOverrides || {}),
        [category]: value
      },
      hasChanges: true
    });
  };

  // Chart Data Preparation
  const chartData = Object.entries(currentRisks).map(([category, score]) => {
    const isResolved = state?.resolvedRisks.includes(category);
    return {
      category,
      value: isResolved ? 0 : score * 100, // Current Risk Level
      optimal: 10, // "Safe Harbor" (always small risk)
      fullMark: 100,
    };
  });

  return (
    <div className={cn("rounded-2xl card-skeu overflow-hidden w-full bg-white ring-1 ring-stone-900/5", className)} {...props}>
      {/* 1. Header Section - Standard Skeuomorphic (Matches ClauseTuner) */}
      <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl inset-skeu flex items-center justify-center bg-stone-50">
            <ShieldCheck className="w-5 h-5 text-[#20808D]" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900 leading-tight">Risk Assessment</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Deal Health</span>
              {currentGrade.grade !== 'F' && (
                <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md", currentGrade.bg, currentGrade.color)}>
                  {currentGrade.grade} Grade
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "px-3 py-1 rounded-lg inset-skeu bg-white flex items-center gap-2",
            currentGrade.border
          )}>
            <span className={cn("text-xl font-bold font-serif tabular-nums", currentGrade.color)}>
              {displayScore}
            </span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">%</span>
          </div>
        </div>
      </div>
      <div className="p-0">

        {/* Radar Chart Container */}
        <div className="bg-gradient-to-b from-stone-50/30 to-white border-b border-stone-100 p-4 relative">
          <div className="h-[260px] w-full relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid gridType="polygon" stroke="#e7e5e4" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: '#78716c', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-sans)' }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                  {/* Safe Harbor Overlay (Gray/Green Zone) */}
                  <Radar
                    name="Safe Harbor"
                    dataKey="optimal"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    fill="#10b981"
                    fillOpacity={0.1}
                  />

                  {/* Current Risk (Dynamic) */}
                  <Radar
                    name="Current Risk"
                    dataKey="value"
                    stroke="#20808D"
                    strokeWidth={3}
                    fill="#20808D"
                    fillOpacity={0.25}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: '#78716c' }}
                    iconSize={8}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                <ShieldCheck className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-xs font-medium uppercase tracking-widest">No Risk Data</p>
              </div>
            )}
          </div>

          {/* AI Fix Header Action */}
          <div className="absolute top-4 right-4">
            <button
              onClick={applyAiFix}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-[#20808D] text-stone-600 hover:text-[#20808D] text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <Wand2 className="w-3 h-3" />
              AI Fix
            </button>
          </div>
        </div>

        {/* 3. Action List */}
        <div className="divide-y divide-stone-100">
          {/* Section Header */}
          <div
            onClick={toggleFactors}
            className="px-4 py-3 bg-stone-50/30 flex items-center justify-between cursor-pointer group/header"
          >
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Risk Factors</h4>

            {state?.hasChanges ? (
              <button
                onClick={handleDone}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all animate-in zoom-in duration-200"
              >
                <CheckCircle className="w-3 h-3" />
                Done
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-300 group-hover/header:text-stone-500 transition-colors">
                  {state?.isFactorsCollapsed ? 'View All' : 'Collapse'}
                </span>
                {state?.isFactorsCollapsed ? <ChevronDown className="w-3 h-3 text-stone-300" /> : <ChevronUp className="w-3 h-3 text-stone-300" />}
              </div>
            )}
          </div>

          {!state?.isFactorsCollapsed && Object.entries(currentRisks).map(([category, score]) => {
            const isResolved = state?.resolvedRisks.includes(category);
            const isExpanded = state?.expandedCategory === category;
            const riskLevel = score >= 0.7 ? 'Critical' : score >= 0.4 ? 'Medium' : 'Low';

            return (
              <div key={category} className={cn(
                "bg-white transition-colors hover:bg-stone-50/50 group/row",
                isExpanded && "bg-stone-50"
              )}>
                <div
                  className="py-3 px-4 flex items-center justify-between group/item"
                >
                  <div className="flex items-center gap-3 w-[40%]">
                    <div
                      onClick={() => toggleExpand(category)}
                      className="cursor-pointer flex items-center gap-3"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full ring-2 ring-offset-2 transition-colors shrink-0",
                        isResolved ? "bg-stone-300 ring-stone-100" :
                          riskLevel === 'Critical' ? "bg-rose-500 ring-rose-100" :
                            riskLevel === 'Medium' ? "bg-amber-400 ring-amber-100" :
                              "bg-emerald-400 ring-emerald-100"
                      )} />
                      <span className={cn(
                        "font-medium text-sm text-stone-700 truncate",
                        isResolved && "text-stone-400 line-through"
                      )}>{category}</span>
                    </div>
                  </div>

                  {/* Inline Controls (Visible) */}
                  {!isResolved ? (
                    <div className="flex items-center gap-4 flex-1 justify-end">
                      <div className="w-24 on-drag-stop-propagation" onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                        <Slider
                          value={[score * 100]}
                          max={100}
                          step={1}
                          onValueChange={(val) => updateRiskScore(category, val)}
                          className="py-1"
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-bold tabular-nums w-8 text-right",
                        riskLevel === 'Critical' ? "text-rose-600" : "text-stone-500"
                      )}>{Math.round(score * 100)}%</span>

                      <button onClick={() => toggleExpand(category)} className="p-1 hover:bg-stone-100 rounded-md transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-300" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                      <button onClick={() => toggleExpand(category)} className="p-1 hover:bg-stone-100 rounded-md transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-300" />}
                      </button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="p-3 bg-stone-50 rounded-xl inset-skeu border border-stone-200/50">

                      {!isResolved ? (
                        <>
                          {/* AI Recommendation - Compact */}
                          {/* Compact Recommendation Only */}
                          <div className="flex gap-3 items-start">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                              <Wand2 className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-stone-600 leading-relaxed font-medium mb-1.5">
                                {FAILSAFE_SUGGESTIONS[category] || `Consider adding a cap.`}
                              </p>
                              <button
                                onClick={() => applyFix(category)}
                                className="group flex items-center gap-1.5 text-[10px] font-bold text-[#20808D] hover:text-[#1a6b76] uppercase tracking-wider transition-colors"
                              >
                                <span>Use Smart Fix</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-stone-500 mb-3">This risk has been mitigated by recent changes.</p>
                          <button
                            onClick={() => undoFix(category)}
                            className="text-xs font-semibold text-stone-400 hover:text-stone-600 underline decoration-stone-300 underline-offset-4"
                          >
                            Revert Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
                }
              </div>
            )
          })}
        </div>
      </div>
    </div >
  );
}
