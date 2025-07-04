// src/app/lyramor/skills/new/edit/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Tambahkan ini
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
      setError('Harap pilih file gambar (JPG, PNG, SVG, dll.).');
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar harus kurang dari 2MB.');
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
      setError('Nama skill wajib diisi.');
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
          throw new Error(errorData.error || 'Gagal mengunggah gambar.');
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
        throw new Error(errorData.error || 'Gagal membuat skill baru.');
      }

      router.push('/lyramor/skills');
      router.refresh();
    } catch (err) {
      console.error('Error creating skill:', err);
      setError(err.message || 'Gagal membuat skill. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <FiCode className="text-sky-400 mr-3" size={24} />
        <h1 className="text-2xl font-bold">Tambah Skill Baru</h1>
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
              Nama Skill *
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Contoh: React, JavaScript, UI Design"
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
                URL Gambar
              </button>
              <button
                type="button"
                onClick={() => handleUploadOptionChange('upload')}
                className={`flex-1 py-2 ${uploadOption === 'upload' 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300'} rounded-r-lg transition-colors`}
              >
                Unggah Gambar
              </button>
            </div>

            {uploadOption === 'url' ? (
              <>
                <label htmlFor="imgSrc" className="block text-sm font-medium text-zinc-300 mb-2">
                  URL Gambar
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
                  Masukkan URL ikon atau logo skill (direkomendasikan SVG).
                </p>
                {formData.imgSrc && (
                  <div className="mt-4 p-2 bg-zinc-900 rounded-md border border-zinc-700 flex justify-center items-center relative"> {/* Tambahkan relative di sini */}
                    <Image // Ganti <img>
                      src={formData.imgSrc} 
                      alt="Pratinjau URL Gambar" 
                      fill // Gunakan fill
                      style={{ objectFit: 'contain' }} // Atur objectFit
                      onError={(e) => { 
                        // next/image tidak menggunakan onError seperti tag <img>,
                        // Anda perlu menangani fallback di komponen pembungkus
                        // atau menyediakan gambar fallback secara langsung di src
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-zinc-300 mb-2">
                  Unggah Gambar
                </label>
                <div className="mt-1 flex items-center">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-zinc-900 text-zinc-500 rounded-lg tracking-wide border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition-colors relative"> {/* Tambahkan relative di sini */}
                    {imagePreview ? (
                      <div className="w-full flex flex-col items-center">
                        <Image // Ganti <img>
                          src={imagePreview} 
                          alt="Pratinjau Unggahan" 
                          fill // Gunakan fill
                          style={{ objectFit: 'contain' }} // Atur objectFit
                        />
                        <span className="mt-2 text-base">Klik untuk mengubah gambar</span>
                      </div>
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8" />
                        <span className="mt-2 text-base">Pilih gambar</span>
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
                        title="Hapus Gambar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </label>
                </div>
                <p className="text-zinc-500 text-sm mt-2">
                  Ukuran file maksimal: 2MB. Format yang direkomendasikan: SVG, PNG, JPEG.
                </p>
              </>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Deskripsi singkat tentang skill ini"
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Link
              href="/lyramor/skills"
              className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <FiX size={18} />
              <span>Batal</span>
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
              <span>Simpan Skill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}