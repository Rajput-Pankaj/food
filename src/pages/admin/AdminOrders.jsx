import { useMemo, useState } from 'react';
import { MdNotificationsActive } from 'react-icons/md';
import AdminOrderCard from '../../components/admin/AdminOrderCard';
import { useOrders } from '../../hooks/useOrders';
import { ADMIN_ORDER_TABS } from '../../constants/orders';

export default function AdminOrders() {
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState('pending');

  const tabCounts = useMemo(() => {
    return ADMIN_ORDER_TABS.reduce((acc, tab) => {
      acc[tab.id] = orders.filter(tab.filter).length;
      return acc;
    }, {});
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const tab = ADMIN_ORDER_TABS.find((item) => item.id === activeTab);
    if (!tab) return orders;
    return orders.filter(tab.filter);
  }, [orders, activeTab]);

  const pendingCount = tabCounts.pending || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-0.5">
            Accept, reject, and track orders through every stage
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-semibold">
            <MdNotificationsActive className="w-5 h-5" />
            {pendingCount} pending order{pendingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_ORDER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === tab.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-200'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
              }`}
            >
              {tabCounts[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-600 font-medium">No {activeTab} orders</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'pending'
              ? 'New customer orders will appear here for accept/reject.'
              : 'Orders will show up here as they move through the pipeline.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              defaultExpanded={activeTab === 'pending' && tabCounts.pending <= 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}
