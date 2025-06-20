'use client';
// src/app/lyramor/projects/page.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 

import { 
  FiBriefcase, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiAlertCircle,
  FiImage,
  FiTag,
  FiCalendar,
  FiLink as LinkIcon // Mengganti nama FiLink agar tidak konflik dengan Link dari next/link
} from 'react-icons/fi';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [deleteTitle, setDeleteTitle] = useState(''); 
  const [isDeleting, setIsDeleting] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/admin/projects');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load project data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true); 
    try {
      const res = await fetch(`/api/admin/projects/${deleteId}`, { 
        method: 'DELETE', 
      });

      if (!res.ok) {
        const errorData = await res.json(); 
        throw new Error(errorData.error || 'Failed to delete project');
      }

      setProjects(projects.filter(project => project.id !== deleteId)); 
      setShowDeleteModal(false); 
      setDeleteId(null);
      setDeleteTitle('');
    } catch (err) {
      console.error('Error deleting project:', err); 
      setError(err.message || 'Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false); 
    }
  };

  const confirmDelete = (id, title) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'; 
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown'; 
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-sky-400" /> 
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <FiBriefcase className="text-sky-400 mr-3" size={24} /> 
          <h1 className="text-2xl font-bold">Project Management</h1> 
        </div>
        <Link
          href="/lyramor/projects/new"
          className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        > 
          <FiPlus size={18} /> 
          <span>Add New Project</span> 
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={18} /> 
          {error}
        </div>
      )} 

      {projects.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center">
          <FiBriefcase className="mx-auto text-zinc-600 mb-4" size={48} /> 
          <h3 className="text-lg font-medium text-zinc-400 mb-2">No projects yet</h3> 
          <p className="text-zinc-500 mb-4">Start by adding your first project</p> 
          <Link
            href="/lyramor/projects/new"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors"
          > 
            <FiPlus size={18} /> 
            <span>Add Your First Project</span> 
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => ( 
            <div key={project.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-6"> 
              <div className="flex items-start gap-4"> 
                {/* Project Image */}
                <div className="flex-shrink-0"> 
                  {project.image ? ( 
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => { 
                        e.target.onerror = null;
                        e.target.src = '/images/default_project_image.png'; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-zinc-700 rounded-lg flex items-center justify-center"> 
                      <FiImage className="text-zinc-500" size={24} /> 
                    </div>
                  )} 
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0"> 
                  <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3> 
                  {project.description && (
                    <p className="text-zinc-400 mb-3 line-clamp-2">{project.description}</p> 
                  )}

                  {/* Skills */}
                  {project.skill_labels && project.skill_labels.length > 0 && ( 
                    <div className="flex items-center gap-2 mb-3"> 
                      <FiTag className="text-zinc-500" size={14} /> 
                      <div className="flex flex-wrap gap-1"> 
                        {project.skill_labels.map((skill, index) => ( 
                          <span 
                            key={index}
                            className="px-2 py-1 bg-sky-600/20 text-sky-400 text-xs rounded-md" 
                          >
                            {skill}
                          </span>
                        ))} 
                      </div>
                    </div>
                  )}

                  {/* Project Link */}
                  {project.link && (
                    <div className="flex items-center text-zinc-500 text-sm mb-1">
                      <LinkIcon className="mr-1" size={14} />
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sky-400 hover:underline truncate"
                      >
                        {project.link}
                      </a>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center text-zinc-500 text-sm"> 
                    <FiCalendar className="mr-1" size={14} /> 
                    <span>Created: {formatDate(project.created_at)}</span> 
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2"> 
                  <Link
                    href={`/lyramor/projects/${project.id}/edit`} 
                    className="p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Edit Project" 
                  >
                    <FiEdit2 size={18} /> 
                  </Link>
                  
                  <button
                    onClick={() => confirmDelete(project.id, project.title)}
                    disabled={isDeleting && deleteId === project.id} 
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50" 
                    title="Delete Project" 
                  >
                    {isDeleting && deleteId === project.id ? ( 
                      <FiLoader className="animate-spin" size={18} /> 
                    ) : (
                      <FiTrash2 size={18} /> 
                    )}
                  </button> 
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full m-4 animate-scaleIn">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3> 
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deleteTitle}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <FiLoader className="animate-spin" size={16} />
                ) : (
                  <FiTrash2 size={16} />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}