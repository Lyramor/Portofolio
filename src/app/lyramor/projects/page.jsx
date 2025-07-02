'use client';
// src/app/lyramor/projects/page.jsx
import { useState, useEffect, useRef } from 'react'; // Import useRef
import Link from 'next/link';
import Image from 'next/image'; 
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical } from 'lucide-react'; // Untuk ikon drag handle
import { toast } from 'react-hot-toast'; // Untuk notifikasi

import { 
  FiBriefcase, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiAlertCircle,
  FiImage,
  FiTag,
  FiCalendar,
  FiLink as LinkIcon, // Mengganti nama FiLink agar tidak konflik dengan Link dari next/link
  FiMove, // Untuk tombol save order
  FiEye, // Untuk unarchive
  FiEyeOff // Untuk archive
} from 'react-icons/fi';

// Fungsi formatDate dipindahkan ke luar komponen utama agar dapat diakses oleh ProjectItem
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'; 
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Unknown'; 
  }
};

// Komponen Project Item yang dapat di-drag
const ProjectItem = ({ project, index, moveProject, confirmDelete, handleToggleArchive }) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'PROJECT',
    item: { index, id: project.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'PROJECT',
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index; // Perbaiki: Gunakan item.index
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveProject(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));
  const dragHandle = useRef(null);
  drag(dragHandle);

  const cardStyle = `
    bg-zinc-800 border rounded-xl p-6 flex flex-col
    transition-all duration-200 transform
    ${isDragging ? 'opacity-50 scale-105 shadow-xl z-10 border-sky-500/50' : 'opacity-100 border-zinc-700'}
    ${project.archived ? 'opacity-70 bg-zinc-900 border-zinc-800 line-through text-zinc-500' : ''}
  `;

  return (
    <div ref={ref} className={cardStyle}>
      <div className="flex items-start gap-4"> 
        {/* Drag Handle */}
        <div 
          ref={dragHandle}
          className="flex-shrink-0 mr-3 cursor-move text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-700 active:bg-zinc-600"
        >
          <GripVertical size={20} />
        </div>

        {/* Project Image */}
        <div className="flex-shrink-0"> 
          {project.image ? ( 
            <img 
              src={project.image} 
              alt={project.title}
              className={`w-20 h-20 object-cover rounded-lg ${project.archived ? 'grayscale' : ''}`}
              onError={(e) => { 
                e.target.onerror = null;
                e.target.src = '/images/default_project_image.png'; // Fallback image
              }}
            />
          ) : (
            <div className={`w-20 h-20 bg-zinc-700 rounded-lg flex items-center justify-center ${project.archived ? 'grayscale' : ''}`}> 
              <FiImage className="text-zinc-500" size={24} /> 
            </div>
          )} 
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0"> 
          <h3 className="text-lg font-semibold text-white mb-2">
            {project.title} {project.archived && <span className="text-sm text-zinc-600">(Archived)</span>}
          </h3> 
          {project.description && (
            <p className="text-zinc-400 mb-3 line-clamp-2">{project.description}</p> 
          )}

          {/* Skills */}
          {project.skill_labels && project.skill_labels.length > 0 && ( 
            <div className="flex items-center gap-2 mb-3"> 
              <FiTag className="text-zinc-500" size={14} /> 
              <div className="flex flex-wrap gap-1"> 
                {project.skill_labels.map((skill, index) => ( 
                  <span 
                    key={index}
                    className="px-2 py-1 bg-sky-600/20 text-sky-400 text-xs rounded-md" 
                  >
                    {skill}
                  </span>
                ))} 
              </div>
            </div>
          )}

          {/* Project Link */}
          {project.link && (
            <div className="flex items-center text-zinc-500 text-sm mb-1">
              <LinkIcon className="mr-1" size={14} />
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sky-400 hover:underline truncate"
              >
                {project.link}
              </a>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center text-zinc-500 text-sm"> 
            <FiCalendar className="mr-1" size={14} /> 
            <span>Created: {formatDate(project.created_at)}</span> 
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2"> 
          <button
            onClick={() => handleToggleArchive(project, !project.archived)}
            className={`p-2 rounded-lg transition-colors ${
              project.archived 
                ? 'text-green-400 hover:text-green-300 bg-green-600/20 hover:bg-green-600/40' 
                : 'text-orange-400 hover:text-orange-300 bg-orange-600/20 hover:bg-orange-600/40'
            }`}
            title={project.archived ? "Unarchive Project" : "Archive Project"}
          >
            {project.archived ? <FiEye size={16} /> : <FiEyeOff size={16} />}
          </button>
          <Link
            href={`/lyramor/projects/${project.id}/edit`} 
            className="p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-700 rounded-lg transition-colors"
            title="Edit Project" 
          >
            <FiEdit2 size={18} /> 
          </Link>
          
          <button
            onClick={() => confirmDelete(project.id, project.title)}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors" 
            title="Delete Project" 
          >
            <FiTrash2 size={18} /> 
          </button> 
        </div>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [deleteTitle, setDeleteTitle] = useState(''); 
  const [isDeleting, setIsDeleting] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [orderChanged, setOrderChanged] = useState(false); // State untuk melacak perubahan urutan
  const [isSavingOrder, setIsSavingOrder] = useState(false); // State untuk loading tombol save
  const [filter, setFilter] = useState('active'); // 'active', 'archived', 'all'

  useEffect(() => {
    fetchProjects();
  }, [filter]); // Muat ulang proyek saat filter berubah

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/admin/projects?filter=${filter}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      // Pastikan data memiliki properti 'order' dan urutkan di frontend juga
      const projectsWithOrder = data.map((project, index) => ({
        ...project,
        order: project.order !== undefined ? project.order : index
      }));
      projectsWithOrder.sort((a, b) => a.order - b.order);

      setProjects(projectsWithOrder);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load project data. Please try again.');
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const moveProject = (dragIndex, hoverIndex) => {
    setProjects(prevProjects => {
      const updatedProjects = [...prevProjects];
      const [movedProject] = updatedProjects.splice(dragIndex, 1);
      updatedProjects.splice(hoverIndex, 0, movedProject);
      
      // Perbarui properti order untuk mencerminkan urutan baru di state lokal
      return updatedProjects.map((project, index) => ({
        ...project,
        order: index
      }));
    });
    setOrderChanged(true); // Set orderChanged menjadi true
  };

  const saveProjectOrder = async () => {
    setIsSavingOrder(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/projects/reorder', {
        method: 'PUT', // Menggunakan PUT untuk reorder
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectIds: projects.map(proj => proj.id)
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update project order');
      }
      
      setOrderChanged(false);
      toast.success('Project order saved successfully!');
      fetchProjects(); // Muat ulang untuk memastikan konsistensi
    } catch (error) {
      console.error('Error saving project order:', error);
      setError(error.message || 'An error occurred while saving order.');
      toast.error('Failed to save project order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleToggleArchive = async (projectToUpdate, newArchivedStatus) => {
    try {
      // Kita perlu mengirim semua data yang diperlukan oleh API PUT projects/[id]
      // karena API tersebut mengharapkan semua field untuk update.
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', projectToUpdate.title);
      formDataToSubmit.append('description', projectToUpdate.description || ''); // Pastikan tidak undefined
      formDataToSubmit.append('link', projectToUpdate.link || ''); // Pastikan tidak undefined
      formDataToSubmit.append('order', projectToUpdate.order);
      formDataToSubmit.append('archived', newArchivedStatus ? 'true' : 'false'); // Kirim sebagai string 'true'/'false'
      formDataToSubmit.append('skills', JSON.stringify(projectToUpdate.skill_ids || []));
      
      // Logika untuk mengirim gambar
      // Jika projectToUpdate.image ada, kita perlu memberi sinyal ke backend bahwa gambar tidak berubah
      // atau jika dihapus, sinyal untuk menghapus
      if (projectToUpdate.image) {
        // Tidak perlu mengirim file 'image' jika tidak ada perubahan.
        // Backend akan mempertahankan gambar yang sudah ada jika tidak ada file 'image' baru.
        // Namun, jika kita ingin menghapus gambar lama, kita harus memberi sinyal 'image_cleared'.
        // Untuk kasus toggle archive, kita asumsikan gambar tidak berubah, jadi tidak perlu mengirim file.
      } else {
        // Jika tidak ada gambar sebelumnya, dan tidak ada gambar baru, pastikan path gambar di DB kosong.
        // Ini penting jika sebelumnya ada gambar dan sekarang dihapus.
        formDataToSubmit.append('image_cleared', 'true'); 
      }

      const res = await fetch(`/api/admin/projects/${projectToUpdate.id}`, {
        method: 'PUT',
        body: formDataToSubmit, // Gunakan FormData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${newArchivedStatus ? 'archive' : 'unarchive'} project`);
      }
      
      // Update state lokal untuk respons UI yang cepat
      setProjects(prevProjects => 
        prevProjects.map(proj => 
          proj.id === projectToUpdate.id ? { ...proj, archived: newArchivedStatus } : proj
        )
      );
      toast.success(`Project ${newArchivedStatus ? 'archived' : 'unarchived'} successfully!`);
      fetchProjects(); // Muat ulang untuk menerapkan filter jika perlu
    } catch (err) {
      console.error('Error toggling archive status:', err);
      setError(err.message || `Failed to ${newArchivedStatus ? 'archive' : 'unarchive'} project. Please try again.`);
      toast.error(`Failed to ${newArchivedStatus ? 'archive' : 'unarchive'} project`);
    }
  };


  const handleDelete = async (id) => {
    if (!deleteId) return;

    setIsDeleting(true); 
    try {
      const res = await fetch(`/api/admin/projects/${deleteId}`, { 
        method: 'DELETE', 
      });

      if (!res.ok) {
        const errorData = await res.json(); 
        throw new Error(errorData.error || 'Failed to delete project');
      }

      setProjects(projects.filter(project => project.id !== deleteId)); 
      setShowDeleteModal(false); 
      setDeleteId(null);
      setDeleteTitle('');
      toast.success('Project deleted successfully!');
      fetchProjects(); // Muat ulang untuk memastikan konsistensi
    } catch (err) {
      console.error('Error deleting project:', err); 
      setError(err.message || 'Failed to delete project. Please try again.');
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false); 
    }
  };

  const confirmDelete = (id, title) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'; 
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown'; 
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <FiBriefcase className="text-sky-400 mr-3" size={24} /> 
            <h1 className="text-2xl font-bold">Project Management</h1> 
          </div>
          <div className="flex gap-4">
            {orderChanged && (
              <button
                onClick={saveProjectOrder}
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
              href="/lyramor/projects/new"
              className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            > 
              <FiPlus size={18} /> 
              <span>Add New Project</span> 
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center">
            <FiAlertCircle className="mr-2" size={18} /> 
            {error}
          </div>
        )} 

        {/* Tombol Filter */}
        <div className="mb-6 flex space-x-3">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active' ? 'bg-sky-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            Active Projects
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'archived' ? 'bg-sky-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            Archived Projects
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-sky-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            All Projects
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center">
            <FiBriefcase className="mx-auto text-zinc-600 mb-4" size={48} /> 
            <h3 className="text-lg font-medium text-zinc-400 mb-2">No projects yet</h3> 
            <p className="text-zinc-500 mb-4">Start by adding your first project</p> 
            <Link
              href="/lyramor/projects/new"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors"
            > 
              <FiPlus size={18} /> 
              <span>Add Your First Project</span> 
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project, index) => ( 
              <ProjectItem
                key={project.id}
                project={project}
                index={index}
                moveProject={moveProject}
                confirmDelete={confirmDelete}
                handleToggleArchive={handleToggleArchive}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full m-4 animate-scaleIn">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3> 
              <p className="text-zinc-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteTitle}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? ( 
                    <FiLoader className="animate-spin" size={18} /> 
                  ) : (
                    <FiTrash2 size={18} /> 
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add global styles for animations */}
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
      </div>
    </DndProvider>
  );
}
