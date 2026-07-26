import React, { useState } from 'react';
import { SETTINGS_TABS } from './settingsTabs';
import MainTabNavigation from './components/MainTabNavigation';
import SubTabNavigation from './components/SubTabNavigation';

export default function Settings() {
  const [selectedMainTab, setSelectedMainTab] = useState(SETTINGS_TABS[0].id);
  const [selectedSubTab, setSelectedSubTab] = useState(SETTINGS_TABS[0].subTabs[0].id);

  const handleMainTabChange = (tabId) => {
    setSelectedMainTab(tabId);
    const newMainTabConfig = SETTINGS_TABS.find(t => t.id === tabId);
    if (newMainTabConfig && newMainTabConfig.subTabs.length > 0) {
      setSelectedSubTab(newMainTabConfig.subTabs[0].id);
    }
  };

  const activeMainTabConfig = SETTINGS_TABS.find(t => t.id === selectedMainTab) || SETTINGS_TABS[0];
  const activeSubTabConfig = activeMainTabConfig.subTabs.find(st => st.id === selectedSubTab) || activeMainTabConfig.subTabs[0];
  const ActiveComponent = activeSubTabConfig.component;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">System Settings</h1>
        <p className="text-sm text-[#8f9192] mt-1">Configure company, roles, attendance, and policies</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-shrink-0 z-10 sticky top-0">
          <MainTabNavigation 
            tabs={SETTINGS_TABS} 
            selectedMainTab={selectedMainTab} 
            onMainTabChange={handleMainTabChange} 
          />
          <SubTabNavigation 
            subTabs={activeMainTabConfig.subTabs} 
            selectedSubTab={selectedSubTab} 
            onSubTabChange={setSelectedSubTab} 
          />
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-[#f8f9fa]">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
