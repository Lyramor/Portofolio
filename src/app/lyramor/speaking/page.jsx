'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function SpeakingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/speaking');
      const data = await res.json();
      setItems(data.speaking || []);
    } catch (err) {
      setError('Failed to load speaking entries.');
      toast.error('Failed to load speaking entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this speaking entry?')) return;
    try {
      const res = await fetch(`/api/admin/speaking/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter(i => i.id !== id));
        toast.success('Deleted successfully');
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Speaking Invitations</h1>
        <Link
          href="/lyramor/speaking/new"
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
        >
          <FiPlus size={18} />
          Add Speaking
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-zinc-800 border border-zinc-700/50 rounded-lg p-4 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-zinc-50">{item.event}</h3>
                <p className="text-zinc-400 text-sm">
                  {item.organizer && item.organizer}
                  {item.role && ` • ${item.role}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/lyramor/speaking/${item.id}/edit`}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-700/50 hover:bg-zinc-700 rounded transition-colors"
                >
                  <FiEdit2 size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-700/50 hover:bg-zinc-700 rounded transition-colors"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-400 mb-4">No speaking entries yet</p>
          <Link
            href="/lyramor/speaking/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            <FiPlus size={18} />
            Add First Speaking Entry
          </Link>
        </div>
      )}
    </div>
  );
}
