import { Link } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { useEffect, useRef } from 'react';

const animStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-20px); }
  }

  .anim-hero-1 { animation: fadeInUp 0.6s ease both; }
  .anim-hero-2 { animation: fadeInUp 0.6s ease 0.2s both; }
  .anim-hero-3 { animation: fadeInUp 0.6s ease 0.4s both; }
  .anim-hero-4 { animation: fadeInUp 0.6s ease 0.6s both; }

  .scroll-fade {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .scroll-fade.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .btn-anim {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-anim:hover  { transform: scale(1.03); }
  .btn-anim:active { transform: scale(0.97); }

  .orb {
    position: absolute;
    border-radius: 9999px;
    filter: blur(80px);
    pointer-events: none;
  }
  .orb-1 { animation: float 9s ease-in-out infinite; }
  .orb-2 { animation: float 11s ease-in-out 2s infinite reverse; }
  .orb-3 { animation: float 8s ease-in-out 4s infinite; }
`;

function useScrollFade(ref) {
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.scroll-fade');
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, _) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const idx = parseInt(el.dataset.idx || '0', 10);
            setTimeout(() => el.classList.add('visible'), idx * 100);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el, i) => { el.dataset.idx = i; io.observe(el); });
    return () => io.disconnect();
  }, []);
}

const features = [
  {
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'bg-indigo-100',
    title: 'Verified Skills',
    desc: 'Tutors must verify their technical and academic skills before teaching. Every badge is earned, not given.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bg: 'bg-blue-100',
    title: 'Smart Matchmaking',
    desc: 'Discover tutors with the exact tech stack or module expertise you need. Filter by subject, level, and verification.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    bg: 'bg-purple-100',
    title: 'Seamless Scheduling',
    desc: 'Book sessions directly in the app. Manage your schedule, track request statuses, and review completed meetings.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    bg: 'bg-rose-100',
    title: 'Honest Reviews',
    desc: 'Ratings are only allowed after a session is completed. Real feedback from real learners — no fake reviews.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    bg: 'bg-green-100',
    title: 'Secure & Private',
    desc: 'University email verification ensures only real students join. Your data stays protected with JWT-based auth.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bg: 'bg-amber-100',
    title: 'Peer Community',
    desc: 'Learn from students who just mastered what you need. Relatable, affordable, and always available.',
  },
];

const steps = [
  { step: '01', title: 'Create your account', desc: 'Register with your SLIIT university email to join the verified community.' },
  { step: '02', title: 'Add your skills', desc: 'List what you can teach and get verified through MCQ or grade evidence.' },
  { step: '03', title: 'Discover & connect', desc: 'Browse peer tutors, send requests, and book sessions that fit your schedule.' },
  { step: '04', title: 'Learn & review', desc: 'Complete your session and leave honest feedback to help the community grow.' },
];

export default function HomePage() {
  const { user } = useAuth();
  const featuresRef = useRef(null);
  const stepsRef    = useRef(null);
  const statsRef    = useRef(null);

  useScrollFade(featuresRef);
  useScrollFade(stepsRef);
  useScrollFade(statsRef);

  return (
    <>
      <style>{animStyles}</style>
      <div className="bg-white font-sans">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden bg-gray-50">

          {/* subtle floating orbs using existing page colors */}
          <div className="orb orb-1" style={{ width: 400, height: 400, top: '-80px', left: '-100px', background: 'radial-gradient(circle, #6366f1, transparent 70%)', opacity: 0.08 }} />
          <div className="orb orb-2" style={{ width: 350, height: 350, bottom: '-60px', right: '-80px', background: 'radial-gradient(circle, #3b82f6, transparent 70%)', opacity: 0.08 }} />
          <div className="orb orb-3" style={{ width: 280, height: 280, top: '40%', left: '55%', background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', opacity: 0.06 }} />

          {/* decorative dots */}
          <div className="hidden sm:block absolute inset-y-0 w-full" aria-hidden="true">
            <div className="relative h-full max-w-7xl mx-auto">
              <svg className="absolute right-full translate-y-1/4 translate-x-1/4 lg:translate-x-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
                <defs><pattern id="dots-a" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" /></pattern></defs>
                <rect width="404" height="784" fill="url(#dots-a)" />
              </svg>
              <svg className="absolute left-full -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
                <defs><pattern id="dots-b" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" /></pattern></defs>
                <rect width="404" height="784" fill="url(#dots-b)" />
              </svg>
            </div>
          </div>

          <div className="relative pt-16 pb-24 lg:pt-28 lg:pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

              <span className="anim-hero-1 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 shadow-sm mb-8">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse" />
                Secure Peer Learning Platform for SLIIT Students
              </span>

              <h1 className="anim-hero-2 text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-6 leading-tight">
                Master your skills with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  PeerPulse
                </span>
              </h1>

              <p className="anim-hero-3 mt-3 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 mb-10 leading-relaxed">
                Connect with top students, share your expertise, and excel in your university journey.
                Find verified tutors, book sessions, and grow together in a trusted environment.
              </p>

              <div className="anim-hero-4 flex justify-center flex-col sm:flex-row gap-4 max-w-sm mx-auto sm:max-w-none">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="btn-anim inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                  >
                    Go to Dashboard
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn-anim inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      Get Started Free
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      to="/login"
                      className="btn-anim inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-base font-semibold rounded-xl text-indigo-700 bg-white hover:bg-gray-50 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Social proof */}
              <div className="anim-hero-4 mt-12 inline-flex flex-col sm:flex-row items-center gap-0 sm:gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                {[
                  { icon: '💳', text: 'No credit card required' },
                  { icon: '🎓', text: 'University email only' },
                  { icon: '✨', text: 'Free to use' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
                    <span className="text-base">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Features ── */}
        <div className="py-24 bg-white" ref={featuresRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="scroll-fade text-center mb-16">
              <h2 className="text-base text-indigo-600 font-semibold tracking-widest uppercase">Features</h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to succeed
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Built closely with university students to ensure academic integrity, ease of use, and verified learning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map(({ icon, bg, title, desc }) => (
                <div
                  key={title}
                  className="scroll-fade bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
                >
                  <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center mb-6`}>
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="py-24 bg-gray-50" ref={stepsRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="scroll-fade text-center mb-16">
              <h2 className="text-base text-indigo-600 font-semibold tracking-widest uppercase">How it works</h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Up and running in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map(({ step, title, desc }, i) => (
                <div key={step} className="scroll-fade relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-indigo-100 -translate-x-4 z-0" />
                  )}
                  <div className="relative z-10 bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                    <span className="inline-block text-4xl font-extrabold text-indigo-100 mb-4 leading-none">{step}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats / CTA banner ── */}
        <div className="py-16 px-4 sm:px-8" ref={statsRef}>
          <div className="scroll-fade max-w-7xl mx-auto bg-indigo-700 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-16 sm:p-16 lg:flex lg:items-center lg:justify-between gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Ready to dive in?
                  <br />
                  <span className="text-indigo-200">Start learning today.</span>
                </h2>
                <p className="mt-4 text-lg text-indigo-100 leading-relaxed max-w-md">
                  PeerPulse enforces unique university emails alongside strict business logic — like post-session reviews — so you can trust the community.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {!user ? (
                    <>
                      <Link
                        to="/register"
                        className="btn-anim inline-flex items-center px-6 py-3 rounded-xl text-indigo-700 bg-white font-semibold hover:bg-indigo-50 transition-all shadow-md"
                      >
                        Create Account
                      </Link>
                      <Link
                        to="/login"
                        className="btn-anim inline-flex items-center px-6 py-3 rounded-xl text-white border-2 border-indigo-500 font-semibold hover:bg-indigo-600 transition-all"
                      >
                        Sign In
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/discover"
                      className="btn-anim inline-flex items-center px-6 py-3 rounded-xl text-indigo-700 bg-white font-semibold hover:bg-indigo-50 transition-all shadow-md"
                    >
                      Discover Tutors →
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-12 lg:mt-0 lg:w-1/2">
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { value: '100%', label: 'University Verified' },
                    { value: '4.9/5', label: 'Average Session Rating' },
                    { value: 'Free', label: 'Always Free to Use' },
                    { value: 'SLIIT', label: 'Trusted Institution' },
                  ].map(({ value, label }) => (
                    <div key={label} className="scroll-fade bg-indigo-600/50 rounded-2xl p-6 border border-indigo-500">
                      <p className="text-4xl font-extrabold text-white">{value}</p>
                      <p className="mt-2 text-indigo-200 font-medium text-sm">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
