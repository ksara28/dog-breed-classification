import { useState } from 'react';
import Hero from '../components/Hero';
import PredictSection from '../components/PredictSection';
import BreedInfo from '../components/BreedInfo';
import FoodSuggestions from '../components/FoodSuggestions';

export default function HomePage() {
  const [predictedBreed, setPredictedBreed] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <Hero />
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <PredictSection
          onPrediction={(breed, conf, img) => {
            setPredictedBreed(breed);
            setConfidence(conf);
            setUploadedImage(img);
          }}
        />

        {predictedBreed && (
          <div className="max-w-4xl mx-auto px-4">
            <BreedInfo breed={predictedBreed} confidence={confidence} image={uploadedImage} />
            <FoodSuggestions breed={predictedBreed} />
          </div>
        )}
      </div>
    </div>
  );
}
