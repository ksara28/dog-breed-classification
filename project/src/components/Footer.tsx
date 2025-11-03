import { Mail, Phone, Facebook, Twitter, Instagram, Heart, Dog, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Dog className="w-8 h-8 text-brand-500" />
              <span className="text-2xl font-bold">PawFinder</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted companion in discovering dog breeds, finding the perfect food, and connecting with fellow dog lovers.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:sara1228k@gmail.com"
                className="flex items-center space-x-3 text-gray-400 hover:text-brand-500 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>sara1228k@gmail.com</span>
              </a>
              <a
                href="tel:1234567890"
                className="flex items-center space-x-3 text-gray-400 hover:text-brand-500 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>1234567890</span>
              </a>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>Bangalore, India</span>
              </div>
              <div className="text-gray-400">Owner: Saraswathi</div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-500 transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p className="flex items-center justify-center space-x-2">
            <span>Made with</span>
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            <span>for dog lovers everywhere</span>
          </p>
          <p className="mt-2 text-sm">© 2025 PawFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
