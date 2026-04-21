import { useState } from 'react';

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

export function StarDisplay({ rating, size = 4 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-${size} h-${size} ${s <= rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

export function RatingSummary({ reviews }) {
  if (!reviews.length) return null;

  const total = reviews.length;
  const avg   = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);

  const counts = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm mb-6">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="text-center shrink-0">
          <p className="text-5xl font-extrabold text-amber-500 leading-none">{avg}</p>
          <StarDisplay rating={Math.round(Number(avg))} size={5} />
          <p className="text-xs text-slate-400 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 min-w-[160px] space-y-1.5">
          {counts.map(({ star, count }) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-3 shrink-0">{star}</span>
                <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-6 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ReviewCard({ review, currentUserId, onFlag, flaggedByMe = false }) {
  const [showFlagUI, setShowFlagUI] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagError, setFlagError] = useState('');

  const isGiven = String(review.learner?._id) === String(currentUserId);
  const reviewer = review.learner;
  const recipient = review.tutor;

  const canFlag = currentUserId &&
    String(review.learner?._id) !== String(currentUserId) &&
    !flaggedByMe &&
    onFlag;

  async function handleFlagSubmit() {
    setFlagError('');
    try {
      await onFlag(review._id, flagReason);
      setShowFlagUI(false);
      setFlagReason('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err?.message || 'Failed to flag review. Please try again.';
      setFlagError(errorMsg);
    }
  }

  function handleFlagCancel() {
    setShowFlagUI(false);
    setFlagReason('');
    setFlagError('');
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
          {reviewer?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-slate-800 text-sm">{reviewer?.name || 'Anonymous'}</p>
              <p className="text-xs text-slate-400">
                {isGiven ? <>To <span className="text-slate-600">{recipient?.name}</span></> : <>Reviewed you</>}
                {review.createdAt && <> · {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</>}
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <StarDisplay rating={review.rating} size={4} />
              <span className="text-xs font-bold text-amber-500">Rating: {review.rating}/5</span>
            </div>
          </div>
        </div>
      </div>

      {review.session?.title && (
        <p className="text-xs text-indigo-500 font-medium mb-2 ml-12">Session: {review.session.title}</p>
      )}

      {review.comment && (
        <div className="bg-slate-50 rounded-xl px-4 py-3 leading-relaxed border border-slate-100 ml-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Feedback Comment</p>
          <p className="text-sm text-slate-600">{review.comment}</p>
        </div>
      )}

      {/* Flag UI */}
      {showFlagUI && (
        <div className="mt-3 ml-12">
          <select
            value={flagReason}
            onChange={e => setFlagReason(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-amber-300"
          >
            <option value="">Select a reason...</option>
            <option value="Spam">Spam</option>
            <option value="Offensive language">Offensive language</option>
            <option value="False information">False information</option>
            <option value="Irrelevant">Irrelevant</option>
          </select>
          {flagError && <p className="text-xs text-red-500 mt-1">{flagError}</p>}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleFlagSubmit}
              disabled={!flagReason}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
            <button
              onClick={handleFlagCancel}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Flag button / indicator */}
      <div className="flex justify-end mt-2">
        {flaggedByMe ? (
          <span className="text-xs text-slate-400 select-none">🚩 Flagged</span>
        ) : canFlag && !showFlagUI ? (
          <button
            onClick={() => setShowFlagUI(true)}
            className="text-xs text-slate-400 hover:text-amber-500 transition-colors"
          >
            🚩 Flag
          </button>
        ) : null}
      </div>
    </div>
  );
}
