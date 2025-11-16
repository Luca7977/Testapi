import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const sendMsg = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'z-ai/glm-4.5-air:free',
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      const botText = data?.choices?.[0]?.message?.content || 'No response';

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: botText }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: 'Error: ' + (err as any).message
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto border p-4 rounded">
      <div className="h-64 overflow-auto mb-3">
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={
                m.role === 'user'
                  ? 'bg-blue-200 inline-block p-2 m-1 rounded'
                  : 'bg-gray-200 inline-block p-2 m-1 rounded'
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={sendMsg}
          disabled={loading}
          className="border px-4 rounded"
        >
          {loading ? '...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
