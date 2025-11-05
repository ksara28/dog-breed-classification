import React from 'react';
import ChatWidget from '../components/ChatWidget';

export default function ChatPage() {
  return (
    <main className="pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">PawFinder Chat</h1>
          <p className="text-gray-600">Ask about breeds, care, training, or get recommendations.</p>
        </div>

        <ChatWidget />
      </div>
    </main>
  );
}
