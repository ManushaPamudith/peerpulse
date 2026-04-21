import { Link } from 'react-router-dom';

export default function TutorCard({ tutor, onRequest }) {
  const verifiedSkillCount = (tutor.skills || []).filter(
    s => s.verificationStatus === 'verified' || s.verified
  ).length;
  const hasVerified = verifiedSkillCount > 0;

  return (
    <div className={`relative rounded-2xl p-5 flex flex-col gap-4 transition-all
      ${hasVerified
        ? 'border-2 border-emerald-300 bg-linear-to-br from-emerald-50 via-white to-emerald-50/20 shadow-md hover:shadow-lg hover:-translate-y-0.5'
        : 'border border-slate-100 bg-white shadow-sm hover:shadow-md'
      }`}>

      {/* Verified tutor ribbon — top-left */}
      {hasVerified && (
        <div className="absolute -top-px -left-px">
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-tl-2xl rounded-br-xl flex items-center gap-1 shadow-sm">
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Tutor
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-start gap-3 ${hasVerified ? 'mt-3' : ''}`}>
        <Link to={`/profile/${tutor._id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
            ${hasVerified ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
            <span className={`font-bold text-sm ${hasVerified ? 'text-emerald-700' : 'text-indigo-700'}`}>
              {tutor.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className={`font-semibold truncate ${hasVerified ? 'text-emerald-900' : 'text-slate-800'}`}>
              {tutor.name}
            </h3>
            <p className="text-xs text-slate-400">{tutor.university}</p>
          </div>
        </Link>
        {/* Verified skill count badge */}
        {hasVerified && (
          <span className="shrink-0 text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
            {verifiedSkillCount} verified
          </span>
        )}
      </div>

      {/* Rating & Matching Score */}
      <div className="flex items-center gap-2 flex-wrap">
        {tutor.averageRating > 0 && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
            ⭐ {tutor.averageRating.toFixed(1)} ({tutor.reviewCount})
          </span>
        )}
        {typeof tutor.matchingScore === 'number' && (
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
            🎯 {tutor.matchingScore}% match
          </span>
        )}
        {tutor.responseRateLabel && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ⚡ {tutor.responseRateLabel}
          </span>
        )}
        {tutor.demandTag && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
            🔥 {tutor.demandTag}
          </span>
        )}
      </div>

      {tutor.lastActiveLabel && (
        <p className="text-xs text-slate-400">
          {tutor.lastActiveLabel}{tutor.availabilityLabel ? ` · ${tutor.availabilityLabel}` : ''}
        </p>
      )}
      {tutor.levelGapWarning && (
        <p className="text-xs text-amber-700 font-semibold">
          ⚠️ Level mismatch detected: consider a tutor closer to your chosen level.
        </p>
      )}

      {/* Skills list */}
      <div className="space-y-1.5">
        {(tutor.skills || []).map((s, i) => {
          const isVerified = s.verificationStatus === 'verified' || s.verified;
          return (
            <div key={i} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors
              ${isVerified
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center gap-2 min-w-0">
                {isVerified && (
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-sm font-medium truncate ${isVerified ? 'text-emerald-900' : 'text-slate-700'}`}>
                  {s.skill}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{s.level}</span>
              </div>
              {isVerified
                ? <span className="shrink-0 text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm shadow-emerald-200">
                    Verified
                  </span>
                : <span className="shrink-0 text-xs text-slate-400">—</span>
              }
            </div>
          );
        })}
      </div>

      {/* Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRequest(tutor, tutor.skills?.[0]);
        }}
        className={`w-full text-sm font-semibold py-2 rounded-xl transition-colors mt-auto
          ${hasVerified
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
      >
        Send Request
      </button>
    </div>
  );
}
