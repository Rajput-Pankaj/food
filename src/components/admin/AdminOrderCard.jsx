import { useState } from 'react';
import {
  LuChevronDown,
  LuChevronUp,
  LuArrowRight,
  LuCheck,
  LuX,
  LuPhone,
} from 'react-icons/lu';
import OrderTimeline from '../orders/OrderTimeline';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import {
  getNextStatusLabel,
  isPendingOrderStatus,
  isTerminalStatus,
  normalizeOrderStatus,
  ORDER_STATUS,
} from '../../constants/orders';
import { PAYMENT_METHOD_LABELS } from '../../constants/roles';
import { PAYMENT_STATUS_LABELS } from '../../constants/storeSettings';
import {
  acceptOrder,
  advanceOrderStatus,
  rejectOrder,
} from '../../utils/orderStorage';

export default function AdminOrderCard({ order, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const status = normalizeOrderStatus(order.status);
  const isPending = isPendingOrderStatus(order.status);
  const isTerminal = isTerminalStatus(order.status);
  const nextLabel = getNextStatusLabel(order);

  const handleAccept = async () => {
    await acceptOrder(order.id);
    setActionMessage('Order accepted.');
    setShowRejectForm(false);
  };

  const handleReject = async () => {
    await rejectOrder(order.id, rejectNote.trim() || 'Order rejected by restaurant');
    setActionMessage('Order rejected.');
    setShowRejectForm(false);
  };

  const handleAdvance = async () => {
    await advanceOrderStatus(order.id);
    setActionMessage(`Moved to: ${getNextStatusLabel(order) || 'next step'}`);
  };

  return (
    <article
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isPending ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                #{order.id.slice(0, 8).toUpperCase()}
              </h3>
              <OrderStatusBadge status={order.status} orderType={order.orderType} />
              {isPending && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                  Needs action
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString()} ·{' '}
              {order.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
            </p>
            <div className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
              <p className="truncate">
                <strong className="text-gray-800">Customer:</strong> {order.userEmail}
              </p>
              <p className="inline-flex items-center gap-1">
                <LuPhone className="w-3.5 h-3.5 text-green-600" />
                <a href={`tel:${order.phone}`} className="text-green-600 hover:underline">
                  {order.phone}
                </a>
              </p>
              <p className="sm:col-span-2 break-words">
                <strong className="text-gray-800">
                  {order.orderType === 'takeaway' ? 'Pickup:' : 'Address:'}
                </strong>{' '}
                {order.address}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
            <p className="text-xl font-bold text-green-600">Rs.{order.total}/-</p>
            <p className="text-xs text-gray-500">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              {order.paymentStatus && (
                <span> · {PAYMENT_STATUS_LABELS[order.paymentStatus]}</span>
              )}
            </p>
          </div>
        </div>

        {isPending && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
            >
              <LuCheck className="w-4 h-4" />
              Accept Order
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 bg-red-50 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <LuX className="w-4 h-4" />
              Reject Order
            </button>
          </div>
        )}

        {showRejectForm && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl space-y-2">
            <label htmlFor={`reject-${order.id}`} className="text-sm font-medium text-red-800">
              Rejection reason (optional)
            </label>
            <textarea
              id={`reject-${order.id}`}
              rows={2}
              value={rejectNote}
              onChange={(event) => setRejectNote(event.target.value)}
              placeholder="Item unavailable, store closed, etc."
              className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
            <button
              type="button"
              onClick={handleReject}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Confirm Reject
            </button>
          </div>
        )}

        {!isPending && !isTerminal && nextLabel && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAdvance}
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
            >
              Mark as {nextLabel}
              <LuArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
            >
              Cancel Order
            </button>
          </div>
        )}

        {actionMessage && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {actionMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm font-semibold text-gray-500 hover:text-green-600 py-2 border-t border-gray-100"
        >
          {expanded ? (
            <>
              Hide details <LuChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              View items & tracking <LuChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 space-y-5">
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">Order items</h4>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3"
                >
                  <img
                    src={item.food_image}
                    alt={item.food_name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.food_name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 shrink-0">
                    Rs.{item.price * item.quantity}/-
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">Tracking progress</h4>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <OrderTimeline order={order} variant="horizontal" />
            </div>
          </div>

          {order.notes && (
            <p className="text-sm text-gray-600 bg-white rounded-xl border border-gray-100 p-3">
              <strong className="text-gray-800">Customer notes:</strong> {order.notes}
            </p>
          )}

          {status === ORDER_STATUS.REJECTED && order.statusHistory?.length > 0 && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
              <strong>Rejection note:</strong>{' '}
              {[...order.statusHistory]
                .reverse()
                .find((entry) => normalizeOrderStatus(entry.status) === ORDER_STATUS.REJECTED)?.note ||
                'Order was rejected.'}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
