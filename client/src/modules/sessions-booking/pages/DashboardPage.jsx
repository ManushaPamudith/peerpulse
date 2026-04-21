import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../core/services/api';
import { useAuth } from '../../../core/context/AuthContext';
import StatCard from '../../../shared/components/admin/StatCard';
import PageHeader from '../../../shared/components/layout/PageHeader';

const quickLinks = [
  { to: '/profile',  label: 'Edit Profile',   desc: 'Update your skills and bio',    icon: '👤' },
  { to: '/discover', label: 'Discover Tutors', desc: 'Find peers to learn from',      icon: '🔍' },
  { to: '/requests', label: 'My Requests',     desc: 'View and manage your requests', icon: '📬' },
  { to: '/sessions', label: 'My Sessions',     desc: 'Upcoming and past sessions',    icon: '📅' },
  { to: '/feedback', label: 'Feedback',        desc: 'Rate your learning sessions',   icon: '⭐' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ requests: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, sesRes] = await Promise.all([
          api.get('/requests/my'),
          api.get('/sessions/my'),
        ]);
        setCounts({
          requests: reqRes.data.requests.length,
          sessions: sesRes.data.sessions.length,
        });
      } catch {
        setCounts({ requests: 0, sessions: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* hero — matches Profile Page gradient */}
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Student'} 👋`}
        subtitle={`${user?.university || 'SLIIT'} · ${user?.email || ''}`}
        badges={[
          { label: user?.role === 'admin' ? '🛡️ Admin' : '🎓 Student' },
          ...(user?.skills?.length ? [{ label: `🧠 ${user.skills.length} skill${user.skills.length !== 1 ? 's' : ''}`, variant: 'emerald' }] : []),
        ]}
        action={
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm shadow-lg"
          >
            Discover Tutors
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* stat cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <StatCard title="Skills Added"  value={loading ? '—' : user?.skills?.length || 0} detail="Saved in your profile"        icon="🧠" color="indigo" />
          <StatCard title="My Requests"   value={loading ? '—' : counts.requests}            detail="Learner and tutor requests"   icon="📬" color="blue"   />
          <StatCard title="My Sessions"   value={loading ? '—' : counts.sessions}            detail="Scheduled and completed"      icon="📅" color="green"  />
        </div>

        {/* quick links */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">⚡</span>
          <h2 className="text-lg font-semibold text-slate-800">Quick Access</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ to, label, desc, icon }) => (
            <Link
              key={to} to={to}
              className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:bg-indigo-100 transition-colors">{icon}</div>
              <div>
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{label}</p>
                <p className="text-sm text-slate-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
