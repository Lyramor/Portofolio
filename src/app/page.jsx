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

// Fungsi untuk mengambil data dari API publik
async function fetchPublicData(path) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/${path}`, {
    // Cache data untuk 5 menit, revalidate di latar belakang
    next: { revalidate: 300 } 
  });

  if (!res.ok) {
    console.error(`Failed to fetch data from /api/${path}:`, res.status, res.statusText);
    // Jika gagal, kembalikan array kosong atau nilai default yang sesuai
    // agar komponen tidak error saat mencoba memetakan data
    return null; // Atau [] jika API selalu mengembalikan array
  }
  return res.json();
}

export default async function HomePage() {
  // Ambil semua data di server-side
  const [
    aboutData, 
    projectCounterData, 
    experienceCounterData, 
    skillItems, 
    experienceData, 
    projectData,
    cvLinkData
  ] = await Promise.all([
    fetchPublicData('about'),
    fetchPublicData('counters/projects'),
    fetchPublicData('counters/experience'),
    fetchPublicData('skills'),
    fetchPublicData('experiences'),
    fetchPublicData('projects'),
    fetchPublicData('cv')
  ]);

  // Pastikan data yang diteruskan adalah format yang diharapkan
  const aboutContent = aboutData?.content || "Welcome! I'm Marsa, a junior web developer...";
  const projectCount = projectCounterData?.number || 0;
  const experienceYears = experienceCounterData?.number || 0;
  const cvLink = cvLinkData?.link_cv || null;

  return (
    <div className="relative overflow-hidden">
      <Header />
      <main>
        <Hero cvLink={cvLink} />
        <About 
          aboutContent={aboutContent} 
          projectCount={projectCount} 
          experienceYears={experienceYears} 
        />
        <Skill skillItems={skillItems || []} /> {/* Pastikan skillItems adalah array */}
        <Experience experienceData={experienceData || []} /> {/* Pastikan experienceData adalah array */}
        <Project projectData={projectData || []} /> {/* Pastikan projectData adalah array */}
        <Contact/>
        <Footer />
      </main>
    </div>
  );
}
