import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const scrollToPredict = () => {
    const element = document.getElementById('predict');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
    >
      <div className="absolute inset-0 paw-print-bg opacity-10"></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8 inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
            <span className="text-5xl">🐕</span>
          </div>
        </div>

  <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent">
          Discover Your Dog's Breed
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
          Upload a photo and let AI identify the breed instantly. Get breed info, food recommendations, and explore our marketplace!
        </p>

        <button
          onClick={scrollToPredict}
          className="bg-gradient-to-r from-brand-500 to-brand-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto"
        >
          <span>Upload Dog Image</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent"></div>
    </section>
  );
}
