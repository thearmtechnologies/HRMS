import React from 'react';

export default function PersonalTab({ employee }) {
  if (!employee) return null;
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Profile Image - Spans 2 rows to fit perfectly next to the first 2 rows of fields */}
        <div className="flex justify-center md:justify-start md:row-span-2 items-start">
          <div className="w-32 h-32 bg-white rounded-full border-4 border-[#f0f3f5] shadow-sm flex items-center justify-center text-4xl font-bold text-[#1E293B] overflow-hidden">
            {employee.url ? (
              <img src={employee.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              employee.firstName?.substring(0, 2).toUpperCase() || 'EM'
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">First Name</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.firstName || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Last Name</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.lastName || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Email</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.email || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Personal Email</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.personalEmail || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Mobile Number</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.mobile || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Birth</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">
            {employee.dob ? new Date(employee.dob).toLocaleDateString() : '—'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Gender</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.gender || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Marital Status</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.maritalStatus || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Blood Group</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.bloodGroup || '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Address</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.address || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">City</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.city || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">State</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.state || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Pincode</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.pincode || '—'}</div>
        </div>
      </div>
    </div>
  );
}
