import React from 'react';

const SuperAdminCard = ({ title, icon: Icon, iconColor, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-[#f8f9fa]">
        {Icon && <Icon size={20} className={iconColor || 'text-gray-500'} />}
        <h2 className="font-bold text-gray-800 text-sm tracking-wide">{title}</h2>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default SuperAdminCard;
