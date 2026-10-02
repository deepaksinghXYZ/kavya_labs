import { Cpu, ShieldCheck, Zap, Database } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'Custom AI Pipelines',
    desc: 'Fine-tune, orchestrate, and deploy high-performance LLM microservices with zero downtime.',
  },
  {
    icon: Zap,
    title: 'Sub-Millisecond Retrieval',
    desc: 'Hybrid vector search powered by distributed edge indexing for real-time contextual data.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Guardrails',
    desc: 'End-to-end data privacy, continuous prompt audits, and full SOC2 Type II compliance.',
  },
  {
    icon: Database,
    title: 'Universal Integrations',
    desc: 'Drop-in SDKs and REST APIs compatible with PostgreSQL, Snowflake, and S3 out of the box.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">Engineered for Reliability</h2>
          <p className="mt-3 text-slate-400">Everything needed to move from model prototype to production scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}