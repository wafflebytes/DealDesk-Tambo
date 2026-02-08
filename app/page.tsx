import Link from "next/link"
import { ArrowRight, LayoutGrid, Scale } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4fafa] via-white to-[#edf3f3]">
      {/* Atmosphere: soft bloom + paper fiber */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, rgba(32, 128, 141, 0.18), transparent 42%), radial-gradient(circle at 78% 28%, rgba(13, 61, 67, 0.08), transparent 45%), radial-gradient(circle at 58% 92%, rgba(245, 158, 11, 0.10), transparent 40%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(13, 61, 67, 0.55) 0px, rgba(13, 61, 67, 0.55) 1px, transparent 1px, transparent 7px), repeating-linear-gradient(90deg, rgba(13, 61, 67, 0.35) 0px, rgba(13, 61, 67, 0.35) 1px, transparent 1px, transparent 11px)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <section className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-3 rounded-2xl px-4 py-2 card-skeu">
              <div className="w-9 h-9 rounded-xl inset-skeu bg-white flex items-center justify-center border border-stone-200/60">
                <Scale className="w-5 h-5 text-[#20808D]" strokeWidth={2.2} />
              </div>
              <div className="leading-tight">
                <div
                  className="font-serif text-[18px] tracking-[-0.03em] text-[#0d3d43]"
                  style={{ fontWeight: 560 }}
                >
                  The Deal Desk
                </div>
                <div className="text-xs font-medium text-stone-500">Tactile contract workspace</div>
              </div>
            </div>

            <h1
              className="mt-7 font-serif text-[40px] md:text-[54px] leading-[1.02] tracking-[-0.05em] text-stone-900"
              style={{ fontWeight: 650 }}
            >
              A desk, not a dashboard.
            </h1>

            <p className="mt-4 max-w-[42ch] text-[15px] md:text-[16px] leading-relaxed text-stone-600 font-medium">
              Upload a contract, draft in place, and pull in intelligent modules like Risk Radar and Clause Tuner
              when you need them.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/deal-desk"
                className="btn-skeu-dark rounded-xl px-5 py-3 text-sm font-bold tracking-tight shadow-lg hover:shadow-xl active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                Open the workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/components"
                className="btn-skeu rounded-xl px-5 py-3 text-sm font-semibold text-stone-700 hover:text-stone-900 active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                Component gallery
                <LayoutGrid className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-500">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#20808D] shadow-[0_0_0_3px_rgba(32,128,141,0.12)]" />
                Skeuomorphic UI system
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500/80 shadow-[0_0_0_3px_rgba(245,158,11,0.14)]" />
                Fast, local-first demo
              </span>
            </div>
          </section>

          <aside className="relative animate-in fade-in slide-in-from-right-6 duration-700">
            {/* Paper stack */}
            <div className="absolute -right-6 -top-8 h-[520px] w-[520px] rounded-[56px] opacity-50 blur-2xl bg-[#20808D]/10" />

            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-[1.2deg] rounded-[32px] bg-white/70 border border-stone-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)]" />
              <div className="absolute inset-0 -translate-x-2 translate-y-4 -rotate-[1.1deg] rounded-[32px] bg-[#fffdf7]/80 border border-stone-200/70 shadow-[0_10px_36px_rgba(0,0,0,0.05)]" />

              <div className="relative rounded-[32px] card-skeu p-6 md:p-7 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-0 opacity-[0.55]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 10%, rgba(32, 128, 141, 0.18), transparent 45%), radial-gradient(circle at 70% 80%, rgba(13, 61, 67, 0.07), transparent 44%)",
                    }}
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl knob-skeu">
                        <div className="w-6 h-6 rounded-xl bg-[#20808D] shadow-[0_10px_18px_rgba(32,128,141,0.22)]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900 tracking-tight">Workspace</div>
                        <div className="text-xs font-medium text-stone-500">Drop in modules as you work</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl btn-skeu flex items-center justify-center text-stone-500">
                        <span className="block w-3 h-3 rounded-sm bg-stone-300 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]" />
                      </div>
                      <div className="w-8 h-8 rounded-xl btn-skeu flex items-center justify-center text-stone-500">
                        <span className="block w-4 h-1 rounded-full bg-stone-300 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl inset-skeu p-3 bg-stone-50/60 border border-stone-200/60">
                    <div className="flex items-center justify-between">
                      <div className="h-2.5 w-24 rounded-full bg-stone-300/70" />
                      <div className="h-2.5 w-16 rounded-full bg-[#20808D]/35" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-xl bg-white/70 border border-stone-200/60 shadow-sm" />
                      <div className="h-16 rounded-xl bg-white/70 border border-stone-200/60 shadow-sm" />
                      <div className="h-16 rounded-xl bg-white/70 border border-stone-200/60 shadow-sm" />
                    </div>
                    <div className="mt-3 h-24 rounded-xl bg-white/70 border border-stone-200/60 shadow-sm" />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-xs font-semibold text-stone-600">
                      “Feels like a real desk.”
                    </div>
                    <div className="w-12 h-12 rounded-full btn-skeu-dark flex items-center justify-center shadow-lg">
                      <span className="font-serif text-[18px] leading-none">D</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-16 text-center text-xs text-stone-400">
          <span className="font-medium">Tip:</span> bookmark the workspace at
          <span className="mx-1 font-mono text-stone-500">/deal-desk</span>
        </footer>
      </div>
    </main>
  )
}
