import React from 'react';

export default function SettingsHeader({ title, description, actions }) {
  return (
    <div className="p-5 border-b border-[#d6d9df] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fdfdfe]">
      <div>
        <h3 className="font-bold text-[#1E293B]">{title}</h3>
        {description && <p className="text-xs text-[#8f9192]">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
