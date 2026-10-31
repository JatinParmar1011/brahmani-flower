import { useState, useEffect } from 'react';
import { fetchOrderById } from '../services/orderService';
import { fetchMyReview } from '../services/reviewService';
import WriteReviewForm from './WriteReviewForm';

const statusStyle = {
  CONFIRMED:        'bg-blue-100 text-blue-700',
  PROCESSING:       'bg-indigo-100 text-indigo-700',
  READY_TO_SHIP:    'bg-sky-100 text-sky-700',
  SHIPPED:          'bg-cyan-100 text-cyan-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED:        'bg-green-100 text-green-700',
  CANCELLED:        'bg-red-100 text-red-600',
  PENDING_PAYMENT:  'bg-amber-100 text-amber-700',
};

/**
 * OrderDetailsPanel — full order details with per-item review UI.
 * Props:
 *   orderId  — order ID to fetch
 *   onBack   — return to order list
 */
export default function OrderDetailsPanel({ orderId, onBack }) {
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Which item's review form is open and in what mode
  const [reviewingItem, setReviewingItem] = useState(null);   // the OrderItemResponse
  const [editMode, setEditMode]           = useState(false);  // true = editing existing review

  // Map of productId → existing review (fetched lazily per item when needed)
  const [existingReviews, setExistingReviews] = useState({});

  const load = () => {
    setLoading(true);
    setError('');
    fetchOrderById(orderId)
      .then(setOrder)
      .catch(err => setError(err.message || 'Failed to load order details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [orderId]);

  // Load existing review for an item before opening the form
  const openReviewForm = async (item, forEdit) => {
    if (forEdit && !existingReviews[item.productId]) {
      try {
        const r = await fetchMyReview(item.productId);
        setExistingReviews(prev => ({ ...prev, [item.productId]: r }));
      } catch {
        // review not found — treat as write mode
      }
    }
    setReviewingItem(item);
    setEditMode(forEdit);
  };

  const handleReviewSuccess = (savedReview) => {
    // Update cached review
    if (savedReview) {
      setExistingReviews(prev => ({ ...prev, [savedReview.productId]: savedReview }));
    }
    setReviewingItem(null);
    setEditMode(false);
    load(); // refresh order items to update reviewStatus / eligibleForReview
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#1a6b8a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#1a6b8a] font-semibold mb-5 hover:underline">
        ← Back to Orders
      </button>
      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
    </div>
  );

  if (!order) return null;

  const a = order.address;
  const addrLine = a
    ? [a.fullName, a.address1, a.address2, `${a.city}, ${a.state} – ${a.pincode}`, a.country]
        .filter(Boolean).join(', ')
    : '—';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#1a6b8a] font-semibold hover:underline flex-shrink-0"
        >
          ← Orders
        </button>
        <span className="text-gray-300">/</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            Order {order.orderNumber || `#${order.id}`}
          </h2>
          <p className="text-xs text-gray-400">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
              : ''}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusStyle[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {order.status?.replaceAll('_', ' ')}
        </span>
      </div>

      {/* Review form (write / edit) */}
      {reviewingItem && (
        <div className="mb-6 bg-white border border-[#1a6b8a]/20 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {editMode ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <WriteReviewForm
            productId={reviewingItem.productId}
            productName={reviewingItem.productName}
            productImageUrl={reviewingItem.productImageUrl}
            orderItemId={reviewingItem.id}
            existingReview={editMode ? existingReviews[reviewingItem.productId] : undefined}
            onSuccess={handleReviewSuccess}
            onCancel={() => { setReviewingItem(null); setEditMode(false); }}
          />
        </div>
      )}

      {/* Products */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Products Ordered</h3>
        <div className="flex flex-col gap-3">
          {order.items?.map((item, i) => (
            <ReviewableItem
              key={i}
              item={item}
              orderStatus={order.status}
              onWriteReview={() => openReviewForm(item, false)}
              onEditReview={() => openReviewForm(item, true)}
            />
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Order Summary</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Items Total</span>
              <span className="font-semibold text-gray-800">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-semibold text-gray-800">
                {order.shippingCharge > 0 ? `₹${order.shippingCharge}` : 'Free'}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-1.5 flex justify-between">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-sm font-bold text-[#1a6b8a]">
                ₹{(Number(order.totalAmount) + Number(order.shippingCharge || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Delivery Address</p>
          <p className="text-xs text-gray-700 leading-relaxed">📍 {addrLine}</p>
        </div>
      </div>
    </div>
  );
}

// ── Per-item review state card ─────────────────────────────────────────────
function ReviewableItem({ item, orderStatus, onWriteReview, onEditReview }) {
  const isReviewed  = !!item.reviewStatus && item.reviewStatus !== 'REJECTED' && item.reviewStatus !== 'HIDDEN';
  const isApproved  = item.reviewStatus === 'APPROVED';
  const isRejected  = item.reviewStatus === 'REJECTED';
  const isHidden    = item.reviewStatus === 'HIDDEN';
  const canWrite    = item.eligibleForReview;
  const afterDeliv  = orderStatus !== 'DELIVERED';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex gap-4 items-start">
        {/* Product thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          {item.productImageUrl
            ? <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.productName}</p>
          <p className="text-xs text-gray-500 mb-1">Qty: {item.quantity} × ₹{item.unitPrice}</p>
          <p className="text-xs font-bold text-gray-800">Subtotal: ₹{item.subtotal}</p>
        </div>

        {/* Review action / status */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          {isApproved ? (
            <>
              <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                ✅ Review Submitted
              </span>
              <button
                onClick={onEditReview}
                className="text-[10px] font-semibold text-[#1a6b8a] hover:underline"
              >
                ✏️ Edit Review
              </button>
            </>
          ) : isRejected ? (
            <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              ❌ Review Not Approved
            </span>
          ) : isHidden ? (
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
              🙈 Review Hidden
            </span>
          ) : canWrite ? (
            <button
              onClick={onWriteReview}
              className="text-xs font-semibold text-white bg-[#1a6b8a] hover:bg-[#155a75] px-3 py-1.5 rounded-lg transition-colors"
            >
              ✍️ Write a Review
            </button>
          ) : afterDeliv ? (
            <span className="text-[10px] text-gray-400 text-right">Available after delivery</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
