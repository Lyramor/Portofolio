'use client';
// src/components/AboutSection.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AboutSection() {
  const [aboutContent, setAboutContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/api/about');
        
        if (!response.ok) {
          throw new Error('Failed to fetch about content');
        }
        
        const data = await response.json();
        if (data.content) {
          setAboutContent(data.content);
        }
      } catch (error) {
        console.error('Error loading about content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <section id="about" className="py-16 md:py-24 bg-zinc-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">About Me</h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse bg-zinc-800 h-4 w-full max-w-2xl rounded"></div>
            </div>
          ) : (
            <p className="text-zinc-300 mb-4 md:mb-8 md:text-xl md:max-w-[60ch]">
              {aboutContent}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}