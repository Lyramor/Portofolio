
'use client';
// src/app/lyramor/experience/new/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';

export default function NewExperience() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    period: '',
    position: '',
    company: '',
    description: '',
    technologies: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    // Fetch available skills
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/admin/skills');
        if (res.ok) {
          const data = await res.json();
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skillLabel) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillLabel)) {
        return prev.filter(skill => skill !== skillLabel);
      } else {
        return [...prev, skillLabel];
      }
    });
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() !== '' && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Combine selectedSkills into technologies string
      const technologiesString = selectedSkills.join(', ');
      
      const res = await fetch('/api/admin/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          technologies: technologiesString
        }),
      });

      if (res.ok) {
        router.push('/lyramor/experience');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal membuat pengalaman');
      }
    } catch (error) {
      console.error('Error creating experience:', error);
      alert('Terjadi kesalahan saat membuat pengalaman');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tambah Pengalaman Baru</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
        >
          <FiX size={18} />
          Batal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="period">
              Periode
            </label>
            <input
              id="period"
              name="period"
              type="text"
              placeholder="contoh: Jan 2020 - Sekarang"
              value={formData.period}
              onChange={handleChange}
              required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="position">
              Posisi
            </label>
            <input
              id="position"
              name="position"
              type="text"
              placeholder="contoh: Frontend Developer"
              value={formData.position}
              onChange={handleChange}
              required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="company">
            Perusahaan
          </label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="contoh: Acme Inc."
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="description">
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Jelaskan tanggung jawab dan pencapaian Anda"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Teknologi yang Digunakan
          </label>
          
          <div className="mb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => handleSkillToggle(skill.label)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    selectedSkills.includes(skill.label)
                      ? 'bg-sky-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {skill.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Tambahkan teknologi baru"
              className="flex-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              className="px-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
            >
              Tambah
            </button>
          </div>
          
          {selectedSkills.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-zinc-400 mb-2">Teknologi yang dipilih:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <span key={skill} className="inline-flex items-center px-3 py-1 rounded-lg bg-sky-600/20 text-sky-400 text-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className="ml-2 text-sky-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`flex items-center gap-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiSave size={18} />
            {submitting ? 'Menyimpan...' : 'Simpan Pengalaman'}
          </button>
        </div>
      </form>
    </div>
  );
}