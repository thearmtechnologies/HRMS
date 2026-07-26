import React from 'react';
import { Building2 } from 'lucide-react';

export default function CompanyInformationTab() {
  return (
    <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm p-12 text-center flex flex-col items-center justify-center">
      <Building2 size={48} className="text-[#bdc2c7] mb-4" />
      <h3 className="font-bold text-[#1E293B] text-lg">Company Settings</h3>
      <p className="text-sm text-[#8f9192] mt-2 max-w-md">This section is reserved for future company information updates such as Company Name, Address, Logo, and default configurations.</p>
    </div>
  );
}
