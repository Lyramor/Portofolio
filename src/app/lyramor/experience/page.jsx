'use client';
// src/app/lyramor/experience/page.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/navigation';
// Import GripVertical icon from the correct location
import { GripVertical } from 'lucide-react';

// Experience Item Component
const ExperienceItem = ({ experience, index, moveExperience, handleDelete }) => {
  const router = useRouter();
  
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'EXPERIENCE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'EXPERIENCE',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveExperience(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => preview(drop(node))}
      className={`bg-zinc-800 border border-zinc-700/50 rounded-lg mb-4 transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center p-4">
        <div 
          ref={drag} 
          className="mr-3 cursor-move text-zinc-500 hover:text-zinc-300"
        >
          <GripVertical size={20} />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium">{experience.position}</h3>
          <p className="text-zinc-400">
            {experience.company} • {experience.period}
          </p>
          {experience.technologies && (
            <p className="text-zinc-500 text-sm mt-1">
              Teknologi: {experience.technologies}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/lyramor/experience/edit?id=${experience.id}`)}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-700/50 hover:bg-zinc-700 rounded transition-colors"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(experience.id)}
            className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-700/50 hover:bg-zinc-700 rounded transition-colors"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/admin/experience');
      const data = await res.json();
      
      if (data.experiences) {
        setExperiences(data.experiences);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveExperience = async (dragIndex, hoverIndex) => {
    const dragExperience = experiences[dragIndex];
    const newExperiences = [...experiences];
    
    // Remove dragExperience from array
    newExperiences.splice(dragIndex, 1);
    // Insert it at the hover position
    newExperiences.splice(hoverIndex, 0, dragExperience);
    
    setExperiences(newExperiences);
    
    // Update order in database
    try {
      await fetch('/api/admin/experience/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experienceIds: newExperiences.map(exp => exp.id)
        }),
      });
    } catch (error) {
      console.error('Error updating experience order:', error);
      // Revert to original order if update fails
      fetchExperiences();
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengalaman ini?')) {
      try {
        const res = await fetch(`/api/admin/experience/delete?id=${id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          setExperiences(experiences.filter(exp => exp.id !== id));
        } else {
          alert('Gagal menghapus pengalaman');
        }
      } catch (error) {
        console.error('Error deleting experience:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pengalaman</h1>
        <Link
          href="/lyramor/experience/new"
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
        >
          <FiPlus size={18} />
          Tambah Pengalaman
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : experiences.length > 0 ? (
        <DndProvider backend={HTML5Backend}>
          <div>
            {experiences.map((experience, index) => (
              <ExperienceItem
                key={experience.id}
                experience={experience}
                index={index}
                moveExperience={moveExperience}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        </DndProvider>
      ) : (
        <div className="text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-400 mb-4">Belum ada entri pengalaman</p>
          <Link
            href="/lyramor/experience/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            <FiPlus size={18} />
            Tambahkan Pengalaman Pertama Anda
          </Link>
        </div>
      )}
    </div>
  );
}