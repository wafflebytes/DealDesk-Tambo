"use client"

import { useDraggable } from "@dnd-kit/core"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableGenUIProps {
    id: string
    children: React.ReactNode
    className?: string
}

export function DraggableGenUI({ id, children, className, disableDrag = false }: DraggableGenUIProps & { disableDrag?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        disabled: disableDrag,
    })

    // Only apply transform if we are NOT using a DragOverlay, or if we want the item to move. 
    // Since we use DragOverlay in page.tsx, we'll keep the original item in the chat but dim it.
    const style = undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn("relative group/draggable", className, isDragging && "opacity-20 transition-all duration-200 ease-out")}
        >
            {/* Drag Handle - Skeuomorphic & Consistent - Only if drag is enabled */}
            {!disableDrag && (
                <div
                    {...listeners}
                    {...attributes}
                    className="absolute top-3 right-3 z-20 opacity-0 group-hover/draggable:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                >
                    <div className="w-6 h-6 rounded-md bg-white/50 hover:bg-white inset-skeu flex items-center justify-center backdrop-blur-sm shadow-sm border border-stone-200/50">
                        <GripVertical className="w-3.5 h-3.5 text-stone-400 group-hover/draggable:text-stone-600 transition-colors" />
                    </div>
                </div>
            )}

            {children}
        </div>
    )
}
