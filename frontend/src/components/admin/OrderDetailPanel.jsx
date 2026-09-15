import { useState, useEffect } from 'react';
import { fetchAdminOrderDetail, updateOrderStatusApi } from '../../services/orderService';

const STATUS_STYLE = {
  CONFIRMED:       'bg-blue-100 text-blue-700',
  PROCESSING:      'bg-indigo-100 text-indigo-700',
  SHIPPED:         'bg-cyan-100 text-cyan-700',
  DELIVERED:       'bg-emerald-100 text-emerald-700',
  CANCELLED:       'bg-red-100 text-red-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
};

const STATUS_ICON = {
  CONFIRMED: '✅', PROCESSING: '⚙️', SHIPPED: '🚚',
  DELIVERED: '📦', CANCELLED: '❌', PENDING_PAYMENT: '⏳',
};

const VALID_NEXT = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:       ['PROCESSING', 'CANCELLED'],
  PROCESSING:      ['SHIPPED',    'CANCELLED'],
  SHIPPED:         ['DELIVERED'],
  DELIVERED:       [],
  CANCELLED:       [],
};

const TRACK_STEPS = [
  { key: 'CONFIRMED',  label: 'Confirmed'  },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED',    label: 'Shipped'    },
  { key: 'DELIVERED',  label: 'Delivered'  },
];

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-xs font-semibold text-gray-700 text-right max-w-[60%]">{value ?? '—'}</span>
    </div>
  );
}

