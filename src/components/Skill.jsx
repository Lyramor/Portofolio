/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState, useEffect } from 'react'; 
import SkillCard from "./SkillCard";
import { FiLoader, FiAlertCircle } from 'react-icons/fi'; // Import ikon untuk loading/error

// Menerima props yang sudah diambil dari server
export default function Skill({ skillItems }) {
  // Hapus state untuk menyimpan data skill, status loading, dan error
  // const [skillItems, setSkillItems] = useState([]);
  const [loading, setLoading] = useState(false); // Tidak perlu loading di sini lagi untuk data utama
  const [error, setError] = useState(null); // Tidak perlu error di sini lagi untuk data utama

  // Hapus useEffect untuk fetching data, karena data sudah ada di props
  // useEffect(() => { /* ... logika fetching ... */ }, []); 

  // Tampilkan loading state (hanya jika ada loading tambahan di masa depan)
  if (loading) {
    return (
      <section id="skill" className="section">
        <div className="container max-w-5xl mx-auto flex justify-center items-center h-48">
          <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="ml-3 text-zinc-400">Loading skills...</p>
        </div>
      </section>
    );
  }

  // Tampilkan error state (hanya jika ada error tambahan di masa depan)
  if (error) {
    return (
      <section id="skill" className="section">
        <div className="container max-w-5xl mx-auto text-center py-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-3">
          <FiAlertCircle size={24} />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // Tampilkan pesan jika tidak ada data skill ditemukan
  if (skillItems.length === 0) {
    return (
      <section id="skill" className="section">
        <div className="container max-w-5xl mx-auto text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-400">No skills found. Please add skills via admin panel.</p>
        </div>
      </section>
    );
  }

  // Tampilkan daftar skill jika data sudah berhasil diambil dan ada
  return (
    <section
      id="skill"
      className="section"
    >
      <div className="container max-w-5xl mx-auto">
        <h2 className="headline-2">
          Essential Tools I use
        </h2>

        <p className="text-zinc-400 mt-3 mb-8 max-w-[50ch]">
          Discover the powerful tools and technologies I use to create exceptional, high-performing websites & applications.
        </p>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {
            skillItems.map((skill) => (
              <SkillCard
                key={skill.id} // Gunakan ID unik dari database sebagai key
                imgSrc={skill.imgSrc}
                label={skill.label}
                // Pastikan untuk memetakan 'description' dari DB ke prop 'desc'
                // Jika description kosong, berikan fallback string
                desc={skill.description || 'No description provided'} 
              />
            ))
          }
        </div>
      </div>
    </section>
  )
}
