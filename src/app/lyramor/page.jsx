  'use client';
  // src/app/lyramor/page.js - Updated with new card order
  import { useState, useEffect } from 'react';
  import Link from 'next/link';
  import { 
    FiGrid, 
    FiCode, 
    FiUsers, 
    FiEdit, 
    FiInfo, 
    FiBriefcase,
    FiBarChart2,
    FiClock
  } from 'react-icons/fi';

  export default function DashboardHome() {
    const [stats, setStats] = useState({
      projects: 0,
      skills: 0,
      about: 0,
      experience: 0,
      counterProjects: 0,
      counterExperience: 0,
      users: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/admin/stats');
          const data = await res.json();
          setStats(data);
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, []);

    // Updated statCards to match the requested order
    const statCards = [
      {
        title: 'About',
        value: stats.about,
        icon: <FiInfo size={24} />,
        link: '/lyramor/about',
        color: 'bg-purple-500',
      },
      {
        title: 'Project Counter',
        value: stats.counterProjects,
        icon: <FiBarChart2 size={24} />,
        link: '/lyramor/counters',
        color: 'bg-pink-500',
      },
      {
        title: 'Experience Counter',
        value: stats.counterExperience,
        icon: <FiClock size={24} />,
        link: '/lyramor/counters',
        color: 'bg-indigo-500',
      },
      {
        title: 'Skills',
        value: stats.skills,
        icon: <FiCode size={24} />,
        link: '/lyramor/skills',
        color: 'bg-green-500',
      },
      {
        title: 'Experience',
        value: stats.experience,
        icon: <FiBriefcase size={24} />,
        link: '/lyramor/experience',
        color: 'bg-yellow-500',
      },
      {
        title: 'Projects',
        value: stats.projects,
        icon: <FiGrid size={24} />,
        link: '/lyramor/projects',
        color: 'bg-blue-500',
      },
    ];

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to your Portfolio Admin</h1>
          <p className="text-zinc-400">
            Manage your portfolio content and settings from this dashboard.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div 
                key={i}
                className="bg-zinc-800 rounded-xl p-6 h-32 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => (
              <Link
                key={card.title}
                href={card.link}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-zinc-400 text-sm">{card.title}</p>
                    <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
                  </div>
                  <div className={`${card.color} bg-opacity-20 p-3 rounded-lg`}>
                    <div className={`${card.color} bg-opacity-20 text-white`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {/* Update the order of quick actions links */}
              <Link 
                href="/lyramor/about" 
                className="flex items-center w-full p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <FiInfo className="mr-3" />
                Edit About Section
              </Link>
              <Link 
                href="/lyramor/counters" 
                className="flex items-center w-full p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <FiEdit className="mr-3" />
                Edit Counters
              </Link>
              <Link 
                href="/lyramor/skills/new" 
                className="flex items-center w-full p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <FiCode className="mr-3" />
                Add New Skill
              </Link>
              <Link 
                href="/lyramor/experience/new" 
                className="flex items-center w-full p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <FiBriefcase className="mr-3" />
                Add New Experience
              </Link>
              <Link 
                href="/lyramor/projects/new" 
                className="flex items-center w-full p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <FiGrid className="mr-3" />
                Add New Project
              </Link>
            </div>
          </div>
          
          <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Getting Started</h2>
            <ul className="space-y-2 text-zinc-300">
              <li>• Edit your portfolio content from the sidebar options</li>
              <li>• Update your About section to tell visitors about yourself</li>
              <li>• Manage counter statistics for your experience and projects</li>
              <li>• Update your skills and technologies</li>
              <li>• Add work experience to showcase your professional journey</li>
              <li>• Add new projects and link them to your skills</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }