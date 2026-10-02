import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-400"></span>
          Kavya Labs
        </Link>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-300 hover:text-white transition">Features</a>
          <button className="text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}