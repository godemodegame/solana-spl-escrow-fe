function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_36%),linear-gradient(180deg,_#0a1017_0%,_#111827_48%,_#f3f4f6_48%,_#f8fafc_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-5 py-3 text-sm text-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="font-semibold tracking-[0.24em] text-teal-300 uppercase">
            SPL Escrow
          </div>
          <div className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-100">
            Devnet Setup In Progress
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-14">
          <div className="space-y-6 text-left text-white">
            <p className="text-sm font-medium tracking-[0.3em] text-teal-300 uppercase">
              Superteam Ukraine bounty
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl leading-none font-semibold tracking-tight text-balance sm:text-6xl">
                Frontend foundation for a Solana SPL-token escrow on Devnet.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                This repository now has the initial Vite, React, TypeScript, and
                Tailwind setup. The next implementation step is wiring wallet
                detection, escrow instructions, and real Devnet transaction flows.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                Vite
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                React 19
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                TypeScript
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                Tailwind CSS
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
              <p className="text-sm font-medium tracking-[0.24em] text-slate-500 uppercase">
                Current scope
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Custom wallet modal with detected providers</li>
                <li>Make-offer form for Token A and Token B swap terms</li>
                <li>Open offers list with take-offer flow</li>
                <li>Devnet transaction status, errors, and Explorer links</li>
              </ul>
            </article>

            <article className="rounded-[2rem] border border-teal-200 bg-teal-50 p-6 shadow-[0_24px_80px_rgba(13,148,136,0.14)]">
              <p className="text-sm font-medium tracking-[0.24em] text-teal-700 uppercase">
                Program
              </p>
              <p className="mt-4 break-all font-mono text-sm leading-6 text-teal-950">
                4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy
              </p>
              <a
                className="mt-5 inline-flex items-center rounded-full bg-teal-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-900"
                href="https://explorer.solana.com/address/4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy?cluster=devnet"
                target="_blank"
                rel="noreferrer"
              >
                View Program On Explorer
              </a>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
