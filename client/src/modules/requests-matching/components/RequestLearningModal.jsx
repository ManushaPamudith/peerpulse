import { useEffect, useState } from 'react';

const inputCls =
  'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm bg-white';
const selectCls =
  'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm';
const labelCls = 'block text-xs font-medium text-slate-500 mb-1.5';

export default function RequestLearningModal({ tutor, skill, onClose, onSubmit, loading }) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Normal');

  useEffect(() => {
    if (tutor && skill?.skill) {
      setMessage(`Hi, I need help with ${skill.skill}.`);
      setPriority('Normal');
    }
  }, [tutor?._id, skill?.skill]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    await onSubmit(tutor, skill, message, priority);
  };

  if (!tutor || !skill) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100"
        role="dialog"
        aria-labelledby="request-modal-title"
      >
        <h3 id="request-modal-title" className="font-bold text-slate-800 text-lg mb-1">
          Request {skill.skill}
        </h3>
        <p className="text-sm text-slate-500 mb-5">To {tutor.name}</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className={labelCls}>Message</label>
            <textarea
              className={inputCls + ' min-h-28 resize-y'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain what you need help with..."
            />
          </div>

          <div>
            <label className={labelCls}>Priority</label>
            <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent (shown first)</option>
            </select>
            <p className="text-xs text-slate-400 mt-1.5">Urgent requests are ordered first in the tutor&apos;s queue</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200"
          >
            {loading ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </div>
    </div>
  );
}
