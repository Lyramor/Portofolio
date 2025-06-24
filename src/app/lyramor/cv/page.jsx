'use client';

import { useState, useEffect } from 'react';
import { FiLink, FiSave, FiTrash2, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast installed

export default function CvPage() {
  const [cvLink, setCvLink] = useState('');
  const [originalCvLink, setOriginalCvLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCvLink();
  }, []);

  const fetchCvLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/cv');
      if (!res.ok) {
        throw new Error('Failed to fetch CV link');
      }
      const data = await res.json();
      setCvLink(data.link_cv || '');
      setOriginalCvLink(data.link_cv || '');
    } catch (err) {
      console.error('Error fetching CV link:', err);
      setError('Failed to load CV link. Please try again.');
      toast.error('Failed to load CV link');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const method = originalCvLink ? 'POST' : 'POST'; // Always POST to simplify, API handles insert/update
      const res = await fetch('/api/admin/cv', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link_cv: cvLink }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save CV link');
      }
      setOriginalCvLink(cvLink); // Update original link after successful save
      toast.success('CV link saved successfully!');
    } catch (err) {
      console.error('Error saving CV link:', err);
      setError(err.message || 'Failed to save CV link.');
      toast.error('Failed to save CV link');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true); // Use saving state for delete operation as well
    setError(null);
    setShowDeleteConfirm(false); // Close modal
    try {
      const res = await fetch('/api/admin/cv', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete CV link');
      }
      setCvLink('');
      setOriginalCvLink('');
      toast.success('CV link deleted successfully!');
    } catch (err) {
      console.error('Error deleting CV link:', err);
      setError(err.message || 'Failed to delete CV link.');
      toast.error('Failed to delete CV link');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = cvLink !== originalCvLink;

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center">
        <FiLink className="text-sky-400 mr-3" size={24} />
        <h1 className="text-2xl font-bold">CV Link Management</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={18} />
          {error}
        </div>
      )}

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-6">
        <div className="mb-6">
          <p className="text-zinc-400 mb-2">
            Set the downloadable link for your CV/Resume that will appear on your portfolio. Only one CV link can be active at a time.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="cvLink" className="block text-sm font-medium text-zinc-300 mb-2">
            CV Download Link (URL)
          </label>
          <input
            type="url"
            id="cvLink"
            value={cvLink}
            onChange={(e) => setCvLink(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="e.g., https://drive.google.com/your-cv.pdf"
          />
          {cvLink && (
            <p className="text-zinc-500 text-sm mt-2">
              Current Link: <a href={cvLink} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">{cvLink}</a>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {cvLink && ( // Only show delete button if there's a link
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiTrash2 size={18} />
              <span>Delete CV Link</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <FiLoader className="animate-spin" size={18} />
            ) : (
              <FiSave size={18} />
            )}
            <span>Save CV Link</span>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full m-4 animate-scaleIn">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete the CV link? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={saving}
                className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <FiLoader className="animate-spin" size={16} />
                ) : (
                  <FiTrash2 size={16} />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add global styles for animations (if not already in globals.css) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}