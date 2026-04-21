/** Presentational pieces for Discover Tutors (skill matching). */

const QUICK_SKILLS = ['React', 'Python', 'Data structures', 'Calculus'];

export function DiscoverSkillChips({ onPick, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs font-medium text-slate-500">Try:</span>
      {QUICK_SKILLS.map((name) => (
        <button
          key={name}
          type="button"
          disabled={disabled}
          onClick={() => onPick(name)}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {name}
        </button>
      ))}
    </div>
  );
}

export function DiscoverHowMatchingWorks() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2 mb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm">?</span>
        How matching works
      </h3>
      <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
        <li className="flex gap-2">
          <span className="text-indigo-500 font-bold shrink-0">1.</span>
          <span>
            <strong className="text-slate-800">Skill & level</strong> — We score how well a tutor&apos;s listed skills align with your search and level filter.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-indigo-500 font-bold shrink-0">2.</span>
          <span>
            <strong className="text-slate-800">Trust & activity</strong> — Verification, ratings, and response patterns refine the match.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-indigo-500 font-bold shrink-0">3.</span>
          <span>
            <strong className="text-slate-800">Your schedule</strong> — Optional &quot;Match my availability&quot; in Advanced filters compares preferred times.
          </span>
        </li>
      </ul>
    </div>
  );
}

export function DiscoverLoadingSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse"
        >
          <div className="flex gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-16 bg-slate-100 rounded-full" />
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-9 bg-slate-100 rounded-lg" />
            <div className="h-9 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

export function DiscoverEmptyState({ hasFilters }) {
  return (
    <div className="text-center py-16 px-6 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden relative">
      <div className="relative">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl mb-4">🔍</div>
        <p className="text-slate-800 font-semibold mb-1">No tutors match yet</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          {hasFilters
            ? 'Broaden the skill keyword, switch level to “All levels”, or turn off “Verified only”.'
            : 'Search for a skill above, or tap a quick suggestion to see who can help.'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-600">
          <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">Try Advanced → sort by match</span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">Check spelling</span>
        </div>
      </div>
    </div>
  );
}

export function DiscoverSidebarPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
      <div className="text-2xl mb-2">👆</div>
      <p className="text-sm font-semibold text-slate-700 mb-1">Insights appear here</p>
      <p className="text-xs text-slate-500 leading-relaxed">
        Click a tutor card to load match breakdown, demand for that skill, and request analytics.
      </p>
    </div>
  );
}
