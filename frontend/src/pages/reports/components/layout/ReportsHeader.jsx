import React from 'react';

export default function ReportsHeader({ title, description, actionButton }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">{title}</h1>
        {description && <p className="text-sm mt-1 text-slate-600 font-medium">{description}</p>}
      </div>
      {actionButton && (
        <div className="flex items-center gap-3">
          {actionButton}
        </div>
      )}
    </div>
  );
}
