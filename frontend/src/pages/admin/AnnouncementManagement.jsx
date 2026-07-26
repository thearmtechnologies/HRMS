import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Send, Archive, FileText, Bell, Megaphone, Calendar } from 'lucide-react';
import announcementService from '../../services/announcementService';
import employeeService from '../../services/employeeService';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '', summary: '', content: '', type: 'General', priority: 'medium', audience: 'Company', status: 'Draft', targetDepartments: [], targetEmployees: []
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getAllAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [deptRes, empData] = await Promise.all([
        fetch("http://localhost:5000/api/department", { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        employeeService.getAllEmployees()
      ]);
      const deptData = await deptRes.json();
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchInitialData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await announcementService.updateAnnouncement(editingItem._id, formData);
      } else {
        await announcementService.createAnnouncement(formData);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (e) {
      alert(e.message || 'Error saving announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (e) {
      alert(e.message || 'Error deleting announcement');
    }
  };

  const handlePublish = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      await announcementService.updateAnnouncement(id, { status: newStatus });
      fetchAnnouncements();
    } catch (e) {
      alert(e.message || `Error updating status`);
    }
  };

  const stats = {
    total: announcements.length,
    active: announcements.filter(a => a.status === 'Published').length,
    drafts: announcements.filter(a => a.status === 'Draft').length,
    archived: announcements.filter(a => a.status === 'Archived').length
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Announcements Management</h1>
          <p className="text-sm text-[#8f9192] mt-1">Manage and broadcast company announcements.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({ title: '', summary: '', content: '', type: 'General', priority: 'medium', audience: 'Company', status: 'Draft', targetDepartments: [], targetEmployees: [] });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm"
        >
          <Plus size={18} /> Create Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Megaphone size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-[#1E293B]">{stats.total}</div>
            <div className="text-xs text-[#8f9192] uppercase font-bold tracking-wider">Total</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Send size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-[#1E293B]">{stats.active}</div>
            <div className="text-xs text-[#8f9192] uppercase font-bold tracking-wider">Published</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><FileText size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-[#1E293B]">{stats.drafts}</div>
            <div className="text-xs text-[#8f9192] uppercase font-bold tracking-wider">Drafts</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><Archive size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-[#1E293B]">{stats.archived}</div>
            <div className="text-xs text-[#8f9192] uppercase font-bold tracking-wider">Archived</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#d6d9df] overflow-hidden">
        <div className="p-4 border-b border-[#d6d9df] flex flex-wrap gap-4 justify-between items-center bg-[#fdfdfe]">
          <div className="relative w-full md:w-64">
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f0f3f5]">
              <tr>
                <th className="p-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider">Title & Type</th>
                <th className="p-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider">Audience</th>
                <th className="p-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider">Published At</th>
                <th className="p-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d9df]">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No announcements found.</td></tr>
              ) : filteredAnnouncements.map(ann => (
                <tr key={ann._id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#1E293B]">{ann.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <span className={`px-1.5 py-0.5 rounded ${ann.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{ann.priority}</span>
                      {ann.type}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700">{ann.audience}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      ann.status === 'Published' ? 'bg-green-100 text-green-700' :
                      ann.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{ann.status}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handlePublish(ann._id, ann.status)}
                      className={`p-1.5 rounded-lg border transition-colors ${ann.status === 'Published' ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                      title={ann.status === 'Published' ? 'Unpublish (Draft)' : 'Publish Now'}
                    >
                      {ann.status === 'Published' ? <Archive size={16}/> : <Send size={16}/>}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingItem(ann);
                        setFormData({ title: ann.title, summary: ann.summary || '', content: ann.content, type: ann.type, priority: ann.priority, audience: ann.audience, status: ann.status, targetDepartments: ann.targetDepartments?.map(d => d._id || d) || [], targetEmployees: ann.targetEmployees?.map(e => e._id || e) || [] });
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ann._id)}
                      className="p-1.5 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#e2e8f0] flex justify-between items-center bg-[#fdfdfe]">
              <h2 className="text-lg font-bold text-[#1E293B]">{editingItem ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Summary</label>
                <input type="text" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Content *</label>
                <textarea required rows={5} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg resize-none" placeholder="Full announcement details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    {['General', 'Important', 'Urgent', 'Holiday', 'Policy', 'Event', 'Maintenance', 'Information'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Audience</label>
                  <select value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value, targetDepartments: [], targetEmployees: []})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="Company">Entire Company</option>
                    <option value="Department">Specific Departments</option>
                    <option value="Employee">Specific Employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Initial Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published (Notify Now)</option>
                  </select>
                </div>
              </div>

              {formData.audience === 'Department' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Select Departments</label>
                  <select multiple value={formData.targetDepartments} onChange={e => setFormData({...formData, targetDepartments: Array.from(e.target.selectedOptions, option => option.value)})} className="w-full px-3 py-2 border rounded-lg h-24">
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.departmentName}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple</p>
                </div>
              )}

              {formData.audience === 'Employee' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Select Employees</label>
                  <select multiple value={formData.targetEmployees} onChange={e => setFormData({...formData, targetEmployees: Array.from(e.target.selectedOptions, option => option.value)})} className="w-full px-3 py-2 border rounded-lg h-24">
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.email})</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple</p>
                </div>
              )}
            </form>
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Save Announcement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
