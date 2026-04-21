import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';

/* ── custom keyframes ── */
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px)   translateX(0px); }
    33%       { transform: translateY(-40px) translateX(20px); }
    66%       { transform: translateY(20px)  translateX(-15px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes typewriter {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes blink {
    0%, 100% { border-color: #7C3AED; }
    50%       { border-color: transparent; }
  }
  @keyframes particleFloat {
    0%   { transform: translateY(0)    scale(1);   opacity: 0.12; }
    50%  { transform: translateY(-60px) scale(1.2); opacity: 0.18; }
    100% { transform: translateY(-120px) scale(0.8); opacity: 0; }
  }
  @keyframes orbPulse {
    0%, 100% { transform: scale(1)    translate(0, 0); }
    50%       { transform: scale(1.15) translate(10px, -10px); }
  }

  .login-card      { animation: fadeInUp 0.6s ease forwards; }
  .brand-block     { animation: fadeInUp 0.5s ease forwards; }

  .field-stagger-1 { animation: fadeInUp 0.5s ease 0.3s both; }
  .field-stagger-2 { animation: fadeInUp 0.5s ease 0.4s both; }
  .field-stagger-3 { animation: fadeInUp 0.5s ease 0.5s both; }
  .field-stagger-4 { animation: fadeInUp 0.5s ease 0.6s both; }

  .typewriter-text {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    border-right: 2px solid #7C3AED;
    width: 0;
    animation: typewriter 0.8s steps(10, end) 0.2s forwards,
               blink      0.7s step-end      1.1s 4;
  }

  .login-btn-shimmer {
    position: relative;
    overflow: hidden;
  }
  .login-btn-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    background-size: 200% 100%;
    background-position: -200% center;
    transition: none;
  }
  .login-btn-shimmer:hover::after {
    animation: shimmer 0.6s ease forwards;
  }
  .login-btn-shimmer:hover  { transform: scale(1.02); }
  .login-btn-shimmer:active { transform: scale(0.98); }

  .input-animated {
    transition: all 0.2s ease;
  }
  .input-animated:focus {
    transform: scale(1.01);
  }

  .orb-1 { animation: orbPulse 8s ease-in-out infinite; }
  .orb-2 { animation: orbPulse 11s ease-in-out 2s infinite reverse; }
  .orb-3 { animation: orbPulse 9s ease-in-out 4s infinite; }
`;

/* ── floating particles data ── */
const PARTICLES = [
  { left: '10%', top: '80%', size: 4, delay: '0s',   dur: '6s'  },
  { left: '25%', top: '70%', size: 3, delay: '1.2s', dur: '8s'  },
  { left: '45%', top: '85%', size: 5, delay: '0.5s', dur: '7s'  },
  { left: '60%', top: '75%', size: 3, delay: '2s',   dur: '9s'  },
  { left: '75%', top: '80%', size: 4, delay: '0.8s', dur: '6.5s'},
  { left: '88%', top: '72%', size: 3, delay: '1.8s', dur: '7.5s'},
  { left: '35%', top: '90%', size: 2, delay: '3s',   dur: '8.5s'},
  { left: '55%', top: '65%', size: 4, delay: '1.5s', dur: '7s'  },
];

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} tabIndex={-1}
      className="text-slate-400 hover:text-purple-400 transition-colors focus:outline-none">
      {show
        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      }
    </button>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const errors = {
    email: !form.email.trim()
      ? 'Please enter your university email address.'
      : !form.email.toLowerCase().endsWith('@my.sliit.lk')
        ? 'Use your SLIIT email (itXXXXXXXX@my.sliit.lk).'
        : '',
    password: !form.password
      ? 'Please enter your password.'
      : form.password.length < 6
        ? 'Password must be at least 6 characters.'
        : '',
  };
  const isValid = !errors.email && !errors.password;

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      const result = await login({ email: form.email.trim().toLowerCase(), password: form.password });
      // Role-based redirect: admin goes to /admin, everyone else to /dashboard
      if (result?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email or password is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `input-animated w-full pl-10 pr-${field === 'password' ? '10' : '4'} py-3 rounded-xl border text-sm text-white placeholder-white/30 bg-[#334155] focus:outline-none focus:ring-2 transition-all duration-200
    ${touched[field] && errors[field]
      ? 'border-red-500 focus:ring-red-500/40'
      : 'border-[#475569] focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]'}`;

  return (
    <>
      <style>{styles}</style>

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ backgroundColor: '#0F172A' }}>

        {/* ── background orbs ── */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="orb-1 absolute rounded-full"
            style={{ width: 520, height: 520, top: '-10%', left: '-12%',
              background: 'radial-gradient(circle, #7C3AED, transparent 70%)', opacity: 0.15, filter: 'blur(60px)' }} />
          <div className="orb-2 absolute rounded-full"
            style={{ width: 480, height: 480, bottom: '-8%', right: '-10%',
              background: 'radial-gradient(circle, #4F46E5, transparent 70%)', opacity: 0.15, filter: 'blur(60px)' }} />
          <div className="orb-3 absolute rounded-full"
            style={{ width: 360, height: 360, top: '40%', left: '50%',
              background: 'radial-gradient(circle, #2563EB, transparent 70%)', opacity: 0.12, filter: 'blur(60px)' }} />
        </div>

        {/* ── floating particles ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {PARTICLES.map((p, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                left: p.left, top: p.top,
                width: p.size, height: p.size,
                backgroundColor: 'rgba(255,255,255,0.12)',
                animation: `particleFloat ${p.dur} ease-in-out ${p.delay} infinite`,
              }} />
          ))}
        </div>

        <div className="relative w-full max-w-md" style={{ zIndex: 10 }}>

          {/* ── brand mark ── */}
          <div className="brand-block text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform"
                style={{ backgroundColor: '#7C3AED', boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}>
                <span className="text-white font-black text-xl tracking-tight">PP</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tight">
                <span className="typewriter-text">PeerPulse.</span>
              </span>
            </Link>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Sign in to your student account</p>
          </div>

          {/* ── card ── */}
          <div className="login-card rounded-3xl shadow-2xl p-8"
            style={{ backgroundColor: '#1E293B', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)' }}>

            {/* error banner */}
            {error && (
              <div className="mb-5 flex items-center gap-2.5 border px-4 py-3 rounded-xl text-sm field-stagger-1"
                style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#F87171' }}>
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div className="field-stagger-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  University Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    name="email" type="email" placeholder="itXXXXXXXX@my.sliit.lk"
                    value={form.email} onChange={handleInputChange} onBlur={handleBlur}
                    className={inputCls('email')}
                    autoComplete="email"
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#F87171' }}>
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="field-stagger-2">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                    value={form.password} onChange={handleInputChange} onBlur={handleBlur}
                    className={`${inputCls('password')} pr-10`}
                    autoComplete="current-password"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                  </span>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#F87171' }}>
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="field-stagger-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`login-btn-shimmer w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 mt-2 text-white
                    ${loading ? 'cursor-not-allowed opacity-60' : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1E293B]'}`}
                  style={loading ? { backgroundColor: '#334155' } : { backgroundColor: '#7C3AED' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#6D28D9'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#7C3AED'; }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* divider */}
            <div className="field-stagger-3 flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* register link */}
            <div className="field-stagger-4">
              <Link
                to="/register"
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                Create a new account
              </Link>
            </div>
          </div>

          {/* footer note */}
          <p className="field-stagger-4 text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Restricted to verified SLIIT university students only.
          </p>
        </div>
      </div>
    </>
  );
}
