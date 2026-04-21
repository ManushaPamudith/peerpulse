import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../core/services/api';
import { useAuth } from '../../../core/context/AuthContext';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DiscoverTutorMatchCard from '../components/DiscoverTutorMatchCard';
import MatchingScoreBreakdown from '../components/MatchingScoreBreakdown';
import RequestAnalyticsPanel from '../components/RequestAnalyticsPanel';
import SkillDemandCard from '../components/SkillDemandCard';
import TutorComparisonModal from '../components/TutorComparisonModal';

// ── Constants ─────────────────────────────────────────────────────────────────
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const TYPES = ['All', 'Technical Skill', 'Academic Module'];
const LEVEL_WEIGHT = { Expert: 4, Advanced: 3, Intermediate: 2, Beginner: 1 };
const SORT_OPTIONS = [
  { value: 'match', label: 'Best Match' },
  { value: 'level', label: 'Level' },
  { value: 'newest', label: 'Newest' },
];
const levelColors = {
  Beginner: 'bg-sky-50 text-sky-700 border-sky-200',
  Intermediate: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Advanced: 'bg-violet-50 text-violet-700 border-violet-200',
  Expert: 'bg-purple-50 text-purple-700 border-purple-200',
};
const statusStyle = {
  Accepted: 'bg-green-50 text-green-700 border-green-200',
  Rejected: 'bg-slate-100 text-slate-500 border-slate-200',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
};
const statusIcon = { Accepted: '✓', Rejected: '✕', Pending: '🕐', Cancelled: '⛔' };

function matchScore(s) {
  const isVerified = s.verificationStatus === 'verified' || s.verified;
  return (LEVEL_WEIGHT[s.level] || 0) + (isVerified ? 2 : 0);
}

