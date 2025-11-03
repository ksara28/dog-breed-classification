import PredictSection from '../components/PredictSection';
import BreedInfo from '../components/BreedInfo';
import FoodSuggestions from '../components/FoodSuggestions';
import { useState } from 'react';

export default function PredictPage() {
  const [predictedBreed, setPredictedBreed] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200">
      <div className="max-w-4xl mx-auto py-24 px-4">
        <PredictSection
          onPrediction={(breed, conf, img) => {
            setPredictedBreed(breed);
            setConfidence(conf);
            setUploadedImage(img);
          }}
        />

        {predictedBreed && (
          <>
            <BreedInfo breed={predictedBreed} confidence={confidence} image={uploadedImage} />
            <FoodSuggestions breed={predictedBreed} />
          </>
        )}
      </div>
    </div>
  );
}
