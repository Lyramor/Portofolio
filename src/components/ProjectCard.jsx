/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React from 'react';
import PropTypes from 'prop-types';
import { FiLink as LinkIcon } from 'react-icons/fi';

export default function ProjectCard({ title, image, technologies, link, onClick }) {
  return (
    <div
      onClick={onClick}
      className="project-card bg-zinc-800/30 rounded-2xl overflow-hidden border border-zinc-700/20 hover:border-sky-400/40 transition-colors group cursor-pointer"
    >
      <div className="img-box h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="content p-6">
        <h3 className="text-xl font-bold text-zinc-50 mb-3 group-hover:text-sky-400 transition-colors">
          {title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="tech-badge px-3 py-1 text-sm font-medium rounded-lg bg-zinc-700 text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition duration-300"
          >
            <LinkIcon size={16} />
            <span>View Project</span>
          </a>
        )}
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  technologies: PropTypes.arrayOf(PropTypes.string).isRequired,
  link: PropTypes.string,
  onClick: PropTypes.func,
};
