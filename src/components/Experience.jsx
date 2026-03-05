/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState } from 'react';
import ExperienceCard from './ExperienceCard';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const INITIAL_COUNT = 3;

export default function Experience({ experienceData }) {
  const [showAll, setShowAll] = useState(false);

  if (experienceData.length === 0) {
    return (
      <section id="experience" className="section bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="experience-container text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-400">No experience entries found.</p>
        </div>
      </section>
    );
  }

  const visible = experienceData.slice(0, INITIAL_COUNT);
  const hidden = experienceData.slice(INITIAL_COUNT);
  const hasMore = hidden.length > 0;

  return (
    <section
      id="experience"
      className="section bg-gradient-to-b from-zinc-900 to-zinc-950"
    >
      <div className="experience-container">
        <h2 className="headline-2 mb-10 text-center">Experience</h2>

        {/* Always-visible first 3 */}
        <div className="flex flex-col gap-10">
          {visible.map((experience) => (
            <ExperienceCard
              key={experience.id}
              period={experience.period}
              position={experience.position}
              company={experience.company}
              description={experience.description}
              technologies={experience.technologies || []}
            />
          ))}
        </div>

        {/* Expandable extra items */}
        {hasMore && (
          <div
            style={{
              maxHeight: showAll ? `${hidden.length * 600}px` : '0px',
              opacity: showAll ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.6s ease, opacity 0.35s ease',
            }}
          >
            <div className="flex flex-col gap-10 mt-10">
              {hidden.map((experience, index) => (
                <div
                  key={experience.id}
                  style={{
                    opacity: showAll ? 1 : 0,
                    transform: showAll ? 'translateY(0)' : 'translateY(24px)',
                    transition: `opacity 0.4s ease ${0.1 + index * 0.1}s, transform 0.4s ease ${0.1 + index * 0.1}s`,
                  }}
                >
                  <ExperienceCard
                    period={experience.period}
                    position={experience.position}
                    company={experience.company}
                    description={experience.description}
                    technologies={experience.technologies || []}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* See More / Show Less button */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="flex items-center gap-2 px-6 py-3 border border-sky-500 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors font-medium"
            >
              {showAll ? (
                <>Show Less <FiChevronUp size={18} /></>
              ) : (
                <>See More <FiChevronDown size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
