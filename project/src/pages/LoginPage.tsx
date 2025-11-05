import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigateToHome = () => {
    try {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (e) {
      window.location.href = '/';
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res?.error) {
          setError(res.error.message || JSON.stringify(res.error));
        } else {
          navigateToHome();
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
  const addr = { address: address || undefined, city: city || undefined, state: stateVal || undefined, postal_code: postalCode || undefined, country: country || undefined };
  const res = await signUp(email, password, fullName || 'User', phone || undefined, addr);
        if (res?.error) {
          setError(res.error.message || JSON.stringify(res.error));
        } else {
          navigateToHome();
        }
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-6xl w-full bg-white shadow-md rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: breed image + about */}
        <div
          className="hidden md:block bg-cover bg-center"
          style={{
            backgroundImage: `url('https://img.freepik.com/premium-photo/cute-puppy-enjoying-sunset-outdoors_991410-2396.jpg')`,
          }}
        >
          <div className="h-full w-full bg-gradient-to-r from-black/40 to-black/10 flex items-center">
            <div className="p-12 text-white">
              <h3 className="text-3xl font-bold mb-3">PawFinder</h3>
              <p className="text-sm opacity-90 mb-4">Find breed information, get food suggestions, and shop for trusted products — all tailored to your dog's breed.</p>
              <ul className="space-y-2 text-sm">
                <li>• Fast breed prediction from images</li>
                <li>• AI-powered chat for care tips</li>
                <li>• Browse marketplace & track orders</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: auth form */}
        <div className="p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to continue to PawFinder</p>
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Jane Doe" />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" placeholder="+1 555 123 4567" />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600">Address</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Street address" />
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full border rounded-md px-3 py-2" />
                    <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="State" className="w-full border rounded-md px-3 py-2" />
                    <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" className="w-full border rounded-md px-3 py-2" />
                  </div>
                  <div className="mt-2">
                    <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full border rounded-md px-3 py-2" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="you@example.com" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Create a password" />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600">Confirm password</label>
                  <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Confirm password" />
                </div>
              )}

              <div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-500 to-brand-700 text-white px-4 py-2 rounded-md font-semibold">
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <>
                  Don't have an account? <button onClick={() => setMode('signup')} className="text-brand-500 font-semibold">Sign up</button>
                </>
              ) : (
                <>
                  Already have an account? <button onClick={() => setMode('login')} className="text-brand-500 font-semibold">Sign in</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

