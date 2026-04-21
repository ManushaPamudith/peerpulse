export default function StatCard({ title, value, detail, icon, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green:  'bg-green-50 text-green-600',
    blue:   'bg-blue-50 text-blue-600',
    amber:  'bg-amber-50 text-amber-600',
    rose:   'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color] || colors.indigo}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
      {detail && <p className="text-xs text-slate-400">{detail}</p>}
    </div>
  );
}
