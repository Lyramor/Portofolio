'use client'

import { FiAward } from 'react-icons/fi';

export default function Awards({ awards = [] }) {
  if (awards.length === 0) return null;

  return (
    <section id="awards" className="section">
      <div className="project-container">
        <h2 className="headline-2 mb-2 text-center">Awards</h2>
        <p className="text-zinc-400 text-center mb-10">Recognitions & Scholarships</p>

        <div className="flex flex-col gap-4">
          {awards.map((award) => (
            <div
              key={award.id}
              className="relative bg-gradient-to-r from-sky-500/10 via-zinc-800 to-zinc-800 border border-sky-500/20 rounded-2xl p-6 flex items-start gap-5 overflow-hidden"
            >
              {/* glow */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-sky-600 rounded-l-2xl" />

              <div className="bg-sky-500/20 p-3 rounded-xl shrink-0">
                <FiAward size={24} className="text-sky-400" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-zinc-50">{award.title}</h3>
                  {award.year && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {award.year}
                    </span>
                  )}
                </div>
                {award.issuer && (
                  <p className="text-sky-400/80 text-sm font-medium mb-2">{award.issuer}</p>
                )}
                {award.description && (
                  <p className="text-zinc-400 text-sm leading-relaxed">{award.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
