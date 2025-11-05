import React, { useState, useRef, useEffect } from 'react';
import OrderForm from './OrderForm';

const BACKEND_URL = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  source?: string;
};

export default function ChatWidget({ fullHeight = false }: { fullHeight?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forceOpenAI, setForceOpenAI] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // initial system message
    setMessages([{ id: 'm0', role: 'system', text: 'PawFinder Assistant: ask about breeds, care, or recommendations.' }]);
    console.log('ChatWidget BACKEND_URL =', BACKEND_URL);
  }, []);

  useEffect(() => {
    const handler = () => setShowOrderForm(true);
    window.addEventListener('open-order-modal', handler as EventListener);
    return () => window.removeEventListener('open-order-modal', handler as EventListener);
  }, []);

  useEffect(() => {
    // scroll to bottom on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((s) => [...s, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const body = { question: text, force_openai: forceOpenAI };
      console.log('Chat request ->', body);
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'unknown' }));
        const errMsg: Message = { id: `e-${Date.now()}`, role: 'assistant', text: `Error: ${err.error || 'Request failed'}` };
        setMessages((s) => [...s, errMsg]);
        return;
      }

  const data = await res.json();
  console.log('Chat response <-', data);
  const answer = data.answer || data?.choices?.[0]?.message?.content || 'No answer.';
  const assistantMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', text: answer, source: data.source };
  setMessages((s) => [...s, assistantMsg]);
    } catch (e: any) {
      const assistantMsg: Message = { id: `aerr-${Date.now()}`, role: 'assistant', text: `Error: ${e.message || String(e)}` };
      setMessages((s) => [...s, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    send(input);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4" style={fullHeight ? { maxWidth: '100%' } : undefined}>
      <div
        className="overflow-y-auto p-4 space-y-3"
        ref={listRef}
        style={fullHeight ? { height: 'calc(100vh - 220px)' } : { height: '20rem' }}
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${m.role === 'user' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-800'} px-4 py-2 rounded-lg max-w-[80%]`}> 
              <div className="flex items-center space-x-2">
                <div>{m.text}</div>
                {m.role === 'assistant' && m.source && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{m.source}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">Thinking…</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input type="checkbox" checked={forceOpenAI} onChange={(e) => setForceOpenAI(e.target.checked)} className="form-checkbox" />
            <span>Force AI</span>
          </label>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me about breeds, care, or recommendations..." className="flex-1 border rounded-lg px-4 py-2" />
          <button type="submit" disabled={isLoading} className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:opacity-95 disabled:opacity-60">Send</button>
          <button
            type="button"
            onClick={() => {
              // activate the Orders route/menu and then show the order form modal
              try {
                if (window.location.pathname !== '/orders') {
                  window.history.pushState({}, '', '/orders');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              } catch (e) {
                try { window.location.href = '/orders'; } catch (_) {}
              }
                // dispatch a global event so whichever page/component is mounted
                // (ChatWidget when on /chat, or OrdersPage when on /orders) will open the order modal
                try { window.dispatchEvent(new CustomEvent('open-order-modal')); } catch (e) {}
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:opacity-95"
          >Buy Now</button>
        </div>
      </form>

      {/* Order Form modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 relative">
            <button onClick={() => setShowOrderForm(false)} className="absolute top-2 right-2 text-gray-600">Close</button>
            <OrderForm />
          </div>
        </div>
      )}
    </div>
  );
}
