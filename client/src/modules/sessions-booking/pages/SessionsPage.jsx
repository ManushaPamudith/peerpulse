import { useEffect, useMemo, useState } from 'react';
import api from '../../../core/services/api';
import { useAuth } from '../../../core/context/AuthContext';
import SessionCard from '../components/SessionCard';
import PageHeader from '../../../shared/components/layout/PageHeader';

const DURATIONS = [30, 45, 60, 90, 120];
const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm bg-white';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

const emptyForm = {
  requestId: '',
  title: '',
  date: '',
  time: '',
  duration: 60,
  learnerGoal: '',
  agenda: '',
  note: '',
  sessionType: 'Online',
  meetingLink: '',
  location: '',
};

const statusCardStyles = {
  Scheduled: {
    wrap: 'bg-amber-50 border-amber-200',
    label: 'text-amber-700',
    count: 'text-amber-900',
    pill: 'bg-amber-100 text-amber-800',
  },
  Confirmed: {
    wrap: 'bg-sky-50 border-sky-200',
    label: 'text-sky-700',
    count: 'text-sky-900',
    pill: 'bg-sky-100 text-sky-800',
  },
  Ongoing: {
    wrap: 'bg-emerald-50 border-emerald-200',
    label: 'text-emerald-700',
    count: 'text-emerald-900',
    pill: 'bg-emerald-100 text-emerald-800',
  },
  Completed: {
    wrap: 'bg-violet-50 border-violet-200',
    label: 'text-violet-700',
    count: 'text-violet-900',
    pill: 'bg-violet-100 text-violet-800',
  },
  Cancelled: {
    wrap: 'bg-rose-50 border-rose-200',
    label: 'text-rose-700',
    count: 'text-rose-900',
    pill: 'bg-rose-100 text-rose-800',
  },
};

