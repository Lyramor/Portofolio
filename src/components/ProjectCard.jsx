/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

export default function ProjectCard({ title, description, image, technologies }) {
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
        
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <span 
              key={index} 
              className="tech-badge text-xs"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  technologies: PropTypes.arrayOf(PropTypes.string).isRequired
};