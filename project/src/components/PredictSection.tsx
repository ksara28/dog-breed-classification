import { useState, useRef } from 'react';
import { Upload, Loader } from 'lucide-react';

interface PredictSectionProps {
  onPrediction: (breed: string, confidence: number, image: string) => void;
}

const BACKEND_URL = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

export default function PredictSection({ onPrediction }: PredictSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show client preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setPreview(imageUrl);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('image', file);

      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'unknown' }));
        console.error('Prediction error', err);
        setError((err && err.error) || 'Prediction failed. See console for details.');
        setIsLoading(false);
        return;
      }

  const data = await res.json();
  console.log('Prediction response', data);
  const breed = data.breed ?? 'Unknown';
  // data.confidence is expected as a fraction between 0 and 1 (e.g. 0.9234).
  // Convert to percent (e.g. 92.34) and round to two decimals for display.
  const confidenceFraction = typeof data.confidence === 'number' ? data.confidence : 0;
  const confidence = Math.round(confidenceFraction * 10000) / 100; // percent with 2 decimals
      setError(null);
      onPrediction(breed, confidence, preview ?? '');
    } catch (err) {
      console.error('Upload failed', err);
      setError('Upload failed - check console and ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section id="predict" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            Identify Your Dog's Breed
          </h2>
          <p className="text-gray-600 text-lg">Upload a clear photo of your dog for instant AI-powered breed identification</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 transform hover:scale-[1.02] transition-all duration-300">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!preview ? (
            <div
              onClick={handleUploadClick}
              className="border-4 border-dashed border-brand-200 rounded-2xl p-12 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all duration-300"
            >
              <Upload className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">Click to Upload Image</p>
              <p className="text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={preview}
                  alt="Uploaded dog"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
                      <p className="text-lg font-semibold">Analyzing breed...</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleUploadClick}
                className="w-full bg-gradient-to-r from-brand-500 to-brand-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Different Image</span>
              </button>
            </div>
          )}
          {error && (
            <div className="mt-4 text-center text-red-600 font-medium">{error}</div>
          )}
        </div>
      </div>
    </section>
  );
}
