import React, { useState, useEffect } from 'react';
import { IndianRupee, Loader2 } from 'lucide-react';

const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export default function EmployeeSalaryAdvances({ employeeId }) {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAdvances = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/advance?employee=${employeeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          let data = await response.json();
          data = data.filter(a => a.employee === employeeId || (a.employee && a.employee._id === employeeId));
          setAdvances(data);
        } else {
          console.error('Failed to fetch advances');
        }
      } catch (err) {
        console.error('An error occurred while fetching advances', err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchAdvances();
    }
  }, [employeeId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee size={18} className="text-blue-600" />
            Salary Advances
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg">
            {advances.length} Records
          </span>
        </div>
        
        {advances.length === 0 ? (
          <div className="p-8 text-center">
            <IndianRupee size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium text-sm">No salary advances found for this employee</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Request Date</th>
                  <th className="p-4 font-semibold border-b">Amount</th>
                  <th className="p-4 font-semibold border-b">Balance</th>
                  <th className="p-4 font-semibold border-b">Method</th>
                  <th className="p-4 font-semibold border-b">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {advances.map(advance => (
                  <tr key={advance._id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(advance.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {formatINR(advance.amount)}
                    </td>
                    <td className="p-4 text-sm font-bold text-blue-600">
                      {formatINR(advance.outstandingBalance)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {advance.recoveryMethod}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        advance.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        advance.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                        advance.status === 'Recovering' ? 'bg-blue-100 text-blue-700' :
                        advance.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        advance.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {advance.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
