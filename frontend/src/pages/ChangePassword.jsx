import React, { useState, useContext } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, user, updateProfile } = useContext(AuthContext);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }

    if (!validatePassword(newPassword)) {
      return setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        setMessage('Password changed successfully.');
        
        // Update user context to remove isFirstLogin flag
        if (user && user.isFirstLogin) {
           updateProfile({ ...user, isFirstLogin: false });
           setTimeout(() => {
             // Redirect based on role
             switch(user.role) {
               case 'admin': navigate('/admin-dashboard'); break;
               case 'hr': navigate('/hr-dashboard'); break;
               case 'project_manager': navigate('/project-manager/dashboard'); break;
               case 'department_manager': navigate('/department-manager/dashboard'); break;
               case 'employee': navigate('/employee-dashboard'); break;
               default: navigate('/unauthorized');
             }
           }, 2000);
        } else {
           setTimeout(() => navigate(-1), 2000); // go back
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Change Password</h2>
        {user?.isFirstLogin ? (
           <p className="text-[#8f9192] mb-6 text-sm">Please change your default password before continuing.</p>
        ) : (
           <p className="text-[#8f9192] mb-6 text-sm">Update your account password securely.</p>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#8f9192] block mb-1">Current Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#8f9192] block mb-1">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#8f9192] block mb-1">Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#3B82F6] hover:bg-opacity-90 text-white font-bold rounded-lg transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
