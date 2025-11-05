import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { Suspense, lazy } from 'react';
import { useAuth } from './contexts/AuthContext';
const LoginPage = lazy(() => import('./pages/LoginPage'));

const HomePage = lazy(() => import('./pages/HomePage'));
const PredictPage = lazy(() => import('./pages/PredictPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));

function App() {
  // Simple pathname-based routing without react-router.
  const [pathname, setPathname] = useState<string>(typeof window !== 'undefined' ? window.location.pathname : '/');

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Scroll to top whenever the route changes so new pages render from the top
  useEffect(() => {
    try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
  }, [pathname]);

  // no in-page sections: each nav item maps to a standalone page component

  const { user, loading } = useAuth();

  // If auth is still initializing show a small loader
  if (loading) {
    return <div className="py-24 text-center">Loading...</div>;
  }

  // If not signed in, show the login/signup page first
  if (!user) {
    return (
      <div>
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <LoginPage />
        </Suspense>
      </div>
    );
  }

  // route switch
  if (pathname === '/predict') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <PredictPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/marketplace') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <MarketplacePage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/about') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <AboutPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/contact') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <ContactPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/feedback') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <FeedbackPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/chat') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <ChatPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/cart') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <CartPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/profile') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <ProfilePage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/profile/edit') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <EditProfilePage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/orders') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <OrdersPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (pathname === '/history') {
    return (
      <div>
        <Navigation />
        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <HistoryPage />
        </Suspense>
        <Footer />
      </div>
    );
  }

  // Default: home
  return (
    <div>
      <Navigation />
      <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
        <HomePage />
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
