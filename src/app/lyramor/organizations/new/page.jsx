'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';
import TrixEditor from '@/components/admin/TrixEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'react-hot-toast';

export default function NewOrganization() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: '', organization: '', period: '', description: '', image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.organization.trim()) {
      setError('Role and Organization are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Organization added successfully!');
        router.push('/lyramor/organizations');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create organization.');
      }
    } catch {
      setError('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Organization</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="role">Role *</label>
            <input id="role" name="role" type="text" placeholder="e.g., Head of Division"
              value={formData.role} onChange={handleChange} required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="organization">Organization *</label>
            <input id="organization" name="organization" type="text" placeholder="e.g., BEM Universitas X"
              value={formData.organization} onChange={handleChange} required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="period">Period</label>
          <input id="period" name="period" type="text" placeholder="e.g., 2022 - 2023"
            value={formData.period} onChange={handleChange}
            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Photo (optional)</label>
          <ImageUploader value={formData.image_url} onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))} onUploading={setImageUploading} enableCrop />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <TrixEditor inputId="org-new-description" value={formData.description}
            onChange={(html) => setFormData(prev => ({ ...prev, description: html }))} />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={submitting || imageUploading}
            className={`flex items-center gap-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors ${(submitting || imageUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <FiSave size={18} />{imageUploading ? 'Uploading image...' : submitting ? 'Saving...' : 'Save Organization'}
          </button>
        </div>
      </form>
    </div>
  );
}
