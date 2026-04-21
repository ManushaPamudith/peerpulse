export default function SkillDemandCard({ skill, demandCount, totalTutors, averageAcceptanceRate }) {
  if (!skill) return null;

  // Calculate demand level
  const demandPercentage = totalTutors > 0 ? Math.min(100, Math.round((demandCount / totalTutors) * 100)) : 0;
  
  const getDemandLevel = () => {
    if (demandCount >= 10) return { label: '🔥 High Demand', color: 'bg-red-50 border-red-200 text-red-700' };
    if (demandCount >= 5) return { label: '📈 Growing', color: 'bg-amber-50 border-amber-200 text-amber-700' };
    return { label: '📊 Moderate', color: 'bg-blue-50 border-blue-200 text-blue-700' };
  };

  const demandLevel = getDemandLevel();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="font-bold text-slate-800">Market Demand</h4>
          <p className="text-xs text-slate-400 mt-0.5">{skill}</p>
        </div>
      </div>

      {/* Demand Badge */}
      <div className={`inline-block px-3 py-1.5 rounded-full border font-semibold text-sm mb-4 ${demandLevel.color}`}>
        {demandLevel.label}
      </div>

      {/* Demand Stats */}
      <div className="space-y-3 mb-4">
        {/* Request Count */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700">Active Requests</span>
            <span className="font-bold text-slate-800">{demandCount} learners</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (demandCount / 15) * 100)}%` }}
            />
          </div>
        </div>

        {/* Demand Percentage */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700">Demand vs Market</span>
            <span className="font-bold text-slate-800">{demandPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-full rounded-full transition-all ${
                demandPercentage > 60 ? 'bg-red-500' :
                demandPercentage > 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${demandPercentage}%` }}
            />
          </div>
        </div>

        {/* Acceptance Rate */}
        {averageAcceptanceRate !== undefined && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Avg Acceptance Rate</span>
              <span className="font-bold text-slate-800">{Math.round(averageAcceptanceRate * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${averageAcceptanceRate * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
        {demandCount > 10 && (
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold text-base">🔴</span>
            <div>
              <p className="font-medium text-slate-700">High Demand Skill</p>
              <p className="text-slate-500">Many learners are seeking help with this skill right now</p>
            </div>
          </div>
        )}
        {averageAcceptanceRate && averageAcceptanceRate > 0.7 && (
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold text-base">✓</span>
            <div>
              <p className="font-medium text-slate-700">High Success Rate</p>
              <p className="text-slate-500">Most requests for this skill are accepted by tutors</p>
            </div>
          </div>
        )}
        {averageAcceptanceRate && averageAcceptanceRate < 0.5 && (
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold text-base">⚠️</span>
            <div>
              <p className="font-medium text-slate-700">Low Acceptance</p>
              <p className="text-slate-500">Tutors are selective or have limited availability for this skill</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
