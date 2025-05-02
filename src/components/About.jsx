/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

const aboutItems = [
  {
    label: 'Project done',
    number: 15
  },
  {
    label: 'Years of experience',
    number: 3
  }
];

export default function About() {
  const [counters, setCounters] = useState(aboutItems.map(() => 0));
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });
  const animationStarted = useRef(false);

  useEffect(() => {
    if (inView && !animationStarted.current) {
      animationStarted.current = true;
      
      aboutItems.forEach((item, index) => {
        const increment = Math.ceil(item.number / 30); // Jumlah langkah animasi
        let currentCount = 0;
        
        const interval = setInterval(() => {
          currentCount += increment;
          
          if (currentCount >= item.number) {
            currentCount = item.number;
            clearInterval(interval);
          }
          
          setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = currentCount;
            return newCounters;
          });
        }, 50); // Kecepatan animasi (ms)
        
        return () => clearInterval(interval);
      });
    }
  }, [inView]);

  return (
    <section
      id="about"
      className="section"
    >
      <div className="container">
        <div className="flex justify-center">
          <div className="bg-zinc-800 p-7 rounded-2xl md:p-12 max-w-3xl">
            <p className="text-zinc-300 mb-4 md:mb-8 md:text-xl md:max-w-[60ch]">
              Welcome! I&apos;m Marsa, a junior web developer with a strong passion for building dynamic and user-friendly web applications. Currently pursuing my bachelor&apos;s degree in Computer Engineering at Pasundan University, I focus on turning ideas into interactive digital experiences by blending creativity with solid technical skills.
            </p>
            <div ref={ref} className="flex flex-wrap items-center gap-4 md:gap-7">
              {
                aboutItems.map(({label, number}, key) => (
                  <div key={key} className="counter-item">
                    <div className="flex items-center md:mb-2">
                      <span className="text-2xl font-semibold md:text-4xl count-number">
                        {counters[key]}
                      </span>
                      <span className="text-sky-400 font-semibold md:text-3xl">+</span>
                    </div>
                    <p className="text-sm text-zinc-400">{label}</p>
                  </div>
                ))
              }
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