import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../core/services/api';
import { useAuth } from '../../../core/context/AuthContext';
import SkillCard from '../components/SkillCard';
import ReviewCard from '../../feedback-reports/components/ReviewCard';

// ── Star rating display ───────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Request modal ─────────────────────────────────────────────────────────────
function RequestModal({ tutor, skill, onClose, onSend, loading }) {
  const [message, setMessage] = useState(`Hi ${tutor.name}, I'd like to learn ${skill.skill} from you.`);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { setErr('Please enter a short message for the tutor.'); return; }
    setErr('');
    await onSend(message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800">Send Request</h3>
            <p className="text-xs text-slate-400 mt-0.5">{skill.skill} · {skill.level} · {tutor.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message to tutor</label>
            <textarea
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
              rows={4} value={message} onChange={e => setMessage(e.target.value)} required
            />
            {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !message.trim()}
              className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [profile,          setProfile]          = useState(null);
  const [reviews,          setReviews]          = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [notFound,         setNotFound]         = useState(false);
  const [modal,            setModal]            = useState(null);
  const [sending,          setSending]          = useState(false);
  const [toast,            setToast]            = useState('');
  const [toastType,        setToastType]        = useState('ok');
  const [flaggedReviewIds, setFlaggedReviewIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, reviewRes] = await Promise.all([
          api.get(`/users/${id}/public`),
          api.get(`/reviews/user/${id}`),
        ]);
        setProfile(profileRes.data.user);
        // Only show reviews where this user was the tutor (received reviews)
        const allReviews = reviewRes.data.reviews || [];
        setReviews(allReviews.filter(r => String(r.tutor?._id ?? r.tutor) === id));
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const notify = (msg, type = 'ok') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 4000);
  };

  const handleFlag = async (reviewId, reason) => {
    await api.post(`/reviews/${reviewId}/flag`, { reason });
    setFlaggedReviewIds(prev => new Set([...prev, String(reviewId)]));
  };

  const handleSendRequest = async (message) => {
    if (!modal) return;
    setSending(true);
    try {
      await api.post('/requests', {
        tutorId: profile._id,
        skill:   modal.skill.skill,
        message,
      });
      setModal(null);
      notify(`Request sent to ${profile.name}`);
    } catch (err) {
      notify(err.response?.data?.message || 'Request failed', 'err');
    } finally {
      setSending(false);
    }
  };

  const isOwnProfile = user?._id === id || user?._id === profile?._id?.toString();
  const verifiedSkills   = (profile?.skills || []).filter(s => s.verificationStatus === 'verified' || s.verified);
  const unverifiedSkills = (profile?.skills || []).filter(s => s.verificationStatus !== 'verified' && !s.verified);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">User not found</h2>
          <p className="text-sm text-slate-400 mb-6">This profile does not exist or has been removed.</p>
          <button onClick={() => navigate(-1)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg
          ${toastType === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast}
        </div>
      )}

      {/* ── Profile hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6d28d9 100%)' }}>
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="pub-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1.5" fill="white" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#pub-grid)" />
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
          {/* Back button */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl border-4 border-white/30 shadow-2xl flex items-center justify-center text-3xl font-black text-white shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))' }}>
              {profile.profilePicture
                ? <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                : profile.name?.charAt(0).toUpperCase()
              }
            </div>

            {/* Name + meta */}
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{profile.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400 text-indigo-100">
                  {profile.university || 'SLIIT'}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full border border-violet-400 text-violet-100">
                  🎓 {profile.role === 'admin' ? 'Admin' : 'Student'}
                </span>
                {verifiedSkills.length > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-white">
                    ✓ {verifiedSkills.length} Verified Skill{verifiedSkills.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {profile.averageRating > 0 && (
              <div className="text-center px-4 py-2 rounded-2xl border border-white/20 shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <p className="text-2xl font-black text-white leading-none">{profile.averageRating.toFixed(1)}</p>
                <Stars rating={profile.averageRating} />
                <p className="text-xs text-indigo-200 mt-1">{profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-xs">📝</span>
              About
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-xs">🧠</span>
              Skills
            </h2>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
              {profile.skills.length} skill{profile.skills.length !== 1 ? 's' : ''}
            </span>
          </div>

          {profile.skills.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p className="text-sm">No skills listed yet.</p>
              <p className="text-xs mt-1">This user has not added skills to their public profile yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Verified skills first */}
              {verifiedSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                    ✓ Verified Skills
                  </p>
                  <div className="space-y-2">
                    {verifiedSkills.map(s => (
                      <div key={s._id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <SkillCard {...s} />
                        </div>
                        {/* Send request button per skill — hidden on own profile */}
                        {!isOwnProfile && (
                          <button
                            onClick={() => setModal({ skill: s })}
                            className="shrink-0 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Request
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unverified skills */}
              {unverifiedSkills.length > 0 && (
                <div>
                  {verifiedSkills.length > 0 && (
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 mt-3">
                      Other Skills
                    </p>
                  )}
                  <div className="space-y-2">
                    {unverifiedSkills.map(s => (
                      <div key={s._id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <SkillCard {...s} />
                        </div>
                        {!isOwnProfile && (
                          <button
                            onClick={() => setModal({ skill: s })}
                            className="shrink-0 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Request
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews received */}
        {reviews.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center text-xs">⭐</span>
                Reviews
              </h2>
              <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Rating summary bar */}
            {(() => {
              const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
              const counts = [5,4,3,2,1].map(star => ({
                star,
                count: reviews.filter(r => r.rating === star).length,
              }));
              const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
              return (
                <div className="flex items-center gap-6 flex-wrap bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-4">
                  <div className="text-center shrink-0">
                    <p className="text-4xl font-extrabold text-amber-500 leading-none">{avg}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className={`w-4 h-4 ${s <= Math.round(Number(avg)) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d={STAR_PATH} />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 min-w-[140px] space-y-1.5">
                    {counts.map(({ star, count }) => {
                      const pct = Math.round((count / reviews.length) * 100);
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-3 shrink-0">{star}</span>
                          <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-5 text-right shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Individual review cards */}
            <div className="space-y-3">
              {reviews.map(r => (
                <ReviewCard
                  key={r._id}
                  review={r}
                  currentUserId={user?._id}
                  onFlag={!isOwnProfile ? handleFlag : undefined}
                  flaggedByMe={flaggedReviewIds.has(String(r._id))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Member since */}
        <p className="text-xs text-slate-400 text-center">
          Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Request modal */}
      {modal && (
        <RequestModal
          tutor={profile}
          skill={modal.skill}
          onClose={() => setModal(null)}
          onSend={handleSendRequest}
          loading={sending}
        />
      )}
    </div>
  );
}
