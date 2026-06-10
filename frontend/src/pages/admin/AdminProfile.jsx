import React from "react";
import {
  Activity,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Monitor,
  Phone,
  User,
} from "lucide-react";

// --- REUSABLE COMPONENTS ---

// Info Label & Value Component
const InfoItem = ({ label, value, icon: Icon, colSpan = 1 }) => (
  <div className={`col-span-1 ${colSpan === 2 ? "sm:col-span-2" : ""}`}>
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={14} className="text-[#bdc2c7]" />}
      <p className="text-xs font-medium text-[#8f9192] uppercase tracking-wider">
        {label}
      </p>
    </div>
    <p className="text-sm font-semibold text-[#1E293B]">{value}</p>
  </div>
);

// --- MAIN COMPONENT ---

export default function AdminProfile() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">
      
      {/* 1. PROFILE HEADER */}
      <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#3B82F6] text-[#fdfdfe] flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-md">
              KP
            </div>
            <button className="absolute bottom-0 right-0 p-2.5 bg-[#fdfdfe] rounded-full border border-[#d6d9df] text-[#8f9192] hover:text-[#1E293B] shadow-sm transition-colors group-hover:scale-105">
              <Camera size={18} />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
                Kaustubh Pawar
              </h1>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-[#3B82F6]/10 text-[#1E293B] self-center sm:self-auto">
                <CheckCircle2 size={14} className="mr-1.5" /> Active
              </span>
            </div>
            
            <p className="text-[#8f9192] font-medium text-base mb-1">
              System Administrator
            </p>
            <p className="text-sm text-[#bdc2c7] mb-6">
              Admin ID: <span className="font-semibold text-[#8f9192]">admin001</span> • Last Login: <span className="font-semibold text-[#8f9192]">Today 10:15 AM</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm">
                <Edit size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* 2. PERSONAL INFORMATION */}
          <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex items-center gap-2">
              <User size={20} className="text-[#1E293B]" />
              <h2 className="text-lg font-bold text-[#1E293B]">Personal Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <InfoItem label="Full Name" value="Kaustubh Pawar" icon={User} />
              <InfoItem label="Email Address" value="admin@armhrms.com" icon={Mail} />
              <InfoItem label="Phone Number" value="+91 98765 43210" icon={Phone} />
              <InfoItem label="Date of Birth" value="15 August 1988" icon={Calendar} />
              <InfoItem label="Gender" value="Male" icon={User} />
              <InfoItem label="City / State" value="Mumbai, Maharashtra" icon={MapPin} />
              <InfoItem label="Address" value="402, Tech Park, Andheri East, Mumbai 400069, India" icon={MapPin} colSpan={2} />
            </div>
          </div>

          {/* 4. ACCOUNT INFORMATION */}
          <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex items-center gap-2">
              <Monitor size={20} className="text-[#1E293B]" />
              <h2 className="text-lg font-bold text-[#1E293B]">Account Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <InfoItem label="Username" value="admin" />
              <InfoItem label="Account Status" value="Active" />
              <InfoItem label="Registered Email" value="admin@armhrms.com" colSpan={2} />
              <InfoItem label="Account Created" value="01 Jan 2025" />
              <InfoItem label="2FA Status" value="Enabled" />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* 3. PROFESSIONAL INFORMATION */}
          <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex items-center gap-2">
              <Briefcase size={20} className="text-[#1E293B]" />
              <h2 className="text-lg font-bold text-[#1E293B]">Professional Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <InfoItem label="Employee ID" value="ADM001" />
              <InfoItem label="Role" value="Super Admin" />
              <InfoItem label="Department" value="Administration" />
              <InfoItem label="Designation" value="System Administrator" />
              <InfoItem label="Date Joined" value="01 Jan 2025" />
              <InfoItem label="Reporting To" value="Board of Directors" />
            </div>
          </div>

          {/* 7. ACTIVITY SUMMARY */}
          <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex items-center gap-2">
              <Activity size={20} className="text-[#1E293B]" />
              <h2 className="text-lg font-bold text-[#1E293B]">Activity Timeline</h2>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-[#d6d9df] ml-3 space-y-6">
                {[
                  { time: "Today, 01:15 PM", desc: "Updated Department structure for IT." },
                  { time: "Today, 11:45 AM", desc: "Added new employee (EMP-204)." },
                  { time: "Today, 10:30 AM", desc: "Approved Leave Request for Sarah Jenkins." },
                  { time: "Yesterday, 04:20 PM", desc: "Updated Payroll batch for October." },
                  { time: "Yesterday, 02:00 PM", desc: "Assigned Project 'Alpha' to Design Team." },
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className="absolute w-3 h-3 bg-[#3B82F6] rounded-full left-[-7px] top-1.5 shadow-[0_0_0_4px_#fdfdfe]"></div>
                    <p className="text-xs font-bold text-[#bdc2c7] mb-0.5">{item.time}</p>
                    <p className="text-sm font-medium text-[#8f9192]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}