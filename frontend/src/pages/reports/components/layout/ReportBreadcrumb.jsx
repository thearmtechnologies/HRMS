import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';

export default function ReportBreadcrumb({ items }) {
  return (
    <nav className="flex items-center text-sm font-medium text-slate-500 mb-2">
      <Link to="/reports" className="hover:text-blue-600 transition-colors flex items-center gap-1">
        <FileText size={16} />
        Reports
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="mx-1 text-slate-400" />
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
