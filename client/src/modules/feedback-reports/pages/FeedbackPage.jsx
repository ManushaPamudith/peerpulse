import { useEffect, useState, useMemo } from 'react';
import api from '../../../core/services/api';
import { useAuth } from '../../../core/context/AuthContext';
import ReviewCard, { RatingSummary } from '../components/ReviewCard';

// ── Star Picker ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1 items-center flex-wrap">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)} className="focus:outline-none">
          <svg className={`w-8 h-8 transition-colors ${s <= (hovered || value) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm font-semibold text-slate-600">Selected Rating: {value} out of 5</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const { user } = useAuth();
  const [sessions, setSessions]     = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [avgRatingFromServer, setAvgRatingFromServer] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState('');
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('submit');
  const [form, setForm]             = useState({ sessionId: '', rating: 5, comment: '' });
  const [formError, setFormError]   = useState('');
  const [sortBy, setSortBy]         = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [flaggedReviewIds, setFlaggedReviewIds] = useState(new Set());

  useEffect(() => {
    if (user?.role === 'tutor') setActiveTab('received');
  }, [user]);

  const load = async () => {
    try {
      const [sRes, rRes] = await Promise.all([api.get('/sessions/my'), api.get('/reviews/my')]);
      setSessions(sRes.data.sessions.filter(s => s.status === 'Completed' && String(s.learner?._id || s.learner) === String(user?._id)));
      setReviews(rRes.data.reviews);
      setAvgRatingFromServer(rRes.data.avgRating ?? null);
    } catch {
      setError('Unable to load feedback data right now. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reviewedSessionIds = useMemo(
    () => new Set(reviews.filter(r => String(r.learner?._id) === String(user?._id)).map(r => r.session?._id || r.session)),
    [reviews, user]
  );
  const pendingSessions = useMemo(
    () => sessions.filter(s => !reviewedSessionIds.has(s._id)),
    [sessions, reviewedSessionIds]
  );

  const avgRating = avgRatingFromServer;

  const notify = (msg, type = 'ok') => {
    if (type === 'ok') { setToast(msg); setTimeout(() => setToast(''), 4000); }
    else               { setError(msg); setTimeout(() => setError(''), 5000); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.sessionId) { setFormError('Please select a session'); return; }
    if (!form.rating)    { setFormError('Rating is required'); return; }
    if (!form.comment.trim()) { setFormError('Feedback comment is required'); return; }
    const sess = sessions.find(s => s._id === form.sessionId);
    if (!sess || sess.status !== 'Completed') { setFormError('Feedback can only be submitted for completed sessions.'); return; }
    if (reviewedSessionIds.has(form.sessionId)) { setFormError('You have already submitted feedback for this session.'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { sessionId: form.sessionId, rating: form.rating, comment: form.comment.trim() });
      notify('Feedback submitted successfully.');
      setForm({ sessionId: '', rating: 5, comment: '' });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Unable to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const givenReviews    = reviews.filter(r => String(r.learner?._id) === String(user?._id));
  const receivedReviews = reviews.filter(r => String(r.tutor?._id)   === String(user?._id));

  // Show Submit/Given tabs only when the user has sessions where they are the learner
  // This handles users who are tutors by role but also learners in some sessions
  const hasLearnerSessions = sessions.length > 0 || givenReviews.length > 0;
  const TABS = !hasLearnerSessions && receivedReviews.length > 0
    ? [{ key: 'received', label: 'Received', icon: '📥' }]
    : [
        { key: 'submit',   label: 'Submit Feedback', icon: '⭐' },
        { key: 'given',    label: 'Given',           icon: '📤' },
        { key: 'received', label: 'Received',        icon: '📥' },
      ];

  const displayedReviews = useMemo(() => {
    let filtered = filterRating === 'all'
      ? receivedReviews
      : receivedReviews.filter(r => r.rating === Number(filterRating));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest')  return a.rating - b.rating;
      return 0;
    });
  }, [receivedReviews, sortBy, filterRating]);

  const handleFlag = async (reviewId, reason) => {
    try {
      await api.post(`/reviews/${reviewId}/flag`, { reason });
      setFlaggedReviewIds(prev => new Set([...prev, String(reviewId)]));
    } catch (err) {
      const errorMsg = err.response?.data?.message || err?.message || 'Failed to flag review. Please try again.';
      throw new Error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero — amber theme, same structure as other PageHeaders ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #78350f 0%, #92400e 25%, #b45309 50%, #d97706 75%, #f59e0b 100%)' }}>
        {/* dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="fb-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fb-grid)" />
        </svg>
        {/* glow orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)' }} />
        {/* content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Ratings & Feedback</h1>
          <p className="text-amber-200 text-sm mt-2">Rate your completed sessions and view feedback from peers</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs font-semibold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">
              {sessions.length} completed session{sessions.length !== 1 ? 's' : ''}
            </span>
            {pendingSessions.length > 0 && (
              <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
                {pendingSessions.length} awaiting feedback
              </span>
            )}
            {avgRating && (
              <span className="text-xs font-semibold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full">
                ⭐ {avgRating} avg rating
              </span>
            )}
          </div>
        </div>
        {/* wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Toasts */}
        {toast && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {toast}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">{error}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-7 flex-wrap">
          {TABS.map(({ key, label, icon }) => {
            const count = key === 'given' ? givenReviews.length : key === 'received' ? receivedReviews.length : pendingSessions.length;
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <span>{icon}</span>{label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── SUBMIT TAB ── */}
        {activeTab === 'submit' && (
          pageLoading ? (
            <div className="text-center py-16 text-slate-400 text-sm">Loading feedback data...</div>
          ) : pendingSessions.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-sm font-medium text-slate-600">
                {sessions.length === 0 ? 'No completed sessions yet.' : 'All completed sessions have been reviewed.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Complete a session to leave feedback.</p>
            </div>
          ) : (
            <div className="max-w-lg">
              <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-base">⭐</span>
                  Submit Feedback
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Completed Session <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                      value={form.sessionId}
                      onChange={e => setForm({ ...form, sessionId: e.target.value })}
                      required
                    >
                      <option value="">Select a session to review</option>
                      {pendingSessions.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.title} — {new Date(s.scheduledAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Choose one completed session that you have not reviewed yet.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <StarPicker value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition"
                      rows={4}
                      value={form.comment}
                      onChange={e => setForm({ ...form, comment: e.target.value })}
                      placeholder="Share your experience with this session..."
                    />
                    <p className="text-xs text-slate-400 mt-1">Keep your feedback clear, respectful, and specific.</p>
                  </div>
                  {formError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">{formError}</div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !form.sessionId || !form.comment.trim()}
                    title="Submit your feedback for this session"
                    className="w-full bg-amber-400 text-slate-900 font-bold py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 text-sm"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            </div>
          )
        )}

        {/* ── GIVEN TAB ── */}
        {activeTab === 'given' && (
          givenReviews.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
              <div className="text-4xl mb-3">📤</div>
              <p className="text-sm text-slate-500">You have not submitted any feedback yet.</p>
              <p className="text-xs text-slate-400 mt-1">Submit feedback after a completed session to see it here.</p>
            </div>
          ) : (
            <div className="max-w-2xl">
              <p className="text-sm text-slate-500 mb-4">{givenReviews.length} review{givenReviews.length !== 1 ? 's' : ''} submitted</p>
              <div className="space-y-4">
                {givenReviews.map(r => <ReviewCard key={r._id} review={r} currentUserId={user?._id} onFlag={handleFlag} flaggedByMe={flaggedReviewIds.has(String(r._id))} />)}
              </div>
            </div>
          )
        )}

        {/* ── RECEIVED TAB ── */}
        {activeTab === 'received' && (
          receivedReviews.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
              <div className="text-4xl mb-3">📥</div>
              <p className="text-sm text-slate-500">No feedback received yet.</p>
              <p className="text-xs text-slate-400 mt-1">New feedback from learners will appear here.</p>
            </div>
          ) : (
            <div className="max-w-2xl">
              <RatingSummary reviews={receivedReviews} />
              <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <p className="text-sm font-semibold text-slate-700">Feedback Summary Report</p>
                  <button
                    type="button"
                    className="text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg cursor-default"
                    title="Report generation is available from the Admin reports page"
                  >
                    Generate Feedback Report
                  </button>
                </div>
                {/* Filters help tutors quickly focus on specific rating groups. */}
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest">Highest rating</option>
                      <option value="lowest">Lowest rating</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Rating</label>
                    <select
                      value={filterRating}
                      onChange={e => setFilterRating(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
                    >
                      <option value="all">All ratings</option>
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </div>
                </div>
              </div>
              {displayedReviews.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No feedback entries match your selected filters yet.</p>
              ) : (
                <div className="space-y-4">
                  {displayedReviews.map(r => <ReviewCard key={r._id} review={r} currentUserId={user?._id} onFlag={handleFlag} flaggedByMe={flaggedReviewIds.has(String(r._id))} />)}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
