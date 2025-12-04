import React, { useState, useEffect } from 'react';
import { Save, Server, Key, Cpu, AlertCircle, CheckCircle, Wifi, XCircle, Loader2, ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { validateOpenRouterConfig } from '../api/aiService';
import { DOC_HIERARCHY, HIERARCHY_GROUPS } from '../data/hierarchy';

const OPENROUTER_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Recommended)' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (Highest Quality)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Fast & Powerful)' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B (Open Source)' },
  { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B' },
];

const Settings: React.FC = () => {
  const [provider, setProvider] = useState('google');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('anthropic/claude-3.5-sonnet');
  const [modelOverrides, setModelOverrides] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setProvider(localStorage.getItem('sf_provider') || 'google');
    setOpenRouterKey(localStorage.getItem('sf_openrouter_key') || '');
    setOpenRouterModel(localStorage.getItem('sf_openrouter_model') || 'anthropic/claude-3.5-sonnet');
    try {
      const storedOverrides = localStorage.getItem('sf_model_overrides');
      if (storedOverrides) setModelOverrides(JSON.parse(storedOverrides));
    } catch (e) { console.error("Failed to load model overrides", e); }
  }, []);

  const handleSave = () => {
    localStorage.setItem('sf_provider', provider);
    localStorage.setItem('sf_openrouter_key', openRouterKey);
    localStorage.setItem('sf_openrouter_model', openRouterModel);
    localStorage.setItem('sf_model_overrides', JSON.stringify(modelOverrides));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    const result = await validateOpenRouterConfig(openRouterKey, openRouterModel);
    if (result.success) {
      setTestStatus('success');
      setTestMessage('Connection successful!');
    } else {
      setTestStatus('error');
      setTestMessage(result.error || 'Connection failed');
    }
  };

  const handleOverrideChange = (docType: string, model: string) => {
    setModelOverrides(prev => {
      if (model === 'default') {
        const next = { ...prev };
        delete next[docType];
        return next;
      }
      return { ...prev, [docType]: model };
    });
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  const groupedDocs: Record<string, typeof DOC_HIERARCHY[keyof typeof DOC_HIERARCHY][]> = {};
  HIERARCHY_GROUPS.forEach(g => groupedDocs[g] = []);
  Object.values(DOC_HIERARCHY).forEach(doc => {
    if (doc.category && groupedDocs[doc.category]) groupedDocs[doc.category].push(doc);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-textHeading">Settings</h1>
        <p className="text-textBody mt-2">Configure your AI provider and application preferences.</p>
      </div>

      <div className="space-y-6">
         <div className="bg-surface border border-border rounded-card p-6 shadow-subtle">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-textHeading">
               <Server className="text-primaryForeground" size={24} /> 
               AI Provider Configuration
            </h2>
            <div className="space-y-6">
               <div>
                  <label className="text-sm font-medium text-textBody">Select Provider</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                     <button onClick={() => setProvider('google')} className={`p-4 border rounded-button text-left transition-all ${provider === 'google' ? 'border-primaryForeground bg-primary/50' : 'border-border bg-surfaceSecondary hover:border-textMuted'}`}>
                        <div className="font-bold flex items-center justify-between text-textHeading">Google Gemini {provider === 'google' && <CheckCircle size={18} className="text-primaryForeground" />}</div>
                        <p className="text-xs text-textBody mt-1">Default. Uses system API key. Fast and reliable.</p>
                     </button>
                     <button onClick={() => setProvider('openrouter')} className={`p-4 border rounded-button text-left transition-all ${provider === 'openrouter' ? 'border-primaryForeground bg-primary/50' : 'border-border bg-surfaceSecondary hover:border-textMuted'}`}>
                        <div className="font-bold flex items-center justify-between text-textHeading">OpenRouter (Custom) {provider === 'openrouter' && <CheckCircle size={18} className="text-primaryForeground" />}</div>
                        <p className="text-xs text-textBody mt-1">Use any model (GPT-4, Claude 3) via your own API key.</p>
                     </button>
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-border">
                  <div>
                     <label className="block text-sm font-medium text-textBody mb-2"><span className="flex items-center gap-2"><Key size={14} /> OpenRouter API Key {provider === 'google' && '(Optional Backup)'}</span></label>
                     <div className="flex gap-2">
                        <input type="password" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="sk-or-..."
                           className="flex-1 bg-surfaceSecondary border-transparent rounded-button p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm" />
                        <button onClick={handleTestConnection} disabled={!openRouterKey || testStatus === 'testing'}
                           className="px-4 py-2 bg-surface hover:bg-surfaceSecondary border border-border rounded-button text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                           {testStatus === 'testing' ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />} Test
                        </button>
                     </div>
                     {testStatus === 'success' && <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><CheckCircle size={12} /> {testMessage}</p>}
                     {testStatus === 'error' && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><XCircle size={12} /> {testMessage}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-textBody mb-2"><span className="flex items-center gap-2"><Cpu size={14} /> Global Model Selection</span></label>
                     <select value={OPENROUTER_MODELS.find(m => m.id === openRouterModel) ? openRouterModel : 'custom'} onChange={(e) => setOpenRouterModel(e.target.value === 'custom' ? '' : e.target.value)}
                        className="w-full bg-surfaceSecondary border-transparent rounded-button p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none">
                        {OPENROUTER_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                        <option value="custom">Custom Model ID</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-surface border border-border rounded-card p-6 shadow-subtle">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-textHeading"><Settings2 className="text-primaryForeground" size={24} /> Granular Model Configuration</h2>
            <p className="text-sm text-textBody mb-6">Override the global model for specific document types when using OpenRouter.</p>
            <div className="space-y-2">
               {HIERARCHY_GROUPS.map(group => {
                  const docs = groupedDocs[group];
                  if (!docs || docs.length === 0) return null;
                  const isExpanded = expandedGroups.includes(group);
                  return (
                     <div key={group} className="border border-border rounded-button bg-surfaceSecondary/30 overflow-hidden">
                        <button onClick={() => toggleGroup(group)} className="w-full flex items-center justify-between p-3 hover:bg-surfaceSecondary/50 transition-colors text-left font-bold text-sm">
                           <span>{group}</span>
                           {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        {isExpanded && (
                           <div className="p-4 border-t border-border space-y-3 bg-surface">
                              {docs.map(doc => (
                                 <div key={doc.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                    <span className="text-sm text-textBody">{doc.title}</span>
                                    <select value={modelOverrides[doc.id] || 'default'} onChange={(e) => handleOverrideChange(doc.id, e.target.value)}
                                       className={`text-xs p-2 rounded-button border outline-none w-full ${modelOverrides[doc.id] ? 'bg-primary/50 border-primaryForeground text-primaryForeground font-medium' : 'bg-surfaceSecondary border-border text-textBody'}`}>
                                       <option value="default">Use Global Default</option>
                                       {OPENROUTER_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>

         <div className="flex justify-end pb-10">
            <button onClick={handleSave} className={`flex items-center gap-2 px-8 py-3 rounded-button font-bold text-white transition-all shadow-lg ${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-accentDark hover:opacity-90'}`}>
               {saved ? <CheckCircle size={20} /> : <Save size={20} />}
               {saved ? 'Settings Saved' : 'Save Configuration'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default Settings;