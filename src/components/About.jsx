/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';

// Menerima props yang sudah diambil dari server
export default function About({ aboutContent, projectCount, experienceYears }) {
  // State terpisah untuk angka yang dianimasikan
  const [animatedProjectCount, setAnimatedProjectCount] = useState(0);
  const [animatedExperienceYears, setAnimatedExperienceYears] = useState(0);
  const [loading, setLoading] = useState(false); // Tidak perlu loading di sini lagi untuk data utama
  const [error, setError] = useState(null); // Tidak perlu error di sini lagi untuk data utama

  // Hook useInView untuk mendeteksi saat komponen masuk viewport
  const { ref, inView } = useInView({
    threshold: 0.5, 
    triggerOnce: true 
  });
  const animationStarted = useRef(false); 

  // Hapus useEffect untuk fetching data, karena data sudah ada di props
  // useEffect(() => {
  //   const fetchData = async () => { /* ... logika fetching ... */ };
  //   fetchData();
  // }, []);

  // useEffect untuk animasi angka counter saat komponen masuk viewport
  useEffect(() => {
    if (inView && !animationStarted.current) {
      animationStarted.current = true;
      
      // Animasi Project Count
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

      // Animasi Experience Years (mirip dengan project count)
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

      // Cleanup function untuk membersihkan interval saat komponen unmount
      return () => {
        clearInterval(projectInterval);
        clearInterval(experienceInterval);
      };
    }
  }, [inView, projectCount, experienceYears]); 

  // Tampilkan loading state (hanya jika ada loading tambahan di masa depan, saat ini tidak relevan untuk data utama)
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

  // Tampilkan error state (hanya jika ada error tambahan di masa depan, saat ini tidak relevan untuk data utama)
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
              {/* Card Project Done */}
              <div className="counter-item">
                <div className="flex items-center md:mb-2">
                  <span className="text-2xl font-semibold md:text-4xl count-number">
                    {animatedProjectCount}
                  </span>
                  <span className="text-sky-400 font-semibold md:text-3xl">+</span>
                </div>
                <p className="text-sm text-zinc-400">Project done</p>
              </div>

              {/* Card Years of Experience */}
              <div className="counter-item">
                <div className="flex items-center md:mb-2">
                  <span className="text-2xl font-semibold md:text-4xl count-number">
                    {animatedExperienceYears}
                  </span>
                  <span className="text-sky-400 font-semibold md:text-3xl">+</span>
                </div>
                <p className="text-sm text-zinc-400">Years of experience</p>
              </div>
              
              {/* Gambar ikon tetap */}
              <img
                src="/images/icon.png"
                width={30}
                height={30}
                alt="Cylia Tech"
                className="ml-auto md:w-[40px] md:h-[40px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
