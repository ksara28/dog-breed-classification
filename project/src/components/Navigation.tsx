import { useState } from 'react';
import { Dog, LogIn, User as UserIcon, ShoppingCart, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from './AuthModal';
import ChatLauncher from './ChatLauncher';

export default function Navigation() {
  const { user, signOut, deleteAccount } = useAuth();
  const { cart } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    try {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (e) {
      window.location.href = path;
    }
  };

  const prefetch = (path: string) => {
    try {
      if (path === '/predict') import('../pages/PredictPage');
      if (path === '/marketplace') import('../pages/MarketplacePage');
          if (path === '/feedback') import('../pages/FeedbackPage');
      if (path === '/contact') import('../pages/ContactPage');
      if (path === '/cart') import('../pages/CartPage');
      if (path === '/orders') import('../pages/OrdersPage');
      if (path === '/history') import('../pages/HistoryPage');
      if (path === '/') import('../App');
    } catch (e) {
      // ignore
    }
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Dog className="w-8 h-8 text-brand-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">PawFinder</span>
            </div>

            <div className="flex items-center space-x-8">
              <div className="hidden md:flex space-x-8">
                <a onMouseEnter={() => prefetch('/')} onClick={(e) => { e.preventDefault(); navigateTo('/'); }} href="/" className="text-gray-700 hover:text-brand-500 transition-colors font-medium">Home</a>
                <a onMouseEnter={() => prefetch('/predict')} onClick={(e) => { e.preventDefault(); navigateTo('/predict'); }} href="/predict" className="text-gray-700 hover:text-brand-500 transition-colors font-medium">Predict</a>
                <a onMouseEnter={() => prefetch('/marketplace')} onClick={(e) => { e.preventDefault(); navigateTo('/marketplace'); }} href="/marketplace" className="text-gray-700 hover:text-brand-500 transition-colors font-medium">Marketplace</a>
                <a onMouseEnter={() => prefetch('/about')} onClick={(e) => { e.preventDefault(); navigateTo('/about'); }} href="/about" className="text-gray-700 hover:text-brand-500 transition-colors font-medium">About</a>
                <a onMouseEnter={() => prefetch('/contact')} onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} href="/contact" className="text-gray-700 hover:text-brand-500 transition-colors font-medium">Contact</a>
                <a onMouseEnter={() => prefetch('/feedback')} onClick={(e) => { e.preventDefault(); navigateTo('/feedback'); }} href="/feedback" className="text-gray-700 hover:text-brand-500 transition-colors font-medium">Feedback</a>
                <a onMouseEnter={() => prefetch('/history')} onClick={(e) => { e.preventDefault(); navigateTo('/history'); }} href="/history" className="text-gray-700 hover:text-brand-500 transition-colors font-medium">History</a>
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  <button onClick={(e) => { e.preventDefault(); navigateTo('/cart'); }} className="relative bg-white p-2 rounded-full hover:shadow-md" aria-label="Open cart">
                    <ShoppingCart className="w-5 h-5 text-gray-700" />
                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full px-1">{cart.length}</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setShowProfileMenu((s) => !s)} className="flex items-center space-x-2 bg-emerald-500 text-white w-10 h-10 rounded-full justify-center hover:scale-105 transition-transform" aria-label="Open profile menu">
                        <span className="font-semibold">{(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}</span>
                      </button>
                      <div className="hidden sm:flex flex-col leading-none">
                        <span className="text-sm font-medium text-gray-800">{user.user_metadata?.full_name || 'User'}</span>
                        {/* email intentionally hidden from top-right header for privacy; visible in profile dropdown */}
                      </div>
                    </div>
                  </div>

                  {showProfileMenu && (
                    <div className="absolute right-4 top-14 mt-3 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5">
                      <div className="p-4 border-b">
                        <div className="text-sm font-semibold text-gray-800">{user.user_metadata?.full_name || 'User'}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <ul className="py-2">
                        <li><a onClick={(e) => { e.preventDefault(); navigateTo('/profile'); setShowProfileMenu(false); }} href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"><UserIcon className="w-4 h-4 mr-2 text-emerald-500" /> View Profile</a></li>
                        <li><a onClick={(e) => { e.preventDefault(); navigateTo('/profile/edit'); setShowProfileMenu(false); }} href="/profile/edit" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"><UserIcon className="w-4 h-4 mr-2 text-emerald-500" /> Edit Profile</a></li>
                        <li><a onClick={(e) => { e.preventDefault(); navigateTo('/orders'); setShowProfileMenu(false); }} href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"><Clock className="w-4 h-4 mr-2 text-emerald-500" /> Orders</a></li>
                        <li><a onClick={(e) => { e.preventDefault(); navigateTo('/history'); setShowProfileMenu(false); }} href="/history" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"><UserIcon className="w-4 h-4 mr-2 text-emerald-500" /> History</a></li>
                        <li><a onClick={(e) => { e.preventDefault(); navigateTo('/cart'); setShowProfileMenu(false); }} href="/cart" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"><ShoppingCart className="w-4 h-4 mr-2 text-emerald-500" /> Cart <span className="ml-auto text-xs text-gray-500">{cart.length}</span></a></li>
                      </ul>
                      <div className="p-3 border-t space-y-2">
                        <button onClick={async () => { await signOut(); setShowProfileMenu(false); }} className="w-full text-left text-sm text-gray-700 hover:text-red-600">Sign out</button>
                        <button onClick={(e) => { e.preventDefault(); setShowProfileMenu(false); setShowDeleteModal(true); }} className="w-full text-left text-sm text-red-600">Delete account</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleAuthClick('login')} className="flex items-center space-x-2 text-gray-700 hover:text-brand-500 font-semibold transition-colors"><LogIn className="w-4 h-4" /><span>Login</span></button>
                  <button onClick={() => handleAuthClick('signup')} className="bg-gradient-to-r from-brand-500 to-brand-700 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Confirm account deletion</h3>
            <p className="text-sm text-gray-600 mb-4">This action will permanently delete your account. To confirm, type your email below and click Delete.</p>
            <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type your email to confirm" className="w-full border rounded px-3 py-2 mb-2" />
            {deleteError && <div className="text-sm text-red-600 mb-2">{deleteError}</div>}
            <div className="flex justify-end space-x-2">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(null); }} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={async () => {
                setDeleteError(null);
                const expected = user?.email || '';
                if (expected && deleteConfirmText.trim() !== expected) {
                  setDeleteError('The email you entered does not match your account email.');
                  return;
                }
                try {
                  const res = await deleteAccount();
                  if (res?.error) {
                    alert(res.error.message || 'Account deletion is not available in this environment. You will be signed out locally.');
                  }
                } catch (err) {
                  // ignore
                }
                try { await signOut(); } catch (e) { /* ignore */ }
                setShowDeleteModal(false);
                setDeleteConfirmText('');
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
      <ChatLauncher />
    </>
  );
}

