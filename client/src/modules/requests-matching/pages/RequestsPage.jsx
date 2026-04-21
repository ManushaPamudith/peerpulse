import { useEffect, useState } from 'react';
import api from '../../../core/services/api';
import { useAuth } from '../../../core/context/AuthContext';
import PageHeader from '../../../shared/components/layout/PageHeader';

const statusStyle = {
  Accepted: 'bg-green-50 text-green-700 border-green-200',
  Rejected:  'bg-slate-100 text-slate-500 border-slate-200',
  Pending:   'bg-amber-50 text-amber-600 border-amber-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
  Expired:   'bg-red-50 text-red-600 border-red-200',
};
const statusIcon = { Accepted: '✓', Rejected: '✕', Pending: '🕐', Cancelled: '⛔', Expired: '⏳' };

function RequestCard({ request, currentUserId, onUpdate, updating, onWithdraw, withdrawing, onCancel }) {
  const isReceived = request.tutor?._id === currentUserId;
  const isSender = request.learner?._id === currentUserId;
  const isPending  = request.status === 'Pending';
  const isWithdrawn = request.isWithdrawn;
  const hasExpired = new Date(request.expiresAt) < new Date();

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
      isWithdrawn ? 'opacity-60' :
      isPending && request.priority === 'Urgent' ? 'border-red-200 bg-red-50/30' :
      isPending ? 'border-amber-100' : request.status === 'Accepted' ? 'border-green-100' : 'border-slate-100'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-800">{request.skill}</h3>
            {request.priority === 'Urgent' && !isWithdrawn && !hasExpired && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                🔴 Urgent
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle[request.status] || statusStyle.Pending}`}>
              {statusIcon[request.status]} {isWithdrawn ? 'Withdrawn' : request.status}
            </span>
            {request.matchingScore > 0 && !isWithdrawn && !hasExpired && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                {request.matchingScore}% match
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {isReceived
              ? <>From: <span className="text-slate-600 font-medium">{request.learner?.name}</span> · {request.learner?.email}</>
              : <>To: <span className="text-slate-600 font-medium">{request.tutor?.name}</span> · {request.tutor?.email}</>
            }
          </p>
          {isWithdrawn && request.withdrawnReason && (
            <p className="text-xs text-slate-500 mt-1">
              Reason: {request.withdrawnReason}
            </p>
          )}
        </div>
        <div className="text-xs text-slate-400 shrink-0 text-right">
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>

      {request.message && (
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 border border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Message</p>
          <p className="text-sm text-slate-600 leading-relaxed break-words">{request.message}</p>
        </div>
      )}

      {isReceived && isPending && !isWithdrawn && !hasExpired && (
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(request._id, 'Accepted')}
            disabled={updating === request._id}
            className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {updating === request._id ? '...' : '✓ Accept'}
          </button>
          <button
            onClick={() => onUpdate(request._id, 'Rejected')}
            disabled={updating === request._id}
            className="flex-1 border-2 border-slate-200 text-slate-600 text-sm font-semibold py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            ✕ Reject
          </button>
        </div>
      )}

      {isSender && isPending && !isWithdrawn && !hasExpired && (
        <button
          onClick={() => onWithdraw(request._id)}
          disabled={withdrawing === request._id}
          className="w-full border-2 border-slate-200 text-slate-600 text-sm font-semibold py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {withdrawing === request._id ? '...' : '✖️ Cancel Request'}
        </button>
      )}

      {isReceived && (request.status === 'Accepted' || request.status === 'Rejected') && !isWithdrawn && !hasExpired && (
        <button
          onClick={() => onCancel(request._id, request.status)}
          disabled={withdrawing === request._id}
          className="w-full border-2 border-slate-200 text-slate-600 text-sm font-semibold py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {withdrawing === request._id ? '...' : `✖️ Undo ${request.status}`}
        </button>
      )}
    </div>
  );
}

function Section({ title, icon, items, currentUserId, onUpdate, updating, onWithdraw, withdrawing, onCancel, emptyMsg }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">{icon}</span>
        <h2 className="font-semibold text-slate-800">{title}</h2>
        <span className="ml-auto text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-2xl">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm">{emptyMsg}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(r => (
            <RequestCard 
              key={r._id} 
              request={r} 
              currentUserId={currentUserId} 
              onUpdate={onUpdate} 
              updating={updating}
              onWithdraw={onWithdraw}
              withdrawing={withdrawing}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState('');
  const [error,    setError]    = useState('');
  const [updating, setUpdating] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const [activeTab, setActiveTab] = useState('received');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/requests/my');
      setRequests(data.requests);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load requests right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.patch(`/requests/${id}/status`, { status });
      // Optimistically update the local state
      setRequests(prevRequests => 
        prevRequests.map(r => 
          r._id === id 
            ? { 
                ...r, 
                status, 
                ...(status === 'Accepted' && { acceptedAt: new Date() }),
                ...(status === 'Rejected' && { rejectedAt: new Date() })
              }
            : r
        )
      );
      setToast(`Request ${status.toLowerCase()} successfully.`);
      setTimeout(() => setToast(''), 4000);
      load(); // Sync with server in background
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update the request. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setUpdating(null);
    }
  };

  const withdrawRequest = async (id) => {
    setWithdrawing(id);
    try {
      await api.patch(`/requests/${id}/withdraw`, { reason: 'User requested withdrawal' });
      // Optimistically update the local state to reflect the withdrawal
      setRequests(prevRequests => 
        prevRequests.map(r => 
          r._id === id 
            ? { ...r, isWithdrawn: true, withdrawnReason: 'User requested withdrawal', withdrawnAt: new Date() }
            : r
        )
      );
      setToast('Request withdrawn successfully.');
      setTimeout(() => setToast(''), 4000);
      load(); // Sync with server in background
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to withdraw the request. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setWithdrawing(null);
    }
  };

  const cancelRequest = async (id, status) => {
    setWithdrawing(id);
    try {
      const endpoint = status === 'Accepted' ? `/requests/${id}/cancel-accepted` : `/requests/${id}/cancel-rejected`;
      await api.patch(endpoint);
      // Optimistically update the local state to revert status to Pending
      setRequests(prevRequests => 
        prevRequests.map(r => 
          r._id === id 
            ? { ...r, status: 'Pending', acceptedAt: null, rejectedAt: null, cancelableUntil: null }
            : r
        )
      );
      setToast(`${status} status was undone successfully.`);
      setTimeout(() => setToast(''), 4000);
      load(); // Sync with server in background
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to undo this action. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setWithdrawing(null);
    }
  };

  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sent         = sortedRequests.filter(r => r.learner?._id === user?._id);
  const received     = sortedRequests.filter(r => r.tutor?._id   === user?._id);
  const pendingCount = received.filter(r => r.status === 'Pending' && !r.isWithdrawn).length;
  const urgentCount = sent.filter(r => r.priority === 'Urgent' && r.status === 'Pending' && !r.isWithdrawn).length;

  return (
    <div className="min-h-screen bg-slate-50">

      <PageHeader
        title="Requests"
        subtitle="Manage your sent and received learning requests"
        badges={[
          { label: `${sent.length} sent` },
          { label: `${received.length} received` },
          ...(pendingCount > 0 ? [{ label: `${pendingCount} pending action`, variant: 'amber' }] : []),
          ...(urgentCount > 0 ? [{ label: `${urgentCount} urgent`, variant: 'red' }] : []),
        ]}
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

        {/* tab switcher */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
          {[
            { key: 'received', label: 'Received', count: received.length, badge: pendingCount },
            { key: 'sent',     label: 'Sent',     count: sent.length },
          ].map(({ key, label, count, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                {count}
              </span>
              {badge > 0 && <span className="text-xs bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Loading requests...</div>
        ) : activeTab === 'received' ? (
          <Section 
            title="Received Requests" 
            icon="📥" 
            items={received} 
            currentUserId={user?._id} 
            onUpdate={updateStatus} 
            updating={updating}
            onWithdraw={withdrawRequest}
            withdrawing={withdrawing}
            onCancel={cancelRequest}
            emptyMsg="No one has sent you a request yet." 
          />
        ) : (
          <Section 
            title="Sent Requests" 
            icon="📤" 
            items={sent} 
            currentUserId={user?._id} 
            onUpdate={updateStatus} 
            updating={updating}
            onWithdraw={withdrawRequest}
            withdrawing={withdrawing}
            onCancel={cancelRequest}
            emptyMsg="You have not sent any requests yet." 
          />
        )}
      </div>
    </div>
  );
}
