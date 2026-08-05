import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCw, Filter, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import CompanyTable from './CompanyTable';
import CompanyFormModal from './CompanyFormModal';
import CompanyStatusModal from './CompanyStatusModal';
import SuperAdminStats from '../components/SuperAdminStats';

export default function CompanyManagement() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('desc'); // desc = Newest first, asc = Oldest first

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompanyForForm, setSelectedCompanyForForm] = useState(null);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedCompanyForStatus, setSelectedCompanyForStatus] = useState(null);
  const [targetStatus, setTargetStatus] = useState('Suspended');

  // Load Companies
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch companies');
      }
      setCompanies(data.companies || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server error loading companies');
    } finally {
      setLoading(false);
    }
  };

  // Derive Stats
  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'Active').length,
    suspended: companies.filter(c => c.status === 'Suspended').length
  };

  // Filter & Sort Logic
  const filteredCompanies = companies
    .filter(c => {
      const matchesSearch = 
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyPhone.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Create or Update handler
  const handleSaveCompany = async (formData) => {
    try {
      const isEdit = !!selectedCompanyForForm;
      const url = isEdit 
        ? `http://localhost:5000/api/companies/${selectedCompanyForForm._id}`
        : 'http://localhost:5000/api/companies';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      setIsFormOpen(false);
      setSelectedCompanyForForm(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Error occurred while saving');
    }
  };

  // View Details (Navigation)
  const handleViewCompany = (company) => {
    navigate(`/super-admin/companies/${company._id}`);
  };

  // Toggle status handler
  const handleConfirmToggleStatus = async () => {
    if (!selectedCompanyForStatus) return;

    try {
      const response = await fetch(`http://localhost:5000/api/companies/${selectedCompanyForStatus._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      setIsStatusOpen(false);
      setSelectedCompanyForStatus(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Error occurred while updating status');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Stats widgets */}
      <SuperAdminStats 
        stats={stats} 
        onCreateClick={() => {
          navigate('/super-admin/companies/create');
        }} 
      />

      {/* Main Table with Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        
        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by name, code, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] placeholder:text-gray-400"
            />
          </div>

          {/* Action filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Status filter */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
              <Filter size={14} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none border-none text-gray-700 font-bold"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Sorting order */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
              <ArrowUpDown size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none border-none text-gray-700 font-bold"
              >
                <option value="desc">Newest Registered</option>
                <option value="asc">Oldest Registered</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-[#4F46E5] bg-white transition-colors"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {/* Content Board */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 font-semibold">
            <RotateCw size={24} className="animate-spin text-[#4F46E5] mr-2" />
            Loading registry...
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertTriangle className="shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={loadData} className="text-xs font-bold underline ml-auto">Retry</button>
          </div>
        ) : (
          <>
            {/* Table */}
            <CompanyTable 
              companies={paginatedCompanies}
              onView={handleViewCompany}
              onEdit={(c) => {
                setSelectedCompanyForForm(c);
                setIsFormOpen(true);
              }}
              onToggleStatus={(c, status) => {
                setSelectedCompanyForStatus(c);
                setTargetStatus(status);
                setIsStatusOpen(true);
              }}
            />

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-[#F8FAFC] border border-gray-150 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-medium">
                  Showing Page <span className="font-bold text-gray-800">{currentPage}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({filteredCompanies.length} tenants)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Modals & Drawers */}
      <CompanyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCompanyForForm(null);
        }}
        onSave={handleSaveCompany}
        company={selectedCompanyForForm}
      />



      <CompanyStatusModal
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false);
          setSelectedCompanyForStatus(null);
        }}
        onConfirm={handleConfirmToggleStatus}
        company={selectedCompanyForStatus}
        targetStatus={targetStatus}
      />

    </div>
  );
}
