/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */

export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skill from '@/components/Skill';
import Experience from '@/components/Experience';
import Project from '@/components/Project';
import Activities from '@/components/Activities';
import Awards from '@/components/Awards';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

import {
  getAbout,
  getCounters,
  getSkills,
  getExperiencesWithSkills,
  getProjectsWithSkills,
  getOrganizations,
  getSpeaking,
  getAwards,
  query as dbQuery,
} from '@/lib/db';

export default async function HomePage() {
  const [
    aboutData,
    counters,
    skillItems,
    experienceData,
    projectData,
    cvLinkData,
    organizations,
    speaking,
    awards,
  ] = await Promise.all([
    getAbout(),
    getCounters(),
    getSkills(),
    getExperiencesWithSkills(),
    getProjectsWithSkills(),
    dbQuery('SELECT link_cv FROM cv LIMIT 1'),
    getOrganizations(),
    getSpeaking(),
    getAwards(),
  ]);

  const aboutContent = aboutData?.content || "Welcome! I'm Marsa, a junior web developer...";
  const projectCount = counters?.projects || 0;
  const experienceYears = counters?.experience || 0;
  const cvLink = cvLinkData?.[0]?.link_cv || null;

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
        <Skill skillItems={skillItems || []} />
        <Experience experienceData={experienceData || []} />
        <Project projectData={projectData || []} />
        <Activities organizations={organizations || []} speaking={speaking || []} />
        <Awards awards={awards || []} />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
