'use client';
import { useRef, useState } from 'react';
import { FiUpload, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CropModal from './CropModal';

const MAX_MB = 1.5;

// Compress a Blob/File to under MAX_MB using canvas
async function compressIfNeeded(blob) {
  const maxBytes = MAX_MB * 1024 * 1024;
  if (blob.size <= maxBytes) return blob;

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    const url = URL.createObjectURL(blob);
    i.onload  = () => { URL.revokeObjectURL(url); resolve(i); };
    i.onerror = reject;
    i.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width  = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);

  for (let q = 0.8; q >= 0.15; q -= 0.1) {
    const out = await new Promise(r => canvas.toBlob(r, 'image/jpeg', q));
    if (out.size <= maxBytes) return out;
  }
  return new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.15));
}

export default function ImageUploader({ value, onChange, onUploading, enableCrop = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading]       = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const [cropSrc, setCropSrc]           = useState(null);

  const setUploadState = (v) => { setUploading(v); onUploading?.(v); };

  const doUpload = async (blob, filename = 'image.jpg') => {
    setUploadState(true);
    try {
      const toUpload = await compressIfNeeded(blob);
      const origMB   = (blob.size / 1024 / 1024).toFixed(1);
      const outMB    = (toUpload.size / 1024 / 1024).toFixed(1);
      if (toUpload !== blob) toast(`Compressed ${origMB}MB → ${outMB}MB`, { icon: '📦' });

      const fd = new FormData();
      fd.append('image', toUpload, filename);
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.imageUrl) {
        onChange(data.imageUrl);
        setLocalPreview(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (enableCrop) {
      // Read as dataURL first, then open crop modal
      const reader = new FileReader();
      reader.onload = (ev) => setCropSrc(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      // Show instant preview then upload
      const reader = new FileReader();
      reader.onload = (ev) => setLocalPreview(ev.target.result);
      reader.readAsDataURL(file);
      doUpload(file, file.name);
    }
  };

  const handleCropConfirm = (blob) => {
    setCropSrc(null);
    // Show a local preview immediately using a blob URL while uploading
    const previewUrl = URL.createObjectURL(blob);
    setLocalPreview(previewUrl);
    doUpload(blob, 'cropped.jpg').finally(() => URL.revokeObjectURL(previewUrl));
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = () => { onChange(''); setLocalPreview(null); };

  const displaySrc = localPreview || value;

  return (
    <>
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

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-white text-sm font-medium">Uploading…</span>
            </div>
          )}

          {!uploading && (
            <>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
              >
                <FiTrash2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1 text-xs bg-zinc-700/80 hover:bg-zinc-600 rounded-lg transition-colors text-zinc-200"
              >
                Change
              </button>
            </>
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
          {enableCrop && (
            <span className="text-zinc-600 text-xs mt-1">Crop tool opens after selecting</span>
          )}
        </button>
      )}

      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
