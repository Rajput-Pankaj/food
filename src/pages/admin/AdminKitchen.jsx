import { useEffect, useState } from 'react';
import { ordersApi } from '../../api';
import { API_URL, USE_API } from '../../config/api';
import { getAllOrders } from '../../utils/orderStorage';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const KITCHEN_STATUSES = ['accepted', 'preparing', 'ready'];

export default function AdminKitchen() {
  useDocumentTitle('Kitchen Display');
  const [orders, setOrders] = useState([]);

  const load = async () => {
    if (USE_API) {
      const all = await ordersApi.list({ limit: 100 });
      setOrders(all.filter((o) => KITCHEN_STATUSES.includes(o.status)));
    } else {
      setOrders(getAllOrders().filter((o) => KITCHEN_STATUSES.includes(o.status)));
    }
  };

  useEffect(() => {
    load();
    if (USE_API) {
      const es = new EventSource(`${API_URL}/events/orders`, { withCredentials: true });
      es.onmessage = () => load();
      return () => es.close();
    }
    const handler = () => load();
    window.addEventListener('orders-updated', handler);
    return () => window.removeEventListener('orders-updated', handler);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">Live queue — accepted, preparing, and ready orders</p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order) => (
          <article key={order.id} className="bg-white rounded-2xl border-2 border-green-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-2xl font-black text-gray-900">#{order.id.slice(0, 6).toUpperCase()}</h2>
              <OrderStatusBadge status={order.status} orderType={order.orderType} />
            </div>
            <ul className="space-y-2 text-lg">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between font-semibold">
                  <span>{item.food_name}</span>
                  <span className="text-green-600">×{item.quantity}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">{order.orderType} · {order.phone}</p>
          </article>
        ))}
      </div>
      {orders.length === 0 && (
        <p className="text-center text-gray-400 py-20 text-xl">No active kitchen orders</p>
      )}
    </div>
  );
}
