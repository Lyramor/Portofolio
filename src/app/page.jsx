/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */

import Hero from '@/components/Hero';
import Header from '@/components/Header';
import About from '@/components/About';
import Skill from '@/components/Skill';
import SplashCursor from '@/components/SplashCursor/SplashCursor';


export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <SplashCursor/>
      <Header />
      <main>
        <Hero/>
        <About/>
        <Skill/>
      </main>
    </div>
  );
}