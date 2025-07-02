/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState, useEffect } from 'react'; 
import ProjectCard from './ProjectCard';
import { FiLoader, FiAlertCircle } from 'react-icons/fi'; 

// Menerima props yang sudah diambil dari server
export default function Project({ projectData }) {
  // Hapus state untuk menyimpan data proyek, status loading, dan error
  // const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(false); // Tidak perlu loading di sini lagi untuk data utama
  const [error, setError] = useState(null); // Tidak perlu error di sini lagi untuk data utama

  // Hapus useEffect untuk fetching data, karena data sudah ada di props
  // useEffect(() => { /* ... logika fetching ... */ }, []); 

  // Tampilkan loading state (hanya jika ada loading tambahan di masa depan)
  if (loading) {
    return (
      <section 
        id="project" 
        className="section bg-gradient-to-b from-zinc-950 to-zinc-900"
      >
        <div className="project-container flex justify-center items-center h-48">
          <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="ml-3 text-zinc-400">Loading projects...</p>
        </div>
      </section>
    );
  }

  // Tampilkan error state (hanya jika ada error tambahan di masa depan)
  if (error) {
    return (
      <section 
        id="project" 
        className="section bg-gradient-to-b from-zinc-950 to-zinc-900"
      >
        <div className="project-container text-center py-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-3">
          <FiAlertCircle size={24} />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // Tampilkan pesan jika tidak ada data proyek ditemukan
  // Pemeriksaan ini sekarang lebih aman karena kita sudah memastikan projectData adalah array
  if (projectData.length === 0) { 
    return (
      <section 
        id="project" 
        className="section bg-gradient-to-b from-zinc-950 to-zinc-900"
      >
        <div className="project-container text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-400">No projects found. Please add projects via admin panel.</p>
        </div>
      </section>
    );
  }

  // Tampilkan daftar proyek jika data sudah berhasil diambil dan ada
  return (
    <section 
      id="project" 
      className="section bg-gradient-to-b from-zinc-950 to-zinc-900"
    >
      <div className="project-container">
        <h2 className="headline-2 mb-10 text-center">
          My Project Highlights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectData.map((project) => (
            <ProjectCard 
              key={project.id} 
              title={project.title}
              description={project.description}
              image={project.image || '/images/default_project_image.png'} 
              technologies={project.technologies || []} 
              link={project.link} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
