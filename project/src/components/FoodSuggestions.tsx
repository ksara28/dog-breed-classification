import { ShoppingBag, Star, Dog } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface FoodSuggestionsProps {
  breed: string;
}

const foodRecommendations = [
  {
    name: 'Premium Puppy Formula',
    brand: 'Royal Canin',
    price: '₹4,999',
    rating: 4.8,
    features: 'High protein, DHA for brain development',
  },
  {
    name: 'Adult Large Breed',
    brand: 'Hill\'s Science Diet',
    price: '₹4,199',
    rating: 4.7,
    features: 'Joint support, balanced nutrition',
    // large breed dog outdoors / lifestyle
  },
  {
    name: 'Grain-Free Salmon',
    brand: 'Blue Buffalo',
    price: '₹5,299',
    rating: 4.9,
    features: 'No artificial preservatives, omega fatty acids',
    // fish / salmon ingredient, shiny coat
  },
  {
    name: 'Active Dog Formula',
    brand: 'Purina Pro Plan',
    price: '₹3,999',
    rating: 4.6,
    features: 'High energy, glucosamine for joints',
    // active dog running / sporty
  },
  {
    name: 'Sensitive Stomach',
    brand: 'Wellness Complete',
    price: '₹4,499',
    rating: 4.8,
    features: 'Easy digestion, probiotics included',
    // calm, relaxed dog — soothing vibe
  },
];

export default function FoodSuggestions({ breed }: FoodSuggestionsProps) {
  const { addToCart } = useCart();
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            Recommended Food for {breed}
          </h2>
          <p className="text-gray-600 text-lg">Premium nutrition options to keep your dog healthy and happy</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {foodRecommendations.map((food, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="rounded-xl mb-4 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                  <Dog className="w-10 h-10 text-brand-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">{food.name}</h3>
              <p className="text-brand-500 font-semibold mb-3">{food.brand}</p>

              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(food.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">({food.rating})</span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{food.features}</p>

              <div className="mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-green-600">{food.price}</span>
                </div>
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    onClick={() => {
                      const priceNum = parseFloat(String(food.price).replace(/[^0-9.]/g, '').replace(/,/g, '')) || 0;
                      const listingId = `${food.name.replace(/\s+/g, '-').toLowerCase()}-${index}-${Date.now()}`;
                      addToCart({ listingId, breed: food.name, price: priceNum, image: (food as any).imageUrl || undefined });
                      const btn = document.activeElement as HTMLElement | null;
                      if (btn) {
                        const prev = btn.getAttribute('title') || '';
                        btn.setAttribute('title', 'Added to cart');
                        setTimeout(() => btn.setAttribute('title', prev), 1400);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-brand-500 to-brand-700 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to cart</span>
                  </button>

                  <button
                    onClick={() => {
                      const priceNum = parseFloat(String(food.price).replace(/[^0-9.]/g, '').replace(/,/g, '')) || 0;
                      const listingId = `${food.name.replace(/\s+/g, '-').toLowerCase()}-${index}-${Date.now()}`;
                      addToCart({ listingId, breed: food.name, price: priceNum, image: (food as any).imageUrl || undefined });
                      try {
                        if (window.location.pathname !== '/cart') {
                          window.history.pushState({}, '', '/cart');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        } else {
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      } catch (e) {
                        window.location.href = '/cart';
                      }
                    }}
                    className="flex-1 border border-brand-500 text-brand-500 px-4 py-2 rounded-lg font-semibold hover:shadow-sm transition-all duration-300 flex items-center justify-center"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
