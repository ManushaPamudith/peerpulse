import { useEffect, useMemo, useState } from 'react';
import api from '../../../core/services/api';
import RatingBadge from '../../feedback-reports/components/RatingBadge';

const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';
const STEPS = ['Scheduled', 'Confirmed', 'Ongoing', 'Completed'];
const STEP_META = {
  Scheduled: { pct: 25, color: 'bg-amber-400', ring: 'ring-amber-300', icon: '🕐', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  Confirmed: { pct: 50, color: 'bg-sky-500', ring: 'ring-sky-300', icon: '✅', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  Ongoing: { pct: 75, color: 'bg-emerald-500', ring: 'ring-emerald-300', icon: '▶️', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Completed: { pct: 100, color: 'bg-violet-500', ring: 'ring-violet-300', icon: '🎉', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  Cancelled: { pct: 0, color: 'bg-slate-300', ring: 'ring-slate-200', icon: '✕', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className="focus:outline-none">
          <svg className={`w-7 h-7 transition-colors ${s <= value ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ProgressStepper({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 py-3 px-1">
        <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">✕</span>
        <span className="text-xs text-slate-400 font-medium">Session Cancelled</span>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="py-3 px-1">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const meta = STEP_META[step];
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? `${meta.color} border-transparent text-white` : active ? `bg-white ${meta.ring} ring-2 border-transparent text-slate-700 shadow-sm` : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-slate-700' : done ? 'text-slate-500' : 'text-slate-300'}`}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${done ? STEP_META[STEPS[i]].color : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${STEP_META[status]?.color || 'bg-slate-300'}`} style={{ width: `${STEP_META[status]?.pct || 0}%` }} />
      </div>
    </div>
  );
}

function ChatBubble({ message, mine, currentRoleLabel, peerRoleLabel }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
        <p className={`text-[11px] mb-1 font-semibold ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>
          {mine ? `${currentRoleLabel} (You)` : peerRoleLabel}
        </p>
        <p className="leading-relaxed">{message.text}</p>
        <p className={`text-[10px] mt-1 ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function SessionCard({ session, onAction, currentUserId, currentRoleLabel = 'Learner', reviewedIds }) {
  const [busy, setBusy] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleErr, setRescheduleErr] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelErr, setCancelErr] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbErr, setFbErr] = useState('');
  const [fbDone, setFbDone] = useState(reviewedIds?.has(session._id));
  const [submittedFeedback, setSubmittedFeedback] = useState(null);
  const [chatText, setChatText] = useState('');
  const [chatErr, setChatErr] = useState('');
  const [messages, setMessages] = useState(session.messages || []);
  const [noteUploadErr, setNoteUploadErr] = useState('');
  const [noteBusy, setNoteBusy] = useState(false);

  const isLearner = String(session.learner?._id) === String(currentUserId);
  const isTutor = String(session.tutor?._id) === String(currentUserId);
  const peer = isLearner ? session.tutor : session.learner;
  const peerRole = isLearner ? 'Tutor' : 'Learner';
  const status = session.status;
  const isCancelled = status === 'Cancelled';
  const scheduledAt = new Date(session.scheduledAt);
  const isPast = scheduledAt < new Date();
  const canRequestReschedule = ['Scheduled', 'Confirmed'].includes(status);
  const canFeedback = isLearner && status === 'Completed' && !fbDone;
  const pendingReschedule = session.rescheduleRequest?.status === 'Pending' ? session.rescheduleRequest : null;
  const requestedByMe = pendingReschedule && String(pendingReschedule.requestedBy?._id || pendingReschedule.requestedBy) === String(currentUserId);
  const canRespondReschedule = pendingReschedule && !requestedByMe;
  const joinHref = session.sessionType === 'Online' ? session.meetingLink : null;
  // Meeting link is only active when the tutor has confirmed the session AND
  // the scheduled date/time has been reached (or passed).
  const isConfirmedOrBeyond = ['Confirmed', 'Ongoing', 'Completed'].includes(status);
  const meetingLinkActive = joinHref && isConfirmedOrBeyond && isPast;
  const displayMessages = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [messages]);

  useEffect(() => {
    setMessages(session.messages || []);
  }, [session.messages]);

  const togglePanel = (panel) => setActivePanel((prev) => (prev === panel ? null : panel));

  // Execute an action on the session and refresh the data
  const runAction = async (payload) => {
    setBusy(true);
    try {
      await onAction(session._id, payload);
      setActivePanel(null);
      setRescheduleErr('');
      setCancelErr('');
    } finally {
      setBusy(false);
    }
  };

  // Handle session status changes (Confirm, Start, End, Cancel)
  const handleStatus = async (newStatus) => {
    if (newStatus === 'Cancelled') {
      togglePanel('cancel');
      return;
    }
    await runAction({ status: newStatus });
  };

  const handleRescheduleRequest = async (e) => {
    e.preventDefault();
    setRescheduleErr('');
    // Validate each field individually to provide clear error messages
    if (!newDate) {
      setRescheduleErr('Please select a new date for the session');
      return;
    }
    if (!newTime) {
      setRescheduleErr('Please select a new time for the session');
      return;
    }
    if (!rescheduleReason.trim()) {
      setRescheduleErr('Please provide a reason for the reschedule request');
      return;
    }
    const dt = new Date(`${newDate}T${newTime}`);
    if (dt <= new Date()) {
      setRescheduleErr('The new date and time must be in the future');
      return;
    }

    try {
      await runAction({
        rescheduleRequest: {
          action: 'request',
          proposedAt: dt.toISOString(),
          reason: rescheduleReason.trim(),
        },
      });
      setNewDate('');
      setNewTime('');
      setRescheduleReason('');
    } catch (err) {
      setRescheduleErr(err.message || 'Failed to request reschedule');
    }
  };

  const respondReschedule = async (decision) => {
    try {
      await runAction({ rescheduleRequest: { action: 'respond', decision } });
    } catch (err) {
      setRescheduleErr(err.message || 'Failed to update reschedule request');
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setCancelErr('');
    // Require cancellation reason for audit trail
    if (!cancelReason.trim()) {
      setCancelErr('Please provide a reason for cancelling this session');
      return;
    }
    try {
      await runAction({ status: 'Cancelled', cancellationReason: cancelReason.trim() });
      setCancelReason('');
    } catch (err) {
      setCancelErr(err.message || 'Failed to cancel session');
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setFbErr('');
    // Learners can only submit feedback after session is completed
    if (!fbComment.trim()) {
      setFbErr('Please share your feedback about this session');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/reviews', {
        sessionId: session._id,
        rating: fbRating,
        comment: fbComment.trim(),
      });
      setFbDone(true);
      setSubmittedFeedback(data.review);
      setActivePanel(null);
    } catch (err) {
      setFbErr(err.response?.data?.message || 'Submission failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setChatErr('');
    // Real-time chat between learner and tutor for session coordination
    if (!chatText.trim()) {
      setChatErr('Please type a message before sending');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(`/sessions/${session._id}/messages`, { text: chatText.trim() });
      setMessages(data.session.messages || []);
      setChatText('');
    } catch (err) {
      setChatErr(err.response?.data?.message || 'Failed to send chat message');
    } finally {
      setBusy(false);
    }
  };

  const handleNotesUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNoteBusy(true);
    setNoteUploadErr('');
    try {
      const formData = new FormData();
      formData.append('notesFile', file);
      await api.post(`/sessions/${session._id}/notes-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      window.location.reload();
    } catch (err) {
      setNoteUploadErr(err.response?.data?.message || 'Failed to upload tutor notes');
    } finally {
      setNoteBusy(false);
      e.target.value = '';
    }
  };

  const handleNotesDownload = async () => {
    setNoteBusy(true);
    setNoteUploadErr('');
    try {
      const response = await api.get(`/sessions/${session._id}/notes-file`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      link.href = url;
      link.download = match?.[1] || session.sessionNotesFile?.originalName || 'tutor-notes';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setNoteUploadErr(err.response?.data?.message || 'Failed to download tutor notes');
    } finally {
      setNoteBusy(false);
    }
  };

  const dateStr = scheduledAt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = scheduledAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const meta = STEP_META[status] || STEP_META.Cancelled;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${meta.badge}`}>
              <span>{meta.icon}</span>{status}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {session.sessionType}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">{session.title}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {isLearner ? 'Tutor' : 'Learner'}: <span className="font-medium text-slate-700">{peer?.name}</span>
          </p>
          {isLearner && session.tutor && (
            <div className="mt-1.5">
              <RatingBadge averageRating={session.tutor?.averageRating} reviewCount={session.tutor?.reviewCount} />
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">{dateStr}</p>
          <p className="text-sm text-slate-400">{timeStr}</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">📅 {dateStr}</span>
          <span className="flex items-center gap-1">🕒 {timeStr}</span>
          {session.duration && <span className="flex items-center gap-1">⏳ {session.duration} min</span>}
          {session.sessionType === 'Physical' && session.location && <span className="flex items-center gap-1">📍 {session.location}</span>}
        </div>

        <div className="grid lg:grid-cols-2 gap-3 mb-4">
          {/* Keep core session context labels easy to scan. */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Learning Goal</p>
            <p className="text-sm text-slate-700 leading-relaxed">{session.learnerGoal || 'No learner goal provided.'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Session Agenda</p>
            <p className="text-sm text-slate-700 leading-relaxed">{session.agenda || 'No agenda provided.'}</p>
          </div>
        </div>

        {session.note && (
          <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 px-4 py-3 mb-4">
            <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">Session Notes</p>
            <p className="text-sm text-slate-700 leading-relaxed">{session.note}</p>
          </div>
        )}

        <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 mb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              {/* Keep this section easy to scan for tutors. */}
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Tutor Notes Attachment</p>
              <p className="text-sm text-slate-600">
                {session.sessionNotesFile?.originalName ? `Uploaded file: ${session.sessionNotesFile.originalName}` : 'No tutor notes uploaded yet for this session.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {isTutor && (
                <label className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">
                  <input type="file" className="hidden" onChange={handleNotesUpload} />
                  {noteBusy ? 'Uploading...' : 'Upload Tutor Notes'}
                </label>
              )}
              {session.sessionNotesFile?.path && (
                <button onClick={handleNotesDownload} disabled={noteBusy} className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 disabled:opacity-50">
                  {noteBusy ? 'Preparing...' : 'Download Notes'}
                </button>
              )}
            </div>
          </div>
          {noteUploadErr && <p className="text-xs text-red-600 mt-3">{noteUploadErr}</p>}
        </div>

        {session.sessionType === 'Online' && joinHref && !isCancelled && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {meetingLinkActive ? (
              <a
                href={joinHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                🔗 Join Session
              </a>
            ) : (
              <span
                title={
                  !isConfirmedOrBeyond
                    ? 'Waiting for the tutor to confirm the session'
                    : 'Available at the scheduled date and time'
                }
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 text-xs font-semibold px-4 py-2 rounded-lg cursor-not-allowed select-none border border-slate-200"
              >
                🔗 Join Session
              </span>
            )}
            <span className={`text-xs truncate ${meetingLinkActive ? 'text-slate-400' : 'text-slate-300'}`}>
              {joinHref}
            </span>
            {!meetingLinkActive && (
              <span className="text-xs text-amber-600 font-medium">
                {!isConfirmedOrBeyond
                  ? '⏳ Awaiting tutor confirmation'
                  : '⏳ Available at scheduled time'}
              </span>
            )}
          </div>
        )}

        {isCancelled && session.cancellationReason && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4">
            <p className="text-xs uppercase tracking-wide text-red-500 font-semibold mb-1">Cancellation Reason</p>
            <p className="text-sm text-slate-700 leading-relaxed">{session.cancellationReason}</p>
          </div>
        )}

        {pendingReschedule && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-4">
            <p className="text-xs uppercase tracking-wide text-amber-600 font-semibold mb-1">Pending Reschedule Request</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Proposed for {new Date(pendingReschedule.proposedAt).toLocaleString()} by {pendingReschedule.requestedBy?.name || (requestedByMe ? 'you' : peer?.name)}.
            </p>
            <p className="text-sm text-slate-600 mt-1">Reason: {pendingReschedule.reason}</p>
            {canRespondReschedule && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => respondReschedule('Approved')} disabled={busy} className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  Approve
                </button>
                <button onClick={() => respondReschedule('Rejected')} disabled={busy} className="border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                  Reject
                </button>
              </div>
            )}
            {requestedByMe && <p className="text-xs text-amber-700 font-medium mt-3">Waiting for the other participant to review your request.</p>}
          </div>
        )}
      </div>

      <div className="px-5 pb-1 border-t border-slate-50 bg-slate-50/50">
        <ProgressStepper status={status} />
      </div>

      {!isCancelled && (
        <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
          {isTutor && status === 'Scheduled' && (
            <button onClick={() => handleStatus('Confirmed')} disabled={busy} className="bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-sky-700 disabled:opacity-50">
              ✓ Confirm Session
            </button>
          )}

          {isTutor && status === 'Confirmed' && (
            <>
              <button onClick={() => handleStatus('Ongoing')} disabled={busy || !isPast} className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                ▶ Start Session
              </button>
              {!isPast && <span className="text-xs text-slate-400">Available at scheduled time</span>}
            </>
          )}

          {isTutor && status === 'Ongoing' && (
            <button onClick={() => handleStatus('Completed')} disabled={busy} className="bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-700 disabled:opacity-50">
              🏁 End Session
            </button>
          )}

          {['Scheduled', 'Confirmed'].includes(status) && (
            <button onClick={() => handleStatus('Cancelled')} disabled={busy} className="border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
              ✕ Cancel Session
            </button>
          )}

          {canRequestReschedule && !pendingReschedule && (
            <button onClick={() => togglePanel('reschedule')} disabled={busy} className={`border text-xs font-semibold px-3 py-1.5 rounded-lg ${activePanel === 'reschedule' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              📅 Request Reschedule
            </button>
          )}

          {!isCancelled && (
            <button onClick={() => togglePanel('chat')} className={`border text-xs font-semibold px-3 py-1.5 rounded-lg ${activePanel === 'chat' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              💬 Open Chat
            </button>
          )}

          {canFeedback && (
            <button onClick={() => togglePanel('feedback')} className={`text-xs font-bold px-4 py-1.5 rounded-lg border-2 ${activePanel === 'feedback' ? 'bg-amber-300 border-amber-400 text-slate-900' : 'bg-amber-400 border-amber-500 text-slate-900 hover:bg-amber-300'}`}>
              ⭐ Leave a Review
            </button>
          )}

          {fbDone && (
            <span className="text-xs font-semibold text-green-700 bg-green-100 border border-green-300 px-3 py-1.5 rounded-lg">
              ✓ Reviewed
            </span>
          )}
        </div>
      )}

      {activePanel === 'reschedule' && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <p className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><span>📅</span> Request New Session Time</p>
          <form onSubmit={handleRescheduleRequest} className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">New Date</label>
              <input type="date" min={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">New Time</label>
              <input type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={newTime} onChange={(e) => setNewTime(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 font-medium mb-1">Reason for Rescheduling</label>
              <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" rows={3} value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} placeholder="Explain why you need to reschedule this session..." required />
            </div>
            {rescheduleErr && <p className="md:col-span-2 text-xs text-red-600">{rescheduleErr}</p>}
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={busy} className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">✓ Send Request</button>
              <button type="button" onClick={() => setActivePanel(null)} className="border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-100">✕ Close</button>
            </div>
          </form>
        </div>
      )}

      {activePanel === 'cancel' && (
        <div className="border-t border-slate-100 px-5 py-4 bg-red-50/50">
          <p className="text-xs font-semibold text-red-700 mb-3 flex items-center gap-1.5"><span>🛑</span> Cancellation Policy</p>
          <p className="text-sm text-slate-600 mb-3">Please provide a valid reason before cancelling. This helps the other participant understand the change and keeps a clear record of the cancellation.</p>
          <form onSubmit={handleCancel} className="space-y-3">
            <textarea className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-white placeholder-slate-400" rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Explain why this session needs to be cancelled..." required />
            {cancelErr && <p className="text-xs text-red-600">{cancelErr}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">✓ Confirm Cancellation</button>
              <button type="button" onClick={() => setActivePanel(null)} className="border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-100">✕ Keep Session</button>
            </div>
          </form>
        </div>
      )}

      {activePanel === 'chat' && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><span>💬</span> Session Chat</p>
            <p className="text-xs text-slate-400">Share questions, notes, and updates with your session partner</p>
          </div>
          <div className="bg-slate-100 rounded-2xl p-3 space-y-3 max-h-72 overflow-y-auto">
            {displayMessages.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-8">No messages yet. Start the conversation!</div>
            ) : (
              displayMessages.map((message) => (
                <ChatBubble
                  key={message._id}
                  message={message}
                  mine={String(message.sender?._id || message.sender) === String(currentUserId)}
                  currentRoleLabel={currentRoleLabel}
                  peerRoleLabel={peerRole}
                />
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
            <input className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white placeholder-slate-400" value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder={`Message the ${peerRole.toLowerCase()}...`} />
            <button type="submit" disabled={busy} className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50">Send</button>
          </form>
          {chatErr && <p className="text-xs text-red-600 mt-2">{chatErr}</p>}
        </div>
      )}

      {activePanel === 'feedback' && !fbDone && (
        <div className="border-t border-amber-100 px-5 py-4 bg-amber-50/40">
          <p className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><span>⭐</span> Rate This Session</p>
          <form onSubmit={handleFeedback} className="space-y-3">
            <StarPicker value={fbRating} onChange={setFbRating} />
            <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white" rows={3} value={fbComment} onChange={(e) => setFbComment(e.target.value)} placeholder="Share your experience and feedback about this session..." />
            {fbErr && <p className="text-xs text-red-600">{fbErr}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={busy || !fbComment.trim()} className="bg-amber-400 text-slate-900 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 disabled:opacity-50">
                {busy ? '⏳ Submitting...' : '✓ Submit Feedback'}
              </button>
              <button type="button" onClick={() => setActivePanel(null)} className="border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-100">✕ Cancel</button>
            </div>
          </form>
        </div>
      )}

      {fbDone && submittedFeedback && (
        <div className="border-t border-green-100 px-5 py-4 bg-green-50/40">
          <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5"><span>✓</span> Your Feedback</p>
          <p className="text-sm text-slate-700">Rating: {submittedFeedback.rating}/5</p>
          {submittedFeedback.comment && <p className="text-sm text-slate-600 bg-white border border-green-100 rounded-xl px-3 py-2 mt-2 leading-relaxed">“{submittedFeedback.comment}”</p>}
        </div>
      )}
    </div>
  );
}
