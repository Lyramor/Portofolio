'use client';
// src/app/lyramor/projects/new/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiImage, FiLink, FiUpload } from 'react-icons/fi';

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    imageUrl: '',
    imageType: 'upload', // 'upload' or 'url'
    selectedSkills: []
  });
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/admin/skills/list');
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillChange = (e) => {
    const skillId = parseInt(e.target.value);
    if (e.target.checked) {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, skillId]
      });
    } else {
      setFormData({
        ...formData,
        selectedSkills: formData.selectedSkills.filter(id => id !== skillId)
      });
    }
  };

  const handleImageTypeChange = (type) => {
    setFormData({
      ...formData,
      imageType: type,
      // Reset image values when switching types
      image: type === 'upload' ? formData.image : null,
      imageUrl: type === 'url' ? formData.imageUrl : ''
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      // Create a preview URL for the image
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clean up the object URL when it's no longer needed
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create form data for multipart/form-data submission
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      
      if (formData.imageType === 'upload' && formData.image) {
        submitData.append('image', formData.image);
      } else if (formData.imageType === 'url' && formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }
      
      // Append selected skills
      formData.selectedSkills.forEach(skillId => {
        submitData.append('skills[]', skillId);
      });

      const res = await fetch('/api/admin/project', {
        method: 'POST',
        body: submitData,
        // Don't set Content-Type header, let the browser set it with boundary for FormData
      });

      if (res.ok) {
        router.push('/lyramor/project');
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Add New Project</h1>
        <button
          onClick={() => router.push('/lyramor/projects')}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiX size={18} />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-zinc-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-zinc-300 mb-2">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 h-40"
                required
              ></textarea>
            </div>

            {/* Image Type Toggle */}
            <div>
              <label className="block text-zinc-300 mb-3">Image Source</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleImageTypeChange('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    formData.imageType === 'upload'
                      ? 'bg-sky-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  <FiUpload size={18} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => handleImageTypeChange('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    formData.imageType === 'url'
                      ? 'bg-sky-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  <FiLink size={18} />
                  External URL
                </button>
              </div>
            </div>

            {/* Image Upload */}
            {formData.imageType === 'upload' && (
              <div>
                <label htmlFor="image" className="block text-zinc-300 mb-2">
                  Project Image
                </label>
                <div className="border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center justify-center py-6"
                  >
                    <FiImage size={48} className="text-zinc-400 mb-4" />
                    <span className="text-zinc-300 font-medium mb-1">
                      Click to upload image
                    </span>
                    <span className="text-zinc-500 text-sm">
                      Supports: JPG, PNG, SVG, GIF, etc.
                    </span>
                  </label>
                  {previewUrl && (
                    <div className="mt-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-sm text-zinc-400 mt-2">
                        {formData.image?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Image URL */}
            {formData.imageType === 'url' && (
              <div>
                <label htmlFor="imageUrl" className="block text-zinc-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {formData.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.imageUrl}
                      alt="URL Preview"
                      className="max-h-40 mx-auto rounded-lg object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAyNGgtMjR2LTI0aDI0djI0em0tMTEtN2wtMi41LTIuNS0zLjUgNC41aDE0bC01LjUtNy4yLTIuNSAzLjJ6bS03LjUtOWMwIDEuMjcxIDEuMDczIDIuMjUgMi4zMjEgMi4yNSAxLjI0OCAwIDIuMzIxLS45NzkgMi4zMjEtMi4yNSAwLTEuMjgyLTEuMDczLTIuMjUtMi4zMjEtMi4yNS0xLjI0OCAwLTIuMzIxLjk2OC0yLjMyMSAyLjI1eiIvPjwvc3ZnPg==';
                        e.target.classList.add('p-8');
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Skills */}
            <div>
              <label className="block text-zinc-300 mb-4">
                Select Skills Used
              </label>
              <div className="bg-zinc-700 border border-zinc-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                {skills.length === 0 ? (
                  <p className="text-zinc-400 text-center py-4">No skills found</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`skill-${skill.id}`}
                          value={skill.id}
                          checked={formData.selectedSkills.includes(skill.id)}
                          onChange={handleSkillChange}
                          className="w-4 h-4 rounded border-zinc-500 text-sky-600 focus:ring-sky-500 focus:ring-offset-zinc-800"
                        />
                        <label
                          htmlFor={`skill-${skill.id}`}
                          className="flex items-center gap-2 cursor-pointer py-1"
                        >
                          {skill.imgSrc && (
                            <img
                              src={skill.imgSrc}
                              alt={skill.label}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span>{skill.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiSave size={18} />
                <span>Save Project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}