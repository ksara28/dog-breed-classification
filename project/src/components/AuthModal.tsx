import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  // Keep internal mode in sync when the parent requests a different initialMode
  // (Navigation toggles initialMode before opening the modal).
  // This ensures the modal shows the requested tab every time it's opened.
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
          setEmail('');
          setPassword('');
        }
      } else {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
  const addr = { address: address || undefined, city: city || undefined, state: stateVal || undefined, postal_code: postalCode || undefined, country: country || undefined };
  const { error } = await signUp(email, password, fullName, phone, addr);
        if (error) {
          setError(error.message);
        } else {
          onClose();
          setEmail('');
          setPassword('');
          setFullName('');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-fade-in">
  <div className="relative bg-gradient-to-r from-brand-500 to-brand-700 p-8 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-white text-center">
            {mode === 'login' ? 'Welcome Back!' : 'Join PawFinder'}
          </h2>
          <p className="text-white/90 text-center mt-2">
            {mode === 'login'
              ? 'Sign in to access your account'
              : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className="w-full border border-gray-200 rounded px-3 py-2" />
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full border border-gray-200 rounded px-3 py-2" />
                <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="State" className="w-full border border-gray-200 rounded px-3 py-2" />
                <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" className="w-full border border-gray-200 rounded px-3 py-2" />
              </div>
              <div className="mt-3">
                <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full border border-gray-200 rounded px-3 py-2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="Confirm password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-700 text-white py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
            >
              {mode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
