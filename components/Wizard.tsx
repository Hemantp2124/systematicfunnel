import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Sparkles, Plus, Trash2, Rocket, Code, Layers, Zap, Shield, Loader2, Wand2 } from 'lucide-react';
import { Project } from '../types';
import { FUNNELS } from '../data/funnels';
import { generateProjectSpecs } from '../api/aiService';

interface WizardProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<Project> | null;
}

const Wizard: React.FC<WizardProps> = ({ onClose, onSubmit, initialData }) => {
  const [step, setStep] = useState(0);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>('founder_launch');
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    problem: '',
    audience: '',
    concept: '',
    features: [''] as string[],
    tech: [] as string[],
    budget: 'Small Budget ($5-25k)',
    timeline: 'Normal (3-6 months)',
    teamSize: 1
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '',
        concept: initialData.concept || '',
        problem: initialData.problem || '',
        audience: initialData.audience || '',
        features: initialData.features?.length ? initialData.features : [''],
        tech: initialData.techStack || []
      }));
      setStep(1); 
    }
  }, [initialData]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (formData.features.length < 10) {
      setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    }
  };

  const updateFeature = (idx: number, val: string) => {
    const newFeatures = [...formData.features];
    newFeatures[idx] = val;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (idx: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, features: newFeatures.length ? newFeatures : [''] }));
  };

  const toggleTech = (tech: string) => {
    setFormData(prev => {
      const exists = prev.tech.includes(tech);
      if (exists) return { ...prev, tech: prev.tech.filter(t => t !== tech) };
      return { ...prev, tech: [...prev.tech, tech] };
    });
  };

  const handleAutoFill = async () => {
    if (!formData.concept.trim()) {
      alert("Please enter a brief concept first!");
      return;
    }
    
    setIsBrainstorming(true);
    const specs = await generateProjectSpecs(formData.concept);
    setIsBrainstorming(false);

    if (specs) {
      setFormData(prev => ({
        ...prev,
        name: specs.name || prev.name,
        concept: specs.concept || prev.concept,
        problem: specs.problem || prev.problem,
        audience: specs.audience || prev.audience,
        features: specs.features?.length ? specs.features : prev.features,
        tech: specs.techStack || prev.tech
      }));
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-8">
              <h3 className="text-lg font-bold text-textHeading">What are you building?</h3>
              <p className="text-textBody text-sm">Select a workflow to generate the right documentation.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(FUNNELS).map(([id, funnel]: [string, any]) => {
                 const Icon = id.includes('launch') ? Rocket : id.includes('feature') ? Zap : id.includes('tech') ? Code : id.includes('enterprise') ? Shield : Layers;
                 const isSelected = selectedFunnelId === id;
                 return (
                   <div 
                     key={id}
                     onClick={() => setSelectedFunnelId(id)}
                     className={`p-4 border rounded-card cursor-pointer transition-all hover:scale-[1.02] ${isSelected ? 'border-primaryForeground bg-primary/50' : 'border-border bg-surface hover:border-primary/50'}`}
                   >
                      <div className="flex items-center gap-3 mb-2">
                         <div className={`p-2 rounded-button ${isSelected ? 'bg-primaryForeground text-white' : 'bg-surfaceSecondary text-icon'}`}>
                            <Icon size={20} />
                         </div>
                         <h4 className="font-bold text-sm text-textHeading">{funnel.name}</h4>
                      </div>
                      <p className="text-xs text-textBody mb-3 min-h-[40px]">{funnel.description}</p>
                   </div>
                 );
              })}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-textHeading">Project Details</h3>
                <button 
                   onClick={handleAutoFill}
                   disabled={isBrainstorming || !formData.concept.trim()}
                   className="text-xs flex items-center gap-2 px-3 py-1.5 bg-primary/80 text-primaryForeground border border-primaryForeground/20 rounded-pill hover:bg-primary disabled:opacity-50 transition-colors font-bold"
                   title="Type a concept below then click here to auto-fill the rest!"
                >
                   {isBrainstorming ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                   Auto-fill with AI
                </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-textBody mb-2">Brief Concept <span className="text-red-400">*</span></label>
              <textarea 
                value={formData.concept}
                onChange={(e) => updateField('concept', e.target.value)}
                placeholder="e.g. A marketplace for AI generated art prints..."
                rows={2}
                className="w-full bg-surfaceSecondary border border-transparent rounded-button p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textBody mb-2">Project Name</label>
              <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g., ArtFlow Market"
                className="w-full bg-surfaceSecondary border border-transparent rounded-button p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-textBody mb-2">Problem to Solve</label>
              <textarea value={formData.problem} onChange={(e) => updateField('problem', e.target.value)} placeholder="Describe the main pain point..." rows={3}
                className="w-full bg-surfaceSecondary border border-transparent rounded-button p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-textBody mb-2">Target Audience</label>
              <input type="text" value={formData.audience} onChange={(e) => updateField('audience', e.target.value)} placeholder="e.g., Digital artists and interior designers"
                className="w-full bg-surfaceSecondary border border-transparent rounded-button p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-textHeading">Key Features</h3>
              <span className="text-xs text-primaryForeground font-semibold">{formData.features.filter(f => f).length} added</span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {formData.features.map((feat, idx) => (
                <div key={idx} className="flex gap-2 items-center group">
                  <span className="text-xs text-textMuted w-4">{idx + 1}.</span>
                  <input type="text" value={feat} onChange={(e) => updateFeature(idx, e.target.value)} placeholder="Describe a feature..."
                    className="flex-1 bg-surfaceSecondary border border-transparent rounded-button p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus={idx === formData.features.length - 1 && !feat} />
                  {formData.features.length > 1 && (
                    <button onClick={() => removeFeature(idx)} className="text-textMuted hover:text-red-500 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {formData.features.length < 10 && (
                <button onClick={addFeature} className="flex items-center gap-2 text-sm text-primaryForeground hover:underline ml-6">
                  <Plus size={16} /> Add another feature
                </button>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h3 className="text-lg font-bold text-textHeading">Preferences</h3>
            <div>
              <label className="block text-sm font-medium text-textBody mb-3">Tech Stack</label>
              <div className="grid grid-cols-3 gap-3">
                {['React', 'Next.js', 'Vue.js', 'Node.js', 'Python', 'Go', 'Flutter', 'Firebase', 'AWS', 'Supabase'].map(tech => (
                  <div key={tech} onClick={() => toggleTech(tech)}
                    className={`p-3 text-center rounded-button border cursor-pointer transition-all text-sm ${
                      formData.tech.includes(tech) 
                      ? 'border-primaryForeground bg-primary/80 text-primaryForeground font-bold' 
                      : 'border-border bg-surface hover:border-textMuted'
                    }`}>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textBody mb-2">Budget</label>
                <select value={formData.budget} onChange={(e) => updateField('budget', e.target.value)}
                  className="w-full bg-surfaceSecondary border border-transparent rounded-button p-3 outline-none appearance-none">
                  <option>Bootstrapped (&lt;$5k)</option><option>Small Budget ($5-25k)</option>
                  <option>Medium Budget ($25-100k)</option><option>Well Funded (&gt;$100k)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textBody mb-2">Timeline</label>
                <select value={formData.timeline} onChange={(e) => updateField('timeline', e.target.value)}
                  className="w-full bg-surfaceSecondary border border-transparent rounded-button p-3 outline-none appearance-none">
                  <option>ASAP (1-3 months)</option><option>Normal (3-6 months)</option>
                  <option>Flexible (6-12 months)</option><option>Long-term (12+ months)</option>
                </select>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-card shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-textHeading flex items-center gap-2">
              <Sparkles className="text-primaryForeground" size={20} />
              {initialData ? `Create from Template` : 'Create New Project'}
            </h2>
            <p className="text-sm text-textBody">Step {step + 1} of 4</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surfaceSecondary rounded-full text-icon">
            <X size={20} />
          </button>
        </div>

        <div className="h-1 bg-surfaceSecondary w-full">
          <div 
            className="h-full bg-primaryForeground transition-all duration-300"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 overflow-y-auto flex-1 no-scrollbar">
          {renderStepContent()}
        </div>

        <div className="p-6 border-t border-border flex justify-between bg-surface/50">
          <button 
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="px-6 py-2.5 rounded-button text-sm font-bold text-textBody hover:text-textHeading hover:bg-surfaceSecondary transition-colors"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onSubmit({ ...formData, funnelId: selectedFunnelId });
            }}
            disabled={step === 1 && !formData.name && !isBrainstorming}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-button text-sm font-bold text-white transition-all
              ${(step === 1 && !formData.name) || isBrainstorming
                ? 'bg-accentDark/50 cursor-not-allowed' 
                : 'bg-accentDark hover:opacity-90 shadow-lg'}
            `}
          >
            {isBrainstorming ? <Loader2 size={16} className="animate-spin" /> : null}
            {step === 3 ? 'Generate Documents' : 'Next Step'}
            {step < 3 && !isBrainstorming && <ArrowRight size={16} />}
            {step === 3 && !isBrainstorming && <Sparkles size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wizard;