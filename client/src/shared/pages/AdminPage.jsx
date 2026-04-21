import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../core/services/api';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  programming_fundamentals:    'Programming Fundamentals',
  web_development:             'Web Development',
  database:                    'Database',
  object_oriented_programming: 'Object Oriented Programming',
  networking:                  'Networking',
  software_engineering:        'Software Engineering',
};

function StatusPill({ status }) {
  const map = {
    pending:  'bg-amber-100 text-amber-700 border border-amber-200',
    verified: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    rejected: 'bg-red-100 text-red-600 border border-red-200',
  };
  const label = { pending: '🕐 Pending Review', verified: '✓ Approved', rejected: '✗ Rejected' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {label[status] || status}
    </span>
  );
}

function StatBox({ icon, label, value, highlight }) {
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 border ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${highlight ? 'bg-amber-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION QUEUE — primary admin function
// ─────────────────────────────────────────────────────────────────────────────
function VerificationQueue({ onCountChange }) {
  const [verifications, setVerifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('pending');
  const [processing,    setProcessing]    = useState(null);
  const [rejectReasons, setRejectReasons] = useState({});
  const [toast,         setToast]         = useState({ msg: '', type: 'ok' });

  const load = async (f = filter) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/verifications?status=${f}`);
      setVerifications(data.verifications || []);
    } catch {
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const notify = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 4000);
  };

  const handleReview = async (id, decision) => {
    if (decision === 'rejected' && !rejectReasons[id]?.trim()) return;
    setProcessing(id);
    try {
      await api.patch(`/admin/verifications/${id}/review`, {
        decision,
        rejectionReason: rejectReasons[id] || '',
      });
      notify(`Skill ${decision === 'verified' ? 'approved' : 'rejected'} successfully`);
      setRejectReasons(prev => { const n = { ...prev }; delete n[id]; return n; });
      await load();
      onCountChange();
    } catch (err) {
      notify(err.response?.data?.message || 'Action failed', 'err');
    } finally {
      setProcessing(null);
    }
  };

  const FILTERS = [
    { key: 'pending',  label: 'Pending'  },
    { key: 'verified', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all',      label: 'All'      },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
      {/* Section header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-sm">🕐</span>
              Skill Verification Requests
            </h2>
            <p className="text-xs text-slate-400 mt-1">Review quiz results and evidence submitted by students, then approve or reject.</p>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {FILTERS.map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Toast */}
        {toast.msg && (
          <div className={`mb-4 text-sm font-medium px-4 py-2.5 rounded-xl border ${toast.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {toast.msg}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-slate-400 py-10 text-center">Loading...</div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-medium">No {filter === 'all' ? '' : filter} requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((v) => {
              const isTech    = v.skillType === 'Technical Skill';
              const catLabel  = v.categoryLabel || CATEGORY_LABELS[v.categoryKey] || v.categoryKey || '—';
              const modLabel  = v.moduleTitle || v.moduleCode || '—';
              const isPending = v.status === 'pending';

              return (
                <div key={v._id} className={`rounded-xl border p-4 ${
                  isPending ? 'border-amber-200 bg-amber-50/20'
                  : v.status === 'verified' ? 'border-emerald-200 bg-emerald-50/10'
                  : 'border-red-200 bg-red-50/10'}`}>

                  {/* User row */}
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                        {v.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{v.user?.name || '—'}</p>
                        <p className="text-xs text-slate-400">{v.user?.email || '—'}</p>
                      </div>
                    </div>
                    <StatusPill status={v.status} />
                  </div>

                  {/* Details */}
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs mb-3 bg-white/60 rounded-lg px-3 py-2.5 border border-slate-100">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400 shrink-0">Skill</span>
                      <span className="font-semibold text-slate-700 text-right">{v.skillName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400 shrink-0">Type</span>
                      <span className={`font-semibold text-right ${isTech ? 'text-indigo-700' : 'text-emerald-700'}`}>{v.skillType}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400 shrink-0">{isTech ? 'Category' : 'Module'}</span>
                      <span className="font-semibold text-slate-700 text-right max-w-[55%]">
                        {isTech ? catLabel : `${v.moduleCode} — ${modLabel}`}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400 shrink-0">Quiz Score</span>
                      <span className={`font-semibold ${v.percentage >= 70 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {v.score}/{v.totalQuestions} ({v.percentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400 shrink-0">Evidence</span>
                      <span className="font-semibold text-slate-700 text-right">{v.evidenceFile || 'None'}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400 shrink-0">Submitted</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(v.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {v.status === 'rejected' && v.rejectionReason && (
                      <div className="sm:col-span-2 flex justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Reason</span>
                        <span className="font-semibold text-red-600 text-right">{v.rejectionReason}</span>
                      </div>
                    )}
                    {v.status !== 'pending' && v.reviewedBy && (
                      <div className="sm:col-span-2 flex justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Reviewed by</span>
                        <span className="font-semibold text-slate-700">{v.reviewedBy.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Quiz answers — collapsible */}
                  {v.quizAnswers?.length > 0 && (
                    <details className="mb-3">
                      <summary className="text-xs font-semibold text-indigo-600 cursor-pointer select-none hover:text-indigo-800">
                        View quiz answers ({v.quizAnswers.filter(a => a.isCorrect).length}/{v.quizAnswers.length} correct)
                      </summary>
                      <div className="mt-2 space-y-1 pl-2">
                        {v.quizAnswers.map((a, i) => (
                          <div key={i} className={`text-xs px-3 py-1.5 rounded-lg border ${a.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
                            {a.isCorrect ? '✓' : '✗'} Q{i + 1}: Selected option {a.selectedOption + 1}
                            {!a.isCorrect && <span className="text-slate-500"> (correct: {a.correctOption + 1})</span>}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Approve / Reject actions — pending only */}
                  {isPending && (
                    <div className="pt-3 border-t border-amber-200 space-y-2">
                      <input
                        type="text"
                        placeholder="Rejection reason (required to reject)"
                        value={rejectReasons[v._id] || ''}
                        onChange={e => setRejectReasons(prev => ({ ...prev, [v._id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(v._id, 'verified')}
                          disabled={processing === v._id}
                          className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {processing === v._id ? '...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleReview(v._id, 'rejected')}
                          disabled={processing === v._id || !rejectReasons[v._id]?.trim()}
                          className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          title={!rejectReasons[v._id]?.trim() ? 'Enter a rejection reason first' : ''}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER LIST — supporting section
// ─────────────────────────────────────────────────────────────────────────────
function UserList() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">👥</span>
            Registered Users
          </h2>
          <p className="text-xs text-slate-400 mt-1">All students and tutors registered on the platform.</p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{users.length} total</span>
      </div>

      <div className="p-6">
        {/* Quick lookup for user records by basic identity fields. */}
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        {loading ? (
          <div className="text-sm text-slate-400 py-6 text-center">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No users found matching your search.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => {
              const verifiedCount = (u.skills || []).filter(s => s.verified).length;
              const pendingCount  = (u.skills || []).filter(s => s.verificationStatus === 'pending').length;
              const totalSkills   = (u.skills || []).length;
              return (
                <div key={u._id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
                    {u.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-700'}`}>
                      {u.role}
                    </span>
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {totalSkills} skill{totalSkills !== 1 ? 's' : ''}
                    </span>
                    {verifiedCount > 0 && (
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        {verifiedCount} verified
                      </span>
                    )}
                    {pendingCount > 0 && (
                      <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        {pendingCount} pending
                      </span>
                    )}
                    <Link to={`/profile/${u._id}`}
                      className="text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors">
                      View User Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT TAB — feedback summary report with PDF export
// ─────────────────────────────────────────────────────────────────────────────
function ReportTab() {
  const [report,   setReport]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error,    setError]    = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/reviews/report');
      setReport(data.report);
    } catch {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!report) return;
    setPdfLoading(true);
    try {
      // Dynamic import so the heavy library is only loaded when needed
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;

      // ── Header banner ──────────────────────────────────────────────────────
      doc.setFillColor(67, 56, 202); // indigo-700
      doc.rect(0, 0, pageW, 38, 'F');

      // Accent stripe
      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(0, 38, pageW, 3, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('Feedback Report', margin, 18);

      // Sub-title
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(199, 210, 254); // indigo-200
      doc.text('PeerPulse — Platform Analytics', margin, 26);

      // Generated date (right-aligned in header)
      const genDate = new Date(report.generatedAt).toLocaleString();
      doc.setFontSize(8);
      doc.setTextColor(199, 210, 254);
      doc.text(`Generated: ${genDate}`, pageW - margin, 26, { align: 'right' });

      let y = 52;

      // ── Section helper ─────────────────────────────────────────────────────
      const sectionTitle = (title) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(title, margin, y);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.4);
        doc.line(margin, y + 2, pageW - margin, y + 2);
        y += 10;
      };

      // ── Summary cards (3 boxes side by side) ──────────────────────────────
      sectionTitle('Summary');

      const cardW = (contentW - 8) / 3;
      const cardH = 22;
      const cards = [
        { label: 'Total Reviews',      value: String(report.totalReviews),      bg: [238, 242, 255], accent: [67, 56, 202] },
        { label: 'Overall Avg Rating', value: String(report.overallAvgRating || '—'), bg: [255, 251, 235], accent: [217, 119, 6] },
        { label: 'Flagged Reviews',    value: String(report.flaggedReviewCount), bg: [254, 242, 242], accent: [220, 38, 38] },
      ];

      cards.forEach((card, i) => {
        const x = margin + i * (cardW + 4);
        // Card background
        doc.setFillColor(...card.bg);
        doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
        // Left accent bar
        doc.setFillColor(...card.accent);
        doc.roundedRect(x, y, 3, cardH, 1.5, 1.5, 'F');
        // Value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...card.accent);
        doc.text(card.value, x + cardW / 2, y + 11, { align: 'center' });
        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(card.label, x + cardW / 2, y + 18, { align: 'center' });
      });

      y += cardH + 14;

      // ── Rating Distribution table ──────────────────────────────────────────
      sectionTitle('Rating Distribution');

      const distRows = [5, 4, 3, 2, 1].map(star => {
        const count = report.ratingDistribution[star] || 0;
        const pct = report.totalReviews
          ? `${Math.round((count / report.totalReviews) * 100)}%`
          : '0%';
        return [`${star} Star${star !== 1 ? 's' : ''}`, count, pct];
      });

      autoTable(doc, {
        startY: y,
        head: [['Rating', 'Count', 'Percentage']],
        body: distRows,
        margin: { left: margin, right: margin },
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [67, 56, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
        },
      });

      y = doc.lastAutoTable.finalY + 14;

      // ── Top Rated Tutors table ─────────────────────────────────────────────
      if (report.topTutors.length > 0) {
        // Check if we need a new page
        if (y > pageH - 60) {
          doc.addPage();
          y = 20;
        }

        sectionTitle('Top Rated Tutors');

        const tutorRows = report.topTutors.map((t, i) => [
          `#${i + 1}`,
          t.name,
          t.avgRating,
          `${t.reviewCount} review${t.reviewCount !== 1 ? 's' : ''}`,
        ]);

        autoTable(doc, {
          startY: y,
          head: [['Rank', 'Tutor Name', 'Avg Rating', 'Reviews']],
          body: tutorRows,
          margin: { left: margin, right: margin },
          styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
            lineColor: [226, 232, 240],
            lineWidth: 0.3,
            textColor: [30, 41, 59],
          },
          headStyles: {
            fillColor: [67, 56, 202],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: {
            0: { cellWidth: 18, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 36, halign: 'center' },
          },
          // Highlight top 3 rows
          didParseCell: (data) => {
            if (data.section === 'body' && data.row.index < 3) {
              const medalColors = [
                [255, 251, 235], // gold tint
                [248, 250, 252], // silver tint
                [255, 247, 237], // bronze tint
              ];
              data.cell.styles.fillColor = medalColors[data.row.index];
              if (data.row.index === 0) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [146, 64, 14]; // amber-800
              }
            }
          },
        });

        y = doc.lastAutoTable.finalY + 14;
      }

      // ── Footer on every page ───────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageH - 12, pageW, 12, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('PeerPulse — Confidential', margin, pageH - 4.5);
        doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 4.5, { align: 'right' });
      }

      doc.save(`feedback-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
      {/* ── Card header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">📊</span>
            Feedback Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">Generate a summary of all feedback and rating data on the platform.</p>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Generate Report */}
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6h6v6m-3-9V3m0 0L9 6m3-3l3 3" />
                </svg>
                Generate Report
              </>
            )}
          </button>

          {/* Download PDF — only shown once report is loaded */}
          {report && (
            <button
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {pdfLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Building PDF…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        {!report && !loading && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm font-medium">Click "Generate Report" to view feedback analytics</p>
            <p className="text-xs mt-1">Then download a polished PDF with one click</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-slate-400">
            <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-medium">Fetching report data…</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Generated at */}
            <p className="text-xs text-slate-400">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </p>

            {/* Summary cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-indigo-700 leading-none">{report.totalReviews}</p>
                <p className="text-xs text-indigo-500 mt-1 font-medium">Total Reviews</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-amber-600 leading-none">{report.overallAvgRating || '—'}</p>
                <p className="text-xs text-amber-500 mt-1 font-medium">Overall Avg Rating</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-red-600 leading-none">{report.flaggedReviewCount}</p>
                <p className="text-xs text-red-500 mt-1 font-medium">Flagged Reviews</p>
              </div>
            </div>

            {/* Rating distribution */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Rating Distribution</h3>
              <div className="space-y-2">
                {[5,4,3,2,1].map(star => {
                  const count = report.ratingDistribution[star] || 0;
                  const pct = report.totalReviews ? Math.round((count / report.totalReviews) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 w-20 shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3 h-3 ${s <= star ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d={STAR_PATH} />
                          </svg>
                        ))}
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-16 text-right shrink-0">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top tutors */}
            {report.topTutors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Rated Tutors</h3>
                <div className="space-y-2">
                  {report.topTutors.map((t, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const topStyles = [
                      'border-amber-300 bg-amber-50',
                      'border-slate-300 bg-slate-50',
                      'border-orange-200 bg-orange-50',
                    ];
                    const isTop3 = i < 3;
                    return (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isTop3 ? topStyles[i] : 'border-slate-100 bg-slate-50'}`}>
                        <span className="text-base w-6 shrink-0">{isTop3 ? medals[i] : `#${i + 1}`}</span>
                        <p className={`flex-1 text-sm font-semibold truncate ${isTop3 ? 'text-slate-900' : 'text-slate-700'}`}>{t.name}</p>
                        <span className={`text-xs font-bold shrink-0 ${i === 0 ? 'text-amber-600' : 'text-slate-600'}`}>⭐ {t.avgRating}</span>
                        <span className="text-xs text-slate-400 shrink-0">{t.reviewCount} review{t.reviewCount !== 1 ? 's' : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS TAB — moderate all platform reviews
// ─────────────────────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [deleting,    setDeleting]    = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);
  const [error,       setError]       = useState('');
  const [toast,       setToast]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reviews');
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    setError('');
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      setConfirmId(null);
      setToast('Review deleted');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const displayed = flaggedOnly ? reviews.filter(r => r.flagCount > 0) : reviews;

  const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-sm">⭐</span>
              Reviews
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{reviews.length} total</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">View and moderate all reviews submitted on the platform.</p>
          </div>
          <button
            onClick={() => setFlaggedOnly(f => !f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${flaggedOnly ? 'bg-red-50 border-red-200 text-red-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            🚩 {flaggedOnly ? 'Showing flagged only' : 'Show flagged only'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {toast && (
          <div className="mb-4 text-sm font-medium px-4 py-2.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700">{toast}</div>
        )}
        {error && (
          <div className="mb-4 text-sm font-medium px-4 py-2.5 rounded-xl border bg-red-50 border-red-200 text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-slate-400 py-10 text-center">Loading...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-sm font-medium">{flaggedOnly ? 'No flagged reviews' : 'No reviews yet'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(r => (
              <div key={r._id} className={`rounded-xl border p-4 ${r.flagCount > 0 ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
                      {r.learner?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{r.learner?.name || '—'}</p>
                      <p className="text-xs text-slate-400">→ {r.tutor?.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {r.flagCount > 0 && (
                      <span className="text-xs font-semibold bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                        🚩 {r.flagCount} flag{r.flagCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d={STAR_PATH} />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-600">{r.rating}/5</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-2 flex flex-wrap gap-x-4 gap-y-1">
                  {r.session?.title && <span>📚 {r.session.title}</span>}
                  <span>{new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                {r.comment && (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 mb-3 leading-relaxed">
                    "{r.comment}"
                  </p>
                )}

                {r.flagReasons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {r.flagReasons.map((reason, i) => (
                      <span key={i} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {confirmId === r._id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Delete this review?</span>
                    <button onClick={() => handleDelete(r._id)} disabled={deleting === r._id}
                      className="text-xs font-semibold bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50">
                      {deleting === r._id ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      className="text-xs font-semibold border border-slate-200 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(r._id)}
                    className="text-xs font-semibold border border-red-200 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                    🗑 Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [stats,     setStats]     = useState(null);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('verifications');

  const loadStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin data. Make sure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl text-sm font-medium max-w-md text-center">
          🔒 {error}
        </div>
      </div>
    );
  }

  const TABS = [
    { key: 'verifications', label: 'Skill Verifications', icon: '🕐' },
    { key: 'users',         label: 'Users',               icon: '👥' },
    { key: 'reviews',       label: 'Reviews',             icon: '⭐' },
    { key: 'report',        label: 'Report',              icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Admin header bar — visually distinct from student pages ── */}
      <div className="bg-slate-900 text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-base shrink-0">🛡️</div>
            <div>
              <h1 className="text-lg font-bold leading-none">Admin Dashboard</h1>
              <p className="text-xs text-slate-400 mt-0.5">PeerPulse — User Profile Management</p>
            </div>
          </div>
          {/* Quick pending count in header */}
          {stats.pendingVerifications > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {stats.pendingVerifications} pending review{stats.pendingVerifications !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Stat overview — 3 cards, module-relevant only ── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatBox icon="👥" label="Registered Users"       value={stats.totalUsers}           />
          <StatBox icon="✅" label="Users with Verified Skills" value={stats.verifiedTutors}   />
          <StatBox icon="🕐" label="Pending Verifications"  value={stats.pendingVerifications} highlight={stats.pendingVerifications > 0} />
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl w-fit mb-6 shadow-sm">
          {TABS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors
                ${activeTab === key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <span>{icon}</span>
              {label}
              {key === 'verifications' && stats.pendingVerifications > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {stats.pendingVerifications}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'verifications' && (
          <VerificationQueue onCountChange={loadStats} />
        )}
        {activeTab === 'users' && <UserList />}
        {activeTab === 'reviews' && <ReviewsTab />}
        {activeTab === 'report' && <ReportTab />}
      </div>
    </div>
  );
}
