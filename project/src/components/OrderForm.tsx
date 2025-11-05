import React, { useState } from 'react';

const BACKEND_URL = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

type User = { name: string; email?: string; phone?: string; address: string };

type Item = { id?: string; name: string; qty: number; price?: number };

export default function OrderForm() {
  const [user, setUser] = useState<User>({ name: '', email: '', phone: '', address: '' });
  const [itemsText, setItemsText] = useState('');
  const [payment, setPayment] = useState<'cod' | 'online'>('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const parseItems = (): Item[] => {
    // Allow simple newline-separated items like: name,qty,price
    const lines = itemsText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const items: Item[] = [];
    for (const ln of lines) {
      const parts = ln.split(',').map(p => p.trim());
      const name = parts[0] || 'item';
      const qty = parts[1] ? Number(parts[1]) : 1;
      const price = parts[2] ? Number(parts[2]) : 0;
      items.push({ name, qty: isNaN(qty) ? 1 : qty, price: isNaN(price) ? 0 : price });
    }
    return items;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setResult(null);
    const items = parseItems();
    if (!user.name || !user.address) {
      setError('Name and address are required');
      return;
    }
    setLoading(true);
    try {
        const body = { user, items, payment_method: payment, notes };

        // create a local order entry so OrdersPage shows it immediately (no DB required)
        const localOrder = {
          id: (window.crypto && (window.crypto as any).randomUUID ? (window.crypto as any).randomUUID() : `ord-${Date.now()}`),
          user,
          items,
          payment_method: payment,
          notes,
          total: items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 1)), 0),
          status: payment === 'cod' ? 'pending' : 'awaiting_payment',
          created_at: Date.now(),
        };

        try {
          const raw = localStorage.getItem('pf_orders');
          const arr = raw ? JSON.parse(raw) : [];
          arr.unshift(localOrder);
          localStorage.setItem('pf_orders', JSON.stringify(arr));
        } catch (e) {
          // ignore localStorage errors
        }

        // dispatch update so OrdersPage refreshes
        try { window.dispatchEvent(new CustomEvent('orders-updated')); } catch (e) {}

        // still attempt to persist to backend (best-effort)
        try {
          const res = await fetch(`${BACKEND_URL}/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            // keep local copy but surface a non-blocking warning
            setError(data.error || 'Order saved locally but failed to persist to server');
            setResult({ ok: false, localOrder });
          } else {
            setResult(data);
          }
        } catch (e: any) {
          setResult({ ok: false, localOrder });
        }

        // clear form
        setUser({ name: '', email: '', phone: '', address: '' });
        setItemsText('');
        setNotes('');
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">Place an Order</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Address</label>
          <textarea value={user.address} onChange={(e) => setUser({ ...user, address: e.target.value })} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm">Items (one per line: name,qty,price)</label>
          <textarea value={itemsText} onChange={(e) => setItemsText(e.target.value)} placeholder={`Dog Food,2,299\nChew Toy,1,99`} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center"><input type="radio" checked={payment === 'cod'} onChange={() => setPayment('cod')} /> <span className="ml-2">Cash on Delivery</span></label>
          <label className="flex items-center"><input type="radio" checked={payment === 'online'} onChange={() => setPayment('online')} /> <span className="ml-2">Online Payment</span></label>
        </div>

        <div>
          <label className="block text-sm">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="flex items-center space-x-2">
          <button type="submit" disabled={loading} className="bg-brand-500 text-white px-4 py-2 rounded">{loading ? 'Placing...' : 'Place Order'}</button>
        </div>
      </form>

      {error && <div className="mt-3 text-red-600">{error}</div>}

      {result && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <div className="font-medium">Order placed — ID: {result.order_id}</div>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(result.order, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
