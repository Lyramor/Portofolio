/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React from 'react';
import ExperienceCard from './ExperienceCard';

const experienceData = [
  {
    period: '2023 - Present',
    position: 'Senior Full Stack Developer',
    company: 'Google Inc.',
    description: 'Led a team in developing and maintaining web applications using JavaScript, React.js, and Node.js. Implemented RESTful APIs and integrated with MongoDB databases. Collaborated with stakeholders to define project requirements and timelines.',
    technologies: ['Javascript', 'React.js', 'Next.js', 'MongoDB']
  },
  {
    period: '2022 - 2023',
    position: 'Frontend Developer',
    company: 'Adobe',
    description: 'Designed and developed user interfaces for web applications using Next.js and React. Worked closely with backend developers to integrate frontend components with Node.js APIs. Implemented responsive designs and optimized frontend performance.',
    technologies: ['HTML', 'CSS', 'Vue.js', 'MySQL']
  },
  {
    period: '2021 - 2022',
    position: 'Full Stack Developer',
    company: 'Facebook',
    description: 'Developed and maintained web applications using JavaScript, React.js, and Node.js. Designed and implemented RESTful APIs for data communication. Collaborated with cross-functional teams to deliver high-quality software products on schedule.',
    technologies: ['Python', 'Svelte', 'Three.js', 'Postgres']
  }
];

export default function Experience() {
  return (
    <section 
      id="experience" 
      className="section bg-gradient-to-b from-zinc-900 to-zinc-950"
    >
      <div className="experience-container">
        <h2 className="headline-2 mb-10 text-center">
          Experience
        </h2>

        <div className="flex flex-col gap-10">
          {experienceData.map((experience, index) => (
            <ExperienceCard 
              key={index}
              period={experience.period}
              position={experience.position}
              company={experience.company}
              description={experience.description}
              technologies={experience.technologies}
            />
          ))}
        </div>
      </div>
    </section>
  );
}