import { useEffect, useState } from 'react';

type MessageEntry = {
  id: string;
  type: 'contact';
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  created_at?: number;
};

const HISTORY_KEY = 'pf_history';

function readLocalHistory(): MessageEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // ignore
  }
  return [];
}

export default function HistoryPage() {
  const [messages, setMessages] = useState<MessageEntry[]>(() => readLocalHistory());

  useEffect(() => {
    const handler = () => setMessages(readLocalHistory());
    window.addEventListener('history-updated', handler as EventListener);
    return () => window.removeEventListener('history-updated', handler as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-brand-50 py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">History</h1>

        {messages.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">You have no activity yet. Contact messages and other actions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="bg-white p-4 rounded shadow-sm">
                <div className="text-sm text-gray-500">Message · <span className="text-xs text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span></div>
                <div className="mt-1 font-semibold">{m.subject || 'Contact message'}</div>
                <div className="text-sm text-gray-600">From: {m.name || m.email || 'Anonymous'}</div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{m.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
