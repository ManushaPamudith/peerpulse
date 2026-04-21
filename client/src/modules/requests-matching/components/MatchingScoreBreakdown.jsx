export default function MatchingScoreBreakdown({ tutor, skill, learnerLevel }) {
  if (!tutor || !skill) return null;

  // Calculate component scores (matching the backend logic)
  const matchedSkill = tutor.skills?.find(
    (s) => s.skill && skill && s.skill.toLowerCase() === skill.toLowerCase()
  );
  const isVerified =
    matchedSkill &&
    (matchedSkill.verificationStatus === 'verified' || matchedSkill.verified === true);

  // Skill Match (40%)
  const skillMatchScore = matchedSkill ? 40 : 0;

  // Level Match (20%) — same rules as requestController.calculateMatchingScore
  let levelMatchScore = 0;
  if (matchedSkill) {
    const filterLevel = (learnerLevel || '').trim();
    if (!filterLevel) {
      levelMatchScore = 20;
    } else if (matchedSkill.level === filterLevel) {
      levelMatchScore = 20;
    } else {
      levelMatchScore = 10;
    }
  }

  // Verification (15%)
  const verificationScore = isVerified ? 15 : 0;

  // Rating (15%)
  const ratingScore = tutor.averageRating ? (tutor.averageRating / 5) * 15 : 0;

  // Availability (10%)
  const availabilityScore = tutor.availability?.isAvailable ? 10 : 5;

  const totalScore = Math.min(100, Math.round(skillMatchScore + levelMatchScore + verificationScore + ratingScore + availabilityScore));

  const components = [
    { label: 'Skill Match', score: skillMatchScore, max: 40, color: 'bg-blue-500', icon: '🎯' },
    { label: 'Level Match', score: levelMatchScore, max: 20, color: 'bg-purple-500', icon: '📊' },
    { label: 'Verification', score: verificationScore, max: 15, color: 'bg-emerald-500', icon: '✓' },
    { label: 'Rating', score: Math.round(ratingScore), max: 15, color: 'bg-amber-500', icon: '⭐' },
    { label: 'Availability', score: availabilityScore, max: 10, color: 'bg-cyan-500', icon: '📅' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800">Matching Score Breakdown</h4>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">{totalScore}%</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        {components.map((comp, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">{comp.icon}</span>
                <span className="font-medium text-slate-700">{comp.label}</span>
              </div>
              <span className="font-bold text-slate-800">{comp.score}/{comp.max}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`${comp.color} h-full rounded-full transition-all`}
                style={{ width: `${Math.min(100, (comp.score / comp.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Details Section */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
        {matchedSkill && (
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-slate-700">Skill Found</p>
              <p className="text-slate-500">{matchedSkill.skill} at {matchedSkill.level} level</p>
            </div>
          </div>
        )}
        {isVerified && (
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-slate-700">Verified Tutor</p>
              <p className="text-slate-500">This skill has been verified</p>
            </div>
          </div>
        )}
        {tutor.averageRating > 3.5 && (
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">⭐</span>
            <div>
              <p className="font-medium text-slate-700">Highly Rated</p>
              <p className="text-slate-500">{tutor.averageRating.toFixed(1)} average rating from {tutor.reviewCount} reviews</p>
            </div>
          </div>
        )}
        {!matchedSkill && (
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">⚠️</span>
            <div>
              <p className="font-medium text-slate-700">Skill Not Found</p>
              <p className="text-slate-500">This tutor doesn't have this exact skill, but may be able to help</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="mt-3 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
        <p className="text-xs text-slate-900">
          💡 This score helps you find the best tutor match based on skill, experience, and availability.
        </p>
      </div>
    </div>
  );
}
