import { GitBranch, Database, AlertCircle, Link2, Check, ArrowRight } from "lucide-react"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { useTamboComponentState, useTamboThread } from "@tambo-ai/react"
import { ScopingData } from "@/components/genui/schemas"

export function ScopingCard(props: Partial<ScopingData>) {
  // Use local state if props are missing (fallback) or specific override
  const variant = props.variant || 'v1'

  // Hook for sending responses back to the AI
  const { sendThreadMessage } = useTamboThread()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // -- Handlers --
  const handleOptionSelect = async (value: string, label: string) => {
    if (isSubmitting || isSubmitted) return
    setIsSubmitting(true)

    try {
      // Send the choice back to the chat
      await sendThreadMessage(`Selected option: ${label} (${value})`)
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (isSubmitting || isSubmitted) return
    setIsSubmitting(true)

    try {
      // Format form data as a clear instruction:
      const summary = Object.entries(formData)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ')

      // Heuristic to trigger the right agent based on form fields
      let prefix = "Here are the details:"
      if (summary.includes("clause_type")) prefix = "Tune clause with these parameters:"

      await sendThreadMessage(`${prefix} ${summary}`)
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative group/card w-full bg-white rounded-xl">
      {/* Thread Indicator */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-amber-400 opacity-0 group-hover/card:opacity-100 transition-opacity" />
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 transition-opacity">
        <Link2 className="w-3 h-3 text-amber-500" />
      </div>

      <div className="p-5 border-2 border-dashed border-stone-300 rounded-xl bg-gradient-to-b from-[#FDFCF8] to-stone-50/50 relative overflow-hidden transition-all">

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-stone-800">Selection Recorded</p>
            <p className="text-xs text-stone-500">Maven is updating the analysis...</p>
          </div>
        ) : (
          <>
            {variant === 'v1' && <ScopingEnum {...props} onSelect={handleOptionSelect} isSubmitting={isSubmitting} />}
            {variant === 'v2' && <ScopingForm {...props} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />}
            {variant === 'v3' && <ScopingConfirmation {...props} onConfirm={(val) => handleOptionSelect(val, "Confirmed")} isSubmitting={isSubmitting} />}
          </>
        )}

      </div>
    </div>
  )
}

// --- Sub-Components ---

function ScopingEnum({ title, description, options = [], onSelect, isSubmitting }: Partial<ScopingData> & { onSelect: (v: string, l: string) => void, isSubmitting: boolean }) {
  return (
    <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0 shadow-inner border border-stone-200/50">
        <GitBranch className="w-5 h-5 text-stone-600" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-stone-900 mb-1">{title}</h4>
        <p className="text-xs text-stone-500 mb-4 leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-2">
          {options.map((opt, i) => (
            <button
              key={`${opt.value}-${i}`}
              disabled={isSubmitting}
              onClick={() => onSelect(opt.value, opt.label)}
              className="min-h-[2rem] h-auto py-1.5 px-4 text-xs tracking-tight rounded-lg btn-skeu text-stone-700 font-medium hover:text-stone-900 active:scale-95 transition-all disabled:opacity-50 whitespace-normal text-center bg-stone-50 border border-stone-200 shadow-sm hover:shadow hover:bg-white"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScopingForm({ title, description, formFields = [], submitLabel, onSubmit, isSubmitting }: Partial<ScopingData> & { onSubmit: (data: any) => void, isSubmitting: boolean }) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-4 border-b border-stone-200/50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0 shadow-inner border border-stone-200/50">
          <Database className="w-5 h-5 text-stone-600 drop-shadow-sm" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-stone-900 mb-1">{title}</h4>
          <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {formFields.map((field) => (
            <div key={field.id} className={formFields.length % 2 !== 0 && field === formFields[formFields.length - 1] ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
              <Label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold px-0.5">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </Label>
              {field.type === 'boolean' ? (
                <div className="flex p-1 rounded-lg inset-skeu">
                  <button
                    onClick={() => handleChange(field.id, true)}
                    className={`flex-1 min-w-[40px] py-1.5 text-xs font-medium rounded-md transition-all ${formData[field.id] === true ? 'bg-white shadow-sm text-stone-900 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
                  >Yes</button>
                  <button
                    onClick={() => handleChange(field.id, false)}
                    className={`flex-1 min-w-[40px] py-1.5 text-xs font-medium rounded-md transition-all ${formData[field.id] === false ? 'bg-white shadow-sm text-stone-900 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
                  >No</button>
                </div>
              ) : field.type === 'select' && field.options ? (
                <div className="relative">
                  <select
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full input-skeu font-mono text-xs appearance-none pr-8 cursor-pointer"
                  >
                    <option value="" disabled>Select...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full input-skeu font-mono"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/50">
        <button
          disabled={isSubmitting}
          onClick={() => onSubmit(formData)}
          className="px-4 py-2 rounded-lg text-xs font-bold btn-skeu-dark shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {submitLabel || "Submit Details"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function ScopingConfirmation({ title, description, options = [], onConfirm, isSubmitting }: Partial<ScopingData> & { onConfirm: (v: string) => void, isSubmitting: boolean }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0 shadow-inner border border-stone-200/50">
          <AlertCircle className="w-5 h-5 text-stone-600 drop-shadow-sm" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-stone-900 mb-1">{title}</h4>
          <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-1">Confirmation Required</Label>

        <div className="flex flex-wrap gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onConfirm(opt.value)}
              disabled={isSubmitting}
              className={`flex-1 min-w-[100px] min-h-[2.25rem] h-auto py-1.5 px-4 text-xs tracking-tight rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 whitespace-normal text-center ${opt.destructive
                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-sm'
                : 'btn-skeu text-stone-600'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