function NotificationCard({ item, onRead, tone = 'indigo' }) {
  const createdAt = item.createdAt ? new Date(item.createdAt) : null;
  const toneMap = {
    amber: 'bg-amber-50 border-amber-200',
    indigo: item.read ? 'bg-white border-slate-100' : 'bg-indigo-50/70 border-indigo-100',
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone] || toneMap.indigo}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.message}</p>
          {item.session?.title && (
            <p className="text-xs text-slate-400 mt-2">Session: {item.session.title}</p>
          )}
        </div>
        {!item.read && !String(item._id).startsWith('reminder-') && (
          <button
            onClick={() => onRead(item._id)}
            className="shrink-0 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50"
          >
            Mark read
          </button>
        )}
      </div>
      {createdAt && <p className="text-xs text-slate-400 mt-3">{createdAt.toLocaleString()}</p>}
    </div>
  );
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const roleLabel = useMemo(() => {
    const role = String(user?.role || '').toLowerCase();
    return role === 'tutor' || role === 'admin' ? 'Tutor' : 'Learner';
  }, [user?.role]);

  const load = async () => {
    try {
      const [rRes, sRes, revRes, notifyRes] = await Promise.all([
        api.get('/requests/my'),
        api.get('/sessions/my'),
        api.get('/reviews/my'),
        api.get('/notifications/my'),
      ]);
      setRequests(rRes.data.requests || []);
      setSessions(sRes.data.sessions || []);
      setReviewedIds(new Set((revRes.data.reviews || []).map((r) => r.session?._id || r.session)));
      setNotifications(notifyRes.data.notifications || []);
      setReminders(notifyRes.data.reminders || []);
    } catch {
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const acceptedRequests = useMemo(
    () => requests.filter((r) => r.status === 'Accepted'),
    [requests]
  );

  const latestAcceptedRequest = useMemo(() => {
    if (!acceptedRequests.length) return null;
    return [...acceptedRequests].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })[0];
  }, [acceptedRequests]);

  const upcoming = useMemo(
    () => sessions.filter((s) => !['Cancelled', 'Completed'].includes(s.status)).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
    [sessions]
  );
  const past = useMemo(
    () => sessions.filter((s) => ['Cancelled', 'Completed'].includes(s.status)).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)),
    [sessions]
  );

  const statusGroups = useMemo(() => ({
    Scheduled: sessions.filter((s) => s.status === 'Scheduled').length,
    Confirmed: sessions.filter((s) => s.status === 'Confirmed').length,
    Ongoing: sessions.filter((s) => s.status === 'Ongoing').length,
    Completed: sessions.filter((s) => s.status === 'Completed').length,
    Cancelled: sessions.filter((s) => s.status === 'Cancelled').length,
  }), [sessions]);

  const unreadNotificationCount = notifications.filter((item) => !item.read).length;

  const notify = (msg, type = 'ok') => {
    if (type === 'ok') {
      setToast(msg);
      setTimeout(() => setToast(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.requestId || !form.title.trim() || !form.date || !form.time || !form.learnerGoal.trim() || !form.agenda.trim()) {
      setFormError('Accepted request, title, date, time, learner goal, and agenda are required');
      return;
    }

    const scheduledAt = new Date(`${form.date}T${form.time}`);
    if (scheduledAt <= new Date()) {
      setFormError('Date and time must be in the future');
      return;
    }

    if (form.sessionType === 'Online' && !/^https?:\/\//i.test(form.meetingLink.trim())) {
      setFormError('Please enter a valid online meeting link');
      return;
    }

    if (form.sessionType === 'Physical' && !form.location.trim()) {
      setFormError('Please enter a location for the physical session');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/sessions', {
        requestId: form.requestId,
        title: form.title.trim(),
        scheduledAt: scheduledAt.toISOString(),
        duration: form.duration,
        learnerGoal: form.learnerGoal.trim(),
        agenda: form.agenda.trim(),
        note: form.note.trim(),
        sessionType: form.sessionType,
        meetingLink: form.sessionType === 'Online' ? form.meetingLink.trim() : '',
        location: form.sessionType === 'Physical' ? form.location.trim() : '',
      });
      notify('Session scheduled successfully');
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, payload) => {
    try {
      await api.patch(`/sessions/${id}`, payload);
      const status = payload.status;
      const msg = payload.rescheduleRequest?.action === 'request'
        ? 'Reschedule request sent'
        : payload.rescheduleRequest?.action === 'respond'
          ? `Reschedule request ${payload.rescheduleRequest.decision?.toLowerCase()}`
          : status === 'Cancelled'
            ? 'Session cancelled'
            : status === 'Confirmed'
              ? 'Session confirmed'
              : status === 'Ongoing'
                ? 'Session started'
                : status === 'Completed'
                  ? 'Session completed'
                  : 'Session updated';
      notify(msg);
      await load();
    } catch (err) {
      const message = err.response?.data?.message || 'Action failed';
      notify(message, 'err');
      throw new Error(message);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
    } catch {
      notify('Failed to mark notification as read', 'err');
    }
  };

  const visibleUpcoming = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Sessions"
        subtitle="Book, manage, reschedule, chat, and stay updated on every learning session"
        badges={[
          { label: `${upcoming.length} upcoming` },
          { label: `${past.length} past` },
          { label: `${unreadNotificationCount} unread notifications`, variant: unreadNotificationCount ? 'amber' : 'emerald' },
          ...(acceptedRequests.length > 0 ? [{ label: `${acceptedRequests.length} accepted request${acceptedRequests.length !== 1 ? 's' : ''} ready`, variant: 'emerald' }] : []),
        ]}
        action={
          acceptedRequests.length > 0 ? (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              {showForm ? '✕ Close Form' : '+ Book Session'}
            </button>
          ) : null
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {toast && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {toast}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-4 mb-7">
          {Object.entries(statusGroups).map(([label, count]) => {
            const ui = statusCardStyles[label];
            return (
              <div key={label} className={`border rounded-2xl p-4 shadow-sm ${ui.wrap}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-xs uppercase tracking-wide font-semibold ${ui.label}`}>{label}</p>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${ui.pill}`}>{label}</span>
                </div>
                <p className={`text-2xl font-bold mt-2 ${ui.count}`}>{count}</p>
              </div>
            );
          })}
        </div>

        {(reminders.length > 0 || notifications.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-5 mb-7">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-sm">⏰</span>
                    {roleLabel} Reminders
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Upcoming sessions and time-based reminders for the current {roleLabel.toLowerCase()} view</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">{reminders.length} items</span>
              </div>
              <div className="space-y-4">
                {reminders.length > 0 ? reminders.map((item) => (
                  <NotificationCard key={item._id} item={item} onRead={markNotificationRead} tone="amber" />
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-400 text-center">No reminders right now.</div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">🔔</span>
                    {roleLabel} Notifications
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Booking, reschedule, cancellation, and chat notifications for the current {roleLabel.toLowerCase()} view</p>
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">{notifications.length} items</span>
              </div>
              <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((item) => (
                  <NotificationCard key={item._id} item={item} onRead={markNotificationRead} />
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-400 text-center">No notifications right now.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-7">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">📅</span>
                Advanced Session Booking
              </h2>
              {latestAcceptedRequest && (
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full">
                  Latest accepted request highlighted below
                </span>
              )}
            </div>

            {latestAcceptedRequest && (
              <div className="mb-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">Last Accepted Request</p>
                <p className="text-sm font-semibold text-slate-800">
                  {latestAcceptedRequest.skill} with {latestAcceptedRequest.tutor?._id === user?._id ? latestAcceptedRequest.learner?.name : latestAcceptedRequest.tutor?.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">This request was accepted most recently and is highlighted for quick booking.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Accepted Request <span className="text-red-500">*</span></label>
                <select className={inputCls} value={form.requestId} onChange={(e) => setForm({ ...form, requestId: e.target.value })} required>
                  <option value="">Select an accepted request</option>
                  {acceptedRequests.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r._id === latestAcceptedRequest?._id ? '⭐ ' : ''}
                      {r.skill} — with {r.tutor?._id === user?._id ? r.learner?.name : r.tutor?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Session Title <span className="text-red-500">*</span></label>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. React Hooks Deep Dive" required />
              </div>

              <div>
                <label className={labelCls}>Date <span className="text-red-500">*</span></label>
                <input type="date" className={inputCls} value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Time <span className="text-red-500">*</span></label>
                <input type="time" className={inputCls} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Duration</label>
                <select className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}>
                  {DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Session Type</label>
                <select className={inputCls} value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>

              {form.sessionType === 'Online' ? (
                <div className="sm:col-span-2">
                  <label className={labelCls}>Meeting Link <span className="text-red-500">*</span></label>
                  <input className={inputCls} value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." required />
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <label className={labelCls}>Location <span className="text-red-500">*</span></label>
                  <input className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lab 03 / Library Study Area" required />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className={labelCls}>Learner Goal <span className="text-red-500">*</span></label>
                <textarea className={inputCls} rows={3} value={form.learnerGoal} onChange={(e) => setForm({ ...form, learnerGoal: e.target.value })} placeholder="What should be achieved by the end of the session?" required />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Session Agenda <span className="text-red-500">*</span></label>
                <textarea className={inputCls} rows={3} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} placeholder="Main topics, steps, or discussion flow" required />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Session Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea className={inputCls} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Extra notes, materials, or reminders" />
              </div>

              {formError && (
                <div className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">{formError}</div>
              )}

              <div className="sm:col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border-2 border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {submitting ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!showForm && acceptedRequests.length === 0 && sessions.length === 0 && !loading && (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl mb-7">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm font-medium text-slate-600">No accepted requests yet</p>
            <p className="text-xs text-slate-400 mt-1">Accept a learning request first, then come back to book a session</p>
          </div>
        )}

        {sessions.length > 0 && (
          <>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
              {[
                { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
                { key: 'past', label: 'Past', count: past.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400 text-sm">Loading sessions...</div>
            ) : (
              <div className="space-y-4">
                {visibleUpcoming.map((s) => (
                  <SessionCard
                    key={s._id}
                    session={s}
                    onAction={handleAction}
                    currentUserId={user?._id}
                    currentRoleLabel={roleLabel}
                    reviewedIds={reviewedIds}
                  />
                ))}
                {visibleUpcoming.length === 0 && (
                  <div className="text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-2xl">
                    <div className="text-3xl mb-2">{activeTab === 'upcoming' ? '📅' : '📂'}</div>
                    <p className="text-sm">{activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
