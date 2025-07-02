/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import Image from 'next/image';
import { ButtonPrimary, ButtonOutline } from './Button';
import Lanyard from './Lanyard/Lanyard';
import RotatingText from './RotatingText/RotatingText';
// Hapus import useState dan useEffect karena data akan diterima via props
// import { useState, useEffect } from 'react'; 

export default function Hero({ cvLink }) { // Menerima cvLink sebagai prop
  // Hapus state cvLink dan loadingCv, serta useEffect untuk fetching data
  // const [cvLink, setCvLink] = useState(null); 
  // const [loadingCv, setLoadingCv] = useState(true);

  // Hapus useEffect ini
  // useEffect(() => {
  //   const fetchCvLink = async () => {
  //     try {
  //       const res = await fetch('/api/cv'); 
  //       if (res.ok) {
  //         const data = await res.json();
  //         setCvLink(data.link_cv);
  //       } else {
  //         console.error('Failed to fetch CV link:', res.statusText);
  //         setCvLink(null); 
  //       }
  //     } catch (error) {
  //       console.error('Error fetching CV link:', error);
  //       setCvLink(null); 
  //     } finally {
  //       setLoadingCv(false);
  //     }
  //   };
  //   fetchCvLink();
  // }, []);

  return (
    <section 
      id="home"
      className="pt-20 lg:pt-0">
      <div className="min-h-screen overflow-hidden">

        <div className="container mx-auto h-screen">
          <div className="lg:grid lg:grid-cols-2 lg:gap-10 items-center">
            
            {/* Kolom kiri - Konten utama */}
            <div className="flex flex-col lg:pl-32">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-zinc-50 text-xl lg:text-2xl font-bold tracking-wide lg:pt-0 pt-24">
                  Hello! I&apos;m
                  <RotatingText
                    texts={['Web Design', 'Web Depelopment', 'Web Programming']}
                    mainClassName="px-2 sm:px-2 md:px-3 bg-sky-400 text-zinc-900 overflow-hidden py-0.5 sm:py-1 justify-center rounded-lg text-21xl font-bold inline-flex transition-all"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </div>
              </div>

              <h2 className="headline-1 max-w-[50ch] sm:max-w-[20ch] mt-5 mb-8 lg:mb-5">
                Where Your Vision Meets My Code
              </h2>

              <div className="flex items-center gap-3">
                {/* Render ButtonPrimary berdasarkan cvLink yang diterima */}
                {cvLink ? ( // Tidak perlu loadingCv lagi
                  <ButtonPrimary
                    label="Download CV"
                    icon={true}
                    href={cvLink} // Gunakan CV link dari prop
                    target="_blank" // Buka di tab baru
                  />
                ) : (
                  // Opsional render tombol yang dinonaktifkan atau tidak ada jika CV tidak tersedia
                  <ButtonPrimary
                    label="Download CV"
                    icon={true}
                    classes="opacity-50 cursor-not-allowed"
                    disabled={true}
                  />
                )}
                <ButtonOutline
                  href="#about"
                  label="Scroll down"
                  icon={true}
                />
              </div>
            </div>

            {/* Kolom kanan - Lanyard + Avatar (Logo) */}
            <div className="hidden lg:flex lg:flex-col lg:items-center lg:-translate-y-32">
              <Image 
                src="/images/Logo.png" 
                alt="Avatar" 
                width={180} 
                height={180}
                className="mb-6"
                priority
              />
              <Lanyard position={[0, 0, 12]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
