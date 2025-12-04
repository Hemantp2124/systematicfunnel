import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className="w-10 h-10 bg-accentDark text-white rounded-lg flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
      <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" fillOpacity="0.6" />
    </svg>
  </div>
);

export default Logo;