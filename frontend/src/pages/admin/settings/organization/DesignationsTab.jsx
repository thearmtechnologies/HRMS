import React, { useState, useEffect, useContext } from 'react';
import { Plus } from 'lucide-react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import { AuthContext } from '../../../../context/AuthContext';

export default function DesignationsTab() {
  const { token } = useContext(AuthContext);
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState('');

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/designations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDesignations(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!newDesignation.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/settings/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newDesignation })
      });
      if (res.ok) {
        setNewDesignation('');
        fetchDesignations();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDesignation = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/settings/designations/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDesignations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SettingsCard>
      <SettingsHeader 
        title="Company Designations" 
        description="Manage job titles available during employee creation."
        actions={
          <form onSubmit={handleAddDesignation} className="flex items-center gap-2">
            <label htmlFor="newDesignationInput" className="sr-only">New Designation Name</label>
            <input 
              id="newDesignationInput"
              name="newDesignationInput"
              type="text" 
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              placeholder="New Designation Name" 
              className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#1E293B] focus:outline-none focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all w-64"
            />
            <button type="submit" className="flex items-center justify-center p-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors">
              <Plus size={20} />
            </button>
          </form>
        }
      />
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f0f3f5]">
            <tr>
              <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Designation</th>
              <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df] text-center">Status</th>
              <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d6d9df]">
            {designations.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-[#8f9192]">No designations found.</td></tr>
            ) : designations.map(d => (
              <tr key={d._id} className="hover:bg-[#f8f9fa] transition-colors">
                <td className="px-5 py-3 font-bold text-[#1E293B]">{d.name}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button 
                    onClick={() => handleToggleDesignation(d._id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${d.isActive ? 'bg-white border-[#d6d9df] text-red-600 hover:bg-red-50 hover:border-red-200' : 'bg-white border-[#d6d9df] text-green-600 hover:bg-green-50 hover:border-green-200'}`}
                  >
                    {d.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsCard>
  );
}
