export default function RequestAnalyticsPanel({ tutorAnalytics, tutorName }) {
  if (!tutorAnalytics) return null;

  const {
    totalRequests = 0,
    acceptedCount = 0,
    rejectedCount = 0,
    avgResponseTime = null,
    acceptanceRate = 0,
    recentHistory = []
  } = tutorAnalytics;

  const getAcceptanceColor = () => {
    if (acceptanceRate >= 0.7) return 'text-emerald-600 bg-emerald-50';
    if (acceptanceRate >= 0.5) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const formatResponseTime = (ms) => {
    if (!ms) return 'N/A';
    const hours = Math.round(ms / 3600000);
    if (hours < 1) return 'Less than 1h';
    if (hours < 24) return `${hours}h avg`;
    const days = Math.round(hours / 24);
    return `${days}d avg`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="mb-4">
        <h4 className="font-bold text-slate-800">Request Analytics</h4>
        {tutorName && <p className="text-xs text-slate-400 mt-0.5">{tutorName}</p>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Total Requests */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="text-xs text-slate-600 font-medium">Total Requests</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalRequests}</p>
        </div>

        {/* Acceptance Rate */}
        <div className={`rounded-lg p-3 border ${getAcceptanceColor().split(' ')[1]} ${getAcceptanceColor().split(' ')[0]}`}>
          <p className="text-xs font-medium">Acceptance Rate</p>
          <p className="text-2xl font-bold mt-1">{Math.round(acceptanceRate * 100)}%</p>
        </div>

        {/* Accepted Count */}
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <p className="text-xs text-emerald-700 font-medium">✓ Accepted</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{acceptedCount}</p>
        </div>

        {/* Rejected Count */}
        <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-700 font-medium">✕ Declined</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-900 font-medium">⚡ Avg Response Time</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatResponseTime(avgResponseTime)}</p>
          </div>
          <span className="text-2xl">⏱️</span>
        </div>
      </div>


      {/* Insights */}
      <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        {acceptanceRate >= 0.7 ? (
          <p className="text-xs text-slate-900">
            ✓ <span className="font-medium">Reliable tutor</span> - High acceptance rate shows this tutor is responsive to requests
          </p>
        ) : acceptanceRate >= 0.4 ? (
          <p className="text-xs text-slate-900">
            💡 <span className="font-medium">Selective tutor</span> - This tutor is thoughtful about request selection
          </p>
        ) : (
          <p className="text-xs text-slate-900">
            ⚠️ <span className="font-medium">Limited availability</span> - This tutor may be very busy or selective
          </p>
        )}
      </div>
    </div>
  );
}
