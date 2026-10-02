export default function Footer() {
  return (
    <footer className="border-t border-slate-900 py-10 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Kavya Labs, Inc. Bengaluru, India. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
          <a href="#" className="hover:text-slate-300 transition">Documentation</a>
        </div>
      </div>
    </footer>
  );
}