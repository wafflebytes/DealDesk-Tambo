"use client"

import { GitBranch, Database, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Label } from "@/components/ui/label"

type Variant = 'v1' | 'v2' | 'v3'

export function ScopingCard() {
  const [variant, setVariant] = useState<Variant>('v2') // Defaulting to v2 (Form) for demo

  return (
    <div className="relative group/card">
      {/* Developer Toggle - Discreet */}
      <div className="absolute -top-6 right-0 flex items-center gap-1 bg-stone-100/50 p-1 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity">
        <button
          onClick={() => setVariant('v1')}
          className={`px-2 py-0.5 text-[10px] rounded-md transition-all font-medium ${variant === 'v1' ? 'bg-white shadow-sm text-stone-900 ring-1 ring-[#20808D]/30' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Enum
        </button>
        <button
          onClick={() => setVariant('v2')}
          className={`px-2 py-0.5 text-[10px] rounded-md transition-all font-medium ${variant === 'v2' ? 'bg-white shadow-sm text-stone-900 ring-1 ring-[#20808D]/30' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Form
        </button>
        <button
          onClick={() => setVariant('v3')}
          className={`px-2 py-0.5 text-[10px] rounded-md transition-all font-medium ${variant === 'v3' ? 'bg-white shadow-sm text-stone-900 ring-1 ring-[#20808D]/30' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Confirm
        </button>
      </div>

      <div className="p-5 border-2 border-dashed border-stone-300 rounded-xl bg-gradient-to-b from-[#FDFCF8] to-stone-50/50 relative overflow-hidden">

        {/* V1: Enum Selection */}
        {variant === 'v1' && (
          <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0 shadow-inner border border-stone-200/50">
              <GitBranch className="w-5 h-5 text-stone-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-stone-900 mb-1">Select Clause Direction</h4>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                I can draft this clause for you. Which position should we take?
              </p>

              <div className="flex flex-wrap gap-2">
                <button className="h-8 px-4 text-xs tracking-tight rounded-lg btn-skeu text-stone-700 font-medium hover:text-stone-900">
                  Pro-Vendor
                </button>
                <button className="h-8 px-4 text-xs tracking-tight rounded-lg btn-skeu text-stone-700 font-medium hover:text-stone-900">
                  Neutral
                </button>
                <button className="h-8 px-4 text-xs tracking-tight rounded-lg btn-skeu text-stone-700 font-medium hover:text-stone-900">
                  Pro-Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* V2: Multi-Field Form */}
        {variant === 'v2' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-4 border-b border-stone-200/50 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0 shadow-inner border border-stone-200/50">
                <Database className="w-5 h-5 text-stone-600 drop-shadow-sm" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900 mb-1">Database Connection</h4>
                <p className="text-xs text-stone-500 leading-relaxed">I need a few details to set up the connection.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold px-0.5">DB Host <span className="text-red-400">*</span></Label>
                  <input
                    type="text"
                    defaultValue="localhost"
                    className="w-full input-skeu font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold px-0.5">Port <span className="text-red-400">*</span></Label>
                  <input
                    type="text"
                    defaultValue="5432"
                    className="w-full input-skeu font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold px-0.5">Database Name <span className="text-red-400">*</span></Label>
                <input
                  type="text"
                  placeholder="e.g. production_db"
                  className="w-full input-skeu placeholder:text-stone-300"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold px-0.5">Use SSL <span className="text-red-400">*</span></Label>
                <div className="flex p-1 rounded-lg inset-skeu">
                  <button className="flex-1 py-1.5 text-xs font-medium rounded-md bg-white shadow-sm text-stone-900 border border-stone-100">Yes</button>
                  <button className="flex-1 py-1.5 text-xs font-medium rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-colors">No</button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/50">
              <button className="px-4 py-2 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors">
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-medium text-red-500 border border-transparent hover:border-red-100 hover:bg-red-50 transition-colors">
                Decline
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-bold btn-skeu-dark shadow-lg hover:shadow-xl">
                Submit Details
              </button>
            </div>
          </div>
        )}

        {/* V3: Confirmation Dialog */}
        {variant === 'v3' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0 shadow-inner border border-stone-200/50">
                <AlertCircle className="w-5 h-5 text-stone-600 drop-shadow-sm" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900 mb-1">Delete 47 log files?</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  This action is irreversible. These files will be permanently removed from the server history.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-1">Confirm Deletion <span className="text-red-500">*</span></Label>

              <div className="flex gap-2">
                <button className="flex-1 h-9 px-4 text-xs tracking-tight rounded-lg btn-skeu text-stone-500 font-medium hover:text-stone-800 transition-colors">
                  No, Keep Files
                </button>
                <button className="flex-1 h-9 px-4 text-xs tracking-tight rounded-lg btn-skeu text-red-600 font-medium hover:text-red-700 transition-colors">
                  Yes, Proceed
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