export default function OrderDetailPanel({ orderId, onBack, onStatusChanged }) {
  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error,    setError]    = useState('');
  const [reason,   setReason]   = useState('');
  const [toast,    setToast]    = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminOrderDetail(orderId)
      .then(setOrder)
      .catch(() => setError('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatus = async (newStatus) => {
    setUpdating(true); setError('');
    try {
      const updated = await updateOrderStatusApi(orderId, newStatus, reason);
      setOrder(updated);
      onStatusChanged?.(updated);
      setReason('');
      showToast(`Order marked as ${newStatus.replace('_', ' ')}`);
    } catch (e) {
      setError(e.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-gray-500 text-sm">{error}</p>
        <button onClick={onBack} className="text-[#1a6b8a] text-sm font-semibold hover:underline">← Back to Orders</button>
      </div>
    );
  }

  const nextStatuses = order ? (VALID_NEXT[order.status] || []) : [];
  const a = order?.address;
  const addrLine = a
    ? `${a.address1}${a.address2 ? ', ' + a.address2 : ''}, ${a.city}, ${a.state} – ${a.pincode}`
    : '—';

  // Track which step is active (for cancelled orders show cancelled state)
  const cancelled = order?.status === 'CANCELLED';
  const currentStepIdx = TRACK_STEPS.findIndex(s => s.key === order?.status);

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white/70 hover:text-white text-base leading-none">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#1a6b8a] hover:text-white hover:border-[#1a6b8a] transition-all shadow-sm text-lg">
            ←
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{order?.orderNumber}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Placed on {fmtDate(order?.createdAt)}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLE[order?.status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_ICON[order?.status]} {order?.status?.replace('_', ' ')}
        </span>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Left column ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Order Items</h3>
              <span className="text-xs text-gray-400">{order?.items?.length} item{order?.items?.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order?.items?.map((item, i) => {
                const disc = item.originalPrice > item.unitPrice
                  ? Math.round(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a6b8a]/10 to-[#1a6b8a]/5 flex items-center justify-center flex-shrink-0 text-2xl">
                      🌸
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{item.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-gray-900">₹{item.unitPrice}</span>
                        {disc > 0 && <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>}
                        {disc > 0 && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">{disc}% OFF</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400 mb-0.5">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900">₹{item.subtotal}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Price summary */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{order?.items?.reduce((s, i) => s + Number(i.subtotal), 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#1a6b8a]">₹{order?.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Delivery Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-5">Delivery Progress</h3>
            {cancelled ? (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="text-sm font-bold text-red-700">Order Cancelled</p>
                  <p className="text-xs text-red-500 mt-0.5">This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-[#1a6b8a] z-0 transition-all duration-700"
                  style={{ width: currentStepIdx >= 0 ? `${(currentStepIdx / (TRACK_STEPS.length - 1)) * (100 - 8)}%` : '0%' }}
                />
                <div className="relative z-10 flex justify-between">
                  {TRACK_STEPS.map((s, i) => {
                    const done    = i < currentStepIdx;
                    const current = i === currentStepIdx;
                    return (
                      <div key={s.key} className="flex flex-col items-center gap-2" style={{ width: '25%' }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          done    ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white'
                        : current ? 'bg-white border-[#1a6b8a] text-[#1a6b8a] shadow-md ring-4 ring-[#1a6b8a]/20'
                        :           'bg-white border-gray-200 text-gray-400'
                        }`}>
                          {done ? '✓' : i + 1}
                        </div>
                        <p className={`text-[10px] text-center leading-tight font-medium ${i <= currentStepIdx ? 'text-[#1a6b8a]' : 'text-gray-400'}`}>
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status History */}
          {order?.statusHistory?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Status History</h3>
              <div className="relative pl-5">
                <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-100" />
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="relative mb-4 last:mb-0">
                    <div className="absolute -left-[15px] top-1 w-3 h-3 rounded-full bg-[#1a6b8a] border-2 border-white shadow-sm" />
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {h.fromStatus && (
                            <>
                              <span className="text-xs text-gray-400">{h.fromStatus.replace('_', ' ')}</span>
                              <span className="text-gray-300 text-xs">→</span>
                            </>
                          )}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[h.toStatus] || 'bg-gray-100 text-gray-600'}`}>
                            {h.toStatus?.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">{fmtDate(h.createdAt)}</span>
                      </div>
                      {h.reason && <p className="text-xs text-gray-500 mt-0.5">Note: {h.reason}</p>}
                      {h.changedBy && <p className="text-[11px] text-gray-400 mt-0.5">By: {h.changedBy}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">👤</span>
              Customer
            </h3>
            <InfoRow label="Name"  value={order?.userName} />
            <InfoRow label="Order" value={order?.orderNumber} />
            <InfoRow label="Date"  value={fmtDate(order?.createdAt)} />
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">📍</span>
              Delivery Address
            </h3>
            {a ? (
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-gray-900">{a.fullName}</p>
                <p className="text-xs text-gray-500">📞 +91 {a.mobileNumber}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{addrLine}</p>
                <span className="inline-block text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1">
                  {a.addressType}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No address on record</p>
            )}
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">🔄</span>
              Update Status
            </h3>
            {nextStatuses.length > 0 ? (
              <div className="space-y-3">
                <input value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Reason / note (optional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[#1a6b8a]/20 transition" />
                {nextStatuses.map(s => (
                  <button key={s} onClick={() => handleStatus(s)} disabled={updating}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 ${
                      s === 'CANCELLED'
                        ? 'border-2 border-red-200 text-red-500 hover:bg-red-50'
                        : 'bg-[#1a6b8a] hover:bg-[#155a75] text-white'
                    }`}>
                    {updating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Updating…
                      </span>
                    ) : `Mark as ${s.replace('_', ' ')}`}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-base">{STATUS_ICON[order?.status]}</span>
                <p className="text-xs text-gray-500 font-medium">
                  {order?.status === 'DELIVERED' ? 'Order delivered successfully.' : 'Order has been cancelled.'}
                  {' '}No further actions available.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a6b8a]/10 flex items-center justify-center text-sm">💰</span>
              Payment Summary
            </h3>
            <InfoRow label="Items"    value={`${order?.items?.length} item(s)`} />
            <InfoRow label="Delivery" value="FREE" />
            <div className="flex justify-between pt-3 border-t border-dashed border-gray-200 mt-1">
              <span className="text-sm font-bold text-gray-900">Total Paid</span>
              <span className="text-base font-extrabold text-[#1a6b8a]">₹{order?.totalAmount}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
