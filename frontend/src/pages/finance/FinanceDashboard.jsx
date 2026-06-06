import React, { useState } from 'react';
import { 
  DollarSign, Receipt, CreditCard, PieChart, TrendingUp, 
  Landmark, Download, Plus, FileText, CheckCircle2, 
  XCircle, ChevronRight, Clock, Building2, Wallet,
  FileSpreadsheet
} from 'lucide-react';

// --- MOCK DATA ---
const STATS = [
  { title: 'Total Payroll', value: '₹142,500', subtitle: 'Oct 2023', icon: Wallet, trend: 'up' },
  { title: 'Total Expenses', value: '₹28,450', subtitle: 'This Month', icon: Receipt, trend: 'up' },
  { title: 'Reimbursements', value: '12 Pending', subtitle: 'Needs Approval', icon: CreditCard, trend: 'neutral' },
  { title: 'Vendor Payments', value: '5 Pending', subtitle: 'Due this week', icon: Landmark, trend: 'neutral' },
  { title: 'Budget Usage', value: '78%', subtitle: 'Q4 Budget', icon: PieChart, trend: 'up' },
  { title: 'Tax Liability', value: '₹34,200', subtitle: 'Estimated', icon: TrendingUp, trend: 'neutral' }
];

const RECENT_PAYROLLS = [
  { id: 'PR-10', month: 'October 2023', amount: '₹142,500', status: 'Processed', date: 'Oct 28, 2023' },
  { id: 'PR-09', month: 'September 2023', amount: '₹140,200', status: 'Processed', date: 'Sep 28, 2023' },
  { id: 'PR-08', month: 'August 2023', amount: '₹138,500', status: 'Processed', date: 'Aug 28, 2023' },
  { id: 'PR-07', month: 'July 2023', amount: '₹135,000', status: 'Processed', date: 'Jul 28, 2023' },
];

const RECENT_EXPENSES = [
  { id: 'EXP-104', desc: 'AWS Cloud Hosting', dept: 'Engineering', amount: '₹4,250', status: 'Paid' },
  { id: 'EXP-105', desc: 'Q4 Marketing Ads', dept: 'Marketing', amount: '₹12,000', status: 'Pending' },
  { id: 'EXP-106', desc: 'Office Supplies', dept: 'Admin', amount: '₹450', status: 'Paid' },
  { id: 'EXP-107', desc: 'Sales Force CRM', dept: 'Sales', amount: '₹2,800', status: 'Processing' },
];

const PENDING_APPROVALS = [
  { id: 1, requester: 'Marcus Doe', type: 'Travel Reimbursement', amount: '₹850.00', date: 'Oct 25, 2023', initial: 'MD' },
  { id: 2, requester: 'Sarah Jenkins', type: 'Software License', amount: '₹120.00', date: 'Oct 26, 2023', initial: 'SJ' },
  { id: 3, requester: 'Liam Brown', type: 'Hardware Upgrade', amount: '₹1,200.00', date: 'Oct 26, 2023', initial: 'LB' },
];

// --- REUSABLE COMPONENTS ---
const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm hover:border-[#bdc2c7] transition-all flex flex-col justify-between h-full">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 bg-[#f0f3f5] text-[#3d766d] rounded-xl">
        <Icon size={20} />
      </div>
      <span className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider">{title}</span>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-[#3d766d]">{value}</h3>
      <p className="text-xs text-[#8f9192] mt-1">{subtitle}</p>
    </div>
  </div>
);

