import { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, Tag, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CheckoutModal from './CheckoutModal';
import ContactModal from './ContactModal';

interface DogListing {
  listingId: string;
  breed: string;
  price: number;
  ageMonths: number;
  image: string;
  description: string;
  tags: string[];
}

const LISTINGS_VERSION = 4; // bump this when initialListings change to force migration

const initialListings: DogListing[] = [
  {
    listingId: '1',
    breed: 'Golden Retriever',
    price: 200000,
    ageMonths: 8,
    image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=600&h=400&fit=crop',
    description: 'Friendly and playful golden retriever puppy. Vaccinated and trained.',
    tags: ['Pure Breed', 'Vaccinated']
  },
  {
    listingId: '2',
    breed: 'German Shepherd',
    price: 250000,
    ageMonths: 10,
  image: 'https://wallpapers.com/images/hd/bright-german-shepherd-dog-az4sanyk2mebg0y7.jpg',
    description: 'Intelligent and loyal German Shepherd. Excellent guard dog.',
    tags: ['Pure Breed', 'Trained']
  },
  {
    listingId: '3',
    breed: 'Labrador Retriever',
    price: 180000,
    ageMonths: 6,
  image: 'https://www.101dogbreeds.com/wp-content/uploads/2018/10/Labrador-Retriever-Images.jpg',
    description: 'Energetic and friendly Labrador. Great with kids.',
    tags: ['Family Dog', 'Vaccinated']
  },
  {
    listingId: '4',
    breed: 'Siberian Husky',
    price: 280000,
    ageMonths: 7,
    image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=400&fit=crop',
    description: 'Beautiful husky with striking blue eyes. Very energetic.',
    tags: ['Blue Eyes', 'Pure Breed']
  },
  {
    listingId: '5',
    breed: 'Beagle',
    price: 150000,
    ageMonths: 5,
    image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&h=400&fit=crop',
    description: 'Adorable beagle puppy. Friendly and curious nature.',
    tags: ['Small Size', 'Playful']
  },
  {
    listingId: '6',
    breed: 'Poodle',
    price: 220000,
    ageMonths: 9,
    image: 'https://images.unsplash.com/photo-1616012804791-28941fc7347e?w=600&h=400&fit=crop',
    description: 'Elegant standard poodle. Hypoallergenic coat.',
    tags: ['Hypoallergenic', 'Intelligent']
  },
  {
    listingId: '7',
    breed: 'Rottweiler',
    price: 240000,
    ageMonths: 11,
    image: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=600&h=400&fit=crop',
    description: 'Strong and loyal Rottweiler. Excellent protector.',
    tags: ['Guard Dog', 'Pure Breed']
  },
  {
    listingId: '8',
    breed: 'Bulldog',
    price: 210000,
    ageMonths: 8,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=400&fit=crop',
    description: 'Calm and friendly bulldog. Great apartment dog.',
    tags: ['Low Energy', 'Friendly']
  },
  {
    listingId: '9',
    breed: 'Shih Tzu',
    price: 120000,
    ageMonths: 4,
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&h=400&fit=crop',
    description: 'Adorable Shih Tzu puppy. Perfect lap dog.',
    tags: ['Small Size', 'Affectionate']
  },
  {
    listingId: '10',
    breed: 'Boxer',
    price: 190000,
    ageMonths: 9,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop',
    description: 'Energetic boxer with great personality. Loves to play.',
    tags: ['Athletic', 'Playful']
  },
  {
    listingId: '11',
    breed: 'Dachshund',
    price: 140000,
    ageMonths: 6,
    image: 'https://images.unsplash.com/photo-1612536980005-3dbf9b57aec3?w=600&h=400&fit=crop',
    description: 'Cute dachshund with unique personality. Very loyal.',
    tags: ['Small Size', 'Unique']
  },
  {
    listingId: '12',
    breed: 'Yorkshire Terrier',
    price: 160000,
    ageMonths: 5,
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=400&fit=crop',
    description: 'Tiny and adorable Yorkie. Great for apartments.',
    tags: ['Toy Size', 'Energetic']
  },
  {
    listingId: '13',
    breed: 'Doberman',
    price: 260000,
    ageMonths: 10,
    image: 'https://images.unsplash.com/photo-1603907208859-2d3e0b6b0789?w=600&h=400&fit=crop',
    description: 'Alert and loyal Doberman. Excellent guard dog.',
    tags: ['Guard Dog', 'Intelligent']
  },
  {
    listingId: '14',
    breed: 'Pomeranian',
    price: 130000,
    ageMonths: 4,
    image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600&h=400&fit=crop',
    description: 'Fluffy Pomeranian puppy. Very cute and friendly.',
    tags: ['Toy Size', 'Fluffy']
  },
  {
    listingId: '15',
    breed: 'Cocker Spaniel',
    price: 170000,
    ageMonths: 7,
    image: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=600&h=400&fit=crop',
    description: 'Beautiful Cocker Spaniel. Gentle and loving nature.',
    tags: ['Gentle', 'Family Dog']
  },
  {
    listingId: '16',
    breed: 'Chow Chow',
    price: 270000,
    ageMonths: 8,
    image: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=600&h=400&fit=crop',
    description: 'Majestic Chow Chow with lion-like appearance. Independent.',
    tags: ['Unique', 'Pure Breed']
  }
];

export default function Marketplace() {
  const [listings, setListings] = useState<DogListing[]>([]);
  const [checkoutItem, setCheckoutItem] = useState<DogListing | null>(null);
  const [contactBreed, setContactBreed] = useState<string>('');
  const { addToCart } = useCart();

  useEffect(() => {
    // Load listings from localStorage or use initial data.
    // We keep a version so when initialListings change we overwrite cached data.
    try {
      const savedVersion = Number(localStorage.getItem('pawfinder_marketplace_listings_version') || '0');
      const saved = localStorage.getItem('pawfinder_marketplace_listings');

      if (!saved || savedVersion !== LISTINGS_VERSION) {
        // overwrite with the current initial listings
        setListings(initialListings);
        localStorage.setItem('pawfinder_marketplace_listings', JSON.stringify(initialListings));
        localStorage.setItem('pawfinder_marketplace_listings_version', String(LISTINGS_VERSION));
      } else {
        setListings(JSON.parse(saved));
      }
    } catch (e) {
      setListings(initialListings);
      localStorage.setItem('pawfinder_marketplace_listings', JSON.stringify(initialListings));
      localStorage.setItem('pawfinder_marketplace_listings_version', String(LISTINGS_VERSION));
    }
  }, []);

  const handleAddToCart = (listing: DogListing) => {
    addToCart({
      listingId: listing.listingId,
      breed: listing.breed,
      price: listing.price,
      image: listing.image,
      ageMonths: listing.ageMonths,
    });
    alert(`${listing.breed} added to cart!`);
  };

  const handleBuyNow = (listing: DogListing) => {
    setCheckoutItem(listing);
  };

  const handleContact = (breed: string) => {
    setContactBreed(breed);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-brand-50 to-accent-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
            Dog Marketplace
          </h2>
          <p className="text-gray-600 text-lg">Find your perfect companion from our curated selection</p>
          <p className="text-gray-500 text-sm mt-2">🐾 {listings.length} adorable puppies available</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.listingId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.breed}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop';
                  }}
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Available
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-gray-800">{listing.breed}</h4>
                </div>
                
                <p className="text-2xl font-bold text-brand-600 mb-3">
                  ₹{listing.price.toLocaleString('en-IN')}
                </p>

                <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                  <span className="flex items-center bg-blue-50 px-2 py-1 rounded-lg">
                    <Calendar className="w-4 h-4 mr-1" />
                    {listing.ageMonths} months
                  </span>
                  <span className="flex items-center bg-purple-50 px-2 py-1 rounded-lg">
                    <Tag className="w-4 h-4 mr-1" />
                    {listing.tags[0]}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleBuyNow(listing)}
                    className="w-full bg-gradient-to-r from-brand-600 to-accent-500 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Buy Now
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddToCart(listing)}
                      className="flex items-center justify-center space-x-1 bg-white border-2 border-brand-300 text-brand-600 py-2 rounded-xl font-semibold hover:bg-brand-50 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                    
                    <button
                      onClick={() => handleContact(listing.breed)}
                      className="flex items-center justify-center space-x-1 bg-white border-2 border-gray-300 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {checkoutItem && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setCheckoutItem(null)}
          item={checkoutItem}
        />
      )}

      <ContactModal
        isOpen={!!contactBreed}
        onClose={() => setContactBreed('')}
        breed={contactBreed}
      />
    </section>
  );
}
