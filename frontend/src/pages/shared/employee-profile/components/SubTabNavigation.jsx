import React from 'react';

export default function SubTabNavigation({ subTabs, selectedSubTab, onSubTabChange }) {
  return (
    <div className="bg-white border-b border-[#e2e6ea] flex px-4 overflow-x-auto custom-scrollbar shadow-sm">
      {subTabs.map(subTab => {
        const isActive = selectedSubTab === subTab.id;
        return (
          <button
            key={subTab.id}
            onClick={() => onSubTabChange(subTab.id)}
            className={`px-4 py-3 font-semibold text-[14px] whitespace-nowrap transition-all border-b-[3px] ${
              isActive 
                ? 'border-[#0ea5e9] text-[#0ea5e9]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {subTab.label}
          </button>
        )
      })}
    </div>
  );
}
