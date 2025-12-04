import React from 'react';
import { CREATOR_TEMPLATES } from '../data/templates';
import { ArrowRight, LayoutTemplate } from 'lucide-react';
import { Template } from '../types';

interface TemplatesProps {
  onUseTemplate: (template: Template) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onUseTemplate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-textHeading">
              Project Templates
            </h1>
            <p className="text-textBody mt-2">
               Launch faster with pre-configured project templates.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {CREATOR_TEMPLATES.map(template => (
            <div key={template.id} className="bg-surface border border-border rounded-card p-6 hover:border-primary/50 transition-all hover:shadow-lg group flex flex-col shadow-subtle">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-surfaceSecondary rounded-button text-primaryForeground">
                     <template.icon size={28} />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-pill bg-surfaceSecondary text-textBody uppercase">
                     {template.category}
                  </span>
               </div>
               
               <h3 className="text-xl font-bold text-textHeading mb-2">{template.name}</h3>
               <p className="text-sm text-textBody mb-6 flex-1">
                  {template.description}
               </p>

               <div className="space-y-3 mb-6 bg-surfaceSecondary/50 p-4 rounded-button">
                  <p className="text-xs font-semibold text-textMuted uppercase">Included Features:</p>
                  <div className="flex flex-wrap gap-2">
                     {template.prefill.features?.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs bg-surface border border-border px-2 py-1 rounded text-textBody">
                           {f}
                        </span>
                     ))}
                     {(template.prefill.features?.length || 0) > 3 && (
                        <span className="text-xs text-textMuted py-1">+{(template.prefill.features?.length || 0) - 3} more</span>
                     )}
                  </div>
               </div>
               
               <button 
                  onClick={() => onUseTemplate(template)}
                  className="w-full bg-surface border border-border text-primaryForeground font-bold py-3 rounded-button hover:bg-primary/80 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-primary"
               >
                  Use Template <ArrowRight size={18} />
               </button>
            </div>
         ))}
      </div>
      
      <div className="p-8 border-2 border-dashed border-border rounded-card text-center bg-surface">
         <LayoutTemplate className="mx-auto text-textMuted mb-4" size={32} />
         <h3 className="text-lg font-bold text-textHeading mb-2">Need a custom template?</h3>
         <p className="text-textBody text-sm mb-4">
            We are adding new templates weekly. Contact us if you have a specific request.
         </p>
         <button className="text-sm text-primaryForeground hover:underline">Request Template</button>
      </div>
    </div>
  );
};

export default Templates;