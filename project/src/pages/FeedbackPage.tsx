import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Feedback = {
  id: string;
  name?: string;
  rating?: number;
  message?: string;
  created_at?: number;
  author_id?: string | null;
  author_email?: string | null;
};

const FEEDBACK_KEY = 'pf_feedback';

function readFeedbacks(): Feedback[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // ignore
  }
  return [];
}

function writeFeedbacks(items: Feedback[]) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('feedback-updated'));
}

function seedDummyIfEmpty() {
  const existing = readFeedbacks();
  if (existing.length > 0) return;
  const now = Date.now();
  const sample: Feedback[] = [
    { id: `f-${now}-1`, name: 'Ananya', rating: 5, message: 'Lovely site, very easy to use!', created_at: now - 1000 * 60 * 60 * 24 },
    { id: `f-${now}-2`, name: 'Ravi', rating: 4, message: 'Good recommendations, model is impressive.', created_at: now - 1000 * 60 * 60 * 12 },
    { id: `f-${now}-3`, name: 'Meera', rating: 3, message: 'Checkout flow could be smoother on mobile.', created_at: now - 1000 * 60 * 30 },
  ];
  writeFeedbacks(sample);
}

export default function FeedbackPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<Feedback[]>(() => {
    seedDummyIfEmpty();
    return readFeedbacks().sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  });

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    const onUpdate = () => setItems(readFeedbacks().sort((a, b) => (b.created_at || 0) - (a.created_at || 0)));
    window.addEventListener('feedback-updated', onUpdate as EventListener);
    return () => window.removeEventListener('feedback-updated', onUpdate as EventListener);
  }, []);

  const addFeedback = () => {
    if (!message.trim()) return alert('Please enter feedback message');
    const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fb: Feedback = {
      id,
      name: name || (user?.user_metadata?.full_name as string) || 'Anonymous',
      rating,
      message: message.trim(),
      created_at: Date.now(),
      author_id: user?.id ?? null,
      author_email: user?.email ?? null,
    };
    const next = [fb, ...readFeedbacks()];
    writeFeedbacks(next);
    setName(''); setRating(5); setMessage('');
    setItems(next.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)));
  };

  const startEdit = (fb: Feedback) => {
    // only allow editing if current user is the author
    if (!user || (fb.author_id && fb.author_id !== user.id)) return alert('You can only edit your own feedback');
    setEditingId(fb.id);
    setEditName(fb.name || '');
    setEditRating(fb.rating || 5);
    setEditMessage(fb.message || '');
  };

  const saveEdit = (id: string) => {
    const arr = readFeedbacks().map((f) => {
      if (f.id !== id) return f;
      // ensure only author can update
      if (!user || (f.author_id && f.author_id !== user.id)) return f;
      return { ...f, name: editName || 'Anonymous', rating: editRating, message: editMessage };
    });
    writeFeedbacks(arr);
    setEditingId(null);
    setItems(arr.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteFeedback = (id: string) => {
    const f = readFeedbacks().find((x) => x.id === id);
    if (!f) return;
    // ensure only author can delete
    if (!user || (f.author_id && f.author_id !== user.id)) return alert('You can only delete your own feedback');
    if (!window.confirm('Delete this feedback?')) return;
    const arr = readFeedbacks().filter((f) => f.id !== id);
    writeFeedbacks(arr);
    setItems(arr.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)));
  };

  return (
    <div className="min-h-screen bg-brand-50 py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Feedback & Reviews</h1>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-2">Leave feedback about the website</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="col-span-2 border p-2 rounded" />
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border p-2 rounded">
              <option value={5}>5 — Excellent</option>
              <option value={4}>4 — Good</option>
              <option value={3}>3 — Okay</option>
              <option value={2}>2 — Poor</option>
              <option value={1}>1 — Bad</option>
            </select>
          </div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full border p-2 rounded mb-2" placeholder="Tell us what you liked or what we can improve" />
          <div className="flex items-center space-x-2">
            <button onClick={addFeedback} className="bg-brand-600 text-white px-4 py-2 rounded">Submit feedback</button>
            <button onClick={() => { setName(''); setRating(5); setMessage(''); }} className="px-3 py-2 rounded border">Clear</button>
          </div>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="bg-white p-6 rounded shadow">No feedback yet — be the first to leave a review.</div>
          ) : (
            items.map((f) => (
              <div key={f.id} className="bg-white p-4 rounded shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">{f.name} · <span className="font-mono text-xs">{new Date(f.created_at || 0).toLocaleString()}</span></div>
                    <div className="font-semibold mt-1">{(f.rating || 0) > 0 ? '★'.repeat(f.rating || 0) : ''}{'☆'.repeat(5 - (f.rating || 0))}</div>
                    {editingId === f.id ? (
                      <div className="mt-2">
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border p-2 rounded mb-2" />
                        <select value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} className="border p-2 rounded mb-2">
                          <option value={5}>5</option>
                          <option value={4}>4</option>
                          <option value={3}>3</option>
                          <option value={2}>2</option>
                          <option value={1}>1</option>
                        </select>
                        <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} className="w-full border p-2 rounded mb-2" rows={3} />
                        <div className="flex space-x-2">
                          <button onClick={() => saveEdit(f.id)} className="bg-emerald-500 text-white px-3 py-1 rounded">Save</button>
                          <button onClick={cancelEdit} className="px-3 py-1 rounded border">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{f.message}</div>
                    )}
                  </div>

                  <div className="ml-4 text-right space-y-2">
                    {editingId !== f.id && (user && f.author_id && user.id === f.author_id) && (
                      <>
                        <button onClick={() => startEdit(f)} className="text-sm text-brand-600">Edit</button>
                        <button onClick={() => deleteFeedback(f.id)} className="text-sm text-red-600">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
