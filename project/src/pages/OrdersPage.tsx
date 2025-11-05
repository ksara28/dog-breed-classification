import { useEffect, useState } from 'react';
import OrderForm from '../components/OrderForm';

type Order = {
  id: string;
  user: { name?: string; email?: string; phone?: string; address?: string };
  items: Array<{ name?: string; qty?: number; price?: number }>;
  total?: number;
  payment_method?: string;
  status?: string;
  created_at?: number;
};

const LOCAL_KEY = 'pf_orders';

function readLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // ignore
  }
  return [];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => readLocalOrders());
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    const handler = () => setOrders(readLocalOrders());
    window.addEventListener('orders-updated', handler as EventListener);
    return () => window.removeEventListener('orders-updated', handler as EventListener);
  }, []);

  useEffect(() => {
    const openHandler = () => setShowOrderForm(true);
    window.addEventListener('open-order-modal', openHandler as EventListener);
    return () => window.removeEventListener('open-order-modal', openHandler as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-brand-50 py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>

        {orders.length === 0 && (
          <p className="text-gray-600">You have no orders yet. Purchases will appear here after checkout.</p>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">Order ID: <span className="font-mono text-xs">{o.id}</span></div>
                  <div className="text-lg font-semibold">{o.user?.name || 'Guest'}</div>
                  <div className="text-sm text-gray-600">{o.user?.email || ''} {o.user?.phone ? `· ${o.user.phone}` : ''}</div>
                  <div className="mt-2 text-sm text-gray-700">{o.items?.map((it) => `${it.name} x${it.qty || 1}`).join(', ')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{o.payment_method?.toUpperCase() || ''}</div>
                  <div className="text-xl font-semibold">₹{Number(o.total || 0).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Order Form modal (open on demand) */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 relative">
            <button onClick={() => setShowOrderForm(false)} className="absolute top-2 right-2 text-gray-600">Close</button>
            <OrderForm />
          </div>
        </div>
      )}
    </div>
  );
}
