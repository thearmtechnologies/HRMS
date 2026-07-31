import React, { useState, useEffect } from 'react';
import { Settings2, Plus, X, Search, CheckCircle2, ShieldAlert } from 'lucide-react';
import leaveService from '../../../../services/leaveService';
import leaveTypeService from '../../../../services/leaveTypeService';

export default function LeaveBalanceTab({ employee }) {
  const [balances, setBalances] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Assigned, Available
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [balData, typesData] = await Promise.all([
        leaveService.getEmployeeBalances(employee._id),
        leaveTypeService.getLeaveTypes()
      ]);
      setBalances(balData);
      setLeaveTypes(typesData || []);
    } catch (err) {
      setError("Failed to fetch leave data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employee?._id) fetchData();
  }, [employee]);

  const handleAssign = async (leaveName) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      await leaveService.assignLeave(employee._id, leaveName, "Assigned by Admin");
      setSuccess(`${leaveName} assigned successfully.`);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to assign leave.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (leaveName) => {
    if (!window.confirm(`Are you sure you want to deactivate ${leaveName} for this employee? History will be retained.`)) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      await leaveService.removeLeave(employee._id, leaveName, "Removed by Admin");
      setSuccess(`${leaveName} deactivated successfully.`);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to remove leave.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="py-12 text-center text-[#8f9192]">Loading leave balances...</div>;
  if (!balances) return <div className="py-12 text-center text-red-500">Failed to load balances.</div>;

  const activeAssignedLeaves = leaveTypes.filter(lt => balances.normalizedBalances?.[lt.name]);

  // Modal Filtering Logic
  const getModalLeaves = () => {
    return leaveTypes.filter(lt => {
      // Search
      if (searchQuery && !lt.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      const balData = balances.normalizedBalances?.[lt.name];
      const isAssigned = !!balData;
      
      if (filter === 'Assigned') return isAssigned;
      if (filter === 'Available') return !isAssigned;
      
      return true;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#1E293B]">Assigned Leave Templates</h3>
          <p className="text-sm text-[#8f9192]">Manage which leave policies apply to this employee.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1E293B] text-white text-sm font-bold rounded-lg hover:bg-[#334155] transition-colors shadow-sm"
        >
          <Settings2 size={16} /> Manage Templates
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">{success}</div>}

      {/* Cards */}
      {activeAssignedLeaves.length === 0 ? (
        <div className="text-center py-12 bg-[#f8f9fa] rounded-xl border border-dashed border-[#d6d9df]">
          <p className="text-[#8f9192] text-sm font-medium mb-3">No leave templates are currently assigned.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-sm font-bold text-blue-600 hover:text-blue-700">Assign Templates</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAssignedLeaves.map(lt => {
            const bal = balances.normalizedBalances[lt.name];
            return (
              <div key={lt._id} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-[#1E293B] text-base">{lt.name}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f9192]">{lt.category}</span>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-[#f8f9fa] p-2 rounded-lg">
                    <div className="text-xs text-[#8f9192] font-semibold mb-0.5">Total</div>
                    <div className="font-bold text-[#1E293B]">{bal.total}</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="text-xs text-blue-600 font-semibold mb-0.5">Available</div>
                    <div className="font-bold text-blue-700">{bal.available}</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg">
                    <div className="text-xs text-orange-600 font-semibold mb-0.5">Used</div>
                    <div className="font-bold text-orange-700">{bal.used}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MANAGE TEMPLATES MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8f9fa]">
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Settings2 size={18} /> Manage Leave Assignments
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8f9192] hover:text-[#1E293B]">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Templates</option>
                <option value="Assigned">Assigned</option>
                <option value="Available">Available / Inactive</option>
              </select>
            </div>

            <div className="p-4 overflow-y-auto bg-[#f0f3f5] flex-1">
              <div className="space-y-3">
                {getModalLeaves().map(lt => {
                  const balData = balances.normalizedBalances?.[lt.name];
                  const isAssigned = !!balData;

                  return (
                    <div key={lt._id} className="bg-white p-4 rounded-xl shadow-sm border border-[#d6d9df] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#1E293B]">{lt.name}</h4>
                          {isAssigned ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Assigned</span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Unassigned / Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-[#8f9192] max-w-md">{lt.description || 'No description provided.'}</p>
                        
                        {isAssigned && (
                           <div className="flex gap-4 mt-3 text-xs font-semibold">
                             <span className="text-[#1E293B]">Total: <span className="font-bold">{balData.total}</span></span>
                             <span className="text-blue-600">Available: <span className="font-bold">{balData.available}</span></span>
                             <span className="text-orange-600">Used: <span className="font-bold">{balData.used}</span></span>
                           </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center">
                        {isAssigned ? (
                          <button 
                            onClick={() => handleRemove(lt.name)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
                          >
                            Remove
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAssign(lt.name)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 w-full sm:w-auto"
                          >
                            <Plus size={14} /> Assign
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {getModalLeaves().length === 0 && (
                  <div className="text-center py-8 text-[#8f9192] text-sm">No templates match your search.</div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8f9fa] flex items-start gap-2">
               <ShieldAlert size={16} className="text-amber-500 mt-0.5 shrink-0" />
               <p className="text-[11px] text-[#8f9192] leading-tight">
                 <strong>Note:</strong> Removing a template sets it to <em>Inactive</em> for this employee, hiding it from their dashboard but safely retaining any historically used days.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
