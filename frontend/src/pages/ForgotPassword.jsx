import React, { useState, useContext, useEffect } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ForgotPassword() {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || otpSent) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        setMessage(data.message || 'OTP sent to your email.');
        setOtpSent(true);
        // Go to verify OTP page with email state
        setTimeout(() => {
          navigate('/verify-otp', { state: { email } });
        }, 2000);
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
        <button 
          onClick={() => user ? navigate(-1) : navigate('/login')}
          className="flex items-center text-sm text-[#8f9192] hover:text-[#1E293B] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {user ? 'Back' : 'Back to Login'}
        </button>

        <h2 className="text-2xl font-bold text-[#1E293B] mb-2">{user ? 'Change / Reset Password' : 'Forgot Password'}</h2>
        <p className="text-[#8f9192] mb-6">
          {user 
            ? "We'll send a verification OTP to your registered email to reset your password securely." 
            : "Enter your email address and we'll send you an OTP to reset your password."}
        </p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-[#8f9192] block mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || otpSent}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpSent}
            className="w-full py-2 px-4 bg-[#3B82F6] hover:bg-opacity-90 text-white font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : otpSent ? 'OTP Sent (Redirecting...)' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
