'use client';
// src/app/lyramor/projects/new/page.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiBriefcase,
  FiSave,
  FiX,
  FiLoader,
  FiAlertCircle,
  FiTag,
  FiLink
} from 'react-icons/fi';
import SkillsSelector from '@/components/admin/SkillsSelector';
import TrixEditor from '@/components/admin/TrixEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'react-hot-toast';

export default function NewProjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ title: '', description: '', link: '' });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Project title is required.');
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('link', formData.link);
      fd.append('skills', JSON.stringify(selectedSkills));
      fd.append('image_url', imageUrl);

      const res = await fetch('/api/admin/projects', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project.');
      }

      toast.success('Project created successfully!');
      router.push('/lyramor/projects');
      router.refresh();
    } catch (err) {
      setError(err.message);
      toast.error('Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <FiBriefcase className="text-sky-400 mr-3" size={24} />
        <h1 className="text-2xl font-bold">Add New Project</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={18} />{error}
        </div>
      )}

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">Project Title *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required
              placeholder="e.g., Portfolio Website, E-commerce App"
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
            <TrixEditor inputId="proj-new-description" value={formData.description}
              onChange={(html) => setFormData(prev => ({ ...prev, description: html }))} />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
              <FiLink className="mr-2" size={16} />Project Link
            </label>
            <input type="url" id="link" name="link" value={formData.link} onChange={handleChange}
              placeholder="e.g., https://yourproject.com"
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            <p className="text-zinc-500 text-sm mt-1">Optional: URL to the live project or repository.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Project Image</label>
            <ImageUploader value={imageUrl} onChange={setImageUrl} />
            <p className="text-zinc-500 text-sm mt-1">Max 2MB. PNG, JPEG, SVG, GIF, WebP.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
              <FiTag className="mr-2" size={16} />Skills Used
            </label>
            <SkillsSelector selectedSkills={selectedSkills} onChange={setSelectedSkills} />
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/lyramor/projects"
              className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <FiX size={18} /><span>Cancel</span>
            </Link>
            <button type="submit" disabled={saving}
              className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
              {saving ? <FiLoader className="animate-spin" size={18} /> : <FiSave size={18} />}
              <span>Save Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
