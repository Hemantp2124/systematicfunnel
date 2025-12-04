import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, FileText, Settings, 
  Menu, Bell, Search, LogOut, X, Plus, HelpCircle,
  User as UserIcon, Sparkles
} from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bgMain text-textBody flex">
      {/* Slim Sidebar */}
      <aside className="w-20 bg-surface flex-shrink-0 flex flex-col items-center py-6 shadow-subtle z-10">
        <div className="mb-10">
          <Logo />
        </div>
        <nav className="flex-1 flex flex-col items-center space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-200 relative
                  ${isActive ? 'bg-accentDark text-white' : 'text-icon hover:bg-surfaceSecondary'}
                `}
              >
                <item.icon size={22} />
                {isActive && <div className="absolute -right-2 w-1.5 h-6 bg-accentDark rounded-full"></div>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center space-y-4">
          <Link to="/profile">
             <img 
               src={user.avatar || `https://i.pravatar.cc/48?u=${user.email}`} 
               alt={user.name} 
               className="w-12 h-12 rounded-full border-2 border-surface" 
             />
          </Link>
          <button onClick={handleLogoutClick} className="w-12 h-12 flex items-center justify-center rounded-full text-icon hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-6 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
           <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold text-textHeading capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</h1>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                 <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-surfaceSecondary border border-transparent rounded-pill pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
                 />
              </div>
              
              <button className="p-3 hover:bg-surfaceSecondary rounded-full text-icon transition-colors">
                  <Bell size={20} />
              </button>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;