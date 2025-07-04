/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skill from '@/components/Skill';
import Experience from '@/components/Experience';
import Project from '@/components/Project';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

// **PERBAIKAN**: Impor fungsi database secara langsung, bukan menggunakan fetch.
import {
  getAbout,
  getCounters,
  getSkills,
  getExperiencesWithSkills,
  getProjectsWithSkills,
  query as dbQuery // Ganti nama untuk menghindari konflik
} from '@/lib/db';

export default async function HomePage() {
  // Ambil semua data di server-side langsung dari database.
  // Ini adalah cara SSR yang benar di Next.js App Router.
  const [
    aboutData,
    counters,
    skillItems,
    experienceData,
    projectData,
    cvLinkData
  ] = await Promise.all([
    getAbout(),
    getCounters(),
    getSkills(),
    getExperiencesWithSkills(),
    getProjectsWithSkills(),
    dbQuery('SELECT link_cv FROM cv LIMIT 1') // Ambil link CV langsung
  ]);

  // Pastikan data yang diteruskan adalah format yang diharapkan dengan fallback.
  const aboutContent = aboutData?.content || "Welcome! I'm Marsa, a junior web developer...";
  const projectCount = counters?.projects || 0;
  const experienceYears = counters?.experience || 0;
  const cvLink = cvLinkData?.[0]?.link_cv || null;

  return (
    <div className="relative overflow-hidden">
      <Header />
      <main>
        {/* Teruskan data sebagai props ke komponen Client */}
        <Hero cvLink={cvLink} />
        <About
          aboutContent={aboutContent}
          projectCount={projectCount}
          experienceYears={experienceYears}
        />
        <Skill skillItems={skillItems || []} />
        <Experience experienceData={experienceData || []} />
        <Project projectData={projectData || []} />
        <Contact/>
        <Footer />
      </main>
    </div>
  );
}
