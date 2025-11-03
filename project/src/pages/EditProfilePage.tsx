import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone ?? '');
  const [address, setAddress] = useState(user?.user_metadata?.address ?? '');
  const [city, setCity] = useState(user?.user_metadata?.city ?? '');
  const [stateVal, setStateVal] = useState(user?.user_metadata?.state ?? '');
  const [postalCode, setPostalCode] = useState(user?.user_metadata?.postal_code ?? '');
  const [country, setCountry] = useState(user?.user_metadata?.country ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="py-24 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold">Not signed in</h2>
        <p className="text-gray-500 mt-2">Please sign in to edit your profile.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
  const res = await updateProfile({ full_name: fullName, phone, address, city, state: stateVal, postal_code: postalCode, country });
    setSaving(false);
    if (res?.error) {
      setMessage(res.error.message || 'Failed to update profile');
    } else {
      setMessage('Profile updated');
      // navigate back to profile
      window.history.pushState({}, '', '/profile');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 py-24">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-8 space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">State</label>
              <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Postal code</label>
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Country</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
          </div>

          <div className="flex items-center space-x-3">
            <button type="submit" disabled={saving} className="bg-brand-500 text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => { window.history.pushState({}, '', '/profile'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="bg-white border border-gray-200 px-4 py-2 rounded">Cancel</button>
          </div>

          {message && <div className="text-sm text-gray-700">{message}</div>}
        </form>
      </div>
    </div>
  );
}
