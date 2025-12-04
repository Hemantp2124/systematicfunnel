import React, { useState } from 'react';
import { User, CreditCard, Shield, Clock, Zap, Check, Bell, Smartphone, Star, CheckCircle2, Package } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing'>('overview');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const activities = [
    { action: 'Generated PRD', project: 'Fitness Tracking App', time: '2 hours ago', credits: -15 },
    { action: 'Created Project', project: 'Fitness Tracking App', time: '2 hours ago', credits: 0 },
    { action: 'Exported Docs', project: 'SaaS Dashboard', time: '1 day ago', credits: 0 },
    { action: 'Generated Roadmap', project: 'SaaS Dashboard', time: '1 day ago', credits: -10 },
  ];

  const plans = [
    { name: 'Starter', price: 0, period: 'Forever', description: 'For trying out the platform.', features: ['2 Projects', 'Basic AI', 'Standard Templates'], current: true },
    { name: 'Pro', price: billingCycle === 'monthly' ? 29 : 24, period: 'per month', description: 'For building real products.', features: ['Unlimited Projects', 'Advanced AI Models', 'Competitor Analysis', 'Priority Support'], recommended: true },
    { name: 'Agency', price: billingCycle === 'monthly' ? 99 : 79, period: 'per month', description: 'Scale client deliverables.', features: ['Everything in Pro', 'White-label Reports', 'Team Collaboration', 'API Access'] },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-textHeading">Account</h1>
           <p className="text-textBody mt-2">Manage your profile, preferences, and subscription.</p>
        </div>
        <div className="flex bg-surfaceSecondary rounded-pill p-1 border border-border">
          <button onClick={() => setActiveTab('overview')} className={`px-6 py-2 rounded-pill text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-surface text-primaryForeground shadow' : 'text-textBody'}`}>Overview</button>
          <button onClick={() => setActiveTab('billing')} className={`px-6 py-2 rounded-pill text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-surface text-primaryForeground shadow' : 'text-textBody'}`}>Plans & Billing</button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-left-4 duration-300">
           <div className="md:col-span-1 space-y-6">
              <div className="bg-surface border border-border rounded-card p-6 text-center shadow-subtle">
                 <img src={user.avatar} alt={user.name} className="w-24 h-24 mx-auto rounded-full mb-4 ring-4 ring-surface" />
                 <h2 className="text-xl font-bold text-textHeading">{user.name}</h2>
                 <p className="text-textBody text-sm mb-4">{user.email}</p>
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary/80 text-primaryForeground text-xs font-bold border border-primaryForeground/20">
                    <Star size={12} fill="currentColor" /> Free Plan
                 </div>
              </div>
              <div className="bg-surface border border-border rounded-card p-6 shadow-subtle">
                 <h3 className="font-bold mb-4 flex items-center gap-2 text-textHeading"><Shield size={18} className="text-primaryForeground" /> Security</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm"><span className="text-textBody">Password</span><button className="text-primaryForeground hover:underline font-bold">Change</button></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-textBody">Two-Factor Auth</span><span className="text-textMuted bg-surfaceSecondary px-2 py-0.5 rounded text-xs">Disabled</span></div>
                 </div>
              </div>
           </div>
           <div className="md:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-card p-6 shadow-subtle">
                 <h3 className="font-bold mb-4 flex items-center gap-2 text-textHeading"><Zap size={20} className="text-primaryForeground" /> Usage & Credits</h3>
                 <div className="flex justify-between text-sm mb-2"><span className="font-medium text-textBody">Monthly Quota</span><span className="text-textMuted">{Math.round((user.apiCredits / 1000) * 100)}% Used</span></div>
                 <div className="w-full bg-surfaceSecondary rounded-full h-2.5"><div className="bg-primaryForeground h-full rounded-full" style={{ width: `${(user.apiCredits / 1000) * 100}%` }}></div></div>
                 <p className="text-xs text-textMuted mt-2">Credits reset on Nov 1, 2024. <button className="text-primaryForeground hover:underline">Upgrade</button> for unlimited credits.</p>
              </div>
              <div className="bg-surface border border-border rounded-card overflow-hidden shadow-subtle">
                 <div className="p-6 border-b border-border"><h3 className="font-bold flex items-center gap-2 text-textHeading"><Clock size={20} className="text-textMuted" /> Recent Activity</h3></div>
                 <div>
                    {activities.map((activity, i) => (
                       <div key={i} className="flex items-center justify-between p-4 border-b border-border hover:bg-surfaceSecondary/50 transition-colors last:border-0 group">
                          <div>
                             <p className="text-sm font-medium text-textHeading">{activity.action}</p>
                             <p className="text-xs text-textMuted">{activity.project}</p>
                          </div>
                          <div className="text-right"><p className="text-xs text-textMuted">{activity.time}</p>{activity.credits !== 0 && <p className="text-xs font-bold text-primaryForeground">{activity.credits} credits</p>}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
           <div className="flex justify-center items-center gap-4 mb-8">
              <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-textHeading' : 'text-textMuted'}`}>Monthly</span>
              <button onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')} className="w-14 h-7 bg-surfaceSecondary rounded-full p-1 relative border border-border"><div className={`w-5 h-5 bg-primaryForeground rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div></button>
              <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-textHeading' : 'text-textMuted'}`}>Yearly <span className="text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full ml-1 font-bold">SAVE 20%</span></span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                 <div key={idx} className={`relative rounded-card p-6 border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col shadow-subtle ${plan.recommended ? 'border-primaryForeground bg-primary/20' : 'border-border bg-surface'}`}>
                    {plan.recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primaryForeground text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">Most Popular</div>}
                    <div className="mb-6"><h3 className="text-xl font-bold text-textHeading mb-2">{plan.name}</h3><p className="text-sm text-textBody min-h-[40px]">{plan.description}</p></div>
                    <div className="mb-6"><div className="flex items-end gap-1"><span className="text-4xl font-bold text-textHeading">${plan.price}</span><span className="text-textMuted text-sm mb-1">{plan.period}</span></div></div>
                    <div className="space-y-3 mb-8 flex-1">
                       {plan.features.map((feature, i) => <div key={i} className="flex items-start gap-3 text-sm"><CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${plan.recommended ? 'text-primaryForeground' : 'text-textMuted'}`} /><span className="text-textBody">{feature}</span></div>)}
                    </div>
                    <button className={`w-full py-3 rounded-button font-bold transition-all text-sm ${plan.current ? 'bg-surfaceSecondary text-textMuted cursor-default border border-border' : plan.recommended ? 'bg-primaryForeground hover:opacity-90 text-white' : 'bg-surfaceSecondary hover:bg-border text-textHeading border border-border'}`} disabled={plan.current}>{plan.current ? 'Current Plan' : 'Upgrade Plan'}</button>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;