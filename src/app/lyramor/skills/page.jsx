// src/app/lyramor/skills/page.jsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Tambahkan ini
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  FiCode, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiAlertCircle,
  FiMove,
  FiArchive,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const ITEM_TYPE = 'skill';

const DraggableSkill = ({ skill, index, moveSkill, handleDeleteClick, handleToggleArchive }) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index, id: skill.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item) => { // monitor tidak dipakai, bisa dihapus
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveSkill(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  preview(drop(ref));

  const dragHandle = useRef(null);
  drag(dragHandle);
  
  const cardStyle = `
    bg-zinc-800 border rounded-xl p-6 flex flex-col
    transition-all duration-200 transform
    ${isDragging ? 'opacity-50 scale-105 shadow-xl z-10 border-sky-500/50' : 'opacity-100 border-zinc-700'}
    ${isOver && !isDragging ? 'bg-zinc-750 border-zinc-600' : ''}
    ${skill.archived ? 'opacity-70 bg-zinc-900 border-zinc-800 line-through text-zinc-500' : ''}
  `;

  return (
    <div 
      ref={ref}
      className={cardStyle}
      style={{ 
        transition: 'all 0.2s ease',
      }}
    >
      <div className="flex items-center mb-4">
        <div 
          ref={dragHandle}
          className="mr-2 cursor-move text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-700 active:bg-zinc-600"
        >
          <FontAwesomeIcon icon={faGripLines} size="lg" />
        </div>
        
        {skill.imgSrc && (
          <div className={`w-10 h-10 bg-zinc-700 rounded-lg p-2 mr-3 flex items-center justify-center overflow-hidden ${skill.archived ? 'grayscale' : ''}`}>
            <Image // Ganti <img>
              src={skill.imgSrc.startsWith('/') ? skill.imgSrc : `/${skill.imgSrc}`} 
              alt={skill.label} 
              width={40} // w-10/h-10 setara 40px/40px
              height={40} // w-10/h-10 setara 40px/40px
              className="object-contain"
            />
          </div>
        )}
        
        <h3 className="text-lg font-medium">{skill.label}</h3>
      </div>
      
      <p className="text-zinc-400 text-sm mb-4 flex-grow">
        {skill.description || "No description provided"}
      </p>
      
      <div className="flex justify-between mt-4 pt-4 border-t border-zinc-700">
        <Link 
          href={`/lyramor/skills/${skill.id}`}
          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          <FiEdit2 size={16} />
          <span>Edit</span>
        </Link>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleArchive(skill, !skill.archived)}
            className={`p-2 rounded-lg transition-colors ${
              skill.archived 
                ? 'text-green-400 hover:text-green-300 bg-green-600/20 hover:bg-green-600/40' 
                : 'text-orange-400 hover:text-orange-300 bg-orange-600/20 hover:bg-orange-600/40'
            }`}
            title={skill.archived ? "Unarchive Skill" : "Archive Skill"}
          >
            {skill.archived ? <FiEye size={16} /> : <FiEyeOff size={16} />}
          </button>
          <button
            onClick={() => handleDeleteClick(skill)}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <FiTrash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SkillsIndexPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteSkill, setDeleteSkill] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filter, setFilter] = useState('active');

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/admin/skills?filter=${filter}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch skills');
      }
      
      const data = await res.json();
      
      const skillsWithOrder = data.map((skill, index) => ({
        ...skill,
        order: skill.order !== undefined ? skill.order : index
      }));
      
      skillsWithOrder.sort((a, b) => a.order - b.order);
      
      setSkills(skillsWithOrder);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Failed to load skills. Please try again.');
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const moveSkill = (fromIndex, toIndex) => {
    setIsDragging(true);
    
    setSkills(prevSkills => {
      const updatedSkills = [...prevSkills];
      const [movedSkill] = updatedSkills.splice(fromIndex, 1);
      updatedSkills.splice(toIndex, 0, movedSkill);
      
      return updatedSkills.map((skill, index) => ({
        ...skill,
        order: index
      }));
    });
    
    setOrderChanged(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const saveSkillOrder = async () => {
    try {
      setIsSavingOrder(true);
      
      const orderUpdates = skills.map((skill) => ({
        id: skill.id,
        order: skill.order
      }));
      
      const res = await fetch('/api/admin/skills/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills: orderUpdates }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update skill order');
      }
      
      setOrderChanged(false);
      toast.success('Skill order saved successfully!');
      fetchSkills();
    } catch (err) {
      console.error('Error saving skill order:', err);
      setError('Failed to save skill order. Please try again.');
      toast.error('Failed to save skill order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleToggleArchive = async (skillToUpdate, newArchivedStatus) => {
    try {
      const res = await fetch(`/api/admin/skills/${skillToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          label: skillToUpdate.label,
          imgSrc: skillToUpdate.imgSrc,
          description: skillToUpdate.description,
          archived: newArchivedStatus
        }), 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${newArchivedStatus ? 'archive' : 'unarchive'} skill`);
      }
      
      setSkills(prevSkills => 
        prevSkills.map(skill => 
          skill.id === skillToUpdate.id ? { ...skill, archived: newArchivedStatus } : skill
        )
      );
      toast.success(`Skill ${newArchivedStatus ? 'archived' : 'unarchived'} successfully!`);
      fetchSkills();
    } catch (err) {
      console.error('Error toggling archive status:', err);
      setError(err.message || `Failed to ${newArchivedStatus ? 'archive' : 'unarchive'} skill. Please try again.`);
      toast.error(`Failed to ${newArchivedStatus ? 'archive' : 'unarchive'} skill`);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/skills/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete skill');
      }
      
      setSkills(prevSkills => {
        const updatedSkills = prevSkills.filter(skill => skill.id !== id);
        
        return updatedSkills.map((skill, index) => ({
          ...skill,
          order: index
        }));
      });

      setOrderChanged(true);
      toast.success('Skill deleted successfully!');
      fetchSkills();
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError('Failed to delete skill. Please try again.');
      toast.error('Failed to delete skill');
    } finally {
      setIsDeleting(false);
      setDeleteSkill(null);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <FiCode className="text-sky-400 mr-3" size={24} />
            <h1 className="text-2xl font-bold">Skills Management</h1>
          </div>
          
          <div className="flex gap-4">
            {orderChanged && (
              <button
                onClick={saveSkillOrder}
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
              href="/lyramor/skills/new"
              className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            > 
              <FiPlus size={18} />
              <span>Add Skill</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
            <FiAlertCircle className="mr-2" size={18} />
            {error}
          </div>
        )}

        <div className="mb-6 flex space-x-3">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active' ? 'bg-sky-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            Active Skills
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'archived' ? 'bg-sky-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            Archived Skills
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-sky-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            All Skills
          </button>
        </div>


        {skills.length === 0 && !loading ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiCode className="text-zinc-500" size={48} />
            </div>
            <h3 className="text-xl font-medium mb-2">No Skills Found</h3>
            <p className="text-zinc-400 mb-6">
              You haven`&apos;`t added any skills yet. Start showcasing your expertise!
            </p>
            <Link 
              href="/lyramor/skills/new"
              className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            > 
              <FiPlus size={18} />
              <span>Add Your First Skill</span>
            </Link>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{ 
              perspective: '1000px',
              perspectiveOrigin: 'center'
            }}
          >
            {skills.map((skill, index) => (
              <div 
                key={skill.id}
                className="transition-transform duration-300 ease-in-out"
                style={{ 
                  transformStyle: 'preserve-3d',
                  willChange: isDragging ? 'transform, opacity' : 'auto' 
                }}
              >
                <DraggableSkill
                  skill={skill}
                  index={index}
                  moveSkill={moveSkill}
                  handleDeleteClick={setDeleteSkill}
                  handleToggleArchive={handleToggleArchive}
                />
              </div>
            ))}
          </div>
        )}

        {deleteSkill && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full m-4 animate-scaleIn">
              <h3 className="text-xl font-bold mb-4">Delete Skill</h3>
              <p className="text-zinc-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteSkill.label}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteSkill(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteSkill.id)}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <FiLoader className="animate-spin" size={16} />
                  ) : (
                    <FiTrash2 size={16} />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </DndProvider>
  );
}