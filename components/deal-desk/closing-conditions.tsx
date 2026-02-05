"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, GripVertical } from "lucide-react"

interface Task {
  id: string
  number: string
  label: string
  checked: boolean
  section: string
}

const initialTasks: Task[] = [
  { id: "1", number: "I.", label: "Review liability cap", checked: false, section: "Section 4.1" },
  { id: "2", number: "II.", label: "Confirm IP transfer terms", checked: true, section: "Section 5.2" },
  { id: "3", number: "III.", label: "Verify confidentiality period", checked: false, section: "Section 6.1" },
]

export function ClosingConditions() {
  const [tasks, setTasks] = useState(initialTasks)
  
  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, checked: !task.checked } : task
    ))
  }
  
  return (
    <div className="ml-10 rounded-xl card-skeu group relative overflow-hidden">
      {/* Drag Handle */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10">
        <div className="w-6 h-6 rounded-md btn-skeu flex items-center justify-center">
          <GripVertical className="w-3.5 h-3.5 text-stone-400" />
        </div>
      </div>
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/50">
        <h3 className="font-serif text-base text-stone-900 tracking-tight">Closing Conditions</h3>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-1 bg-gradient-to-b from-stone-50/30 to-transparent">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="flex items-center justify-between py-3 border-b border-stone-100/80 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Checkbox 
                id={task.id}
                checked={task.checked}
                onCheckedChange={() => toggleTask(task.id)}
                className="rounded border-stone-300 data-[state=checked]:bg-stone-900 data-[state=checked]:border-stone-900 shadow-sm"
              />
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-sm text-stone-400">{task.number}</span>
                <label 
                  htmlFor={task.id}
                  className={`text-sm cursor-pointer tracking-tight font-medium ${task.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}
                >
                  {task.label}
                </label>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-100/50 transition-all tracking-tight font-medium">
              <span>{task.section}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