const Card = ({ title, action, children, className = "" }) => (
  <div className={`bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden ₹{className}`}>
    <div className="px-6 py-5 border-b border-[#d6d9df] flex items-center justify-between">
      <h2 className="text-base font-bold text-[#3d766d]">{title}</h2>
      {action && <button className="text-sm font-semibold text-[#8f9192] hover:text-[#3d766d] transition-colors">{action}</button>}
    </div>
    <div className="p-6 flex-1 flex flex-col">{children}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Processed': 'bg-green-50 text-green-700 border-green-200',
    'Paid': 'bg-green-50 text-green-700 border-green-200',
    'Pending': 'bg-orange-50 text-orange-700 border-orange-200',
    'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
  }[status] || 'bg-[#f0f3f5] text-[#8f9192] border-[#d6d9df]';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ₹{styles}`}>
      {status}
    </span>
  );
};

export default function FinanceDashboard() {
  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* 1. Header Section */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3d766d]">Finance Dashboard</h1>
          <p className="text-[#8f9192] mt-1">Manage payroll, track expenses, and oversee corporate budgeting.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] text-[#3d766d] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">
          <Download size={18} />
          Export Financials
        </button>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* 2. Quick Actions Strip */}
        <div className="flex flex-wrap items-center gap-3 bg-[#fdfdfe] p-3 rounded-2xl border border-[#d6d9df] shadow-sm">
          <button className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 bg-[#f0f3f5] text-[#3d766d] rounded-xl font-bold hover:bg-[#3d766d] hover:text-[#fdfdfe] transition-colors border border-transparent hover:border-[#3d766d]">
            <FileSpreadsheet size={18} /> Generate Payroll
          </button>
          <button className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 bg-[#f0f3f5] text-[#3d766d] rounded-xl font-bold hover:bg-[#3d766d] hover:text-[#fdfdfe] transition-colors border border-transparent hover:border-[#3d766d]">
            <Plus size={18} /> Add Expense
          </button>
          <button className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 bg-[#f0f3f5] text-[#3d766d] rounded-xl font-bold hover:bg-[#3d766d] hover:text-[#fdfdfe] transition-colors border border-transparent hover:border-[#3d766d]">
            <FileText size={18} /> Create Payslip
          </button>
          <button className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 bg-[#f0f3f5] text-[#3d766d] rounded-xl font-bold hover:bg-[#3d766d] hover:text-[#fdfdfe] transition-colors border border-transparent hover:border-[#3d766d]">
            <PieChart size={18} /> Generate Report
          </button>
        </div>

        {/* 3. Top Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* 4. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Monthly Salary Expense (Bar Chart) */}
          <Card title="Monthly Salary Expense">
            <div className="flex items-end justify-between gap-2 h-48 mt-4">
              {[60, 65, 70, 72, 75, 80, 85].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-[#f0f3f5] rounded-t-sm h-full flex items-end relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3d766d] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{(val * 1.5).toFixed(1)}k
                    </div>
                    <div className="w-full bg-[#3d766d] rounded-t-md transition-all hover:opacity-80" style={{ height: `₹{val}%` }}></div>
                  </div>
                  <span className="text-[10px] text-[#bdc2c7] font-semibold">M{i+4}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Chart 2: Department Wise Expenses (Donut Chart) */}
          <Card title="Department Wise Expenses">
            <div className="flex flex-col items-center justify-center flex-1 py-4">
              <div className="relative w-40 h-40 rounded-full bg-[#f0f3f5] flex items-center justify-center mb-6 shadow-inner" style={{ background: 'conic-gradient(#3d766d 0% 45%, #8f9192 45% 70%, #bdc2c7 70% 85%, #d6d9df 85% 100%)' }}>
                <div className="absolute w-28 h-28 bg-[#fdfdfe] rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xl font-bold text-[#3d766d]">₹28.4k</span>
                  <span className="text-[10px] font-semibold uppercase text-[#8f9192]">Total</span>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold px-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3d766d]"></div> Eng (45%)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8f9192]"></div> Sales (25%)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#bdc2c7]"></div> Mktg (15%)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#d6d9df]"></div> Admin (15%)</div>
              </div>
            </div>
          </Card>

          {/* Chart 3: Payroll Trend (Line/Step representation) */}
          <Card title="Payroll Trend (YTD)">
            <div className="flex-1 relative mt-4 min-h-[192px]">
               {/* Background grid lines */}
               <div className="absolute inset-0 flex flex-col justify-between border-b border-l border-[#d6d9df] pb-6 pl-1">
                 <div className="w-full border-t border-[#f0f3f5] h-0"></div>
                 <div className="w-full border-t border-[#f0f3f5] h-0"></div>
                 <div className="w-full border-t border-[#f0f3f5] h-0"></div>
                 <div className="w-full border-t border-[#f0f3f5] h-0"></div>
               </div>
               
               {/* Trend Data Line Mockup */}
               <div className="absolute inset-0 pb-6 pl-1 flex items-end justify-between px-2">
                 {[40, 45, 42, 50, 55, 60, 62, 65, 70, 75, 78, 85].map((val, i) => (
                    <div key={i} className="relative flex flex-col items-center justify-end h-full w-4 group">
                      <div className="w-2 bg-[#8f9192] rounded-full hover:bg-[#3d766d] transition-colors" style={{ height: `₹{val}%` }}></div>
                      <span className="absolute -bottom-6 text-[10px] text-[#bdc2c7]">{i%2===0 ? `M₹{i+1}` : ''}</span>
                    </div>
                 ))}
               </div>
            </div>
          </Card>

        </div>

        {/* 5. Tables Section 1: Payroll and Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Payroll Runs */}
          <Card title="Recent Payroll Runs" action="View All">
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-[#8f9192] border-b border-[#d6d9df]">
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Batch ID</th>
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Month</th>
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Amount</th>
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3f5]">
                  {RECENT_PAYROLLS.map((run) => (
                    <tr key={run.id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                      <td className="py-4 font-bold text-[#3d766d]">{run.id}</td>
                      <td className="py-4 font-medium">{run.month}</td>
                      <td className="py-4 font-bold text-[#8f9192]">{run.amount}</td>
                      <td className="py-4"><StatusBadge status={run.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Expenses */}
          <Card title="Recent Expenses" action="View All">
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-[#8f9192] border-b border-[#d6d9df]">
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Description</th>
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Dept</th>
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Amount</th>
                    <th className="pb-3 font-semibold uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3f5]">
                  {RECENT_EXPENSES.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                      <td className="py-4 font-bold text-[#3d766d]">{exp.desc}</td>
                      <td className="py-4 text-[#8f9192] flex items-center gap-1.5"><Building2 size={14}/> {exp.dept}</td>
                      <td className="py-4 font-bold text-[#8f9192]">{exp.amount}</td>
                      <td className="py-4"><StatusBadge status={exp.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* 6. Tables Section 2: Pending Approvals (Full Width to allow action buttons breathing room) */}
        <Card title="Action Required: Pending Approvals" className="border-orange-200 shadow-sm">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f3f5]/50 text-[#8f9192] border-b border-[#d6d9df]">
                  <th className="px-4 py-3 font-semibold uppercase text-xs tracking-wider rounded-tl-lg">Requester</th>
                  <th className="px-4 py-3 font-semibold uppercase text-xs tracking-wider">Expense Type</th>
                  <th className="px-4 py-3 font-semibold uppercase text-xs tracking-wider">Date Submitted</th>
                  <th className="px-4 py-3 font-semibold uppercase text-xs tracking-wider text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold uppercase text-xs tracking-wider text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f5]">
                {PENDING_APPROVALS.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f0f3f5]/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#bdc2c7] text-[#fdfdfe] flex items-center justify-center font-bold text-xs shadow-sm">
                          {item.initial}
                        </div>
                        <span className="font-bold text-[#3d766d]">{item.requester}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-[#8f9192] flex items-center gap-2">
                      <Receipt size={14} className="text-[#bdc2c7]" /> {item.type}
                    </td>
                    <td className="px-4 py-4 text-[#8f9192]">{item.date}</td>
                    <td className="px-4 py-4 font-bold text-[#3d766d] text-right text-base">{item.amount}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-bold transition-colors">
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors">
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}