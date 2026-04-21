const levelColors = {
  Beginner:     'bg-sky-50 text-sky-700',
  Intermediate: 'bg-indigo-50 text-indigo-700',
  Advanced:     'bg-violet-50 text-violet-700',
  Expert:       'bg-purple-50 text-purple-700',
};

// ── Verified — prominent green shield badge ──────────────────────────────────
function VerifiedBadge({ method }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-emerald-200">
      {/* shield-check icon */}
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Verified
      {method && method !== 'none' && (
        <span className="opacity-80 font-normal">· {method === 'mcq' ? 'Quiz' : 'Grade'}</span>
      )}
    </span>
  );
}

// ── Pending ──────────────────────────────────────────────────────────────────
function PendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      Pending
    </span>
  );
}

// ── Rejected ─────────────────────────────────────────────────────────────────
function RejectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded-full">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      Rejected
    </span>
  );
}

// ── Not Verified ─────────────────────────────────────────────────────────────
function UnverifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-full">
      Unverified
    </span>
  );
}

/**
 * SkillCard
 *
 * Props:
 *   skill              — skill name string
 *   level              — Beginner | Intermediate | Advanced | Expert
 *   type               — Technical Skill | Academic Module
 *   verified           — boolean (legacy, still supported)
 *   verificationStatus — 'unverified' | 'pending' | 'verified' | 'rejected'
 *   verificationMethod — 'none' | 'mcq' | 'grade'
 *   pendingVerification — boolean (legacy fallback, still supported)
 *   categoryKey        — optional, shown as sub-label for technical skills
 *   moduleCode         — optional, shown as sub-label for academic modules
 */
export default function SkillCard({
  skill,
  level,
  verified,
  type,
  verificationStatus,
  verificationMethod,
  pendingVerification,
  categoryKey,
  moduleCode,
}) {
  // Resolve status — prefer verificationStatus field, fall back to legacy props
  const status = verificationStatus
    || (verified ? 'verified' : pendingVerification ? 'pending' : 'unverified');

  const isVerified = status === 'verified';
  const isPending  = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <div className={`rounded-xl p-4 flex items-start justify-between gap-3 shadow-sm border transition-colors
      ${isVerified
        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-white'
        : isPending
          ? 'border-amber-200 bg-amber-50/30'
          : isRejected
            ? 'border-red-200 bg-red-50/20'
            : 'border-slate-100 bg-white'}`}>

      <div className="flex-1 min-w-0">
        {/* Skill name + level pill */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {/* Verified checkmark inline with name */}
          {isVerified && (
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <h4 className={`font-semibold text-sm ${isVerified ? 'text-emerald-900' : 'text-slate-800'}`}>
            {skill}
          </h4>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[level] || 'bg-slate-100 text-slate-600'}`}>
            {level}
          </span>
        </div>

        {/* Type + category/module sub-label */}
        <p className="text-xs text-slate-400">{type}</p>
        {type === 'Technical Skill' && categoryKey && (
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{categoryKey.replace(/_/g, ' ')}</p>
        )}
        {type === 'Academic Module' && moduleCode && (
          <p className="text-xs text-slate-400 mt-0.5">{moduleCode}</p>
        )}
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        {isVerified  && <VerifiedBadge method={verificationMethod} />}
        {isPending   && <PendingBadge />}
        {isRejected  && <RejectedBadge />}
        {!isVerified && !isPending && !isRejected && <UnverifiedBadge />}
      </div>
    </div>
  );
}
