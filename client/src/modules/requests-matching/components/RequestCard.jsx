const statusStyle = {
  Accepted: 'bg-green-50 text-green-700',
  Rejected: 'bg-slate-100 text-slate-500',
  Pending:  'bg-amber-50 text-amber-700',
};

export default function RequestCard({ request, currentUserId, onUpdate }) {
  const isTutor = request.tutor?._id === currentUserId;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{request.skill}</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Learner: <span className="text-slate-600">{request.learner?.name}</span>
            {' · '}
            Tutor: <span className="text-slate-600">{request.tutor?.name}</span>
          </p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[request.status] || 'bg-slate-100 text-slate-500'}`}>
          {request.status}
        </span>
      </div>

      {request.message && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 mb-4 leading-relaxed">
          {request.message}
        </p>
      )}

      {isTutor && request.status === 'Pending' && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onUpdate(request._id, 'Accepted')}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => onUpdate(request._id, 'Rejected')}
            className="border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
