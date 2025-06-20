/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { FiLink as LinkIcon } from 'react-icons/fi'; // Import ikon tautan

export default function ProjectCard({ title, description, image, technologies, link }) {
  return (
    <div className="project-card bg-zinc-800/30 rounded-2xl overflow-hidden border border-zinc-700/20 hover:border-sky-400/20 transition-colors group">
      <div className="img-box h-48 relative">
        <Image 
          src={image}
          alt={title}
          fill
          className="img-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      <div className="content p-6">
        <h3 className="text-xl font-bold text-zinc-50 mb-3 group-hover:text-sky-400 transition-colors">{title}</h3>
        
        <p className="mb-5 text-zinc-300 line-clamp-4 text-sm">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4"> {/* Tambahkan margin bawah di sini */}
          {technologies.map((tech, index) => (
            <span 
              key={index} 
              className="tech-badge px-3 py-1 text-sm font-medium rounded-lg bg-zinc-700 text-zinc-300 hover:bg-sky-400 hover:text-zinc-900 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Tombol Link (Hanya Tampilkan jika ada link) */}
        {link && (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition duration-300"
          >
            <LinkIcon size={18} />
            <span>View Project</span>
          </a>
        )}
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  technologies: PropTypes.arrayOf(PropTypes.string).isRequired,
  link: PropTypes.string, // Tambahkan prop link (opsional)
};