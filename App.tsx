import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { streamDocumentGeneration } from './api/aiService';
import { Project, User, DocType, Template } from './types';
import { FUNNELS } from './data/funnels';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Wizard from './components/Wizard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<Partial<Project> | null>(null);

  useEffect(() => {
    // Check for logged in user in local storage
    const loggedInUser = localStorage.getItem('primax_user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    // Load projects from local storage
    const savedProjects = localStorage.getItem('primax_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    // Persist projects to local storage
    if (projects.length > 0) {
      localStorage.setItem('primax_projects', JSON.stringify(projects));
    }
  }, [projects]);

  const handleLogin = (email: string) => {
    const newUser: User = { id: '1', name: email.split('@')[0], email, apiCredits: 550, avatar: `https://i.pravatar.cc/150?u=${email}` };
    localStorage.setItem('primax_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('primax_user');
    setUser(null);
  };
  
  const handleUseTemplate = (template: Template) => {
    setWizardInitialData(template.prefill);
    setShowWizard(true);
  };


  const handleCreateProject = (data: any): string => {
    const funnel = (FUNNELS as any)[data.funnelId];
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: data.name,
      problem: data.problem,
      audience: data.audience,
      concept: data.concept,
      features: data.features.filter(Boolean),
      techStack: data.tech,
      budget: data.budget,
      timeline: data.timeline,
      teamSize: data.teamSize,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      funnelId: data.funnelId,
      documents: funnel.docs.map((docType: DocType) => ({
        id: `${docType}_${Date.now()}`,
        type: docType,
        title: docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        content: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      })),
    };

    setProjects(prev => [newProject, ...prev]);
    
    // Auto-generate the first document in the funnel
    const firstDocType = funnel.docs[0];
    if (firstDocType) {
       handleRegenerateDoc(newProject.id, firstDocType);
    }
    
    return newProject.id;
  };

  const handleUpdateDocStatus = (projectId: string, docType: DocType, status: 'pending' | 'generating' | 'completed' | 'failed', content?: string, progress?: number, phase?: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          documents: p.documents.map(d => {
            if (d.type === docType) {
              const updates: any = { status };
              if (content !== undefined) updates.content = content;
              if (progress !== undefined) updates.progress = progress;
              if (phase !== undefined) updates.phase = phase;
              return { ...d, ...updates, lastUpdated: new Date().toISOString() };
            }
            return d;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    }));
  };

  const handleRegenerateDoc = async (projectId: string, docType: DocType) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    handleUpdateDocStatus(projectId, docType, 'generating');

    const req = {
      projectConcept: project.concept,
      features: project.features,
      targetAudience: project.audience,
      problem: project.problem,
      preferences: {
        tech: project.techStack,
        budget: project.budget,
        timeline: project.timeline,
      },
      // Find the "phase 0" doc content if it exists to provide context
      strategicContext: project.documents.find(d => d.type === DocType.GROWTH_PLAYBOOK)?.content
    };
    
    const result = await streamDocumentGeneration(
      docType, 
      req,
      (progress, phase) => handleUpdateDocStatus(projectId, docType, 'generating', undefined, progress, phase)
    );

    if (result.success && result.content) {
      handleUpdateDocStatus(projectId, docType, 'completed', result.content);
    } else {
      handleUpdateDocStatus(projectId, docType, 'failed', result.error || 'Generation failed.');
    }
  };
  
  const handleUpdateDocContent = (projectId: string, docId: string, content: string) => {
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            documents: p.documents.map(d => 
              d.id === docId ? { ...d, content, lastUpdated: new Date().toISOString() } : d
            )
          };
        }
        return p;
      }));
  };


  const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return user ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
          
          <Route path="/*" element={
            <PrivateRoute>
              <Layout user={user!} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard projects={projects} onCreateProject={() => setShowWizard(true)} />} />
                  <Route path="/projects" element={<Projects projects={projects} />} />
                  <Route path="/project/:id" element={<ProjectDetail projects={projects} onRegenerateDoc={handleRegenerateDoc} onUpdateDoc={handleUpdateDocContent} />} />
                  <Route path="/templates" element={<Templates onUseTemplate={handleUseTemplate} />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile user={user!} />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }/>
        </Routes>
      </HashRouter>
      {showWizard && (
        <Wizard
          initialData={wizardInitialData}
          onClose={() => {
            setShowWizard(false);
            setWizardInitialData(null);
          }}
          onSubmit={(data) => {
            setShowWizard(false);
            setWizardInitialData(null);
            const newId = handleCreateProject(data);
            // Quick navigate, router will pick it up
            window.location.hash = `#/project/${newId}`;

          }}
        />
      )}
    </>
  );
};

export default App;