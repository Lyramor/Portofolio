// src/components/admin/SkillsSelector.jsx
'use client';
import { useState, useEffect, useCallback } from 'react'; // Tambahkan useCallback
import Image from 'next/image'; // Tambahkan ini
import { FiLoader, FiTag } from 'react-icons/fi';

export default function SkillsSelector({ selectedSkills, onChange }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSkills = useCallback(async () => { // Bungkus dengan useCallback
    try {
      setLoading(true);
      const res = await fetch('/api/admin/skills/list'); 
      
      if (!res.ok) {
        throw new Error('Failed to fetch skills list');
      }
      
      const data = await res.json();
      setSkills(data);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Failed to load skills. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []); // Dependensi kosong karena tidak ada variabel dari scope luar yang dipakai di dalam fetchSkills

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]); // Dependensi useEffect menjadi fetchSkills

  const handleSkillChange = (skillId) => {
    const newSelectedSkills = selectedSkills.includes(skillId)
      ? selectedSkills.filter(id => id !== skillId)
      : [...selectedSkills, skillId];
    onChange(newSelectedSkills); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <FiLoader className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center">
        <FiTag className="mr-2" size={18} />
        {error}
      </div>
    );
  }

  return (
    <div className="bg-zinc-700 border border-zinc-600 rounded-lg p-4 max-h-96 overflow-y-auto">
      {skills.length === 0 ? (
        <p className="text-zinc-400 text-center py-4">No skills found. Please add skills first.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`skill-${skill.id}`}
                value={skill.id}
                checked={selectedSkills.includes(skill.id)}
                onChange={() => handleSkillChange(skill.id)}
                className="w-4 h-4 rounded border-zinc-500 text-sky-600 focus:ring-sky-500 focus:ring-offset-zinc-800"
              />
              <label
                htmlFor={`skill-${skill.id}`}
                className="flex items-center gap-2 cursor-pointer py-1 text-zinc-200"
              >
                {skill.imgSrc && (
                  <Image // Ganti <img>
                    src={skill.imgSrc}
                    alt={skill.label}
                    width={20} // w-5/h-5 setara 20px/20px
                    height={20} // w-5/h-5 setara 20px/20px
                    className="object-contain"
                  />
                )}
                <span>{skill.label}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}