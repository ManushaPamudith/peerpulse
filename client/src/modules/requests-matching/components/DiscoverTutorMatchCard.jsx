import { Link } from 'react-router-dom';

export default function DiscoverTutorMatchCard({ tutor, isTopMatch, onSelect, onBlock, onReport, isReported }) {
  const verifiedCount = (tutor.skills || []).filter(
    (s) => s.verificationStatus === 'verified' || s.verified
  ).length;

  const cardCls = isTopMatch
    ? 'border-2 border-indigo-300 ring-1 ring-indigo-100 bg-white shadow-sm hover:shadow-md'
    : verifiedCount > 0
      ? 'border-2 border-emerald-300 bg-linear-to-br from-emerald-50 via-white to-emerald-50/30 shadow-md hover:shadow-lg hover:-translate-y-0.5'
      : 'border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200';

  return (
    <article
      className={`rounded-2xl p-5 transition-all hover:shadow-md ${cardCls}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 truncate">{tutor.name}</h3>
            {isTopMatch && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                TOP MATCH
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{tutor.university || 'SLIIT'}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold text-slate-900">{tutor.matchingScore || 0}%</div>
          <p className="text-[10px] text-slate-500">Match Score</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {typeof tutor.averageRating === 'number' && tutor.averageRating > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            ⭐ {tutor.averageRating.toFixed(1)} ({tutor.reviewCount || 0})
          </span>
        )}
        {!!tutor.responseRateLabel && (
          <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
            ⚡ {tutor.responseRateLabel}
          </span>
        )}
        {!!tutor.demandTag && (
          <span className="px-2.5 py-1 rounded-full bg-violet-50 text-slate-900 border border-violet-200">
            📈 {tutor.demandTag}
          </span>
        )}
        {verifiedCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ {verifiedCount} verified
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        {(tutor.skills || []).slice(0, 3).map((s) => (
          <div key={`${tutor._id}-${s.skill}-${s.level}`} className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-700">{s.skill}</span>
            <span className="text-slate-400">({s.level})</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{tutor.lastActiveLabel || 'No activity info'}</p>
          {isReported && (
            <span className="inline-flex mt-2 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
              Reported
            </span>
          )}
        </div>
        <Link
          to={`/profile/${tutor._id}`}
          className="text-xs font-semibold text-slate-900 hover:text-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          View profile →
        </Link>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBlock?.();
          }}
          className="flex-1 bg-slate-50 text-slate-900 text-xs font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
        >
          Block
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReport?.();
          }}
          disabled={isReported}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors border ${isReported ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border-slate-200'}`}>
          {isReported ? 'Reported' : 'Report'}
        </button>
      </div>
    </article>
  );
}
