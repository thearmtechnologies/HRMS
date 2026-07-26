import React from 'react';

export default function PlaceholderTab({ title, description }) {
  return (
    <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm p-12 text-center flex flex-col items-center justify-center animate-in fade-in duration-200">
      <h3 className="font-bold text-[#1E293B] text-lg">{title}</h3>
      <p className="text-sm text-[#8f9192] mt-2 max-w-md">{description || 'This section is reserved for future settings and configurations. Coming soon.'}</p>
    </div>
  );
}
