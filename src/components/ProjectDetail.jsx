/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import { useEffect } from 'react';
import { FiX, FiLink, FiTag } from 'react-icons/fi';

export default function ProjectDetail({ project, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fadeInBackdrop 0.25s ease' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ animation: 'slideUpModal 0.3s ease' }}
      >
        {/* Image */}
        <div className="relative w-full flex-shrink-0 bg-zinc-800">
          <img
            src={project.image || '/images/default_project_image.png'}
            alt={project.title}
            className="w-full h-auto object-contain"
          />
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="overflow-y-auto p-6 flex flex-col gap-5 custom-scroll">
          <h2 className="text-2xl font-bold text-zinc-50">{project.title}</h2>

          {/* Technologies */}
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-lg bg-zinc-700 text-zinc-300"
                >
                  <FiTag size={12} />
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div
              className="text-zinc-300 text-base leading-relaxed trix-content"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}

          {/* Link */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
            >
              <FiLink size={16} />
              View Project
            </a>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #38bdf8;
        }
      `}</style>
    </div>
  );
}
