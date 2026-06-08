import { useEffect, useState } from 'react';
import { ordersApi } from '../api';
import { USE_API } from '../config/api';
import { getAllOrders, getOrderById, getOrdersByUser } from '../utils/orderStorage';

export function useOrders(userId = null) {
  const [orders, setOrders] = useState(() =>
    USE_API ? [] : userId ? getOrdersByUser(userId) : getAllOrders()
  );
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        try {
          const data = await ordersApi.list();
          setOrders(userId ? data.filter((order) => order.userId === userId) : data);
        } catch (error) {
          console.error('Failed to load orders:', error);
        } finally {
          setLoading(false);
        }
        return;
      }
      setOrders(userId ? getOrdersByUser(userId) : getAllOrders());
    };

    refresh();
    window.addEventListener('orders-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('orders-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [userId]);

  return { orders, loading };
}

export function useOrder(orderId) {
  const [order, setOrder] = useState(() => (USE_API ? null : getOrderById(orderId)));
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        try {
          const data = await ordersApi.get(orderId);
          setOrder(data);
        } catch {
          setOrder(null);
        } finally {
          setLoading(false);
        }
        return;
      }
      setOrder(getOrderById(orderId));
    };

    refresh();
    window.addEventListener('orders-updated', refresh);
    return () => window.removeEventListener('orders-updated', refresh);
  }, [orderId]);

  return { order, loading };
}
