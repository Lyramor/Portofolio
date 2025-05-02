/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React from 'react';
import PropTypes from 'prop-types';

export default function ExperienceCard({ period, position, company, description, technologies }) {
  return (
    <div className="experience-card">
      <div className="lg:grid lg:grid-cols-[170px_1fr] gap-12">
        <div className="period-container mb-4 lg:mb-0">
          <h3 className="text-xl font-bold text-zinc-300">{period}</h3>
        </div>
        
        <div className="content-container">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-zinc-50">{position} - <span className="text-sky-400">{company}</span></h3>
          </div>
          
          <p className="mb-5 text-zinc-300 text-lg">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <span 
                key={index} 
                className="tech-badge"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ExperienceCard.propTypes = {
  period: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  technologies: PropTypes.arrayOf(PropTypes.string).isRequired
};