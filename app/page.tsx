import Link from "next/link"
import { ArrowRight, Scale, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4fafa] via-white to-[#edf3f3]">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[-15%] h-[520px] w-[520px] rounded-full bg-[#20808D]/15 blur-3xl" />
        <div className="absolute -bottom-48 right-[-10%] h-[640px] w-[640px] rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.65),transparent_50%)]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 sm:px-6 py-10 sm:py-14">
        {/* Mark */}
        <div className="flex items-center gap-3 animate-in fade-in duration-500">
          <div className="knob-skeu flex h-11 w-11 items-center justify-center rounded-2xl">
            <Scale className="h-5 w-5 text-[#20808D]" strokeWidth={2} />
          </div>

          <div className="leading-none">
            <div
              className="font-serif text-[24px] sm:text-[28px] tracking-[-0.04em] text-[#0d3d43]"
              style={{ fontWeight: 550 }}
            >
              The Deal Desk
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Legal AI workspace
            </div>
          </div>
        </div>

        <div className="mt-10 grid w-full grid-cols-1 gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          {/* Copy */}
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <h1
              className="font-serif text-[38px] sm:text-[46px] leading-[1.02] tracking-[-0.05em] text-stone-900"
              style={{ fontWeight: 550 }}
            >
              A desk for contracts.
              <span className="block text-[#0d3d43]">Quiet, tactile, precise.</span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600">
              Drop in an agreement and work it like a craft: risks surfaced, clauses tuned, definitions clarified —
              all in one skeuomorphic workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/desk"
                className="btn-skeu-dark inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20808D]/40"
              >
                Open Deal Desk
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/components"
                className="btn-skeu inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
              >
                Browse components
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
              <span className="inset-skeu rounded-full bg-white/50 px-3 py-1">Draft</span>
              <span className="inset-skeu rounded-full bg-white/50 px-3 py-1">Negotiate</span>
              <span className="inset-skeu rounded-full bg-white/50 px-3 py-1">Explain</span>
              <span className="inset-skeu rounded-full bg-white/50 px-3 py-1">Track obligations</span>
            </div>
          </section>

          {/* Tactile preview */}
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
            <div className="relative">
              {/* Paper stack */}
              <div className="absolute left-3 top-3 h-full w-full rounded-[28px] bg-white/45 blur-[0.2px]" />
              <div className="absolute left-1.5 top-1.5 h-full w-full rounded-[28px] bg-white/60" />

              <div className="card-skeu relative rounded-[28px] border border-white/70 bg-white/80 p-5 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow-[0_0_0_1px_rgba(120,53,15,0.20)_inset]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_0_1px_rgba(20,83,45,0.18)_inset]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-sky-400/80 shadow-[0_0_0_1px_rgba(12,74,110,0.18)_inset]" />
                  </div>

                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Workspace
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="inset-skeu rounded-2xl bg-white/40 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Upload
                    </div>
                    <div className="mt-1 text-sm font-medium text-stone-800">Acme MSA.pdf</div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200/80">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#20808D] to-[#2ba6b7]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="card-skeu rounded-2xl p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Risk
                      </div>
                      <div className="mt-2 text-xl font-semibold text-stone-900">3</div>
                      <div className="mt-1 text-xs text-stone-500">flags</div>
                    </div>
                    <div className="card-skeu rounded-2xl p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Clauses
                      </div>
                      <div className="mt-2 text-xl font-semibold text-stone-900">12</div>
                      <div className="mt-1 text-xs text-stone-500">tunable</div>
                    </div>
                    <div className="card-skeu rounded-2xl p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Terms
                      </div>
                      <div className="mt-2 text-xl font-semibold text-stone-900">7</div>
                      <div className="mt-1 text-xs text-stone-500">defined</div>
                    </div>
                  </div>

                  <div className="inset-skeu rounded-2xl bg-white/40 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Next
                      </div>
                      <div className="rounded-full bg-[#20808D]/10 px-2 py-1 text-[11px] font-semibold text-[#0d3d43]">
                        Suggested
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-stone-800">
                      Tighten limitation of liability.
                    </div>
                    <div className="mt-1 text-xs text-stone-500">
                      Safer cap, clearer carve-outs, calmer negotiation.
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs font-medium text-stone-500">
                    Built for focus. No dashboards.
                  </div>

                  <Link
                    href="/desk"
                    className="btn-skeu rounded-full px-3 py-1.5 text-xs font-semibold text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
                  >
                    Launch
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-10 text-xs text-stone-400 animate-in fade-in duration-700 delay-300">
          <span className="font-medium">Tip:</span> start by opening the desk, then upload an agreement.
        </footer>
      </main>
    </div>
  )
}
