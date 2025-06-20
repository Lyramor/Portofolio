/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState, useEffect } from 'react'; // Import useState dan useEffect
import SkillCard from "./SkillCard";
import { FiLoader, FiAlertCircle } from 'react-icons/fi'; // Import ikon untuk loading/error

export default function Skill() {
  // State untuk menyimpan data skill, status loading, dan error
  const [skillItems, setSkillItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi async untuk mengambil data skill dari API
    const fetchSkills = async () => {
      try {
        setLoading(true); // Set loading menjadi true saat mulai mengambil data
        setError(null); // Hapus error sebelumnya

        // Mengambil data dari API publik yang baru dibuat
        const res = await fetch('/api/skills'); 

        // Periksa apakah respons berhasil (status 200 OK)
        if (!res.ok) {
          throw new Error('Failed to fetch skills data');
        }

        // Parse respons JSON
        const data = await res.json();
        setSkillItems(data); // Simpan data skill ke state
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load skills. Please try again later.'); // Set pesan error
      } finally {
        setLoading(false); // Set loading menjadi false setelah selesai (berhasil atau error)
      }
    };

    fetchSkills(); // Panggil fungsi pengambilan data saat komponen dimuat
  }, []); // Array dependensi kosong berarti useEffect ini hanya berjalan sekali saat mount

  // Tampilkan loading state
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

  // Tampilkan error state
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