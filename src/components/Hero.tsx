import { Sparkles, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Generation AI Infrastructure
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Supercharge your workflow with <span className="text-cyan-400">intelligent automation</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Kavya Labs builds enterprise-ready AI primitives that streamline data processing, context awareness, and intelligent model deployment.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-cyan-500/20">
            Request Early Access <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-300 border border-slate-800 hover:bg-slate-900 transition"
          >
            Explore Platform
          </a>
        </div>
      </div>
    </section>
  );
}