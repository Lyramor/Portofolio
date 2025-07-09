// src/app/lyramor/skills/new/edit/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Add this
import { 
  FiCode, 
  FiSave, 
  FiX, 
  FiLoader,
  FiAlertCircle,
  FiUpload,
  FiTrash2
} from 'react-icons/fi';

export default function NewSkillPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    imgSrc: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadOption, setUploadOption] = useState('url');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      setError('Please select an image file (JPG, PNG, SVG, etc.).');
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

  const handleUploadOptionChange = (option) => {
    setUploadOption(option);
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imgSrc: '' }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!formData.label.trim()) {
      setError('Skill name is required.');
      setSaving(false);
      return;
    }

    try {
      let finalImgSrc = formData.imgSrc;

      if (uploadOption === 'upload' && imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Failed to upload image.');
        }

        const imageData = await uploadRes.json();
        finalImgSrc = imageData.imageUrl;
      } else if (uploadOption === 'upload' && !imageFile) {
        finalImgSrc = null;
      }

      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: formData.label,
          description: formData.description,
          imgSrc: finalImgSrc,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create new skill.');
      }

      router.push('/lyramor/skills');
      router.refresh();
    } catch (err) {
      console.error('Error creating skill:', err);
      setError(err.message || 'Failed to create skill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <FiCode className="text-sky-400 mr-3" size={24} />
        <h1 className="text-2xl font-bold">Add New Skill</h1>
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
            <label htmlFor="label" className="block text-sm font-medium text-zinc-300 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="e.g., React, JavaScript, UI Design"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => handleUploadOptionChange('url')}
                className={`flex-1 py-2 ${uploadOption === 'url' 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300'} rounded-l-lg transition-colors`}
              >
                Image URL
              </button>
              <button
                type="button"
                onClick={() => handleUploadOptionChange('upload')}
                className={`flex-1 py-2 ${uploadOption === 'upload' 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300'} rounded-r-lg transition-colors`}
              >
                Upload Image
              </button>
            </div>

            {uploadOption === 'url' ? (
              <>
                <label htmlFor="imgSrc" className="block text-sm font-medium text-zinc-300 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  id="imgSrc"
                  name="imgSrc"
                  value={formData.imgSrc}
                  onChange={handleChange}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="https://example.com/icon.svg"
                />
                <p className="text-zinc-500 text-sm mt-2">
                  Enter the URL of the skill icon or logo (SVG recommended).
                </p>
                {formData.imgSrc && (
                  <div className="mt-4 p-2 bg-zinc-900 rounded-md border border-zinc-700 flex justify-center items-center relative"> {/* Add relative here */}
                    <Image // Change <img>
                      src={formData.imgSrc} 
                      alt="Image URL Preview" 
                      fill // Use fill
                      style={{ objectFit: 'contain' }} // Set objectFit
                      onError={(e) => { 
                        // next/image does not use onError like an <img> tag,
                        // you need to handle fallback in the wrapper component
                        // or provide a fallback image directly in src
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-zinc-300 mb-2">
                  Upload Image
                </label>
                <div className="mt-1 flex items-center">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-zinc-900 text-zinc-500 rounded-lg tracking-wide border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition-colors relative"> {/* Add relative here */}
                    {imagePreview ? (
                      <div className="w-full flex flex-col items-center">
                        <Image // Change <img>
                          src={imagePreview} 
                          alt="Upload Preview" 
                          fill // Use fill
                          style={{ objectFit: 'contain' }} // Set objectFit
                        />
                        <span className="mt-2 text-base">Click to change image</span>
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
                  Max file size: 2MB. Recommended formats: SVG, PNG, JPEG.
                </p>
              </>
            )}
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
              placeholder="Brief description of your experience with this skill"
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Link
              href="/lyramor/skills"
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
              <span>Save Skill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}