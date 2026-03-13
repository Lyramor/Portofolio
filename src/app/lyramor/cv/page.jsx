'use client';

import { useState, useEffect, useRef } from 'react';
import { FiLink, FiSave, FiTrash2, FiLoader, FiAlertCircle, FiUpload, FiFileText, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function CvPage() {
  const [cvLink, setCvLink]                   = useState('');
  const [originalCvLink, setOriginalCvLink]   = useState('');
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tab, setTab]                         = useState('url');
  const [pdfFile, setPdfFile]                 = useState(null);
  const fileRef                               = useRef(null);

  useEffect(() => { fetchCvLink(); }, []);

  const fetchCvLink = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch('/api/admin/cv');
      const data = await res.json();
      const val  = data.link_cv || '';
      setCvLink(val); setOriginalCvLink(val);
      if (val.startsWith('/uploads/cv/')) setTab('pdf');
    } catch { setError('Failed to load CV data.'); toast.error('Failed to load CV data'); }
    finally { setLoading(false); }
  };

  const handleSaveUrl = async () => {
    setSaving(true); setError(null);
    try {
      const res  = await fetch('/api/admin/cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ link_cv: cvLink }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setOriginalCvLink(cvLink);
      toast.success('CV link saved!');
    } catch (err) { setError(err.message); toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return;
    setSaving(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('cv_file', pdfFile);
      const res  = await fetch('/api/admin/cv', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setCvLink(data.link_cv); setOriginalCvLink(data.link_cv);
      setPdfFile(null); if (fileRef.current) fileRef.current.value = '';
      toast.success('CV PDF uploaded!');
    } catch (err) { setError(err.message); toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true); setError(null); setShowDeleteConfirm(false);
    try {
      const res = await fetch('/api/admin/cv', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCvLink(''); setOriginalCvLink(''); setPdfFile(null);
      toast.success('CV deleted!');
    } catch (err) { setError(err.message); toast.error(err.message); }
    finally { setSaving(false); }
  };

  const isPdf      = originalCvLink.startsWith('/uploads/cv/');
  const hasChanges = tab === 'url' ? cvLink !== originalCvLink : !!pdfFile;

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center">
        <FiFileText className="text-sky-400 mr-3" size={24} />
        <h1 className="text-2xl font-bold">CV Management</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" size={18} />{error}
        </div>
      )}

      {/* Current CV indicator */}
      {originalCvLink && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400 shrink-0">
              {isPdf ? <FiFileText size={20} /> : <FiLink size={20} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">{isPdf ? 'Uploaded PDF' : 'External URL'} — Active</p>
              <p className="text-sky-400 text-sm truncate">{isPdf ? originalCvLink.split('/').pop() : originalCvLink}</p>
            </div>
          </div>
          <a href={originalCvLink} target="_blank" rel="noopener noreferrer" download={isPdf || undefined}
            className="shrink-0 p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors" title={isPdf ? 'Download PDF' : 'Open link'}>
            <FiExternalLink size={16} />
          </a>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="flex border-b border-zinc-700">
          {[{ id: 'url', icon: FiLink, label: 'Enter URL' }, { id: 'pdf', icon: FiUpload, label: 'Upload PDF' }].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === id ? 'bg-sky-600/20 text-sky-400 border-b-2 border-sky-500' : 'text-zinc-400 hover:text-zinc-200'
              }`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'url' ? (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm">Paste an external link (Google Drive, Dropbox, etc.)</p>
              <input type="url" value={cvLink} onChange={(e) => setCvLink(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="https://drive.google.com/your-cv.pdf" />
              <div className="flex justify-end">
                <button onClick={handleSaveUrl} disabled={saving || !hasChanges || !cvLink.trim()}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                  Save Link
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm">Upload a PDF — visitors will get a direct download. Max 10MB.</p>
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />

              {pdfFile ? (
                <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <FiFileText className="text-sky-400 shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{pdfFile.name}</p>
                    <p className="text-xs text-zinc-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={() => { setPdfFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="text-zinc-500 hover:text-red-400 transition-colors"><FiTrash2 size={16} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 hover:border-sky-500 rounded-lg transition-colors">
                  <FiUpload size={20} className="text-zinc-500 mb-2" />
                  <span className="text-zinc-400 text-sm">Click to select PDF file</span>
                </button>
              )}

              <div className="flex justify-end">
                <button onClick={handleUploadPdf} disabled={saving || !pdfFile}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? <FiLoader className="animate-spin" size={16} /> : <FiUpload size={16} />}
                  Upload PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {originalCvLink && (
        <div className="flex justify-end">
          <button onClick={() => setShowDeleteConfirm(true)} disabled={saving}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            <FiTrash2 size={16} />Delete CV
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-zinc-300 mb-6">Are you sure you want to delete the CV? This cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <FiTrash2 size={16} />Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
