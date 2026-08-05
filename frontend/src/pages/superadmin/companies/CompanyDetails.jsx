import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  UserCircle2,
  Users,
  ShieldCheck,
  UserCog,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Briefcase
} from 'lucide-react';
import SuperAdminCard from '../components/SuperAdminCard';

const CompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`http://localhost:5000/api/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch company details');
      
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Details</h2>
        <p className="text-gray-500 mb-6">{error || 'Company not found'}</p>
        <button onClick={() => navigate('/super-admin/companies')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Companies
        </button>
      </div>
    );
  }

  const { company, companyInfo, primaryAdmin, statistics } = data;

  const StatusBadge = ({ status }) => {
    const styles = {
      Active: 'bg-green-100 text-green-700',
      Inactive: 'bg-orange-100 text-orange-700',
      Suspended: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/super-admin/companies')}
          className="p-2 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            {company.companyName}
            <StatusBadge status={company.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">Company Code: <span className="font-semibold text-gray-700">{company.companyCode}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identity & Admin */}
        <div className="space-y-6 lg:col-span-1">
          {/* Company Information */}
          <SuperAdminCard title="Company Information" icon={Building2} iconColor="text-blue-600">
            <div className="space-y-4">
              {companyInfo?.logoUrl && (
                <div className="mb-4">
                  <img src={`http://localhost:5000${companyInfo.logoUrl}`} alt="Logo" className="h-16 w-16 object-contain rounded border border-gray-100 p-1 bg-white" />
                </div>
              )}
              
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Registered Email</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-2">
                  <Mail size={14} className="text-gray-400"/> {company.companyEmail}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-2">
                  <Phone size={14} className="text-gray-400"/> {company.companyPhone}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Created Date</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400"/> {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(company.createdAt))}
                </p>
              </div>
            </div>
          </SuperAdminCard>

          {/* Primary Admin */}
          <SuperAdminCard title="Primary Administrator" icon={UserCircle2} iconColor="text-purple-600">
            {primaryAdmin ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    {primaryAdmin.firstName[0]}{primaryAdmin.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{primaryAdmin.fullName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${primaryAdmin.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">{primaryAdmin.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400"/> {primaryAdmin.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Phone</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400"/> {primaryAdmin.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">First Login Pending</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {primaryAdmin.isFirstLogin ? <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Yes</span> : <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">No</span>}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-orange-600 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-orange-800">No Administrator Found</p>
                  <p className="text-xs text-orange-600 mt-1">This company does not have a primary admin assigned.</p>
                </div>
              </div>
            )}
          </SuperAdminCard>
        </div>

        {/* Right Column: Stats & Health */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Statistics */}
          <SuperAdminCard title="User Statistics" icon={Users} iconColor="text-indigo-600">
            <div className="bg-[#f8f9fa] rounded-xl p-4 border border-gray-200 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Provisioned Users</p>
                <p className="text-3xl font-black text-gray-800">{statistics?.totalUsers || 0}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Active</p>
                  <p className="text-lg font-bold text-green-600">{statistics?.activeUsers || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Inactive</p>
                  <p className="text-lg font-bold text-red-500">{statistics?.inactiveUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Admins</p>
                  <p className="text-xl font-bold text-gray-800">{statistics?.admins || 0}</p>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserCog size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">HR Roles</p>
                  <p className="text-xl font-bold text-gray-800">{statistics?.hr || 0}</p>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Employees</p>
                  <p className="text-xl font-bold text-gray-800">{statistics?.employees || 0}</p>
                </div>
              </div>
            </div>
          </SuperAdminCard>

          {/* Workspace Health */}
          <SuperAdminCard title="Workspace Health" icon={CheckCircle2} iconColor={company.isWorkspaceProvisioned ? "text-green-600" : "text-red-600"}>
            {company.isWorkspaceProvisioned ? (
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> Company Registered
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> Company Admin Created
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> Default Roles Defined
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> Leave Templates Built
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> Payroll Settings Active
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> Default Shift Generated
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> Company Info Scaffolded
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                  <CheckCircle2 size={16} /> Provisioning Completed
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <XCircle className="text-red-600 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-red-800">Provisioning Failed</p>
                  <p className="text-xs text-red-600 mt-1">This company's workspace failed to fully provision during creation. Some default templates or roles may be missing.</p>
                </div>
              </div>
            )}
          </SuperAdminCard>

        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
