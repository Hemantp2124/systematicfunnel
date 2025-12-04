import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Clock, FileText, Activity, ArrowUpRight, MoreHorizontal,
  FolderOpen
} from 'lucide-react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onCreateProject: () => void;
}

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-surface border border-border p-6 rounded-card hover:border-primary/50 transition-colors cursor-pointer group shadow-subtle">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-surfaceSecondary rounded-button text-primaryForeground group-hover:bg-primary/80 group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-pill">
          <ArrowUpRight size={12} className="mr-1" />
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-textHeading">{value}</h3>
    <p className="text-sm text-textMuted mt-1">{title}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ projects, onCreateProject }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-textHeading">
            Dashboard
          </h1>
          <p className="text-textBody mt-1">
             Welcome back! Here's a summary of your projects.
          </p>
        </div>
        <button 
          onClick={onCreateProject}
          className="flex items-center gap-2 bg-accentDark hover:opacity-90 text-white px-6 py-3 rounded-button font-bold shadow-lg transition-all"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Projects" value={projects.length} icon={FolderOpen} trend="+1" />
        <StatCard title="Documents" value={projects.reduce((acc, p) => acc + p.documents.length, 0)} icon={FileText} trend="+12%" />
        <StatCard title="API Credits Used" value="550" icon={Activity} />
        <StatCard title="Hours Saved" value="~86h" icon={Clock} />
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-textHeading">Recent Projects</h2>
          <button onClick={() => navigate('/projects')} className="text-sm text-primaryForeground hover:underline">View All</button>
        </div>

        {projects.length === 0 ? (
           <div className="text-center py-20 border-2 border-dashed border-border rounded-card bg-surface">
              <FolderOpen size={48} className="mx-auto text-textMuted mb-4" />
              <h3 className="text-lg font-medium text-textHeading">No projects yet</h3>
              <p className="text-textBody mb-6 max-w-md mx-auto">
                Create your first project to generate PRDs, Roadmaps, and GTM strategies instantly.
              </p>
              <button 
                onClick={onCreateProject}
                className="text-primaryForeground font-bold hover:underline"
              >
                Create Project Now
              </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map(project => (
              <div 
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-surface border border-border rounded-card p-6 hover:border-primary/50 transition-all cursor-pointer group hover:-translate-y-1 shadow-subtle hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded-button bg-surfaceSecondary flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <button className="p-1 hover:bg-surfaceSecondary rounded-full text-textMuted">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-textHeading mb-2 group-hover:text-primaryForeground transition-colors">{project.name}</h3>
                <p className="text-sm text-textBody line-clamp-2 mb-4 h-10">
                  {project.concept}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                   <div className="w-full bg-surfaceSecondary rounded-full h-1.5">
                    <div 
                      className="bg-primaryForeground h-1.5 rounded-full" 
                      style={{ width: `${(project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-textMuted ml-3 whitespace-nowrap">
                    {project.documents.filter(d => d.status === 'completed').length}/{project.documents.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;