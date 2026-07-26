import React from 'react';

export default function MainTabNavigation({ tabs, selectedMainTab, onMainTabChange }) {
  return (
    <div className="bg-[#f8f9fa] border-b border-[#d6d9df] flex px-2 overflow-x-auto custom-scrollbar">
      {tabs.map(tab => {
        const isActive = selectedMainTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onMainTabChange(tab.id)}
            className={`px-6 py-3.5 font-bold text-[15px] whitespace-nowrap transition-all border-b-[3px] ${
              isActive 
                ? 'border-[#0ea5e9] text-[#0ea5e9] bg-white shadow-[0_-2px_0_0_inset_#0ea5e9]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
