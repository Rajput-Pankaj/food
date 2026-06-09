import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { CardSkeleton } from '../../components/Skeleton';

export default function AdminContacts() {
  useDocumentTitle('Contact Inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.contacts().then(setMessages).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await adminApi.markContactRead(id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <p className="text-gray-500 text-center py-12">No contact messages yet.</p>
      )}
      {messages.map((msg) => (
        <article
          key={msg.id}
          className={`bg-white rounded-xl border p-4 ${msg.read ? 'opacity-75' : 'border-green-200'}`}
        >
          <div className="flex justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{msg.name}</h3>
            <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600">{msg.email} · {msg.phone}</p>
          {msg.subject && <p className="text-sm font-medium mt-2">{msg.subject}</p>}
          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{msg.message}</p>
          {!msg.read && (
            <button type="button" onClick={() => markRead(msg.id)} className="mt-3 text-sm text-green-600 font-semibold">
              Mark as read
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
