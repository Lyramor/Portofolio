'use client';
// src/app/lyramor/counters/experience/page.jsx
import { useState, useEffect } from 'react';
import { FiClock, FiSave, FiLoader } from 'react-icons/fi';

export default function ExperienceCounter() {
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const res = await fetch('/api/admin/counters/experience');
        const data = await res.json();
        
        if (data.number !== undefined) {
          setCounter(data.number);
        }
      } catch (error) {
        console.error('Error fetching experience counter:', error);
        setMessage({ type: 'error', text: 'Failed to load counter value' });
      } finally {
        setLoading(false);
      }
    };

    fetchCounter();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('/api/admin/counters/experience', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: counter }),
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Counter updated successfully!' });
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update counter');
      }
    } catch (error) {
      console.error('Error updating counter:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update counter' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <FiClock className="text-sky-400 mr-3" size={24} />
        <h1 className="text-2xl font-bold">Experience Counter</h1>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-6">
        <div className="mb-6">
          <p className="text-zinc-400 mb-2">
            This counter displays your years of experience on your portfolio homepage.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="counter" className="block text-sm font-medium text-zinc-300 mb-2">
            Years of Experience
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              id="counter"
              value={counter}
              onChange={(e) => setCounter(parseInt(e.target.value) || 0)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              min="0"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <FiLoader className="animate-spin" size={18} />
              ) : (
                <FiSave size={18} />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}