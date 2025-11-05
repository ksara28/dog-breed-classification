import { Mail, Phone, MapPin, User } from 'lucide-react';
import { useState } from 'react';

const HISTORY_KEY = 'pf_history';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const saveMessage = () => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const entry = { id: `msg-${Date.now()}`, type: 'contact', name, email, subject, message, created_at: Date.now() };
      arr.unshift(entry);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
      try { window.dispatchEvent(new CustomEvent('history-updated')); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('orders-updated')); } catch (e) {}
      setStatus('Message sent — thank you!');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (e) {
      setStatus('Failed to save message locally');
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!name || !message) {
      setStatus('Name and message are required');
      return;
    }
    // For now we save locally and show confirmation. Backend persistence can be added later.
    saveMessage();
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="text-gray-700 mt-3">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

            <form onSubmit={onSubmit}>
              <label className="block text-sm font-medium text-gray-700">Your Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="mt-2 mb-4 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Your name" />

              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 mb-4 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="you@example.com" />

              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} type="text" className="mt-2 mb-4 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Subject" />

              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="mt-2 mb-4 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Write your message..."></textarea>

              <div className="flex items-center justify-between">
                <button type="submit" className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg">Send Message</button>
                <div className="text-sm text-gray-500">We reply within 24-48 hours</div>
              </div>
              {status && <div className="mt-3 text-sm text-green-700">{status}</div>}
            </form>
          </div>

          {/* Right: contact info */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-emerald-50 rounded-md">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Email</div>
                  <div className="text-gray-600">breed123@gmail.com</div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-emerald-50 rounded-md">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Phone</div>
                  <div className="text-gray-600">1234567890</div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-emerald-50 rounded-md">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Address</div>
                  <div className="text-gray-600">Bangalore, India</div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-emerald-50 rounded-md">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Owner</div>
                  <div className="text-gray-600">Saraswathi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
