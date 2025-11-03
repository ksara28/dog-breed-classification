import { ShoppingBag, Star } from 'lucide-react';

interface FoodSuggestionsProps {
  breed: string;
}

const foodRecommendations = [
  {
    name: 'Premium Puppy Formula',
    brand: 'Royal Canin',
    price: '$59.99',
    rating: 4.8,
    features: 'High protein, DHA for brain development',
  },
  {
    name: 'Adult Large Breed',
    brand: 'Hill\'s Science Diet',
    price: '$54.99',
    rating: 4.7,
    features: 'Joint support, balanced nutrition',
  },
  {
    name: 'Grain-Free Salmon',
    brand: 'Blue Buffalo',
    price: '$64.99',
    rating: 4.9,
    features: 'No artificial preservatives, omega fatty acids',
  },
  {
    name: 'Active Dog Formula',
    brand: 'Purina Pro Plan',
    price: '$49.99',
    rating: 4.6,
    features: 'High energy, glucosamine for joints',
  },
  {
    name: 'Sensitive Stomach',
    brand: 'Wellness Complete',
    price: '$56.99',
    rating: 4.8,
    features: 'Easy digestion, probiotics included',
  },
];

export default function FoodSuggestions({ breed }: FoodSuggestionsProps) {
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
              <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl p-8 mb-4 flex items-center justify-center">
                <span className="text-6xl">🍖</span>
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

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">{food.price}</span>
                <button className="bg-gradient-to-r from-brand-500 to-brand-700 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
