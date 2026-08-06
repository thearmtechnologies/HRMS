import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportCard({ title, description, icon: Icon, path, onClick, selected = false, colorClass = "bg-blue-50 text-blue-600" }) {
  const cardClassName = `group block bg-white border rounded-xl p-5 hover:shadow-md transition-all ${selected ? 'border-blue-200 ring-2 ring-blue-500' : 'border-[#d6d9df] hover:border-blue-200'}`;

  const content = (
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-lg ${colorClass} shrink-0`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
      </div>
      <div className="shrink-0 pt-1 text-slate-300 group-hover:text-blue-500 transition-colors">
        <ChevronRight size={20} />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cardClassName}>
        {content}
      </button>
    );
  }

  if (path && path !== '#') {
    return <Link to={path} className={cardClassName}>{content}</Link>;
  }

  return (
    <div className={cardClassName}>
      {content}
    </div>
  );
}
