import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export default function CheckoutModal({ isOpen, onClose, item }: CheckoutModalProps) {
  const { user: authUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<'cod' | 'online'>('cod');
  const [onlineMethod, setOnlineMethod] = useState<'upi' | 'wallet' | 'paylater' | 'netbank'>('upi');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Prefill from authenticated user metadata if available
    try {
      if (authUser) {
        const meta: any = (authUser as any).user_metadata || (authUser as any).user || {};
        const full = meta.full_name || meta.fullName || '';
        const emailVal = (authUser as any).email || meta.email || '';
        const phoneVal = meta.phone || '';
        const addrParts = [meta.address, meta.city, meta.state, meta.postal_code, meta.country].filter(Boolean);
        const addr = addrParts.join(', ');
        setName(full || '');
        setEmail(emailVal || '');
        setPhone(phoneVal || '');
        setAddress(addr || '');
      }
    } catch (e) {}
  }, [isOpen, authUser]);

  if (!isOpen || !item) return null;

  const handleConfirm = async () => {
    if (!confirmChecked) {
      setError('Please confirm the details before purchasing');
      return;
    }
    if (!name || !address) {
      setError('Name and address are required');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const userObj = { name, email, phone, address };
      const items = [{ name: item.breed, qty: 1, price: item.price }];
  const body: any = { user: userObj, items, payment_method: payment, notes: `Marketplace purchase: ${item.breed}` };
  if (payment === 'online') body.payment_channel = onlineMethod;

      // write local order first
      const localOrder = {
        id: (window.crypto && (window.crypto as any).randomUUID ? (window.crypto as any).randomUUID() : `ord-${Date.now()}`),
        user: userObj,
        items,
  payment_method: payment,
  payment_channel: payment === 'online' ? onlineMethod : undefined,
        notes: body.notes,
        total: items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 1)), 0),
        status: payment === 'cod' ? 'pending' : 'awaiting_payment',
        created_at: Date.now(),
      };
      try {
        const raw = localStorage.getItem('pf_orders');
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift(localOrder);
        localStorage.setItem('pf_orders', JSON.stringify(arr));
        try { window.dispatchEvent(new CustomEvent('orders-updated')); } catch (e) {}
      } catch (e) {}

      // attempt to persist to backend
      try {
        const res = await fetch(`${BACKEND_URL}/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResult({ ok: false, localOrder });
          setError(data.error || 'Order saved locally but failed to persist to server');
        } else {
          setResult(data);
        }
      } catch (e) {
        setResult({ ok: false, localOrder });
      }

      // success path: close modal after short delay
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(String(err));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Complete Purchase</h3>

        <div className="flex items-center space-x-4 mb-4">
          <img src={item.image} alt={item.breed} className="w-20 h-20 object-cover rounded-lg" />
          <div>
            <div className="font-semibold">{item.breed}</div>
            <div className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')}</div>
            <div className="text-sm text-gray-500">{item.ageMonths} months</div>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Ship to</div>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State" className="w-full border rounded px-3 py-2 mt-1" />
          <div className="mt-2 grid grid-cols-1 gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full border rounded px-3 py-2" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mt-3 text-sm text-gray-600">Payment</div>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center"><input type="radio" checked={payment === 'cod'} onChange={() => setPayment('cod')} /> <span className="ml-2">Cash on Delivery</span></label>
            <label className="flex items-center"><input type="radio" checked={payment === 'online'} onChange={() => setPayment('online')} /> <span className="ml-2">Online Payment</span></label>
          </div>
          {payment === 'online' && (
            <div className="mt-3">
              <div className="text-sm text-gray-600">Choose online payment method</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button type="button" onClick={() => setOnlineMethod('upi')} className={`border rounded px-3 py-2 text-sm ${onlineMethod === 'upi' ? 'ring-2 ring-brand-500' : ''}`}>UPI</button>
                <button type="button" onClick={() => setOnlineMethod('paylater')} className={`border rounded px-3 py-2 text-sm ${onlineMethod === 'paylater' ? 'ring-2 ring-brand-500' : ''}`}>Pay Later</button>
                <button type="button" onClick={() => setOnlineMethod('wallet')} className={`border rounded px-3 py-2 text-sm ${onlineMethod === 'wallet' ? 'ring-2 ring-brand-500' : ''}`}>Pay from Wallet</button>
                <button type="button" onClick={() => setOnlineMethod('netbank')} className={`border rounded px-3 py-2 text-sm ${onlineMethod === 'netbank' ? 'ring-2 ring-brand-500' : ''}`}>Netbanking</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <label className="flex items-center"><input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} /> <span className="ml-2 text-sm">I confirm these details are correct</span></label>
        </div>

        {error && <div className="mb-3 text-red-600">{error}</div>}
        {result && result.order_id && <div className="mb-3 text-green-700">Order placed — ID: {result.order_id}</div>}

        <div className="space-x-2 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60"
          >
            {loading ? 'Placing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
