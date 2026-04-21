import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../core/services/api';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, visible, onClose }) {
  return (
    <div className={`fixed top-5 right-5 z-50 transition-all duration-300 max-w-sm w-full bg-white shadow-2xl rounded-xl border-l-4 overflow-hidden
      ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}
      ${type === 'error' ? 'border-red-500' : 'border-emerald-500'}`}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {type === 'error'
            ? <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{type === 'error' ? 'Error' : 'Success'}</p>
          <p className="mt-0.5 text-sm text-slate-500">{message}</p>
        </div>
        <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Eye toggle ────────────────────────────────────────────────────────────────
function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} tabIndex={-1}
      className="text-slate-400 hover:text-violet-600 transition-colors focus:outline-none">
      {show
        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      }
    </button>
  );
}

// ── Password strength bar ─────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: 'Weak',        color: 'bg-red-400',     text: 'text-red-500',     bars: 1 },
    { label: 'Fair',        color: 'bg-amber-400',   text: 'text-amber-500',   bars: 2 },
    { label: 'Good',        color: 'bg-yellow-400',  text: 'text-yellow-600',  bars: 3 },
    { label: 'Strong',      color: 'bg-violet-500',  text: 'text-violet-600',  bars: 4 },
    { label: 'Very Strong', color: 'bg-emerald-500', text: 'text-emerald-600', bars: 5 },
  ];
  const lvl = levels[Math.min(score - 1, 4)] || levels[0];
  return (
    <div className="mt-2 px-4">
      <div className="flex gap-1">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= lvl.bars ? lvl.color : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-xs mt-1 font-medium ${lvl.text}`}>{lvl.label} password</p>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, error, touched, optional, children }) {
  const hasError = touched && error;
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
        {optional && <span className="ml-1 normal-case font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {hasError && (
        <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (hasError) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all duration-200
  ${hasError
    ? 'border-red-400 focus:ring-red-300 bg-red-50'
    : 'border-slate-200 focus:ring-violet-300 focus:border-violet-400'}`;

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // real-time validation
  useEffect(() => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 3) e.name = 'At least 3 characters required';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^it\d{8}@my\.sliit\.lk$/.test(form.email.trim().toLowerCase()))
      e.email = 'Email must be in format itXXXXXXXX@my.sliit.lk';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters required';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (form.phone && !/^0[0-9]{9}$/.test(form.phone))
      e.phone = 'Phone must be 10 digits starting with 0 (e.g. 0771234567)';

    setErrors(e);
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const set   = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const blur  = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2 MB', 'error');
      return;
    }
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    if (type === 'success') setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true, phone: true });
    if (!isValid) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        university: 'SLIIT',
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();

      const { data } = await api.post('/auth/register', payload);

      // If a profile picture was selected, upload it immediately after registration
      if (avatar && data.token) {
        try {
          const formData = new FormData();
          formData.append('avatar', avatar);
          await api.post('/users/profile/picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${data.token}`,
            },
          });
        } catch {
          // Non-fatal — profile picture upload failure should not block registration
        }
      }

      showToast('Registration successful. Please login to continue.', 'success');
      setForm({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
      setTouched({});
      setAvatar(null);
      setAvatarPreview(null);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 relative items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-40" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-30" />
        </div>
        <div className="relative z-10 text-white w-full max-w-md">
          <Link to="/" className="inline-block text-2xl font-black tracking-tight text-white mb-14 hover:text-violet-400 transition-colors">
            PeerPulse.
          </Link>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-5">
            Start your peer<br />learning journey<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">today.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Connect with verified top-tier students, exchange real skills, and master your toughest university modules together.
          </p>
          <div className="space-y-3 mb-10">
            {[
              '✅  University-verified accounts only',
              '🔒  Secure JWT-based authentication',
              '⭐  Reviews only after session completion',
            ].map((item) => (
              <p key={item} className="text-sm text-slate-300">{item}</p>
            ))}
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">SR</div>
              <div>
                <p className="font-semibold text-white text-sm">Sarah R.</p>
                <p className="text-xs text-slate-400">Software Engineering, Year 3</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "PeerPulse completely changed how I study. Finding verified tutors for algorithms was seamless."
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center py-10 px-6 sm:px-12 lg:px-16 xl:px-20 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">

          <Link to="/" className="lg:hidden block text-2xl font-black tracking-tight text-slate-900 mb-8">
            PeerPulse.
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Already a member?{' '}
              <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-500 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Profile picture */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div
                onClick={() => fileRef.current.click()}
                className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-violet-400 transition-colors overflow-hidden shrink-0 bg-white"
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                  : <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                }
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current.click()}
                  className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                  {avatar ? 'Change photo' : 'Upload profile photo'}
                </button>
                <p className="text-xs text-slate-400 mt-0.5">JPG or PNG, max 2 MB — optional</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>

            {/* Full Name */}
            <Field label="Full Name" error={errors.name} touched={touched.name}>
              <input
                name="name" type="text" placeholder="e.g. Kavindu Perera"
                value={form.name} onChange={set} onBlur={blur}
                className={inputCls(touched.name && errors.name)}
                autoComplete="name"
              />
            </Field>

            {/* Email */}
            <Field label="University Email" error={errors.email} touched={touched.email}>
              <div className="relative">
                <input
                  name="email" type="email" placeholder="yourstudentID@my.sliit.lk"
                  value={form.email} onChange={set} onBlur={blur}
                  className={inputCls(touched.email && errors.email)}
                  autoComplete="email"
                />
                {touched.email && !errors.email && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              {!errors.email && <p className="mt-1 text-xs text-slate-400">Must end with @my.sliit.lk</p>}
            </Field>

            {/* Phone */}
            <Field label="Phone Number" error={errors.phone} touched={touched.phone} optional>
              <input
                name="phone" type="tel" placeholder="+94 77 123 4567"
                value={form.phone} onChange={set} onBlur={blur}
                className={inputCls(touched.phone && errors.phone)}
                autoComplete="tel"
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password} touched={touched.password}>
              <div className="relative">
                <input
                  name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimum 6 characters"
                  value={form.password} onChange={set} onBlur={blur}
                  className={inputCls(touched.password && errors.password)}
                  autoComplete="new-password"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                </span>
              </div>
              <PasswordStrength password={form.password} />
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword} touched={touched.confirmPassword}>
              <div className="relative">
                <input
                  name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password"
                  value={form.confirmPassword} onChange={set} onBlur={blur}
                  className={inputCls(touched.confirmPassword && errors.confirmPassword)}
                  autoComplete="new-password"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
                </span>
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold tracking-wide text-white transition-all duration-200 mt-2
                ${loading
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-700 hover:-translate-y-0.5 shadow-lg shadow-violet-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Registering...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-slate-400 leading-relaxed">
            By registering you agree to our{' '}
            <span className="underline cursor-pointer hover:text-slate-600 transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-slate-600 transition-colors">Privacy Policy</span>.
            <br />Strictly for verified SLIIT students.
          </p>
        </div>
      </div>
    </div>
  );
}
