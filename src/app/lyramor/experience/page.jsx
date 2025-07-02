'use client';
// src/app/lyramor/experience/page.js
import React, { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiLoader, FiMove, FiAlertCircle } from 'react-icons/fi'; 
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/navigation';
import { GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Import toast for notifications

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

  // Memecah string technologies menjadi array tag individual
  const technologiesArray = experience.technologies 
    ? experience.technologies.split(',').map(tech => tech.trim()) 
    : [];

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
          
          {/* Tampilkan teknologi sebagai tag biru */}
          {technologiesArray.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {technologiesArray.map((tech, idx) => (
                <span 
                  key={idx} // Gunakan idx sebagai key karena tech mungkin duplikat
                  className="px-2 py-1 bg-sky-600/20 text-sky-400 text-xs rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
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
  const [error, setError] = useState(null); // State untuk error
  const [orderChanged, setOrderChanged] = useState(false); // State untuk melacak perubahan urutan
  const [isSavingOrder, setIsSavingOrder] = useState(false); // State untuk loading tombol save
  const router = useRouter();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error
      const res = await fetch('/api/admin/experience');
      const data = await res.json();
      
      if (data.experiences) {
        setExperiences(data.experiences);
      } else {
        setError('Failed to fetch experiences data.'); // Set error jika data tidak sesuai
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      setError('Failed to load experiences. Please try again later.'); // Set error
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const moveExperience = (dragIndex, hoverIndex) => {
    const dragExperience = experiences[dragIndex];
    const newExperiences = [...experiences];
    
    newExperiences.splice(dragIndex, 1);
    newExperiences.splice(hoverIndex, 0, dragExperience);
    
    setExperiences(newExperiences);
    setOrderChanged(true); // Set orderChanged menjadi true
  };

  const saveExperienceOrder = async () => {
    setIsSavingOrder(true);
    setError(null); // Reset error
    try {
      const res = await fetch('/api/admin/experience/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experienceIds: experiences.map(exp => exp.id)
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update experience order');
      }
      
      setOrderChanged(false); // Reset orderChanged setelah berhasil disimpan
      toast.success('Experience order saved successfully!');
      fetchExperiences(); // Muat ulang data untuk memastikan konsistensi
    } catch (error) {
      console.error('Error updating experience order:', error);
      setError(error.message || 'An error occurred while saving order.');
      toast.error('Failed to save experience order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this experience? This action cannot be undone.')) { 
      try {
        const res = await fetch(`/api/admin/experience/delete?id=${id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          setExperiences(experiences.filter(exp => exp.id !== id));
          toast.success('Experience deleted successfully!');
          router.refresh(); // Refresh halaman untuk memastikan data terbaru
        } else {
          const errorData = await res.json();
          setError(errorData.error || 'Failed to delete experience'); 
          toast.error('Failed to delete experience');
        }
      } catch (error) {
        console.error('Error deleting experience:', error);
        setError('An error occurred while deleting experience');
        toast.error('An error occurred while deleting experience');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Experiences</h1> 
        <div className="flex gap-4">
          {orderChanged && (
            <button
              onClick={saveExperienceOrder}
              disabled={isSavingOrder}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSavingOrder ? (
                <FiLoader className="animate-spin" size={18} />
              ) : (
                <FiMove size={18} />
              )}
              <span>Save Order</span>
            </button>
          )}
          <Link
            href="/lyramor/experience/new"
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            <FiPlus size={18} />
            Add Experience 
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={18} />
          {error}
        </div>
      )}

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
          <p className="text-zinc-400 mb-4">No experience entries yet</p> 
          <Link
            href="/lyramor/experience/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            <FiPlus size={18} />
            Add Your First Experience 
          </Link>
        </div>
      )}
    </div>
  );
}
