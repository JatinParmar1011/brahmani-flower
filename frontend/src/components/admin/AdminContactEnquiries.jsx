import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminGetEnquiries,
  adminGetEnquiry,
  adminUpdateEnquiryStatus,
  adminUpdateEnquiryPriority,
  adminSendReply,
  adminGetEnquiryHistory,
} from '../../services/contactEnquiryService';

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_FILTERS   = ['All', 'NEW', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'];
const CATEGORY_FILTERS = [
  'All','GENERAL_ENQUIRY','ORDER_ISSUE','DELIVERY_PROBLEM',
  'PRODUCT_QUALITY','PAYMENT_RELATED','RETURN_REFUND_REQUEST','COMPLAINT','OTHER',
];
const PRIORITY_FILTERS = ['All', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// Status transition rules (mirrors the backend)
const VALID_TRANSITIONS = {
  NEW:                  ['IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS:          ['WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
  WAITING_FOR_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED:             ['IN_PROGRESS', 'CLOSED'],
  CLOSED:               [],
};

function getAllowedStatuses(currentStatus) {
  return VALID_TRANSITIONS[currentStatus] || [];
}

const STATUS_CARDS = [
  { label: 'NEW',                  display: 'New',              icon: '🔵', color: 'from-blue-400 to-indigo-400'   },
  { label: 'IN_PROGRESS',          display: 'In Progress',      icon: '🟡', color: 'from-amber-400 to-orange-400'  },
  { label: 'WAITING_FOR_CUSTOMER', display: 'Waiting Customer', icon: '🟣', color: 'from-purple-400 to-violet-400' },
  { label: 'RESOLVED',             display: 'Resolved',         icon: '🟢', color: 'from-emerald-400 to-teal-400'  },
  { label: 'CLOSED',               display: 'Closed',           icon: '⚫', color: 'from-gray-400 to-slate-500'    },
];

const STATUS_STYLE = {
  NEW:                  'bg-blue-100 text-blue-700',
  IN_PROGRESS:          'bg-amber-100 text-amber-700',
  WAITING_FOR_CUSTOMER: 'bg-purple-100 text-purple-700',
  RESOLVED:             'bg-emerald-100 text-emerald-700',
  CLOSED:               'bg-gray-100 text-gray-600',
};

const PRIORITY_STYLE = {
  LOW:    'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH:   'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const CATEGORY_LABEL = {
  GENERAL_ENQUIRY:       'General Enquiry',
  ORDER_ISSUE:           'Order Issue',
  DELIVERY_PROBLEM:      'Delivery Problem',
  PRODUCT_QUALITY:       'Product Quality',
  PAYMENT_RELATED:       'Payment Related',
  RETURN_REFUND_REQUEST: 'Return / Refund',
  COMPLAINT:             'Complaint',
  OTHER:                 'Other',
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '—';

// ── Helpers ────────────────────────────────────────────────────────────────

function ToastMsg({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold
      ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
      <span>{toast.msg}</span>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex items-start gap-3 mb-3 last:mb-0">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-gray-800 flex-1 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

// ── Collapsed email body preview with expand toggle ───────────────────────

function ReplyBodyPreview({ body }) {
  const [expanded, setExpanded] = useState(false);
  if (!body) return null;

  // Show only first 120 chars when collapsed
  const LIMIT = 120;
  const isLong = body.length > LIMIT;
  const preview = isLong && !expanded ? body.slice(0, LIMIT).trimEnd() + '…' : body;

  return (
    <div>
      <p style={{ whiteSpace: 'pre-wrap' }} className="text-xs text-gray-600 leading-relaxed">
        {preview}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-1 text-[11px] text-[#1a6b8a] font-semibold hover:underline"
        >
          {expanded ? 'Show less ▲' : 'Show full message ▼'}
        </button>
      )}
    </div>
  );
}

// ── History Timeline ───────────────────────────────────────────────────────

function HistoryTimeline({ enquiryId, refreshKey }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetEnquiryHistory(enquiryId)
      .then(res => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enquiryId, refreshKey]); // re-runs whenever refreshKey changes

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-gray-400">
        <span className="w-3.5 h-3.5 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
        Loading history…
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="text-xs text-gray-400 py-3 text-center">No history yet.</p>;
  }

  return (
    <div className="space-y-0">
      {history.map((item, idx) => (
        <div key={item.id} className="flex gap-3">
          {/* vertical line */}
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5
              ${item.eventType === 'REPLY' ? 'bg-[#1a6b8a]/10 text-[#1a6b8a]' : 'bg-gray-100 text-gray-500'}`}>
              {item.eventType === 'REPLY' ? '✉️' : '🔄'}
            </div>
            {idx < history.length - 1 && (
              <div className="w-0.5 bg-gray-100 flex-1 my-1" style={{ minHeight: '16px' }} />
            )}
          </div>

          {/* content */}
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-700">
                {item.eventType === 'REPLY' ? 'Reply sent' : 'Status changed'}
              </span>
              {item.adminName && (
                <span className="text-[11px] text-gray-400">by {item.adminName}</span>
              )}
              <span className="text-[11px] text-gray-400 ml-auto">{fmtDateTime(item.createdAt)}</span>
            </div>

            {item.eventType === 'STATUS_CHANGE' && (
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[item.statusBefore] || 'bg-gray-100 text-gray-600'}`}>
                  {item.statusBefore?.replaceAll('_', ' ')}
                </span>
                <span className="text-gray-400 text-xs">→</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[item.statusAfter] || 'bg-gray-100 text-gray-600'}`}>
                  {item.statusAfter?.replaceAll('_', ' ')}
                </span>
              </div>
            )}

            {item.eventType === 'REPLY' && (
              <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-500 mb-1">
                  Subject: <span className="font-normal text-gray-700">{item.emailSubject}</span>
                </p>
                <ReplyBodyPreview body={item.emailBody} />
                {item.statusAfter && item.statusAfter !== item.statusBefore && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Status set to</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[item.statusAfter] || 'bg-gray-100 text-gray-600'}`}>
                      {item.statusAfter?.replaceAll('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Full-page Enquiry Detail ───────────────────────────────────────────────

function EnquiryDetailPanel({ enquiryId, onBack, onUpdated }) {
  const [enquiry,       setEnquiry]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState(null);
  const [localStatus,   setLocalStatus]   = useState('');
  const [localPriority, setLocalPriority] = useState('');

  // Reply form
  const [replySubject, setReplySubject] = useState('');
  const [replyBody,    setReplyBody]    = useState('');
  const [replyStatus,  setReplyStatus]  = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyErrors,  setReplyErrors]  = useState({});

  // Incrementing this tells HistoryTimeline to re-fetch
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const refreshHistory = () => setHistoryRefreshKey(k => k + 1);

  const show = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEnquiry = useCallback(() => {
    setLoading(true);
    adminGetEnquiry(enquiryId)
      .then(res => {
        setEnquiry(res.data);
        setLocalStatus(res.data.status);
        setLocalPriority(res.data.priority);
        // Default reply-to status to first allowed transition
        const allowed = getAllowedStatuses(res.data.status);
        setReplyStatus(allowed[0] || res.data.status);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enquiryId]);

  useEffect(() => { loadEnquiry(); }, [loadEnquiry]);

  // ── Save status + priority ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!enquiry) return;
    setSaving(true);
    try {
      const statusChanged   = localStatus   !== enquiry.status;
      const priorityChanged = localPriority !== enquiry.priority;
      let updated = { ...enquiry };

      if (statusChanged) {
        const res = await adminUpdateEnquiryStatus(enquiryId, localStatus);
        updated = { ...updated, status: res.data.status };
      }
      if (priorityChanged) {
        const res = await adminUpdateEnquiryPriority(enquiryId, localPriority);
        updated = { ...updated, priority: res.data.priority };
      }

      if (statusChanged || priorityChanged) {
        setEnquiry(updated);
        onUpdated(enquiryId, {
          ...(statusChanged   ? { status:   updated.status }   : {}),
          ...(priorityChanged ? { priority: updated.priority } : {}),
        });
        // Refresh allowed statuses after change
        const allowed = getAllowedStatuses(updated.status);
        setReplyStatus(allowed[0] || updated.status);
        show('✅ Enquiry updated successfully');
        // Reload history to show the STATUS_CHANGE event
        refreshHistory();
      } else {
        show('No changes to save');
      }
    } catch (err) {
      show('❌ ' + (err.message || 'Failed to save'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Send reply ─────────────────────────────────────────────────────────────

  const validateReply = () => {
    const errs = {};
    if (!replySubject.trim())         errs.subject = 'Subject is required';
    else if (replySubject.length > 500) errs.subject = 'Max 500 characters';
    if (!replyBody.trim())            errs.body    = 'Reply body is required';
    else if (replyBody.trim().length < 10) errs.body = 'Must be at least 10 characters';
    if (!replyStatus)                 errs.status  = 'Select a status';
    return errs;
  };

  const handleSendReply = async () => {
    const errs = validateReply();
    if (Object.keys(errs).length > 0) { setReplyErrors(errs); return; }

    setReplySending(true);
    setReplyErrors({});
    try {
      const res = await adminSendReply(enquiryId, {
        emailSubject: replySubject.trim(),
        emailBody:    replyBody.trim(),
        newStatus:    replyStatus,
      });
      const updated = res.data;
      setEnquiry(updated);
      setLocalStatus(updated.status);
      onUpdated(enquiryId, { status: updated.status });
      const allowed = getAllowedStatuses(updated.status);
      setReplyStatus(allowed[0] || updated.status);
      setReplySubject('');
      setReplyBody('');
      show('✅ Reply sent successfully');
      // Reload history timeline
      refreshHistory();
    } catch (err) {
      show('❌ ' + (err.message || 'Failed to send reply'), 'error');
    } finally {
      setReplySending(false);
    }
  };

  // ── Computed ───────────────────────────────────────────────────────────────

  const isClosed      = enquiry?.status === 'CLOSED';
  const allowedForSave = enquiry ? getAllowedStatuses(enquiry.status) : [];
  // Status options available in Save Changes dropdown: current + allowed transitions
  const saveStatusOptions = enquiry
    ? [enquiry.status, ...getAllowedStatuses(enquiry.status)]
    : [];

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading enquiry details…</p>
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-gray-500 text-sm">Could not load enquiry.</p>
        <button onClick={onBack} className="text-[#1a6b8a] text-sm font-semibold hover:underline">← Back to Enquiries</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastMsg toast={toast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#1a6b8a] hover:text-white hover:border-[#1a6b8a] transition-all shadow-sm text-lg">
            ←
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{enquiry.enquiryNumber}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Submitted on {fmtDateTime(enquiry.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLE[enquiry.status] || 'bg-gray-100 text-gray-600'}`}>
            {enquiry.status?.replaceAll('_', ' ')}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${PRIORITY_STYLE[enquiry.priority] || 'bg-gray-100 text-gray-600'}`}>
            {enquiry.priority}
          </span>
        </div>
      </div>

      {/* Closed banner */}
      {isClosed && (
        <div className="bg-gray-100 border border-gray-200 rounded-2xl px-5 py-3 flex items-center gap-3 text-sm text-gray-600">
          <span className="text-lg">🔒</span>
          <span>This enquiry is <strong>CLOSED</strong>. It cannot receive replies or priority changes.</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">

        {/* Left col — customer info + message + reply + history */}
        <div className="col-span-2 space-y-5">

          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">👤</span>
              Customer Information
            </h3>
            <DetailRow label="Full Name"     value={enquiry.fullName} />
            <DetailRow label="Email"         value={enquiry.email} />
            <DetailRow label="Phone"         value={enquiry.phone || '—'} />
            <DetailRow label="Customer Type" value={enquiry.customerId ? `Registered (ID #${enquiry.customerId})` : 'Guest'} />
          </div>

          {/* Original message */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">💬</span>
              Customer Message
            </h3>
            <div style={{whiteSpace:'pre-wrap'}} className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed min-h-20 border border-gray-100">
              {enquiry.message}
            </div>
          </div>

          {/* Reply composer */}
          {/* Reply composer — disabled when NEW, hidden when CLOSED */}
          {!isClosed && (
            <div className={`rounded-2xl border shadow-sm p-5 relative overflow-hidden transition-all
              ${enquiry.status === 'NEW'
                ? 'bg-gray-100 border-gray-200'
                : 'bg-white border-[#1a6b8a]/20'}`}>

              {/* Lock overlay for NEW status */}
              {enquiry.status === 'NEW' && (
                <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-2xl">🔒</div>
                  <p className="text-sm font-bold text-gray-600">Reply Locked</p>
                  <p className="text-xs text-gray-500 text-center max-w-xs leading-relaxed">
                    Change the status from <span className="font-semibold text-blue-600">NEW</span> to{' '}
                    <span className="font-semibold">IN PROGRESS</span> (or another status) before sending a reply.
                  </p>
                </div>
              )}

              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">✉️</span>
                Send Reply to Customer
                <span className="ml-auto text-[11px] text-gray-400 font-normal">Email will be sent to: {enquiry.email}</span>
              </h3>

              {/* Subject */}
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email Subject <span className="text-red-400">*</span>
                </label>
                <input
                  value={replySubject}
                  onChange={e => { setReplySubject(e.target.value); setReplyErrors(p => ({ ...p, subject: '' })); }}
                  placeholder={`Re: ${enquiry.subject}`}
                  maxLength={500}
                  disabled={enquiry.status === 'NEW'}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${replyErrors.subject ? 'border-red-400' : 'border-gray-200'}`}
                />
                {replyErrors.subject && <p className="text-[11px] text-red-500 mt-1">{replyErrors.subject}</p>}
              </div>

              {/* Body */}
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Message Body <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={replyBody}
                  onChange={e => { setReplyBody(e.target.value); setReplyErrors(p => ({ ...p, body: '' })); }}
                  rows={5}
                  placeholder="Write your reply to the customer here…"
                  disabled={enquiry.status === 'NEW'}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${replyErrors.body ? 'border-red-400' : 'border-gray-200'}`}
                />
                {replyErrors.body && <p className="text-[11px] text-red-500 mt-1">{replyErrors.body}</p>}
              </div>

              {/* Status after reply */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Set Status After Reply <span className="text-red-400">*</span>
                </label>
                {allowedForSave.length === 0 ? (
                  <p className="text-xs text-gray-400">No further transitions available from {enquiry.status}.</p>
                ) : (
                  <select
                    value={replyStatus}
                    onChange={e => { setReplyStatus(e.target.value); setReplyErrors(p => ({ ...p, status: '' })); }}
                    disabled={enquiry.status === 'NEW'}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/15 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed
                      ${replyErrors.status ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    {allowedForSave.map(s => (
                      <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                )}
                {replyErrors.status && <p className="text-[11px] text-red-500 mt-1">{replyErrors.status}</p>}
              </div>

              <button
                onClick={handleSendReply}
                disabled={replySending || enquiry.status === 'NEW'}
                className="bg-[#1a6b8a] hover:bg-[#155a75] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
              >
                {replySending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>
                ) : (
                  '📨 Send Email Reply'
                )}
              </button>
            </div>
          )}

          {/* History timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">📋</span>
              History
            </h3>
            <HistoryTimeline enquiryId={enquiryId} refreshKey={historyRefreshKey} />
          </div>
        </div>

        {/* Right col — enquiry info + update controls */}
        <div className="space-y-5">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">📋</span>
              Enquiry Info
            </h3>
            <DetailRow label="Enquiry #" value={enquiry.enquiryNumber} mono />
            <DetailRow label="Subject"   value={enquiry.subject} />
            <DetailRow label="Category"  value={enquiry.categoryLabel || CATEGORY_LABEL[enquiry.category] || enquiry.category} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">⚙️</span>
              Update Enquiry
            </h3>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Status</label>
              {isClosed ? (
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                  CLOSED (terminal — no changes)
                </div>
              ) : (
                <select
                  value={localStatus}
                  onChange={e => setLocalStatus(e.target.value)}
                  disabled={saving || isClosed}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/15 transition-all disabled:opacity-60"
                >
                  {saveStatusOptions.map(s => (
                    <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
                  ))}
                </select>
              )}
              {!isClosed && localStatus !== enquiry.status && (
                <p className="text-[11px] text-amber-600 mt-1">
                  ⚠️ Will change: {enquiry.status?.replaceAll('_', ' ')} → {localStatus?.replaceAll('_', ' ')}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Priority</label>
              <select
                value={localPriority}
                onChange={e => setLocalPriority(e.target.value)}
                disabled={saving || isClosed}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/15 transition-all disabled:opacity-60"
              >
                {PRIORITY_FILTERS.filter(p => p !== 'All').map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || isClosed}
              className="w-full bg-[#1a6b8a] hover:bg-[#155a75] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
              ) : (
                'Save Changes'
              )}
            </button>

            {isClosed && (
              <p className="text-[11px] text-gray-400 mt-2 text-center">
                Enquiry is closed. No further updates allowed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main List Component ────────────────────────────────────────────────────

export default function AdminContactEnquiries() {
  const [view,       setView]       = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  const [enquiries,  setEnquiries]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 20;

  const [searchKey,      setSearchKey]      = useState('enquiry');
  const [searchValue,    setSearchValue]    = useState('');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [fromDate,       setFromDate]       = useState('');
  const [toDate,         setToDate]         = useState('');

  const [statusCounts, setStatusCounts] = useState({});
  const [grandTotal,   setGrandTotal]   = useState(0);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const debounceRef = useRef(null);

  const load = useCallback((p = 0) => {
    setLoading(true);
    adminGetEnquiries({
      search:   searchValue.trim() || undefined,
      status:   statusFilter   !== 'All' ? statusFilter   : undefined,
      category: categoryFilter !== 'All' ? categoryFilter : undefined,
      priority: priorityFilter !== 'All' ? priorityFilter : undefined,
      from:     fromDate || undefined,
      to:       toDate   || undefined,
      page: p, size: PAGE_SIZE, sort: 'createdAt,desc',
    })
      .then(res => {
        const pg = res.data;
        setEnquiries(pg.content || []);
        setTotalPages(pg.totalPages || 0);
        setTotalItems(pg.totalElements || 0);
        setPage(p);
      })
      .catch(err => showToast(err.message || 'Failed to load', 'error'))
      .finally(() => setLoading(false));
  }, [searchValue, statusFilter, categoryFilter, priorityFilter, fromDate, toDate]); // eslint-disable-line

  useEffect(() => { load(0); }, [statusFilter, categoryFilter, priorityFilter, fromDate, toDate]); // eslint-disable-line

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(0), 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchValue]); // eslint-disable-line

  const loadCounts = useCallback(() => {
    adminGetEnquiries({ page: 0, size: 1000, sort: 'createdAt,desc' })
      .then(res => {
        const all = res.data?.content || [];
        const counts = all.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {});
        setStatusCounts(counts);
        setGrandTotal(res.data?.totalElements || all.length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const count = (s) => s === 'All' ? grandTotal : (statusCounts[s] || 0);

  const openDetail = (e) => { setSelectedId(e.id); setView('detail'); };

  const handleUpdated = (id, patch) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    if (patch.status) loadCounts();
  };

  if (view === 'detail' && selectedId) {
    return (
      <EnquiryDetailPanel
        enquiryId={selectedId}
        onBack={() => { setSelectedId(null); setView('list'); }}
        onUpdated={handleUpdated}
      />
    );
  }

  return (
    <div className="space-y-5">
      <ToastMsg toast={toast} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATUS_CARDS.map(({ label, display, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg shadow-md mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-800">{count(label)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{display}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Contact Enquiries</h3>
              <p className="text-xs text-gray-400 mt-0.5">{totalItems} total enquiries</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                <select value={searchKey} onChange={e => { setSearchKey(e.target.value); setSearchValue(''); }}
                  className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2 outline-none cursor-pointer">
                  <option value="enquiry">Enquiry #</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                </select>
                <input type="text" value={searchValue} onChange={e => setSearchValue(e.target.value)}
                  placeholder={`Search by ${searchKey === 'enquiry' ? 'enquiry #' : searchKey}…`}
                  className="px-3 py-2 text-sm outline-none w-44 bg-white" />
              </div>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2">Status</span>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm outline-none bg-white cursor-pointer">
                  {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s.replaceAll('_', ' ')}</option>)}
                </select>
              </div>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2">Category</span>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 text-sm outline-none bg-white cursor-pointer">
                  {CATEGORY_FILTERS.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : CATEGORY_LABEL[c] || c.replaceAll('_', ' ')}</option>)}
                </select>
              </div>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2">Priority</span>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 text-sm outline-none bg-white cursor-pointer">
                  {PRIORITY_FILTERS.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priority' : p}</option>)}
                </select>
              </div>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#1a6b8a] focus-within:ring-2 focus-within:ring-[#1a6b8a]/15 transition-all">
                <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2 whitespace-nowrap">From</span>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-2 py-2 text-sm outline-none bg-white border-r border-gray-200 cursor-pointer" />
                <span className="text-xs font-semibold text-[#1a6b8a] bg-gray-50 border-r border-gray-200 px-3 py-2">To</span>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-2 py-2 text-sm outline-none bg-white cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-400 text-sm">
              <span className="w-5 h-5 border-2 border-gray-200 border-t-[#1a6b8a] rounded-full animate-spin" />
              Loading enquiries…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                  {['Enquiry #', 'Customer', 'Email', 'Category', 'Subject', 'Status', 'Priority', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enquiries.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-300 text-sm">No enquiries found</td></tr>
                ) : enquiries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => openDetail(e)}>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#1a6b8a] font-semibold whitespace-nowrap">{e.enquiryNumber}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a6b8a]/20 to-teal-100 flex items-center justify-center text-xs font-bold text-[#1a6b8a]">
                          {(e.fullName || '?')[0].toUpperCase()}
                        </div>
                        {e.fullName}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{e.email}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {e.categoryLabel || CATEGORY_LABEL[e.category] || e.category?.replaceAll('_', ' ')}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs max-w-40">
                      <span className="block truncate" title={e.subject}>{e.subject}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[e.status] || 'bg-gray-100 text-gray-600'}`}>
                        {e.status?.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_STYLE[e.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {e.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{fmtDate(e.createdAt)}</td>
                    <td className="px-5 py-3.5" onClick={ev => ev.stopPropagation()}>
                      <button onClick={() => openDetail(e)} className="text-xs text-[#1a6b8a] hover:underline font-medium">View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 0 || loading}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1 || loading}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a6b8a] hover:text-[#1a6b8a] disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
