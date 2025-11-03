import { Award, Heart, DollarSign, Info } from 'lucide-react';

interface BreedInfoProps {
  breed: string;
  confidence: number | null;
  image: string | null;
}

const breedData: Record<string, any> = {
  'Golden Retriever': {
    description: 'Friendly, intelligent, and devoted. Golden Retrievers are excellent family dogs known for their gentle temperament.',
    temperament: 'Friendly, Intelligent, Devoted',
    avgPrice: '₹80,000 - ₹2,50,000',
    careTips: 'Regular grooming needed, requires daily exercise, prone to hip dysplasia',
  },
  'Labrador Retriever': {
    description: 'Outgoing, even-tempered, and gentle. Labs are one of the most popular dog breeds in the world.',
    temperament: 'Outgoing, Even-Tempered, Gentle',
    avgPrice: '₹65,000 - ₹2,00,000',
    careTips: 'High energy, needs lots of exercise, loves water and swimming',
  },
  'German Shepherd': {
    description: 'Confident, courageous, and smart. German Shepherds are excellent working dogs and loyal companions.',
    temperament: 'Confident, Courageous, Smart',
    avgPrice: '₹1,25,000 - ₹3,30,000',
    careTips: 'Needs mental stimulation, regular training, and plenty of exercise',
  },
  'Siberian Husky': {
    description: 'Energetic, outgoing, and mischievous. Huskies are known for their striking appearance and vocal nature.',
    temperament: 'Energetic, Outgoing, Mischievous',
    avgPrice: '₹80,000 - ₹2,00,000',
    careTips: 'Requires extensive exercise, thrives in cold weather, known escape artists',
  },
};

export default function BreedInfo({ breed, confidence, image }: BreedInfoProps) {
  const info = breedData[breed] || {
    description: 'A wonderful breed known for their unique characteristics and loyal companionship.',
    temperament: 'Friendly, Loyal, Energetic',
    avgPrice: '₹65,000 - ₹2,00,000',
    careTips: 'Regular exercise, balanced diet, routine vet checkups',
  };

  return (
    <section className="py-20 px-4 bg-white/50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-brand-500 to-brand-700 p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{breed}</h2>
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6" />
                  <span className="text-xl font-semibold">Confidence: {confidence}%</span>
                </div>
              </div>
              {image && (
                <img
                  src={image}
                  alt={breed}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              )}
            </div>
          </div>

          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Info className="w-6 h-6 text-brand-500" />
                  <h3 className="text-xl font-bold text-gray-800">Description</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{info.description}</p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Heart className="w-6 h-6 text-rose-500" />
                  <h3 className="text-xl font-bold text-gray-800">Temperament</h3>
                </div>
                <p className="text-gray-600">{info.temperament}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-800">Average Price</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">{info.avgPrice}</p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-xl font-bold text-gray-800">Care Tips</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{info.careTips}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
