import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportCard({ title, description, icon: Icon, path, colorClass = "bg-blue-50 text-blue-600" }) {
  return (
    <Link to={path} className="group block bg-white border border-[#d6d9df] rounded-xl p-5 hover:shadow-md transition-all hover:border-blue-200">
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
    </Link>
  );
}
