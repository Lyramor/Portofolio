'use client';
// src/app/lyramor/about/page.js
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiSave, FiLoader, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

export default function AboutPage() {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/about');
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.content) {
        setContent(data.content);
        setOriginalContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
      setError('Failed to load about content. Please try again.');
      toast.error('Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if content has changed from original
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      setOriginalContent(content);
      toast.success('About content updated successfully');
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error('Failed to save about content');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchAboutContent();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">About Section</h1>
          <p className="text-zinc-400 mt-1">Edit the content that appears in your portfolio&apos;s about section</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            title="Refresh content"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !hasChanges}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${hasChanges
                ? 'bg-sky-600 hover:bg-sky-700 text-white'
                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              }
            `}
          >
            {saving ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiSave />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg p-4 flex items-center gap-3">
          <FiAlertCircle className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-8 flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <FiLoader size={30} className="animate-spin text-sky-400" />
            <p className="text-zinc-400">Loading about content...</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6">
          <div className="mb-5">
            <label htmlFor="about-content" className="block text-zinc-300 mb-2 font-medium">
              About Content
            </label>
            <p className="text-zinc-400 text-sm mb-4">
              This text appears in the About section of your portfolio. Write in first person to introduce yourself to visitors.
            </p>
            <textarea
              id="about-content"
              value={content}
              onChange={handleContentChange}
              rows={10}
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              placeholder="Write about yourself, your experience, education, and what you're passionate about..."
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 text-zinc-200">Preview</h3>
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700/50">
              <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300">{content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}