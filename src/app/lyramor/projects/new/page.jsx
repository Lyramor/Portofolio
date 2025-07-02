'use client';
// src/app/lyramor/projects/new/page.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiBriefcase, 
  FiSave, 
  FiX, 
  FiLoader,
  FiAlertCircle,
  FiUpload,
  FiImage,
  FiTag,
  FiTrash2, // Untuk tombol hapus gambar
  FiLink // Untuk ikon link
} from 'react-icons/fi';
import SkillsSelector from '@/components/admin/SkillsSelector';
import { toast } from 'react-hot-toast'; // Untuk notifikasi

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '', // Tambahkan state untuk link
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (skills) => {
    setSelectedSkills(skills);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      if (!imageFile) { 
        setImageFile(null);
        setImagePreview(null);
      }
      return;
    }

    setError(null); 

    if (!file.type.includes('image/')) {
      setError('Please select an image file (PNG, JPEG, GIF, SVG, etc.).');
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB.');
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setError(null); 
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!formData.title.trim()) {
      setError('Project title is required.');
      setSaving(false);
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('link', formData.link); // Kirim data link
      
      formDataToSubmit.append('skills', JSON.stringify(selectedSkills));
      
      if (imageFile) {
        formDataToSubmit.append('image', imageFile);
      }

      const res = await fetch('/api/admin/projects', { 
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create project.');
      }

      toast.success('Project created successfully!');
      // Alihkan ke halaman projects setelah berhasil membuat proyek
      router.push('/lyramor/projects'); 
      router.refresh(); 
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project. Please try again.');
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
          <FiAlertCircle className="mr-2" size={18} />
          {error}
        </div>
      )}

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="e.g., Portfolio Website, E-commerce App"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Brief description of your project"
            />
          </div>

          {/* New field for Project Link */}
          <div className="mb-6">
            <label htmlFor="link" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
              <FiLink className="mr-2" size={16} />
              Project Link
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="e.g., https://yourproject.com"
            />
            <p className="text-zinc-500 text-sm mt-2">Optional: URL to the live project or repository.</p>
          </div>

          <div className="mb-6">
            <label htmlFor="imageUpload" className="block text-sm font-medium text-zinc-300 mb-2">
              Project Image
            </label>
            <div className="mt-1 flex flex-col items-center">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-zinc-900 text-zinc-500 rounded-lg tracking-wide border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition-colors relative">
                {imagePreview ? (
                  <div className="w-full flex flex-col items-center">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-32 object-contain" 
                    />
                    <span className="mt-4 text-sm">Click to change image</span>
                  </div>
                ) : (
                  <>
                    <FiUpload className="w-8 h-8" />
                    <span className="mt-2 text-base">Select an image</span>
                  </>
                )}
                <input 
                  id="imageUpload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {imagePreview && (
                    <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 p-2 bg-red-600/70 text-white rounded-full hover:bg-red-700/70 transition-colors"
                        title="Clear Image"
                    >
                        <FiTrash2 size={16} />
                    </button>
                )}
              </label>
            </div>
            <p className="text-zinc-500 text-sm mt-2">
              Max file size: 2MB. Recommended formats: PNG, JPEG, SVG, GIF.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
              <FiTag className="mr-2" size={16} />
              Skills Used
            </label>
            <SkillsSelector 
              selectedSkills={selectedSkills} 
              onChange={handleSkillsChange} 
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Link
              href="/lyramor/projects"
              className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <FiX size={18} />
              <span>Cancel</span>
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="animate-spin" size={18} />
              ) : (
                <FiSave size={18} />
              )}
              <span>Save Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
