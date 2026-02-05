"use client"

import { useState } from "react"
import { Check, ClipboardList, AlertCircle, ArrowRight, GripVertical, Link2 } from "lucide-react"

interface TaskItem {
    id: string
    text: string
    source: string
    completed: boolean
    priority: "high" | "medium" | "low"
}

export function ExtractionChecklist() {
    const [tasks, setTasks] = useState<TaskItem[]>([
        { id: "1", text: "Provider MUST deliver Phase 1 report by Jan 30", source: "Section 4.1", completed: false, priority: "high" },
        { id: "2", text: "Client SHALL provide access to server logs", source: "Section 4.3", completed: true, priority: "medium" },
        { id: "3", text: "Payment MUST be processed within 30 days", source: "Section 5.2", completed: false, priority: "high" },
        { id: "4", text: "Provider to conduct weekly status calls", source: "Section 2.1", completed: false, priority: "low" },
    ])

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    }

    const completedCount = tasks.filter(t => t.completed).length
    const progress = (completedCount / tasks.length) * 100

    return (
        <div className="rounded-xl card-skeu group relative overflow-hidden w-full min-w-0">


            {/* Thread Indicator */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 group-hover:opacity-100 transition-opacity">
                <Link2 className="w-3 h-3 text-amber-500" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#20808D] rounded-full" />
                    <h3 className="font-serif text-base text-stone-900">Obligations</h3>
                </div>
                <div className="text-[10px] font-bold tracking-wide text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 shadow-sm transition-transform duration-300 ease-out group-hover:-translate-x-8 will-change-transform">
                    {completedCount}<span className="text-stone-300 mx-0.5">/</span>{tasks.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-0.5 w-full bg-stone-100">
                <div
                    className="h-full bg-[#20808D] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(32,128,141,0.4)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content */}
            <div className="p-4 bg-gradient-to-b from-stone-50/30 to-transparent space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`group/item relative flex items-start gap-3.5 p-3 rounded-xl transition-all cursor-pointer border ${task.completed
                            ? "bg-transparent border-transparent opacity-60 hover:opacity-100"
                            : "bg-white border-stone-100 shadow-sm hover:border-[#20808D]/20 hover:shadow-md hover:translate-y-[-1px]"
                            }`}
                    >
                        {/* Checkbox */}
                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${task.completed
                            ? "bg-[#20808D] border-[#20808D] text-white"
                            : "bg-stone-50 border-stone-200 text-transparent group-hover/item:border-[#20808D]/40 group-hover/item:bg-white"
                            }`}>
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-relaxed transition-all ${task.completed ? "text-stone-500 line-through decoration-stone-300" : "text-stone-800"
                                }`}>
                                {task.text}
                            </p>

                            {/* Visual Metadata - ALWAYS VISIBLE */}
                            {!task.completed && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1.5 bg-stone-100/80 px-2 py-0.5 rounded border border-stone-200/50">
                                        {task.source}
                                    </span>
                                    {task.priority === 'high' && (
                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                                            High Priority
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Action */}
            <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/30 text-center">
                <button className="text-[11px] font-bold text-[#20808D] hover:text-[#165a63] transition-colors uppercase tracking-widest flex items-center justify-center gap-1 mx-auto hover:underline decoration-2 underline-offset-4 decoration-[#20808D]/20">
                    Examine All Obligations <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    )
}
