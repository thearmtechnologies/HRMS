import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { EMPLOYEE_PROFILE_TABS } from './employeeProfileTabs';
import MainTabNavigation from './components/MainTabNavigation';
import SubTabNavigation from './components/SubTabNavigation';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedMainTab, setSelectedMainTab] = useState(EMPLOYEE_PROFILE_TABS[0].id);
  const [selectedSubTab, setSelectedSubTab] = useState(EMPLOYEE_PROFILE_TABS[0].subTabs[0].id);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const resEmp = await fetch(`http://localhost:5000/api/employee/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const empData = await resEmp.json();
        setEmployee(empData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-slate-500 mb-4">No Employee ID provided</p>
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">
          Return Back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f3f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f0f3f5]">
        <p className="text-slate-500 mb-4">Employee not found</p>
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">
          Return Back
        </button>
      </div>
    );
  }

  const activeMainTabConfig = EMPLOYEE_PROFILE_TABS.find(t => t.id === selectedMainTab) || EMPLOYEE_PROFILE_TABS[0];
  const activeSubTabConfig = activeMainTabConfig.subTabs.find(st => st.id === selectedSubTab) || activeMainTabConfig.subTabs[0];
  const ActiveComponent = activeSubTabConfig.component;

  const handleMainTabChange = (tabId) => {
    setSelectedMainTab(tabId);
    const newMainTabConfig = EMPLOYEE_PROFILE_TABS.find(t => t.id === tabId);
    if (newMainTabConfig && newMainTabConfig.subTabs.length > 0) {
      setSelectedSubTab(newMainTabConfig.subTabs[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-[#1E293B] bg-white px-4 py-2 rounded-lg border border-[#d6d9df] hover:bg-[#e2e6ea] transition-colors shadow-sm w-max"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Navigation & Content Container */}
        <div className="bg-white rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Top Navigation Area - Fixed at top of this container */}
          <div className="flex-shrink-0 z-10 sticky top-0">
            {/* Row 1: Main Tabs */}
            <MainTabNavigation 
              tabs={EMPLOYEE_PROFILE_TABS} 
              selectedMainTab={selectedMainTab} 
              onMainTabChange={handleMainTabChange} 
            />

            {/* Row 2: Sub Tabs */}
            <SubTabNavigation 
              subTabs={activeMainTabConfig.subTabs} 
              selectedSubTab={selectedSubTab} 
              onSubTabChange={setSelectedSubTab} 
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            <ActiveComponent employee={employee} />
          </div>
        </div>
      </div>
    </div>
  );
}
