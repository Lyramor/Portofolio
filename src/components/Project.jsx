/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState, useEffect } from 'react'; 
import ProjectCard from './ProjectCard';
import { FiLoader, FiAlertCircle } from 'react-icons/fi'; 

export default function Project() {
  // State untuk menyimpan data proyek, status loading, dan error
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi async untuk mengambil data proyek dari API
    const fetchProjects = async () => {
      try {
        setLoading(true); 
        setError(null); 

        const res = await fetch('/api/projects'); 

        if (!res.ok) {
          // Tangani respons non-OK (misalnya, status 500)
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch project data');
        }

        // Parse respons JSON
        const data = await res.json();
        
        // Pastikan data adalah array sebelum menyimpannya ke state
        if (Array.isArray(data)) {
          setProjectData(data); 
        } else {
          // Jika data bukan array, log error dan set error state
          console.error('API /api/projects returned non-array data:', data);
          throw new Error('Invalid data format received from server.');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false); 
      }
    };

    fetchProjects();
  }, []); 

  // Tampilkan loading state
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

  // Tampilkan error state
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
