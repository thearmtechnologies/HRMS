import React, { useState, useEffect } from "react";
import { X, Loader2, Search, CheckCircle2, UserPlus, Trash2 } from "lucide-react";

export default function ProjectFormModal({ isOpen, onClose, onSave, projectToEdit }) {
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    department: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
    status: "Planning",
    projectManager: "",
    assignedEmployees: [],
  });

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For employee search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchEmployees();
      if (projectToEdit) {
        setFormData({
          projectName: projectToEdit.projectName,
          description: projectToEdit.description || "",
          department: projectToEdit.department?._id || projectToEdit.department || "",
          startDate: projectToEdit.startDate ? projectToEdit.startDate.split("T")[0] : "",
          endDate: projectToEdit.endDate ? projectToEdit.endDate.split("T")[0] : "",
          priority: projectToEdit.priority || "Medium",
          status: projectToEdit.status || "Planning",
          projectManager: projectToEdit.projectManager?._id || projectToEdit.projectManager || "",
          assignedEmployees: projectToEdit.assignedEmployees?.map(e => typeof e === 'object' ? e._id : e) || [],
        });
      } else {
        setFormData({
          projectName: "",
          description: "",
          department: "",
          startDate: "",
          endDate: "",
          priority: "Medium",
          status: "Planning",
          projectManager: "",
          assignedEmployees: [],
        });
      }
      setSearchQuery("");
      setError(null);
    }
  }, [isOpen, projectToEdit]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/department", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching departments", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/employee", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const emps = Array.isArray(data) ? data : data.employees || [];
        // Only active employees
        setEmployees(emps.filter(e => e.status === "Active"));
      }
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = (empId) => {
    if (!formData.assignedEmployees.includes(empId)) {
      setFormData(prev => ({
        ...prev,
        assignedEmployees: [...prev.assignedEmployees, empId]
      }));
    }
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleRemoveEmployee = (empId) => {
    setFormData(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.filter(id => id !== empId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName || !formData.department || !formData.startDate || !formData.endDate) {
      setError("Please fill all required fields.");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("End date must be after start date.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const method = projectToEdit ? "PUT" : "POST";
      const url = projectToEdit 
        ? `http://localhost:5000/api/projects/${projectToEdit._id}` 
        : `http://localhost:5000/api/projects`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save project");

      onSave(); // Refresh parent
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees for search
  const filteredEmployees = employees.filter(emp => {
    const s = searchQuery.toLowerCase();
    const name = (emp.employeeName || emp.fullName || "").toLowerCase();
    const eid = (emp.employeeId || "").toLowerCase();
    const dpt = (emp.department?.departmentName || "").toLowerCase();
    return name.includes(s) || eid.includes(s) || dpt.includes(s);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1E293B]/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-3xl relative z-10 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#d6d9df]">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              {projectToEdit ? "Edit Project" : "Create New Project"}
            </h2>
            <p className="text-sm text-[#8f9192] mt-1">Fill in the project details below.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g. HRMS Development"
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                  required
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Project Manager */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">Project Manager</label>
                <select
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                >
                  <option value="">Select Manager</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeName || emp.fullName} ({emp.employeeId}) - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-[#8f9192] mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none resize-none"
                />
              </div>

              {/* Team Members Assignment */}
              <div className="md:col-span-2 border-t border-[#d6d9df] pt-6 mt-2">
                <h3 className="text-sm font-bold text-[#1E293B] mb-4">Assign Team Members</h3>
                
                {/* Search Input */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#8f9192]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Name, Employee ID, or Department..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                  />
                  
                  {/* Search Dropdown */}
                  {isSearchOpen && searchQuery && (
                    <div className="absolute z-20 w-full mt-2 bg-[#fdfdfe] border border-[#d6d9df] shadow-lg rounded-xl max-h-60 overflow-y-auto">
                      {filteredEmployees.length === 0 ? (
                        <div className="p-4 text-center text-sm text-[#8f9192]">No employees found</div>
                      ) : (
                        filteredEmployees.map(emp => {
                          const isAssigned = formData.assignedEmployees.includes(emp._id);
                          return (
                            <div 
                              key={emp._id}
                              onClick={() => !isAssigned && handleAddEmployee(emp._id)}
                              className={`flex items-center justify-between p-3 border-b border-[#f0f3f5] last:border-0 ${isAssigned ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-[#f0f3f5]'} transition-colors`}
                            >
                              <div>
                                <p className="text-sm font-bold text-[#1E293B]">{emp.employeeName || emp.fullName}</p>
                                <p className="text-xs text-[#8f9192]">{emp.employeeId} • {emp.department?.departmentName || 'No Dept'} • {emp.designation}</p>
                              </div>
                              {isAssigned ? (
                                <CheckCircle2 size={18} className="text-green-500" />
                              ) : (
                                <button type="button" className="p-1.5 text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg">
                                  <UserPlus size={18} />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Members List */}
                <div className="bg-[#f0f3f5] rounded-xl p-4 min-h-[100px]">
                  {formData.assignedEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#8f9192] py-4">
                      <p className="text-sm">No Team Members Assigned</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.assignedEmployees.map(empId => {
                        const emp = employees.find(e => e._id === empId);
                        if (!emp) return null;
                        return (
                          <div key={empId} className="flex items-center justify-between bg-[#fdfdfe] border border-[#d6d9df] p-2.5 rounded-lg shadow-sm">
                            <div className="truncate pr-2">
                              <p className="text-sm font-bold text-[#1E293B] truncate">{emp.employeeName || emp.fullName}</p>
                              <p className="text-xs text-[#8f9192] truncate">{emp.employeeId} • {emp.designation}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEmployee(empId)}
                              className="shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-[#d6d9df] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="project-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] text-[#fdfdfe] rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {projectToEdit ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
