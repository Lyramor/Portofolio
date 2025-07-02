/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */

import Hero from '@/components/Hero';
import Header from '@/components/Header';
import About from '@/components/About';
import Skill from '@/components/Skill';
import Experience from '@/components/Experience';
import Project from '@/components/Project';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import SplashCursor from '@/components/SplashCursor/SplashCursor';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <Header />
      <main>
        <Hero/>
        <About/>
        <Skill/>
        <Experience/>
        <Project/>
        <Contact/>
        <Footer />
      </main>
    </div>
  );
}