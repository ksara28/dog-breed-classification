import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, deleteAccount } = useAuth();

  const fullName = user?.user_metadata?.full_name ?? '';
  const phone = user?.user_metadata?.phone ?? '';
  const address = user?.user_metadata?.address ?? '';
  const city = user?.user_metadata?.city ?? '';
  const stateVal = user?.user_metadata?.state ?? '';
  const postalCode = user?.user_metadata?.postal_code ?? '';
  const country = user?.user_metadata?.country ?? '';

  const onDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!ok) return;
    const res = await deleteAccount();
    if (res?.error) {
      alert(res.error.message || 'Account deletion not available.');
    } else {
      // redirect home
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <div className="bg-white rounded-2xl shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold">Name</h2>
              <p className="text-gray-700 mt-2">{fullName || '—'}</p>

              <h2 className="text-lg font-semibold mt-6">Email</h2>
              <p className="text-gray-700 mt-2">{user?.email ?? '—'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Phone</h2>
              <p className="text-gray-700 mt-2">{phone || '—'}</p>

              <h2 className="text-lg font-semibold mt-6">Address</h2>
              <p className="text-gray-700 mt-2">{address || '—'}</p>
              <p className="text-gray-700">{city ? `${city}${stateVal ? ', ' + stateVal : ''}${postalCode ? ' • ' + postalCode : ''}` : ''}</p>
              <p className="text-gray-700">{country || ''}</p>

              <h2 className="text-lg font-semibold mt-6">Account</h2>
              <p className="text-gray-700 mt-2">Member since your registration</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => { window.history.pushState({}, '', '/profile/edit'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="bg-brand-500 text-white px-4 py-2 rounded">Edit profile</button>
            <button onClick={() => { window.history.pushState({}, '', '/orders'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="bg-white border border-gray-200 px-4 py-2 rounded">Orders</button>
            <button onClick={() => { window.history.pushState({}, '', '/history'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="bg-white border border-gray-200 px-4 py-2 rounded">History</button>
            <button onClick={onDelete} className="ml-auto bg-red-600 text-white px-4 py-2 rounded">Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
