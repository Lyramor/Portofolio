'use client';
// src/app/lyramor/projects/page.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiEdit, FiTrash2, FiLoader } from 'react-icons/fi';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Perbaiki URL endpoint untuk menggunakan 'projects' (jamak)
      const res = await fetch('/api/admin/projects');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Periksa apakah data adalah array atau tidak
      if (Array.isArray(data)) {
        setProjects(data);
      } else if (data.error) {
        // Jika ada pesan error dari API
        setError(data.error);
        setProjects([]);
      } else {
        // Jika responsnya bukan array dan bukan error, mungkin strukturnya berbeda
        console.warn('Response is not an array:', data);
        setProjects(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again later.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Perbaiki URL endpoint untuk menggunakan 'projects' (jamak)
      const res = await fetch(`/api/admin/projects/${deleteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProjects(projects.filter(project => project.id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        console.error('Failed to delete project');
        setError('Failed to delete project. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/lyramor/projects/new"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={18} />
          Add New Project
        </Link>
      </div>

      {/* Tampilkan pesan error jika ada */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-sky-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center">
          <h2 className="text-xl font-medium mb-2">No projects yet</h2>
          <p className="text-zinc-400 mb-6">
            Start adding projects to showcase your work.
          </p>
          <Link
            href="/lyramor/projects/new"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <FiPlus size={18} />
            Add Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden transition-all hover:border-zinc-500"
            >
              <div className="relative h-48 w-full bg-zinc-700">
                {project.image && (
                  <Image
                    src={project.image.startsWith('http') ? project.image : project.image}
                    alt={project.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-medium mb-2">{project.title}</h3>
                <p className="text-zinc-400 mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                {/* Tags/Skills */}
                {project.skill_labels && project.skill_labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skill_labels.map((skill, index) => (
                      <span
                        key={`${project.id}-skill-${index}`}
                        className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => confirmDelete(project.id)}
                    className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                  <Link
                    href={`/lyramor/projects/edit/${project.id}`}
                    className="p-2 bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 rounded-lg transition-colors"
                  >
                    <FiEdit size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-medium mb-4">Confirm Deletion</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}