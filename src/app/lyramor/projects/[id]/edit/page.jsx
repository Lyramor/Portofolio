'use client';
// src/app/lyramor/projects/[id]/edit/page.jsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiBriefcase, 
  FiSave, 
  FiX, 
  FiLoader,
  FiAlertCircle,
  FiUpload,
  FiTag,
  FiLink, // Untuk ikon link
  FiTrash2 // Untuk tombol hapus gambar
} from 'react-icons/fi';
import SkillsSelector from '@/components/admin/SkillsSelector';
import { toast } from 'react-hot-toast'; // Untuk notifikasi

export default function EditProjectPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '', // Tambahkan state untuk link
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null); // Gambar yang sudah ada di database
  const [imagePreview, setImagePreview] = useState(null); // Pratinjau untuk gambar baru/lama
  const [archived, setArchived] = useState(false); // New state for archived status
  const [order, setOrder] = useState(0); // New state for project order
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/projects/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch project data');
        }
        
        const project = await res.json();
        
        setFormData({
          title: project.title || '',
          description: project.description || '',
          link: project.link || '', // Muat link dari database
        });
        setArchived(project.archived === 1); // Muat status archived
        setOrder(project.order || 0); // Muat order

        if (project.skills) {
          setSelectedSkills(project.skills.map(skill => skill.id));
        }
        
        // Atur currentImage dan imagePreview
        if (project.image) {
          setCurrentImage(project.image);
          setImagePreview(project.image); // Tampilkan gambar yang sudah ada sebagai pratinjau awal
        } else {
            setCurrentImage(null);
            setImagePreview(null);
        }

      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message);
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

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
      // Jika tidak ada file yang dipilih (misal: dialog file dibatalkan),
      // kita mungkin ingin mengembalikan pratinjau ke gambar yang sudah ada.
      setImageFile(null);
      setImagePreview(currentImage); // Kembali ke currentImage jika ada
      setError(null);
      return;
    }

    setError(null);

    if (!file.type.includes('image/')) {
      setError('Please select an image file.');
      setImageFile(null);
      setImagePreview(currentImage); // Kembali ke currentImage
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB.');
      setImageFile(null);
      setImagePreview(currentImage); // Kembali ke currentImage
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result); // Set pratinjau ke gambar baru
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null); // Clear file yang akan diunggah
    setCurrentImage(null); // Clear gambar yang saat ini ada
    setImagePreview(null); // Clear pratinjau
    setError(null); // Clear any related error messages
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
      formDataToSubmit.append('order', order); // Kirim data order
      formDataToSubmit.append('archived', archived ? 'true' : 'false'); // Kirim data archived sebagai string

      formDataToSubmit.append('skills', JSON.stringify(selectedSkills));
      
      // Logika untuk mengirim gambar
      if (imageFile) {
        formDataToSubmit.append('image', imageFile);
      } else if (currentImage && !imagePreview) {
        // Jika tidak ada file baru dipilih DAN gambar lama sudah dihapus dari preview
        // Ini menandakan pengguna ingin menghapus gambar yang ada
        formDataToSubmit.append('image_cleared', 'true'); // Sinyal untuk menghapus gambar
      } else if (!currentImage && !imagePreview && !imageFile) {
        // Jika tidak ada gambar sama sekali (baru atau lama), pastikan backend mengosongkan path
        formDataToSubmit.append('image_cleared', 'true');
      }


      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PUT',
        body: formDataToSubmit,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update project.');
      }

      toast.success('Project updated successfully!');
      router.push('/lyramor/projects');
      router.refresh();
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project. Please try again.');
      toast.error('Failed to update project');
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
        <FiBriefcase className="text-sky-400 mr-3" size={24} />
        <h1 className="text-2xl font-bold">
          Edit Project 
          {archived && (
            <span className="ml-3 px-3 py-1 text-sm font-medium rounded-full bg-zinc-700 text-zinc-400">
              (Archived)
            </span>
          )}
        </h1>
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
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Brief description of your project"
            />
          </div>

          {/* Project Link field */}
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
                {(imagePreview || currentImage) && ( // Tampilkan tombol clear jika ada gambar (baru atau lama)
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
              Max file size: 2MB. Recommended formats: PNG, JPEG.
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

          {/* New: Project Order */}
          <div className="mb-6">
            <label htmlFor="order" className="block text-sm font-medium text-zinc-300 mb-2">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="e.g., 0, 1, 2 (lower number appears first)"
            />
            <p className="text-zinc-500 text-sm mt-2">
              Controls the order of projects on the public portfolio.
            </p>
          </div>

          {/* New: Archived Toggle */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="archived"
              name="archived"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-500 text-sky-600 focus:ring-sky-500 focus:ring-offset-zinc-800"
            />
            <label htmlFor="archived" className="ml-2 text-sm font-medium text-zinc-300">
              Archive Project (Tidak terlihat di halaman utama)
            </label>
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
