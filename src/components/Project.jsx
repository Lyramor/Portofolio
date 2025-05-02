/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

import React from 'react';
import ProjectCard from './ProjectCard';

const projectData = [
  {
    title: 'Aplikasi E-Commerce',
    description: 'Aplikasi e-commerce modern dengan fitur keranjang belanja, pembayaran terintegrasi, dan sistem manajemen produk yang komprehensif. Dibangun menggunakan arsitektur microservice dengan teknologi cloud untuk skalabilitas maksimal.',
    image: '/images/project/project.jpeg',
    technologies: ['React.js', 'Node.js', 'MongoDB', 'AWS']
  },
  {
    title: 'Aplikasi Dashboard Analytics',
    description: 'Dashboard analitik interaktif untuk visualisasi data bisnis dengan grafik real-time dan laporan yang dapat disesuaikan. Sistem ini memungkinkan pengambilan keputusan yang lebih baik berbasis data dengan dukungan machine learning.',
    image: '/images/project/project.jpeg',
    technologies: ['Vue.js', 'Express', 'PostgreSQL', 'D3.js']
  },
  {
    title: 'Sistem Manajemen Konten',
    description: 'CMS yang dapat disesuaikan untuk mengelola konten digital dengan fitur editor WYSIWYG, manajemen pengguna, dan sistem penerbitan yang fleksibel. Mendukung multi-bahasa dan memiliki API yang dapat diakses untuk integrasi pihak ketiga.',
    image: '/images/project/project.jpeg',
    technologies: ['Next.js', 'GraphQL', 'MySQL', 'AWS S3']
  },
  {
    title: 'Aplikasi Mobile Fintech',
    description: 'Aplikasi fintech mobile untuk pembayaran digital, transfer uang, dan manajemen keuangan pribadi. Dilengkapi dengan fitur keamanan tingkat tinggi dan analitik pengeluaran yang komprehensif untuk pengguna.',
    image: '/images/project/project.jpeg',
    technologies: ['React Native', 'Firebase', 'Redux', 'Node.js']
  },
  {
    title: 'Platform Pembelajaran Online',
    description: 'Platform e-learning dengan kursus video interaktif, sistem tugas dan penilaian, serta ruang diskusi langsung. Didukung dengan teknologi streaming adaptif untuk pengalaman belajar yang optimal pada berbagai perangkat.',
    image: '/images/project/project.jpeg',
    technologies: ['Angular', 'Django', 'PostgreSQL', 'WebRTC']
  },
  {
    title: 'Sistem Otomatisasi IoT',
    description: 'Sistem kontrol otomatisasi rumah pintar berbasis IoT dengan dashboard kontrol yang user-friendly, integrasi dengan asisten suara, dan kemampuan pemantauan jarak jauh melalui aplikasi mobile.',
    image: '/images/project/project.jpeg',
    technologies: ['React.js', 'Node.js', 'MQTT', 'MongoDB']
  }
];

export default function Project() {
  return (
    <section 
      id="project" 
      className="section bg-gradient-to-b from-zinc-950 to-zinc-900"
    >
      <div className="project-container">
        <h2 className="headline-2 mb-10 text-center">
          My Project Highlights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectData.map((project, index) => (
            <ProjectCard 
              key={index}
              title={project.title}
              description={project.description}
              image={project.image}
              technologies={project.technologies}
            />
          ))}
        </div>
      </div>
    </section>
  );
}