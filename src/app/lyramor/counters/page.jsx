'use client';
// src/app/lyramor/counters/page.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBarChart2, FiClock, FiArrowRight } from 'react-icons/fi';

export default function CountersPage() {
  const [stats, setStats] = useState({
    counterProjects: 0,
    counterExperience: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats({
          counterProjects: data.counterProjects,
          counterExperience: data.counterExperience,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const counters = [
    {
      title: 'Project Counter',
      description: 'Update the number of projects completed that displays on your portfolio.',
      icon: <FiBarChart2 size={24} />,
      link: '/lyramor/counters/projects',
      color: 'bg-pink-500',
    },
    {
      title: 'Experience Counter',
      description: 'Update the years of experience that displays on your portfolio.',
      icon: <FiClock size={24} />,
      link: '/lyramor/counters/experience',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Portfolio Counters</h1>
        <p className="text-zinc-400">
          Manage the counter statistics that appear on your portfolio homepage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {counters.map((counter) => (
          <Link
            key={counter.title}
            href={counter.link}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className={`${counter.color} bg-opacity-20 p-3 rounded-lg mr-4`}>
                <div className={`${counter.color} bg-opacity-20 text-white`}>
                  {counter.icon}
                </div>
              </div>
              <h2 className="text-xl font-semibold">{counter.title}</h2>
            </div>
            
            <p className="text-zinc-400 mb-4">{counter.description}</p>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-sky-400">
                <span>Manage</span>
                <FiArrowRight className="ml-2" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}