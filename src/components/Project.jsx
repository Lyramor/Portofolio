/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectDetail from './ProjectDetail';

export default function Project({ projectData }) {
  const [selected, setSelected] = useState(null);

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
              onClick={() => setSelected(project)}
            />
          ))}
        </div>
      </div>

      {/* Project detail modal */}
      {selected && (
        <ProjectDetail
          project={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
