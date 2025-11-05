import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-brand-50 py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.listingId} className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.image && <img src={item.image} alt={item.breed} className="w-20 h-20 object-cover rounded" />}
                    <div>
                      <div className="font-semibold">{item.breed}</div>
                      <div className="text-sm text-gray-500">₹{item.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => removeFromCart(item.listingId)} className="text-rose-500">Remove</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <button onClick={() => clearCart()} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg">Clear Cart</button>
              <button onClick={() => {
                try {
                  if (window.location.pathname !== '/orders') {
                    window.history.pushState({}, '', '/orders');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                } catch (e) {
                  try { window.location.href = '/orders'; } catch (_) {}
                }
                try { window.dispatchEvent(new CustomEvent('open-order-modal')); } catch (e) {}
              }} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
