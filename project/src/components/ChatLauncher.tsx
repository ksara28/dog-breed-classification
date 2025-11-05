import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatWidget from './ChatWidget';

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    try {
      mq.addEventListener('change', update);
    } catch (e) {
      // fallback
      // @ts-ignore
      mq.addListener(update);
    }
    return () => {
      try { mq.removeEventListener('change', update); } catch (e) { try { mq.removeListener(update); } catch (e) {} }
    };
  }, []);

  return (
    <div>
      {/* Floating container */}
      {isMobile ? (
        // Full-screen modal on small viewports
        open ? (
          <div className="fixed inset-0 z-50 flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-brand-500" />
                <div className="font-semibold">PawFinder Assistant</div>
              </div>
              <div className="flex items-center space-x-2">
                <button aria-label="Close chat" onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-3 flex-1 overflow-hidden">
              <ChatWidget fullHeight />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            aria-label="Open AI chat"
            className="fixed bottom-4 right-4 z-50 bg-brand-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )
      ) : (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {open && (
            <div className="mb-3 w-[360px] max-w-[90vw]">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-brand-500" />
                    <div className="font-semibold">PawFinder Assistant</div>
                  </div>
                  <button aria-label="Close chat" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="p-3">
                  <ChatWidget />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="Open AI chat"
            className="bg-brand-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
