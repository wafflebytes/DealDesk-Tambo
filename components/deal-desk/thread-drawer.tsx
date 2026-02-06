"use client"

import { useState, useEffect, useCallback } from "react"
import { useTamboThread, useTamboThreadList, type TamboThread } from "@tambo-ai/react"
import { X, Plus, MessageSquare, Sparkles, ChevronRight } from "lucide-react"

interface ThreadDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export function ThreadDrawer({ isOpen, onClose }: ThreadDrawerProps) {
    const { data: threads, isLoading, refetch } = useTamboThreadList()
    const {
        thread: currentThread,
        switchCurrentThread,
        startNewThread,
        generateThreadName
    } = useTamboThread()

    const [searchQuery, setSearchQuery] = useState("")

    // Handle new thread creation
    const handleNewThread = useCallback(async () => {
        try {
            await startNewThread()
            await refetch()
            onClose()
        } catch (error) {
            console.error("Failed to create new thread:", error)
        }
    }, [startNewThread, refetch, onClose])

    // Handle switching threads
    const handleSwitchThread = useCallback(async (threadId: string) => {
        try {
            switchCurrentThread(threadId)
            onClose()
        } catch (error) {
            console.error("Failed to switch thread:", error)
        }
    }, [switchCurrentThread, onClose])

    // Auto-generate name for threads without one
    const handleGenerateName = useCallback(async (thread: TamboThread) => {
        try {
            await generateThreadName(thread.id)
            await refetch()
        } catch (error) {
            console.error("Failed to generate name:", error)
        }
    }, [generateThreadName, refetch])

    // Filter and deduplicate threads by search
    const filteredThreads = (() => {
        const items = (threads?.items as any[]) || []
        const unique = new Map<string, TamboThread>()

        items.forEach(thread => {
            if (!unique.has(thread.id)) {
                unique.set(thread.id, thread)
            }
        })

        return Array.from(unique.values()).filter((thread: TamboThread) => {
            if (!searchQuery.trim()) return true
            const name = thread.name || `Thread ${thread.id.substring(0, 8)}`
            return name.toLowerCase().includes(searchQuery.toLowerCase())
        })
    })()

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    }

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown)
            return () => document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen, onClose])

    return (
        <>
            {/* Backdrop */}
            {/* Backdrop - Absolute to parent now to stay inside chat container */}
            <div
                className={`absolute inset-0 z-40 bg-stone-900/10 backdrop-blur-[1px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            {/* Drawer - Fixed width 320px (w-80) to take up less space */}
            <div
                className={`absolute left-0 top-0 bottom-0 z-50 w-80 bg-[#FDFCF8] shadow-[4px_0_24px_rgba(0,0,0,0.08)] border-r border-stone-200/50 transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-200/60 bg-gradient-to-b from-white to-stone-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8f5f6] to-[#d4eeef] ring-1 ring-[#20808D]/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-[#20808D]" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg font-bold text-stone-800 tracking-tight">Conversations</h2>
                            <p className="text-[10px] text-stone-500 font-medium">
                                {threads?.items?.length || 0} threads
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg btn-skeu flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* New Thread Button */}
                <div className="px-4 py-3 border-b border-stone-100">
                    <button
                        onClick={handleNewThread}
                        className="w-full h-11 bg-gradient-to-b from-[#2595a3] to-[#1e7883] hover:from-[#2ab3c4] hover:to-[#228996] text-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,0.2)_inset] border-t border-white/20 active:scale-[0.98] active:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.1)_inset] transition-all flex items-center justify-center gap-2 font-bold text-sm group"
                    >
                        <Plus className="w-4 h-4 drop-shadow-md group-hover:scale-110 transition-transform" />
                        <span className="drop-shadow-md tracking-wide">New Conversation</span>
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-stone-100">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 px-4 input-skeu bg-white text-sm placeholder:text-stone-400"
                    />
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto py-2 px-3 max-h-[calc(100vh-220px)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-[#20808D] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredThreads.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-stone-500">
                                {searchQuery ? "No matching conversations" : "No conversations yet"}
                            </p>
                            <p className="text-xs text-stone-400 mt-1">
                                {searchQuery ? "Try a different search" : "Start a new conversation to begin"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredThreads.map((thread: TamboThread) => {
                                const isActive = currentThread?.id === thread.id
                                const threadName = thread.name || `Thread ${thread.id.substring(0, 8)}`
                                const hasGeneratedName = !!thread.name

                                return (
                                    <div
                                        key={thread.id}
                                        onClick={() => handleSwitchThread(thread.id)}
                                        className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${isActive
                                            ? "bg-white border-stone-200 shadow-sm ring-1 ring-[#20808D]/10 card-skeu"
                                            : "border-transparent hover:bg-white hover:border-stone-100 hover:shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner ${isActive
                                                ? "bg-gradient-to-br from-[#e8f5f6] to-[#d4eeef] text-[#20808D] ring-1 ring-[#20808D]/10"
                                                : "bg-stone-100 text-stone-400 group-hover:bg-stone-50 group-hover:text-stone-500"
                                                }`}>
                                                <MessageSquare className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-medium truncate ${isActive ? "text-[#20808D]" : "text-stone-700"
                                                        }`}>
                                                        {threadName}
                                                    </p>
                                                    {isActive && (
                                                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#20808D] bg-[#20808D]/10 px-1.5 py-0.5 rounded">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-stone-400 mt-0.5">
                                                    {formatDate(thread.createdAt)}
                                                </p>
                                            </div>

                                            {/* Generate name button for unnamed threads */}
                                            {!hasGeneratedName && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleGenerateName(thread)
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 shrink-0 w-7 h-7 rounded-lg bg-stone-100 hover:bg-[#20808D]/10 flex items-center justify-center text-stone-400 hover:text-[#20808D] transition-all"
                                                    title="Generate name with AI"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                </button>
                                            )}

                                            <ChevronRight className={`w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "text-[#20808D]" : "text-stone-300"
                                                }`} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-gradient-to-t from-[#FDFCF8] to-transparent">
                    <p className="text-[10px] text-stone-400 text-center">
                        Powered by Maven AI
                    </p>
                </div>
            </div>
        </>
    )
}
