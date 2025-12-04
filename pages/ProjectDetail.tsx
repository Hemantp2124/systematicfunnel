import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, RefreshCw, User, ArrowRight
} from 'lucide-react';
import { Project, DocType } from '../types';
import DocViewer from '../components/DocViewer';
import FunnelSidebar from '../components/FunnelSidebar';
import { getDocMetadata } from '../api/aiService';
import { HIERARCHY_GROUPS } from '../data/hierarchy';
import JSZip from 'jszip';
import { Loader2 } from 'lucide-react';

interface ProjectDetailProps {
  projects: Project[];
  onRegenerateDoc: (projectId: string, docType: DocType) => void;
  onUpdateDoc?: (projectId: string, docId: string, content: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, onRegenerateDoc, onUpdateDoc }) => {
  const { id } = useParams<{id: string}>();
  const project = projects.find(p => p.id === id);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    if (project) {
      // Find first pending or generating doc to select, or default to first doc
      const firstActionable = project.documents.find(d => d.status === 'pending' || d.status === 'generating');
      if (firstActionable) {
        setSelectedDocId(firstActionable.id);
      } else if (project.documents.length > 0 && !selectedDocId) {
        setSelectedDocId(project.documents[0].id);
      }
      
      // Expand group of selected doc
      const selectedDoc = project.documents.find(d => d.id === (firstActionable?.id || project.documents[0]?.id));
      if(selectedDoc) {
          const meta = getDocMetadata(selectedDoc.type);
          if (meta && !expandedGroups.includes(meta.category)) {
              setExpandedGroups(prev => [...prev, meta.category]);
          }
      }
    }
  }, [project, selectedDocId]);

  if (!project) return (
    <div className="flex items-center justify-center h-full text-textMuted">
      <Loader2 className="animate-spin mr-2" /> Loading project...
    </div>
  );

  const selectedDoc = project.documents.find(d => d.id === selectedDocId);
  const metadata = selectedDoc ? getDocMetadata(selectedDoc.type) : null;

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };
  
  const handleNextStep = () => {
    if (!metadata || !metadata.nextDocs || metadata.nextDocs.length === 0) return;
    const nextType = metadata.nextDocs[0];
    const nextDoc = project.documents.find(d => d.type === nextType);
    
    if (nextDoc) {
      if (nextDoc.status === 'pending') {
        onRegenerateDoc(project.id, nextType);
      }
      setSelectedDocId(nextDoc.id);
    }
  };


  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderName = project.name.replace(/[^a-z0-9]/gi, '_');
      const folder = zip.folder(folderName);
      if (folder) {
        project.documents.forEach(doc => {
          if (doc.content) folder.file(`${doc.title}.md`, doc.content);
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${folderName}_docs.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) { console.error(e); }
    setIsZipping(false);
  };

  const groupedDocs: Record<string, typeof project.documents> = {};
  HIERARCHY_GROUPS.forEach(g => {
    const docsInGroup = project.documents.filter(doc => getDocMetadata(doc.type)?.category === g);
    if (docsInGroup.length > 0) {
      groupedDocs[g] = docsInGroup;
    }
  });

  return (
    <div className="flex h-[calc(100vh-104px)] md:h-[calc(100vh-89px)]">
      {/* Funnel Sidebar */}
      <div className="w-96 bg-surface border-r border-border flex flex-col shrink-0 h-full z-10 rounded-l-card">
        <div className="p-5 border-b border-border">
          <Link to="/projects" className="flex items-center text-xs text-textMuted hover:text-primaryForeground mb-3">
            <ArrowLeft size={14} className="mr-1" /> Back to Projects
          </Link>
          <h2 className="font-bold truncate text-lg text-textHeading">{project.name}</h2>
          <div className="mt-2 text-xs text-textMuted flex justify-between items-center">
            <span>Progress</span>
            <span className="font-semibold text-primaryForeground">{project.documents.filter(d => d.status === 'completed').length} / {project.documents.length}</span>
          </div>
          <div className="w-full bg-surfaceSecondary rounded-full h-1 mt-1">
             <div className="bg-primaryForeground h-1 rounded-full" style={{width: `${(project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100}%`}}></div>
          </div>
        </div>
        
        <FunnelSidebar 
          groupedDocs={groupedDocs}
          expandedGroups={expandedGroups}
          toggleGroup={toggleGroup}
          selectedDocId={selectedDocId}
          onSelectDoc={(id) => setSelectedDocId(id)}
        />

        <div className="p-4 border-t border-border">
          <button onClick={handleDownloadZip} disabled={isZipping} className="w-full flex items-center justify-center gap-2 py-3 bg-surfaceSecondary border border-border rounded-button hover:bg-border text-xs font-bold transition-colors">
            {isZipping ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download All Docs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-bgMain h-full overflow-hidden">
        {selectedDoc && metadata ? (
          <>
            <div className="bg-surface/80 backdrop-blur-sm border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h3 className="text-xl font-bold text-textHeading">{metadata.title}</h3>
                 <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                    <span className="bg-surfaceSecondary border border-border px-2 py-0.5 rounded-pill flex items-center gap-1.5">
                      <User size={12} /> Owner: {metadata.owner}
                    </span>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => onRegenerateDoc(project.id, selectedDoc.type)}
                   className="p-3 hover:bg-surfaceSecondary rounded-button text-icon hover:text-primaryForeground transition-colors"
                   title="Regenerate"
                 >
                   <RefreshCw size={18} className={selectedDoc.status === 'generating' ? 'animate-spin' : ''} />
                 </button>
                 
                 {metadata.nextDocs && metadata.nextDocs.length > 0 && (
                   <button 
                     onClick={handleNextStep}
                     className="flex items-center gap-2 bg-accentDark hover:opacity-90 text-white px-4 py-2 rounded-button text-sm font-bold shadow-lg transition-all"
                   >
                      {metadata.cta} <ArrowRight size={16} />
                   </button>
                 )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <DocViewer 
                  document={selectedDoc} 
                  onUpdate={(content) => onUpdateDoc && onUpdateDoc(project.id, selectedDoc.id, content)} 
                />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-textMuted">Select a document to view</div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;