import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
      onLogin(email);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-md bg-surface border border-border rounded-card p-8 shadow-subtle animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-surfaceSecondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Logo />
             </div>
             <h1 className="text-2xl font-bold text-textHeading mb-2">Welcome Back</h1>
             <p className="text-textBody">Enter your details to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-textBody mb-2">Email</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                   <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-surfaceSecondary border border-transparent rounded-button pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                      required
                   />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-textBody mb-2">Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                   <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surfaceSecondary border border-transparent rounded-button pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                      required
                   />
                </div>
             </div>

             <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" className="rounded bg-surfaceSecondary border-border text-primaryForeground focus:ring-primaryForeground" />
                   <span className="text-textBody">Remember me</span>
                </label>
                <a href="#" className="text-primaryForeground hover:underline">Forgot password?</a>
             </div>

             <button 
               type="submit"
               className="w-full bg-accentDark hover:opacity-90 text-white font-bold py-3 rounded-button transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
             >
                Sign In <ArrowRight size={18} />
             </button>

             <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-textMuted text-xs">OR</span>
                <div className="flex-grow border-t border-border"></div>
             </div>

             <button 
               type="button"
               onClick={() => {
                  onLogin('demo@primax.com');
                  navigate('/dashboard');
               }}
               className="w-full bg-surface hover:bg-surfaceSecondary border border-border text-textHeading font-bold py-3 rounded-button transition-all flex items-center justify-center gap-2 group"
             >
                <Sparkles size={18} className="text-primaryForeground group-hover:text-secondary transition-colors" /> 
                Try Demo Account
             </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
             <p className="text-textBody text-sm">
                Don't have an account? <Link to="/signup" className="text-primaryForeground hover:underline font-medium">Sign up</Link>
             </p>
          </div>
       </div>
    </div>
  );
};

export default Login;