'use client';
import { useRef, useState } from 'react';
import { FiUpload, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function ImageUploader({ value, onChange, onUploading }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const setUploadState = (state) => {
    setUploading(state);
    onUploading?.(state);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately so user sees the image right away
    const reader = new FileReader();
    reader.onload = (ev) => setLocalPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploadState(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.imageUrl) {
        onChange(data.imageUrl);
        setLocalPreview(null); // swap to server URL via value prop
        toast.success('Image uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
        setLocalPreview(null);
      }
    } catch {
      toast.error('Upload error');
      setLocalPreview(null);
    } finally {
      setUploadState(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setLocalPreview(null);
  };

  // Show local data-URL while uploading, then server URL after done
  const displaySrc = localPreview || value;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {displaySrc ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-700">
          <img src={displaySrc} alt="preview" className="w-full h-full object-cover" />

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-white text-sm font-medium">Uploading…</span>
            </div>
          )}

          {/* Remove button — only when not uploading */}
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
            >
              <FiTrash2 size={14} />
            </button>
          )}

          {/* Change button — only when not uploading */}
          {!uploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 px-3 py-1 text-xs bg-zinc-700/80 hover:bg-zinc-600 rounded-lg transition-colors text-zinc-200"
            >
              Change
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 hover:border-sky-500 rounded-lg transition-colors disabled:opacity-50"
        >
          <FiUpload size={20} className="text-zinc-500 mb-2" />
          <span className="text-zinc-400 text-sm">Click to upload image</span>
        </button>
      )}
    </div>
  );
}
