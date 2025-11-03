import { Cpu, Heart, Medal, Users } from 'lucide-react';

export default function About() {
  return (
  <section id="about" className="py-20 bg-brand-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">About PawFinder</h2>
          <p className="text-lg text-gray-600 mt-2">Your trusted companion for dog breed identification and care</p>
        </div>

        <div className="max-w-6xl mx-auto mb-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 mb-4">PawFinder is dedicated to helping dog lovers identify breeds, learn about their care needs, and connect with reputable breeders.</p>
              <p className="text-gray-700">Using advanced AI technology, we make breed identification accessible to everyone, whether you're a first-time dog owner or an experienced enthusiast.</p>
            </div>

            <div>
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <img
                  src="https://th.bing.com/th/id/R.bec9cc8b9cdbe891f18888067f36b5ab?rik=3%2fycEAeK1lr6Og&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f6%2fd%2f0%2f868430-download-free-cute-puppies-wallpaper-hd-1920x1280-free-download.jpg&ehk=3nmucwagTTcT4gHyQHTc7HuhaqAkQRD5r%2bJa3GvROgw%3d&risl=&pid=ImgRaw&r=0"
                  alt="Cute puppies"
                  className="w-full h-56 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white rounded-full shadow-inner">
                  <Cpu className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">AI-Powered</h4>
              <p className="text-sm text-gray-600 mt-2">Advanced machine learning models trained on thousands of dog breeds</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white rounded-full shadow-inner">
                  <Heart className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Care Tips</h4>
              <p className="text-sm text-gray-600 mt-2">Comprehensive breed information and personalized care recommendations</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white rounded-full shadow-inner">
                  <Medal className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Trusted</h4>
              <p className="text-sm text-gray-600 mt-2">Verified breeders and accurate information you can rely on</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-2xl py-12 px-6 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-3xl font-bold">Join Our Community</h3>
                <p className="mt-2 text-white/90">Thousands of dog lovers trust PawFinder for breed identification and care guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
