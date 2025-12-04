import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User } from 'lucide-react';
import Logo from '../components/Logo';

interface SignupProps {
  onSignup: (email: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
      onSignup(email);
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
             <h1 className="text-2xl font-bold text-textHeading mb-2">Create Account</h1>
             <p className="text-textBody">Start generating documentation in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-textBody mb-2">Full Name</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                   <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-surfaceSecondary border border-transparent rounded-button pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                      required
                   />
                </div>
             </div>
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

             <button 
               type="submit"
               className="w-full bg-accentDark hover:opacity-90 text-white font-bold py-3 rounded-button transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-2"
             >
                Create Account <ArrowRight size={18} />
             </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
             <p className="text-textBody text-sm">
                Already have an account? <Link to="/login" className="text-primaryForeground hover:underline font-medium">Log in</Link>
             </p>
          </div>
       </div>
    </div>
  );
};

export default Signup;