import React, { useState } from 'react';

export default function AIChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');
    try {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.41.27:4002';
      const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Unable to get response.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg border rounded-lg p-4 bg-white shadow">
      <div className="h-64 overflow-y-auto mb-4 border-b pb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 text-${msg.role === 'user' ? 'right' : 'left'}`}> 
            <span className={`font-semibold ${msg.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>{msg.role === 'user' ? 'You' : 'AI'}:</span> {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400">AI is typing...</div>}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
