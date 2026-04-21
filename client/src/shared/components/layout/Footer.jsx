import { Link } from 'react-router-dom';

const platformLinks = [
  { label: 'Browse Skills',  to: '/skills' },
  { label: 'Find a Tutor',   to: '/skills' },
  { label: 'My Sessions',    to: '/sessions' },
  { label: 'My Profile',     to: '/profile' },
];

const supportLinks = [
  { label: 'How it Works',  to: '#' },
  { label: 'FAQ',           to: '#' },
  { label: 'Contact Us',    to: '#' },
  { label: 'Report Issue',  to: '#' },
];

function NavLink({ to, label, external }) {
  const cls = 'group flex items-center gap-1.5 text-slate-200 hover:text-purple-400 transition-all duration-200 text-xs font-medium';
  const inner = (
    <>
      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">{label}</span>
    </>
  );
  return external
    ? <a href={to} className={cls} target="_blank" rel="noreferrer">{inner}</a>
    : <Link to={to} className={cls}>{inner}</Link>;
}

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] w-full">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">PeerPulse</h2>
              <div className="h-0.5 w-12 mt-1 rounded-full bg-gradient-to-r from-purple-500 to-violet-400" />
            </div>
            <p className="text-white font-medium text-xs mb-1.5">
              Learn from peers. Teach what you know.
            </p>
            <p className="text-white text-xs leading-relaxed mb-4">
              A peer-to-peer learning platform built exclusively for SLIIT students to share skills, book sessions, and grow together.
            </p>
            <p className="text-white text-[11px]">&copy; {new Date().getFullYear()} PeerPulse. All rights reserved.</p>
          </div>

          {/* Col 2 — Platform */}
          <div>
            <p className="text-white/70 uppercase text-[10px] font-semibold tracking-widest mb-3">Platform</p>
            <ul className="space-y-2">
              {platformLinks.map(l => (
                <li key={l.label}><NavLink to={l.to} label={l.label} /></li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Support */}
          <div>
            <p className="text-white/70 uppercase text-[10px] font-semibold tracking-widest mb-3">Support</p>
            <ul className="space-y-2">
              {supportLinks.map(l => (
                <li key={l.label}><NavLink to={l.to} label={l.label} /></li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Connect */}
          <div>
            <p className="text-white/70 uppercase text-[10px] font-semibold tracking-widest mb-3">Connect</p>
            <div className="space-y-3">
              {/* SLIIT badge */}
              <span className="inline-flex items-center gap-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                SLIIT Students
              </span>

              {/* Email */}
              <a href="mailto:peerpulse@my.sliit.lk"
                className="flex items-center gap-2 text-white hover:text-purple-400 transition-all duration-200 text-xs group">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                peerpulse@my.sliit.lk
              </a>

              {/* Social icons */}
              <div className="flex gap-2 mt-1">
                {/* GitHub */}
                <a href="#" target="_blank" rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" target="_blank" rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="text-white text-xs">&copy; {new Date().getFullYear()} PeerPulse &middot; All rights reserved</p>
          <p className="text-white text-xs">Built with purpose by SLIIT Students</p>
        </div>

      </div>
    </footer>
  );
}
