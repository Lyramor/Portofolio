// src/components/About.jsx
/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import Image from 'next/image'; // Tambahkan ini

export default function About({ aboutContent, projectCount, experienceYears }) {
  const [animatedProjectCount, setAnimatedProjectCount] = useState(0);
  const [animatedExperienceYears, setAnimatedExperienceYears] = useState(0);
  const [loading] = useState(false);
  const [error] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0.5, 
    triggerOnce: true 
  });
  const animationStarted = useRef(false); 

  useEffect(() => {
    if (inView && !animationStarted.current) {
      animationStarted.current = true;
      
      let currentProjectCount = 0;
      const projectIncrement = Math.ceil(projectCount / 30); 
      const projectInterval = setInterval(() => {
        currentProjectCount += projectIncrement;
        if (currentProjectCount >= projectCount) {
          currentProjectCount = projectCount; 
          clearInterval(projectInterval); 
        }
        setAnimatedProjectCount(currentProjectCount);
      }, 50);

      let currentExperienceYears = 0;
      const experienceIncrement = Math.ceil(experienceYears / 30);
      const experienceInterval = setInterval(() => {
        currentExperienceYears += experienceIncrement;
        if (currentExperienceYears >= experienceYears) {
          currentExperienceYears = experienceYears;
          clearInterval(experienceInterval);
        }
        setAnimatedExperienceYears(currentExperienceYears);
      }, 50);

      return () => {
        clearInterval(projectInterval);
        clearInterval(experienceInterval);
      };
    }
  }, [inView, projectCount, experienceYears]); 

  if (loading) {
    return (
      <section id="about" className="section">
        <div className="container flex justify-center items-center h-64">
          <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="ml-3 text-zinc-400">Loading About section...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="about" className="section">
        <div className="container text-center py-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-3">
          <FiAlertCircle size={24} />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="about"
      className="section"
    >
      <div className="container">
        <div className="flex justify-center">
          <div className="bg-zinc-800 p-7 rounded-2xl md:p-12 max-w-3xl">
            <p className="text-zinc-300 mb-4 md:mb-8 md:text-xl md:max-w-[60ch]">
              {aboutContent || "Welcome! I'm Marsa, a junior web developer... (Content not loaded or empty)"}
            </p>
            <div ref={ref} className="flex flex-wrap items-center gap-4 md:gap-7">
              <div className="counter-item">
                <div className="flex items-center md:mb-2">
                  <span className="text-2xl font-semibold md:text-4xl count-number">
                    {animatedProjectCount}
                  </span>
                  <span className="text-sky-400 font-semibold md:text-3xl">+</span>
                </div>
                <p className="text-sm text-zinc-400">Project done</p>
              </div>

              <div className="counter-item">
                <div className="flex items-center md:mb-2">
                  <span className="text-2xl font-semibold md:text-4xl count-number">
                    {animatedExperienceYears}
                  </span>
                  <span className="text-sky-400 font-semibold md:text-3xl">+</span>
                </div>
                <p className="text-sm text-zinc-400">Years of experience</p>
              </div>
              
              <Image // Ganti <img>
                src="/images/icon.png"
                width={40} // Berdasarkan md:w-[40px]
                height={40} // Berdasarkan md:h-[40px]
                alt="Cylia Tech Icon"
                className="ml-auto" // class ml-auto md:w-[40px] md:h-[40px] bisa disisakan atau diganti css module
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}