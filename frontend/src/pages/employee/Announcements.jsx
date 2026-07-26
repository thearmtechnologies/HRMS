import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, AlertCircle, Calendar } from 'lucide-react';
import announcementService from '../../services/announcementService';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchMyAnnouncements();
  }, []);

  const fetchMyAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getMyAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Company Announcements</h1>
        <p className="text-sm text-[#8f9192] mt-1">Stay updated with the latest news, events, and policies.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#d6d9df] flex flex-wrap gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            {['General', 'Important', 'Urgent', 'Holiday', 'Policy', 'Event', 'Maintenance', 'Information'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center p-12 text-gray-500">Loading announcements...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#d6d9df] p-12 text-center text-gray-500 shadow-sm flex flex-col items-center">
            <Bell size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-[#1E293B]">No announcements</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div key={ann._id} className="bg-white rounded-xl border border-[#d6d9df] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h2 className="text-lg font-bold text-[#1E293B]">{ann.title}</h2>
                  <div className="flex shrink-0 gap-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">{ann.type}</span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getPriorityColor(ann.priority)}`}>
                      {ann.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {ann.summary && <p className="text-sm font-semibold text-gray-600 mb-3">{ann.summary}</p>}
                
                <div className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </div>
              </div>
              
              <div className="bg-[#f8f9fa] px-5 py-3 border-t border-[#d6d9df] flex justify-between items-center text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Published {new Date(ann.publishedAt).toLocaleDateString()}</span>
                  {ann.publishedBy && (
                    <span className="ml-2 pl-2 border-l border-gray-300">
                      By {ann.publishedBy.firstName} {ann.publishedBy.lastName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
