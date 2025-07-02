/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState, useEffect } from 'react'; 
import ExperienceCard from './ExperienceCard';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';

// Menerima props yang sudah diambil dari server
export default function Experience({ experienceData }) {
  // Hapus state untuk menyimpan data pengalaman, status loading, dan error
  // const [experienceData, setExperienceData] = useState([]);
  const [loading, setLoading] = useState(false); // Tidak perlu loading di sini lagi untuk data utama
  const [error, setError] = useState(null); // Tidak perlu error di sini lagi untuk data utama

  // Hapus useEffect untuk fetching data, karena data sudah ada di props
  // useEffect(() => { /* ... logika fetching ... */ }, []); 

  // Tampilkan loading state (hanya jika ada loading tambahan di masa depan)
  if (loading) {
    return (
      <section id="experience" className="section bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="experience-container flex justify-center items-center h-48">
          <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="ml-3 text-zinc-400">Loading experiences...</p>
        </div>
      </section>
    );
  }

  // Tampilkan error state (hanya jika ada error tambahan di masa depan)
  if (error) {
    return (
      <section id="experience" className="section bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="experience-container text-center py-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-3">
          <FiAlertCircle size={24} />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // Tampilkan pesan jika tidak ada data pengalaman
  if (experienceData.length === 0) {
    return (
      <section id="experience" className="section bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="experience-container text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-400">No experience entries found.</p>
        </div>
      </section>
    );
  }

  // Tampilkan daftar pengalaman jika data sudah berhasil diambil dan ada
  return (
    <section 
      id="experience" 
      className="section bg-gradient-to-b from-zinc-900 to-zinc-950"
    >
      <div className="experience-container">
        <h2 className="headline-2 mb-10 text-center">
          Experience
        </h2>

        <div className="flex flex-col gap-10">
          {experienceData.map((experience, index) => (
            <ExperienceCard 
              key={experience.id} 
              period={experience.period}
              position={experience.position}
              company={experience.company}
              description={experience.description}
              technologies={experience.technologies || []} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