// ── Request Modal ─────────────────────────────────────────────────────────────
function RequestModal({ item, onClose, onSend }) {
  const [msg, setMsg] = useState(`Hi ${item.owner.name}, I'd like to learn ${item.skill} from you.`);
  const [priority, setPriority] = useState('Normal');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!msg.trim()) { setErr('Message is required'); return; }
    setLoading(true); setErr('');
    try { await onSend(item, msg.trim(), priority); onClose(); }
    catch (e) { setErr(e.message || 'Request failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800">Request Session</h3>
            <p className="text-xs text-slate-400 mt-0.5">{item.skill} · {item.level} · {item.owner.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
            You are about to request <strong>{item.skill}</strong> from <strong>{item.owner.name}</strong>. Please review the message before sending.
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message to tutor</label>
            <textarea
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
              rows={4} value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Introduce yourself and explain what you need help with..." required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Request Priority</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPriority('Normal')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 border ${priority === 'Normal' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>
                Normal
              </button>
              <button type="button" onClick={() => setPriority('Urgent')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 border ${priority === 'Urgent' ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>
                🔴 Urgent
              </button>
            </div>
            {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !msg.trim()} className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Skill Card ────────────────────────────────────────────────────────────────
function SkillCard({ item, onRequest, requesting, sentSkillIds, topMatch, canRequest, demandLabel }) {
  const alreadySent = sentSkillIds.has(`${item.owner._id}-${item.skill}`);
  const isVerified = item.verificationStatus === 'verified' || item.verified;

  return (
    <div className={`relative rounded-2xl p-5 transition-all flex flex-col gap-4
      ${topMatch
        ? 'border-2 border-indigo-300 ring-1 ring-indigo-100 bg-white shadow-sm hover:shadow-md'
        : isVerified
          ? 'border-2 border-emerald-300 bg-linear-to-br from-emerald-50 via-white to-emerald-50/30 shadow-md hover:shadow-lg hover:-translate-y-0.5'
          : 'border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200'
      }`}>

      {/* ── Verified ribbon — top-left corner ── */}
      {isVerified && !topMatch && (
        <div className="absolute -top-px -left-px">
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-tl-2xl rounded-br-xl flex items-center gap-1 shadow-sm">
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        </div>
      )}

      {/* ── Top Match ribbon ── */}
      {topMatch && (
        <div className="absolute -top-2.5 left-4">
          <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Match
          </span>
        </div>
      )}

      {/* ── Skill name + level ── */}
      <div className={`flex items-start justify-between gap-3 ${isVerified ? 'mt-3' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={`font-bold text-base ${isVerified ? 'text-emerald-900' : 'text-slate-800'}`}>
              {item.skill}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${levelColors[item.level] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {item.level}
            </span>
          </div>
          <p className="text-xs text-slate-400">{item.type}</p>
        </div>

        {/* Verification method pill — only for verified, shows how it was earned */}
        {isVerified && item.verificationMethod && item.verificationMethod !== 'none' && (
          <span className="shrink-0 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            via {item.verificationMethod === 'mcq' ? 'Quiz' : 'Grade'}
          </span>
        )}
      </div>

      {/* ── Tutor info — click to view public profile ── */}
      <Link to={`/profile/${item.owner._id}`}
        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:opacity-80
          ${isVerified ? 'bg-emerald-50/60 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
          {item.owner.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">{item.owner.name}</p>
          <p className="text-xs text-slate-400 truncate">{item.owner.university || 'SLIIT'}</p>
        </div>
        <svg className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* ── Demand label ── */}
      {demandLabel && (
        <div className="inline-flex items-center gap-1 w-fit rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span>🔥</span>
          {demandLabel}
        </div>
      )}

      {/* ── Action button ── */}
      <button
        onClick={() => canRequest && onRequest(item)}
        disabled={!canRequest || requesting === item._id || alreadySent}
        className={`w-full text-sm font-semibold py-2 rounded-xl transition-colors mt-auto
          ${alreadySent || !canRequest
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : isVerified
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
          }`}
      >
        {alreadySent ? '✓ Requested' : requesting === item._id ? 'Sending...' : 'Request Session'}
      </button>
    </div>
  );
}

// ── Request Card ──────────────────────────────────────────────────────────────
function ReqCard({ request, currentUserId, onUpdate, updating, onCancel, canceling }) {
  const isReceived = request.tutor?._id === currentUserId;
  const isPending = request.status === 'Pending';
  const isWithdrawn = request.isWithdrawn;
  const hasExpired = request.expiresAt ? new Date(request.expiresAt) < new Date() : false;
  const [timeLeft, setTimeLeft] = useState(null);
  const [canCancelAction, setCanCancelAction] = useState(null);

  useEffect(() => {
    const checkCancellationWindow = () => {
      if (isWithdrawn || hasExpired) {
        setTimeLeft(null);
        setCanCancelAction(false);
        return;
      }

      const now = new Date();
      let actionDate = null;

      if (isPending && !isReceived && request.createdAt) {
        actionDate = new Date(request.createdAt);
      } else if (request.status === 'Accepted' && isReceived && request.acceptedAt) {
        actionDate = new Date(request.acceptedAt);
      } else if (request.status === 'Rejected' && isReceived && request.rejectedAt) {
        actionDate = new Date(request.rejectedAt);
      }

      if (actionDate) {
        const windowEnd = actionDate.getTime() + (5 * 60 * 1000);
        const remaining = windowEnd - now.getTime();

        if (remaining > 0) {
          // Keep backend 5-minute safety window, but do not show countdown text in the button.
          const seconds = Math.ceil(remaining / 1000);
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
          setCanCancelAction(true);
        } else {
          setTimeLeft(null);
          setCanCancelAction(false);
        }
      }
    };

    checkCancellationWindow();
    const interval = setInterval(checkCancellationWindow, 1000);
    return () => clearInterval(interval);
  }, [request, isReceived, isPending]);

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${isWithdrawn
      ? 'opacity-60 border-slate-100'
      : isPending
        ? 'border-amber-100'
        : request.status === 'Accepted'
          ? 'border-green-100'
          : 'border-slate-100'
      }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-800">{request.skill}</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle[request.status]}`}>
              {statusIcon[request.status]} {request.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isReceived
              ? <>From: <span className="text-slate-600 font-medium">{request.learner?.name}</span> · {request.learner?.email}</>
              : <>To: <span className="text-slate-600 font-medium">{request.tutor?.name}</span> · {request.tutor?.email}</>
            }
          </p>
        </div>
        <div className="text-xs text-slate-400 shrink-0">{new Date(request.createdAt).toLocaleDateString()}</div>
      </div>
      {request.message && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 mb-4 leading-relaxed border border-slate-100">
          "{request.message}"
        </p>
      )}
      {isReceived && isPending && !isWithdrawn && !hasExpired && (
        <div className="flex gap-2">
          <button onClick={() => onUpdate(request._id, 'Accepted')} disabled={updating === request._id}
            className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {updating === request._id ? '...' : '✓ Accept'}
          </button>
          <button onClick={() => onUpdate(request._id, 'Rejected')} disabled={updating === request._id}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
            ✕ Reject
          </button>
        </div>
      )}
      {canCancelAction && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          {isPending && !isReceived && (
            <div className="flex gap-2">
              <button
                onClick={() => onCancel(request._id, 'cancel')}
                disabled={canceling === request._id}
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {canceling === request._id ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          )}
          {request.status === 'Accepted' && isReceived && (
            <div className="flex gap-2">
              <button
                onClick={() => onCancel(request._id, 'cancel-accepted')}
                disabled={canceling === request._id}
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50"
              >
                {canceling === request._id ? 'Cancelling...' : 'Cancel Accept'}
              </button>
            </div>
          )}
          {request.status === 'Rejected' && isReceived && (
            <div className="flex gap-2">
              <button
                onClick={() => onCancel(request._id, 'cancel-rejected')}
                disabled={canceling === request._id}
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors disabled:opacity-50"
              >
                {canceling === request._id ? 'Undoing...' : 'Undo Rejection'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SkillBrowsePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');

  // ── Browse tab state ──
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState('');
  const [success, setSuccess] = useState('');
  const [requesting, setRequesting] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [sentSkillIds, setSentSkillIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [type, setType] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState('match');

  const [skillHoverIndex, setSkillHoverIndex] = useState(-1);

  const demandCounts = useMemo(() => {
    const counts = {};
    skills.forEach(s => {
      const key = s.skill.toLowerCase().trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [skills]);

  const skillSuggestions = useMemo(() => {
    const unique = {};
    skills.forEach(s => {
      const key = s.skill.trim();
      if (!key) return;
      const lower = key.toLowerCase();
      if (!unique[lower]) unique[lower] = { skill: key, count: 0 };
      unique[lower].count += 1;
    });
    return Object.values(unique)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [skills]);

  const filteredSkillSuggestions = useMemo(() => {
    if (!search.trim()) return [];
    return skillSuggestions
      .filter(s => s.skill.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [search, skillSuggestions]);

  // ── Discover tab state ──
  const [tutorSearch, setTutorSearch] = useState('');
  const [tutorLevel, setTutorLevel] = useState('');
  const [tutorVerified, setTutorVerified] = useState('');
  const [tutors, setTutors] = useState([]);
  const [blockedTutorIds, setBlockedTutorIds] = useState(new Set());
  const [reportedTutorIds, setReportedTutorIds] = useState(new Set());
  const [tutorToast, setTutorToast] = useState('');
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [tutorsError, setTutorsError] = useState('');
  const [selectedTutorForDetails, setSelectedTutorForDetails] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [tutorAnalytics, setTutorAnalytics] = useState(null);
  const [skillDemandData, setSkillDemandData] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // ── Requests tab state ──
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState('');
  const [reqToast, setReqToast] = useState('');
  const [updating, setUpdating] = useState(null);
  const [canceling, setCanceling] = useState(null);
  const [reqTab, setReqTab] = useState('received');
  const [reqStatusFilter, setReqStatusFilter] = useState('All');

  // ── Load skills + sent ids on mount ──
  useEffect(() => {
    api.get('/users/skills/all')
      .then(({ data }) => setSkills(data.skills))
      .catch(() => setSkillsError('Failed to load skills'))
      .finally(() => setSkillsLoading(false));
    api.get('/requests/my').then(({ data }) => {
      setSentSkillIds(new Set(
        data.requests
          .filter((r) => r.status !== 'Cancelled')
          .map((r) => `${r.tutor?._id}-${r.skill}`)
      ));
      setRequests(data.requests);
    }).catch(() => { });
  }, []);

  // ── Load tutors when discover tab opens ──
  useEffect(() => {
    if (activeTab !== 'discover') return;
    loadTutors();
  }, [activeTab]);

  // ── Auto-load tutors when filters change ──
  useEffect(() => {
    if (activeTab === 'discover') {
      loadTutors();
    }
  }, [tutorSearch, tutorLevel, tutorVerified]);

  // ── Load requests when requests tab opens ──
  useEffect(() => {
    if (activeTab !== 'requests') return;
    loadRequests();
  }, [activeTab]);

  const loadTutors = async (skill = tutorSearch, level = tutorLevel, verified = tutorVerified) => {
    setTutorsLoading(true); setTutorsError('');
    try {
      const { data } = await api.get('/requests/discover', { params: { skill, level, verified } });
      setTutors(data.tutors);
    } catch { setTutorsError('Failed to load tutors'); }
    finally { setTutorsLoading(false); }
  };

  const clearDiscoverFilters = () => {
    setTutorSearch('');
    setTutorLevel('');
    setTutorVerified('');
    loadTutors('', '', '');
  };

  const handleBlockTutor = (tutorId) => {
    setBlockedTutorIds(prev => new Set(prev).add(tutorId));
    setTutorToast('Tutor blocked successfully. They will no longer appear in results.');
    setTimeout(() => setTutorToast(''), 4000);
    if (selectedTutorForDetails?._id === tutorId) {
      setSelectedTutorForDetails(null);
      setSelectedSkill('');
    }
  };

  const handleReportTutor = (tutorId) => {
    setReportedTutorIds(prev => new Set(prev).add(tutorId));
    setTutorToast('Tutor reported successfully. Thank you for your feedback.');
    setTimeout(() => setTutorToast(''), 4000);
  };

  const loadTutorAnalytics = async (tutorId) => {
    try {
      const { data } = await api.get(`/requests/analytics/tutor/${tutorId}`);
      setTutorAnalytics(data.analytics);
    } catch {
      setTutorAnalytics(null);
    }
  };

  const loadSkillDemand = async (skillName) => {
    if (!skillName) return;
    try {
      const { data } = await api.get('/requests/analytics/skill-demand', { params: { skill: skillName } });
      setSkillDemandData(data.demand);
    } catch {
      setSkillDemandData(null);
    }
  };

  const pickSkillForTutor = (tutor) => {
    const skills = tutor?.skills || [];
    const q = tutorSearch.trim().toLowerCase();
    if (!q) return skills[0] || null;
    return skills.find((s) => s.skill?.toLowerCase().includes(q)) || skills[0] || null;
  };

  const handleSelectTutor = (tutor) => {
    const skillObj = pickSkillForTutor(tutor);
    setSelectedTutorForDetails(tutor);
    setSelectedSkill(skillObj?.skill || '');
    loadTutorAnalytics(tutor._id);
    if (skillObj?.skill) loadSkillDemand(skillObj.skill);
  };

  const loadRequests = async () => {
    setReqLoading(true); setReqError('');
    try {
      const { data } = await api.get('/requests/my');
      setRequests(data.requests);
      setSentSkillIds(new Set(
        data.requests
          .filter((r) => r.status !== 'Cancelled')
          .map((r) => `${r.tutor?._id}-${r.skill}`)
      ));
    } catch { setReqError('Failed to load requests'); }
    finally { setReqLoading(false); }
  };

  const handleSend = async (item, message, priority = 'Normal') => {
    const key = `${item.owner._id}-${item.skill}`;
    if (sentSkillIds.has(key)) throw new Error('Already requested');
    setRequesting(item._id);
    try {
      await api.post('/requests', { tutorId: item.owner._id, skill: item.skill, message, priority });
      setSentSkillIds(prev => new Set([...prev, key]));
      setSuccess(`Request sent to ${item.owner.name}`);
      setTimeout(() => setSuccess(''), 4000);
    } finally { setRequesting(null); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.patch(`/requests/${id}/status`, { status });
      setReqToast(`Request ${status.toLowerCase()} successfully`);
      setTimeout(() => setReqToast(''), 4000);
      loadRequests();
    } catch (err) {
      setReqError(err.response?.data?.message || 'Update failed');
      setTimeout(() => setReqError(''), 4000);
    } finally { setUpdating(null); }
  };

  const handleCancel = async (id, action) => {
    setCanceling(id);
    try {
      const actionMap = {
        'cancel': () => api.patch(`/requests/${id}/cancel`),
        'cancel-accepted': () => api.patch(`/requests/${id}/cancel-accepted`),
        'cancel-rejected': () => api.patch(`/requests/${id}/cancel-rejected`),
      };

      const messageMap = {
        'cancel': 'Request cancelled successfully',
        'cancel-accepted': 'Accepted request cancelled successfully',
        'cancel-rejected': 'Rejection undone successfully',
      };

      await actionMap[action]();
      setReqToast(messageMap[action]);
      setTimeout(() => setReqToast(''), 4000);
      loadRequests();
    } catch (err) {
      setReqError(err.response?.data?.message || 'Action failed');
      setTimeout(() => setReqError(''), 4000);
    } finally { setCanceling(null); }
  };

  const filtered = useMemo(() => {
    const list = skills.filter(s => {
      if (s.owner._id === user?._id) return false;
      if (search && !s.skill.toLowerCase().includes(search.toLowerCase()) &&
        !s.owner.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (level !== 'All' && s.level !== level) return false;
      if (type !== 'All' && s.type !== type) return false;
      if (!verifiedOnly && !(s.verificationStatus === 'verified' || s.verified)) return false;
      return true;
    });
    if (sortBy === 'match') list.sort((a, b) => matchScore(b) - matchScore(a));
    else if (sortBy === 'level') list.sort((a, b) => (LEVEL_WEIGHT[b.level] || 0) - (LEVEL_WEIGHT[a.level] || 0));
    return list;
  }, [skills, search, level, type, verifiedOnly, sortBy, user]);

  const filteredTutors = useMemo(
    () => tutors.filter(t => !blockedTutorIds.has(t._id)),
    [tutors, blockedTutorIds]
  );

  const topRecommendedTutors = useMemo(
    () => [...filteredTutors].sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0)).slice(0, 5),
    [filteredTutors]
  );

  const alternativeDiscoverSkills = useMemo(() => {
    const current = tutorSearch.trim().toLowerCase();
    const counts = {};
    filteredTutors.forEach((tutor) => {
      (tutor.skills || []).forEach((s) => {
        const name = (s.skill || '').trim();
        const key = name.toLowerCase();
        if (!name || (current && key === current)) return;
        counts[key] = { name, count: (counts[key]?.count || 0) + 1 };
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [tutors, tutorSearch]);

  const sent = requests.filter(r => r.learner?._id === user?._id);
  const received = requests.filter(r => r.tutor?._id === user?._id);
  const pendingCount = received.filter(r => r.status === 'Pending').length;
  const isTutor = user?.role === 'tutor';

  const TABS = [
    { key: 'browse', label: 'Browse Skills', icon: '🔍' },
    { key: 'discover', label: 'Discover Tutors', icon: '🎓' },
    { key: 'requests', label: isTutor ? 'Incoming Requests' : 'My Requests', icon: '📋', badge: pendingCount },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Skills & Requests"
        subtitle="Browse skills, discover tutors, and manage your learning requests"
        badges={[
          { label: `${skills.length} skills available` },
          { label: `${skills.filter(s => s.verificationStatus === 'verified' || s.verified).length} verified`, variant: 'emerald' },
          ...(pendingCount > 0 ? [{ label: `${pendingCount} pending action`, variant: 'amber' }] : []),
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab switcher */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-7 flex-wrap">
          {TABS.map(({ key, label, icon, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
              <span>{icon}</span>
              {label}
              {badge > 0 && <span className="text-xs bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
            </button>
          ))}
        </div>

        {/* ── BROWSE TAB ── */}
        {activeTab === 'browse' && (
          <>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                <div className="lg:col-span-2 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div className="relative">
                    <input className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Search skill or tutor name..." value={search} onChange={e => setSearch(e.target.value)} />
                    {filteredSkillSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-sm z-10 overflow-hidden">
                        {filteredSkillSuggestions.map((suggestion, index) => (
                          <button
                            type="button"
                            key={suggestion.skill}
                            onClick={() => setSearch(suggestion.skill)}
                            onMouseEnter={() => setSkillHoverIndex(index)}
                            onMouseLeave={() => setSkillHoverIndex(-1)}
                            className={`w-full text-left px-4 py-3 text-sm ${skillHoverIndex === index ? 'bg-slate-100' : 'bg-white'} transition-colors`}
                          >
                            {suggestion.skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={level} onChange={e => setLevel(e.target.value)}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={type} onChange={e => setType(e.target.value)}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" className="accent-indigo-600 w-4 h-4" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} />
                  <span className="text-sm text-slate-600 font-medium">Verified skills only</span>
                </label>

                <div className="flex items-center gap-2">
                  {(search || level !== 'All' || type !== 'All' || !verifiedOnly || sortBy !== 'match') && (
                    <button onClick={() => { setSearch(''); setLevel('All'); setType('All'); setVerifiedOnly(true); setSortBy('match'); }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mr-2">
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {success}
              </div>
            )}
            {skillsError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">{skillsError}</div>}

            {skillsLoading ? (
              <div className="text-center py-20 text-slate-400 text-sm">Loading skills...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm font-medium">No skills match your filters</p>
                <p className="text-xs mt-1">Try adjusting the search or filters above</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-4">{filtered.length} skill{filtered.length !== 1 ? 's' : ''} found</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((item, idx) => {
                    const topMatch = sortBy === 'match' && idx < 3 && matchScore(item) >= 4;
                    return <SkillCard
                      key={item._id}
                      item={item}
                      onRequest={setModalItem}
                      requesting={requesting}
                      sentSkillIds={sentSkillIds}
                      topMatch={topMatch}
                      demandLabel={demandCounts[item.skill.toLowerCase().trim()] >= 5 ? 'High demand' : demandCounts[item.skill.toLowerCase().trim()] >= 3 ? 'Growing demand' : ''}
                      canRequest={!isTutor}
                    />;
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── DISCOVER TAB ── */}
        {activeTab === 'discover' && (
          <>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Search Skill</label>
                  <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="e.g. React, Calculus" value={tutorSearch} onChange={e => setTutorSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadTutors()} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Level</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    value={tutorLevel} onChange={e => setTutorLevel(e.target.value)}>
                    <option value="">All levels</option>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Verification</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    value={tutorVerified} onChange={e => setTutorVerified(e.target.value)}>
                    <option value="">All tutors</option>
                    <option value="true">Verified only</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <button onClick={loadTutors} disabled={tutorsLoading}
                  className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {tutorsLoading ? 'Searching...' : 'Search'}
                </button>
                {(tutorSearch || tutorLevel || tutorVerified) && (
                  <button onClick={clearDiscoverFilters}
                    className="border border-slate-200 bg-white text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    Clear filters
                  </button>
                )}
                {filteredTutors.length > 1 && !tutorsLoading && (
                  <button onClick={() => setIsCompareOpen(true)}
                    className="border border-slate-200 bg-white text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Compare Tutors
                  </button>
                )}
              </div>
            </div>

            {tutorToast && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {tutorToast}
              </div>
            )}
            {tutorsError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{tutorsError}</div>}

            {!tutorsLoading && topRecommendedTutors.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-800">Auto-suggested best 5 matches</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
                    Ranked by match score
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topRecommendedTutors.map((t, idx) => (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => handleSelectTutor(t)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${idx === 0
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {idx === 0 ? 'Top Match: ' : ''}{t.name} ({t.matchingScore || 0}%)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!tutorsLoading && alternativeDiscoverSkills.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Alternative skills you may explore</h3>
                <div className="flex flex-wrap gap-2">
                  {alternativeDiscoverSkills.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setTutorSearch(item.name);
                        setTimeout(() => loadTutors(), 0);
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      {item.name} · {item.count} tutors
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tutorsLoading ? (
              <div className="text-center py-16 text-slate-400 text-sm">Searching tutors...</div>
            ) : filteredTutors.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">🎓</div>
                <p className="text-sm">No tutors found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <p className="text-sm text-slate-500 mb-4">{filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''} found</p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredTutors.map((tutor, idx) => (
                      <DiscoverTutorMatchCard
                        key={tutor._id}
                        tutor={tutor}
                        isTopMatch={idx === 0 && (tutor.matchingScore || 0) > 0}
                        onSelect={() => handleSelectTutor(tutor)}
                        onBlock={() => handleBlockTutor(tutor._id)}
                        onReport={() => handleReportTutor(tutor._id)}
                        isReported={reportedTutorIds.has(tutor._id)}
                      />
                    ))}
                  </div>
                </div>
                <aside className="lg:col-span-1 space-y-5">
                  {!selectedTutorForDetails ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
                      <div className="text-2xl mb-2">👆</div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Insights appear here</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Select a tutor to view matching breakdown, demand for selected skill, and request analytics.
                      </p>
                    </div>
                  ) : (
                    <>
                      {tutorAnalytics && (
                        <RequestAnalyticsPanel
                          tutorAnalytics={tutorAnalytics}
                          tutorName={selectedTutorForDetails.name}
                        />
                      )}
                      {selectedSkill && (
                        <MatchingScoreBreakdown
                          tutor={selectedTutorForDetails}
                          skill={selectedSkill}
                          learnerLevel={tutorLevel}
                        />
                      )}
                      {skillDemandData && (
                        <SkillDemandCard
                          skill={skillDemandData.skill}
                          demandCount={skillDemandData.demandCount}
                          totalTutors={skillDemandData.tutorCount}
                          averageAcceptanceRate={skillDemandData.acceptanceRate}
                        />
                      )}
                    </>
                  )}
                </aside>
              </div>
            )}
          </>
        )}

        {/* ── REQUESTS TAB ── */}
        {activeTab === 'requests' && (
          <>
            {reqToast && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {reqToast}
              </div>
            )}
            {reqError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">{reqError}</div>}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {(isTutor
                  ? [{ key: 'received', label: 'Received', count: received.length, badge: pendingCount }]
                  : [
                    { key: 'received', label: 'Received', count: received.length, badge: pendingCount },
                    { key: 'sent', label: 'Sent', count: sent.length },
                  ]
                ).map(({ key, label, count, badge }) => (
                  <button key={key} onClick={() => setReqTab(key)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${reqTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}>
                    {label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${reqTab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
                    {badge > 0 && <span className="text-xs bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
                  </button>
                ))}
              </div>

              <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl w-fit overflow-x-auto">
                {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled', 'Expired'].map((f) => (
                  <button key={f} onClick={() => setReqStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${reqStatusFilter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                      }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {reqLoading ? (
              <div className="text-center py-20 text-slate-400 text-sm">Loading requests...</div>
            ) : (
              <div className="space-y-3">
                {(reqTab === 'received' ? received : sent)
                  .filter(r => {
                    const isExpired = r.status === 'Expired' || (
                      r.expiresAt && new Date(r.expiresAt) < new Date() && (r.status === 'Pending' || r.status === 'Cancelled')
                    );
                    const isCancelled = !isExpired && (r.status === 'Cancelled' || r.isWithdrawn);
                    
                    if (reqStatusFilter === 'All') return true;
                    if (reqStatusFilter === 'Cancelled') return isCancelled;
                    if (reqStatusFilter === 'Expired') return isExpired;
                    if (reqStatusFilter === 'Pending') return r.status === 'Pending' && !isCancelled && !isExpired;
                    return r.status === reqStatusFilter && !isCancelled && !isExpired;
                  })
                  .map(r => (
                    <ReqCard key={r._id} request={r} currentUserId={user?._id} onUpdate={updateStatus} updating={updating} onCancel={handleCancel} canceling={canceling} />
                  ))}
                {(reqTab === 'received' ? received : sent).length === 0 && (
                  <div className="text-center py-10 text-slate-400 bg-white border border-slate-100 rounded-2xl">
                    <p className="text-sm">{reqTab === 'received' ? 'No one has sent you a request yet' : "You haven't sent any requests yet"}</p>
                  </div>
                )}
                {(reqTab === 'received' ? received : sent).length > 0 && (reqTab === 'received' ? received : sent).filter(r => {
                    const isExpired = r.status === 'Expired' || (
                      r.expiresAt && new Date(r.expiresAt) < new Date() && (r.status === 'Pending' || r.status === 'Cancelled')
                    );
                    const isCancelled = !isExpired && (r.status === 'Cancelled' || r.isWithdrawn);
                    
                    if (reqStatusFilter === 'All') return true;
                    if (reqStatusFilter === 'Cancelled') return isCancelled;
                    if (reqStatusFilter === 'Expired') return isExpired;
                    if (reqStatusFilter === 'Pending') return r.status === 'Pending' && !isCancelled && !isExpired;
                    return r.status === reqStatusFilter && !isCancelled && !isExpired;
                }).length === 0 && (
                    <div className="text-center py-10 text-slate-400 bg-white border border-slate-100 rounded-2xl">
                      <p className="text-sm">No {reqStatusFilter.toLowerCase()} requests found</p>
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </div>

      {modalItem && (
        <RequestModal item={modalItem} onClose={() => setModalItem(null)} onSend={handleSend} />
      )}

      <TutorComparisonModal
        tutors={filteredTutors}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
}
