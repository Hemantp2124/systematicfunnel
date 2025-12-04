import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FolderOpen } from 'lucide-react';
import { Project } from '../types';

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.concept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textHeading">All Projects</h1>
          <p className="text-textBody">Manage and view all your documentation projects.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
            <input 
              type="text" 
              placeholder="Filter projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-pill pl-12 pr-4 py-3 text-sm focus:border-primary/50 outline-none"
            />
          </div>
          <button className="p-3 border border-border rounded-button hover:bg-surfaceSecondary text-icon">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
             <div 
               key={project.id}
               onClick={() => navigate(`/project/${project.id}`)}
               className="bg-surface border border-border rounded-card p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg flex flex-col shadow-subtle"
             >
               <div className="flex justify-between items-start mb-3">
                 <FolderOpen className="text-primaryForeground" size={28} />
                 <span className="text-xs text-textMuted">{new Date(project.createdAt).toLocaleDateString()}</span>
               </div>
               <h3 className="font-bold text-textHeading mb-2 mt-2">{project.name}</h3>
               <p className="text-sm text-textBody line-clamp-2 mb-4 flex-1">
                 {project.concept}
               </p>
               <div className="w-full bg-surfaceSecondary rounded-full h-1.5 mb-2">
                 <div 
                   className="bg-primaryForeground h-1.5 rounded-full transition-all duration-1000" 
                   style={{ width: `${(project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100}%` }}
                 ></div>
               </div>
               <div className="text-xs text-textMuted flex justify-between">
                  <span>Progress</span>
                  <span>{Math.round((project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100)}%</span>
               </div>
             </div>
          ))}
        </div>
      ) : (
        <div className="col-span-full py-20 text-center text-textMuted border-2 border-dashed border-border rounded-card bg-surface">
          <FolderOpen size={48} className="mx-auto text-textMuted/50 mb-4" />
          <h3 className="text-lg font-medium text-textHeading">
            {projects.length > 0 ? `No projects found for "${searchQuery}"` : "No projects created yet."}
          </h3>
          <p className="text-sm text-textBody mt-2">
            {projects.length > 0 ? "Try a different search term." : "Get started by creating a new project."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Projects;