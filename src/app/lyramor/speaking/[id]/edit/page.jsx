'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';
import TrixEditor from '@/components/admin/TrixEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'react-hot-toast';

export default function EditSpeaking() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    event: '', organizer: '', role: '', description: '', image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/admin/speaking/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setFormData({
          event: data.speaking?.event || '',
          organizer: data.speaking?.organizer || '',
          role: data.speaking?.role || '',
          description: data.speaking?.description || '',
          image_url: data.speaking?.image_url || '',
        });
      } catch {
        setError('Failed to load speaking data.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.event.trim()) {
      setError('Event name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/speaking/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Speaking entry updated successfully!');
        router.push('/lyramor/speaking');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update speaking entry.');
      }
    } catch {
      setError('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-32 bg-zinc-800 rounded-xl animate-pulse" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Speaking Entry</h1>
        <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
          <FiX size={18} /> Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={18} />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="event">Event Name *</label>
          <input id="event" name="event" type="text" value={formData.event} onChange={handleChange} required
            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="organizer">Organizer</label>
            <input id="organizer" name="organizer" type="text" value={formData.organizer} onChange={handleChange}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="role">Role / Position</label>
            <input id="role" name="role" type="text" value={formData.role} onChange={handleChange}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Photo (optional)</label>
          <ImageUploader value={formData.image_url} onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))} onUploading={setImageUploading} enableCrop />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <TrixEditor inputId="speaking-edit-description" value={formData.description}
            onChange={(html) => setFormData(prev => ({ ...prev, description: html }))} />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={submitting || imageUploading}
            className={`flex items-center gap-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors ${(submitting || imageUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <FiSave size={18} />{imageUploading ? 'Uploading image...' : submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
