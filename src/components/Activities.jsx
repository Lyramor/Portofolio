'use client'

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiUsers, FiMic } from 'react-icons/fi';

const AUTO_DELAY = 6000; // ms between auto-slides

export default function Activities({ organizations = [], speaking = [] }) {
  const items = [
    ...organizations.map(o => ({ ...o, type: 'organization' })),
    ...speaking.map(s => ({ ...s, type: 'speaking' })),
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % items.length);
  }, [items.length]);

  const goPrev = () => {
    setDirection(-1);
    setCurrent(c => (c - 1 + items.length) % items.length);
  };

  const goTo = (i) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  // Auto-rotate
  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(goNext, AUTO_DELAY);
    return () => clearInterval(timer);
  }, [paused, goNext, items.length]);

  if (items.length === 0) return null;

  const item = items[current];

  const variants = {
    enter: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section id="activities" className="section">
      <div className="project-container">
        <h2 className="headline-2 mb-2 text-center">Activities</h2>
        <p className="text-zinc-400 text-center mb-10">Organization & Speaking Invitations</p>

        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="bg-zinc-800 border border-zinc-700/50 rounded-2xl overflow-hidden min-h-[280px]"
            >
              {/* Image */}
              {item.image_url && (
                <div className="relative w-full aspect-video overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.type === 'organization' ? item.organization : item.event}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-800 to-transparent" />
                </div>
              )}

              <div className={`${item.image_url ? 'p-6 md:p-8 pt-4' : 'p-6 md:p-8'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2.5 rounded-lg shrink-0 bg-sky-500/20 text-sky-400">
                    {item.type === 'organization' ? <FiUsers size={20} /> : <FiMic size={20} />}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                      {item.type === 'organization' ? 'Organization' : 'Speaking'}
                    </span>
                    <h3 className="text-xl font-bold text-zinc-50 mt-1">
                      {item.type === 'organization' ? item.role : item.event}
                    </h3>
                    <p className="text-sky-400 font-medium">
                      {item.type === 'organization' ? item.organization : item.organizer}
                    </p>
                    {item.type === 'organization' && item.period && (
                      <p className="text-zinc-500 text-sm mt-0.5">{item.period}</p>
                    )}
                    {item.type === 'speaking' && item.role && (
                      <p className="text-zinc-500 text-sm mt-0.5">{item.role}</p>
                    )}
                  </div>
                </div>

                {item.description && (
                  <div
                    className="text-zinc-300 text-sm leading-relaxed trix-content"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={goPrev}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-sky-400 w-5' : 'bg-zinc-600 w-2'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
