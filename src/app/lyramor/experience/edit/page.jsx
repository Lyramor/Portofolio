'use client'; // <-- **PERBAIKAN**: Tambahkan baris ini di paling atas

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSave, FiX, FiTrash2, FiLoader, FiAlertCircle, FiTag } from 'react-icons/fi';
import SkillsSelector from '@/components/admin/SkillsSelector';

export default function EditExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [formData, setFormData] = useState({
    period: '',
    position: '',
    company: '',
    description: '',
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      router.push('/lyramor/experience');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const expRes = await fetch(`/api/admin/experience/detail?id=${id}`);
        if (!expRes.ok) {
          throw new Error('Experience not found');
        }
        const expData = await expRes.json();
        setFormData({
          period: expData.period || '',
          position: expData.position || '',
          company: expData.company || '',
          description: expData.description || '',
        });

        if (expData.skill_ids && Array.isArray(expData.skill_ids)) {
          setSelectedSkills(expData.skill_ids);
        } else {
            setSelectedSkills([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load experience data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skills) => {
    setSelectedSkills(skills);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.period.trim() || !formData.position.trim() || !formData.company.trim()) {
      setError('Period, Position, and Company are required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/experience/detail', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          ...formData,
          skillIds: selectedSkills
        }),
      });

      if (res.ok) {
        router.push('/lyramor/experience');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update experience.');
      }
    } catch (err) {
      console.error('Error updating experience:', err);
      setError('An error occurred while updating experience.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/admin/experience/delete?id=${id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          router.push('/lyramor/experience');
          router.refresh();
        } else {
          setError('Failed to delete experience.');
        }
      } catch (err) {
        console.error('Error deleting experience:', err);
        setError('An error occurred while deleting experience.');
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-zinc-800 rounded-lg w-1/3 mb-6"></div>
        <div className="bg-zinc-800 rounded-xl p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-5 bg-zinc-700 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-zinc-700 rounded w-full"></div>
              </div>
              <div>
                <div className="h-5 bg-zinc-700 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-zinc-700 rounded w-full"></div>
              </div>
            </div>
            <div>
              <div className="h-5 bg-zinc-700 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-zinc-700 rounded w-full"></div>
            </div>
            <div>
              <div className="h-5 bg-zinc-700 rounded w-1/4 mb-2"></div>
              <div className="h-32 bg-zinc-700 rounded w-full"></div>
            </div>
            <div>
              <div className="h-5 bg-zinc-700 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-zinc-700 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Experience</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
            type="button"
          >
            <FiTrash2 size={18} />
            Delete
          </button>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            type="button"
          >
            <FiX size={18} />
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="period">
              Period *
            </label>
            <input
              id="period"
              name="period"
              type="text"
              placeholder="e.g., Jan 2020 - Present"
              value={formData.period}
              onChange={handleChange}
              required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="position">
              Position *
            </label>
            <input
              id="position"
              name="position"
              type="text"
              placeholder="e.g., Frontend Developer"
              value={formData.position}
              onChange={handleChange}
              required
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="company">
            Company *
          </label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="e.g., Acme Inc."
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Describe your responsibilities and achievements"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
            <FiTag className="mr-2" size={16} />
            Technologies Used
          </label>
          <SkillsSelector 
            selectedSkills={selectedSkills} 
            onChange={handleSkillsChange} 
          />
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
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
