/**
 * PageHeader — reusable hero banner matching the Profile Page top section.
 *
 * Props:
 *   title      {string}        — main heading
 *   subtitle   {string}        — one-line description
 *   badges     {Array<{label, variant}>}  — optional pill badges
 *                variant: 'default' | 'amber' | 'emerald'
 *   action     {ReactNode}     — optional right-side CTA button/link
 */
export default function PageHeader({ title, subtitle, badges = [], action }) {
  const variantCls = {
    default: 'bg-white/10 text-white border border-white/20',
    amber:   'bg-amber-400 text-slate-900',
    emerald: 'bg-emerald-400/80 text-white',
  };

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6d28d9 75%, #7c3aed 100%)' }}>
      {/* dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ph-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ph-grid)" />
      </svg>

      {/* glow orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />

      {/* content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-indigo-200 text-sm mt-2">{subtitle}</p>}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {badges.map(({ label, variant = 'default' }, i) => (
                  <span key={i} className={`text-xs font-semibold px-3 py-1 rounded-full ${variantCls[variant]}`}>
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>

      {/* wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
          <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#f8fafc" />
        </svg>
      </div>
    </div>
  );
}
