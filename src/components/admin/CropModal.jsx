'use client';
import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { FiX, FiCheck, FiUsers, FiMic } from 'react-icons/fi';

// Canvas helper — returns a Blob of the cropped image
async function getCroppedBlob(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  );

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}

const ASPECTS = [
  { label: '16:9', value: 16 / 9 },
  { label: '1:1',  value: 1 },
  { label: '9:16', value: 9 / 16 },
  { label: 'Free', value: null },
];

export default function CropModal({ imageSrc, onConfirm, onCancel }) {
  const [crop, setCrop]           = useState({ x: 0, y: 0 });
  const [zoom, setZoom]           = useState(1);
  const [aspect, setAspect]       = useState(16 / 9);
  const [croppedArea, setCroppedArea] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(null);

  const onCropComplete = useCallback((_, pixelCrop) => {
    setCroppedArea(pixelCrop);
  }, []);

  // Generate preview every time croppedArea changes
  useEffect(() => {
    if (!croppedArea || !imageSrc) return;
    let cancelled = false;
    getCroppedBlob(imageSrc, croppedArea).then((blob) => {
      if (cancelled) return;
      const url = URL.createObjectURL(blob);
      setCroppedPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    });
    return () => { cancelled = true; };
  }, [croppedArea, imageSrc]);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    const blob = await getCroppedBlob(imageSrc, croppedArea);
    onConfirm(blob);
  };

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-zinc-100">Crop Image</h2>
          <button onClick={onCancel} className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

          {/* ── Left: Cropper ── */}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Aspect ratio selector */}
            <div className="flex gap-2 px-6 pt-4 pb-3 flex-shrink-0">
              {ASPECTS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => setAspect(a.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    aspect === a.value
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-sky-500'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Crop area */}
            <div className="relative flex-1 min-h-[280px] bg-zinc-950 mx-6 mb-4 rounded-xl overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect ?? undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { borderRadius: '0.75rem' },
                  cropAreaStyle: { border: '2px solid #38bdf8' },
                }}
              />
            </div>

            {/* Zoom slider */}
            <div className="px-6 pb-4 flex-shrink-0 flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-10">Zoom</span>
              <input
                type="range" min={1} max={3} step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-sky-500"
              />
              <span className="text-xs text-zinc-500 w-10 text-right">{zoom.toFixed(1)}x</span>
            </div>
          </div>

          {/* ── Right: Preview ── */}
          <div className="lg:w-72 flex flex-col border-t lg:border-t-0 lg:border-l border-zinc-700 flex-shrink-0">
            <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 flex-shrink-0">
              Preview — Activities Card
            </p>

            {/* Mock card */}
            <div className="mx-4 mb-4 bg-zinc-800 border border-zinc-700/50 rounded-xl overflow-hidden flex-1 flex flex-col">
              {/* Image preview — 16:9 container matches Activities */}
              <div className="relative w-full aspect-video overflow-hidden bg-zinc-900 flex-shrink-0">
                {croppedPreview ? (
                  <img
                    src={croppedPreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                    Crop to see preview
                  </div>
                )}
              </div>

              {/* Mock content */}
              <div className="p-4 flex-shrink-0">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                      Organization
                    </span>
                    <p className="text-sm font-bold text-zinc-200 mt-1">Your Role Here</p>
                    <p className="text-sky-400 text-xs">Organization Name</p>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                  Description will appear here…
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-700 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <FiCheck size={16} />
            Crop & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
