import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, XCircle, FileText } from 'lucide-react';
import { Document } from '../types';

interface FunnelSidebarProps {
  groupedDocs: Record<string, Document[]>;
  expandedGroups: string[];
  toggleGroup: (group: string) => void;
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
}

const FunnelSidebar: React.FC<FunnelSidebarProps> = ({
  groupedDocs,
  expandedGroups,
  toggleGroup,
  selectedDocId,
  onSelectDoc,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
      {Object.keys(groupedDocs).map((group, index, arr) => {
        const docs = groupedDocs[group];
        const isExpanded = expandedGroups.includes(group);
        const completedDocs = docs.filter(d => d.status === 'completed').length;
        const totalDocs = docs.length;

        return (
          <div key={group}>
            <div 
              onClick={() => toggleGroup(group)}
              className="flex items-center gap-3 p-2 rounded-button cursor-pointer hover:bg-surfaceSecondary transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-bold text-sm text-textHeading">{group.substring(group.indexOf(' ') + 1)}</h3>
                <p className="text-xs text-textMuted">{completedDocs} of {totalDocs} completed</p>
              </div>
              {isExpanded ? <ChevronDown size={18} className="text-textMuted" /> : <ChevronRight size={18} className="text-textMuted"/>}
            </div>
            
            {isExpanded && (
              <div className="pl-4 pt-2 space-y-1 animate-in fade-in duration-200">
                {docs.map(doc => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <div 
                      key={doc.id} 
                      onClick={() => onSelectDoc(doc.id)}
                      className={`flex items-center gap-3 p-3 rounded-button cursor-pointer text-sm transition-all ${
                         isSelected ? 'bg-primary text-primaryForeground font-bold' : 'text-textBody hover:bg-surfaceSecondary hover:text-textHeading'
                      }`}
                    >
                      <div className="shrink-0">
                        {doc.status === 'completed' && <CheckCircle2 size={16} className={isSelected ? 'text-primaryForeground' : 'text-green-500'} />}
                        {doc.status === 'generating' && <Loader2 size={16} className={`animate-spin ${isSelected ? 'text-primaryForeground' : 'text-blue-500'}`} />}
                        {doc.status === 'failed' && <XCircle size={16} className={isSelected ? 'text-primaryForeground' : 'text-red-500'} />}
                        {doc.status === 'pending' && <FileText size={16} className={isSelected ? 'text-primaryForeground/70' : 'text-textMuted/50'} />}
                      </div>
                      <span className="truncate flex-1">{doc.title.substring(doc.title.indexOf(' ') + 1)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FunnelSidebar;