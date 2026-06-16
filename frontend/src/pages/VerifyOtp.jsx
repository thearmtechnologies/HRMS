import React, { useState, useEffect } from 'react';
import { Hash, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyOtp() {
  const location = useLocation();
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  // If no email was passed, maybe they shouldn't be here
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  if (!email) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid or expired OTP');
      } else {
        // Success! Go to reset password
        navigate('/reset-password', { state: { email, otp } });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Failed to resend OTP');
      } else {
        setMessage('OTP has been resent to your email.');
        setTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      setError('An error occurred while resending OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <button 
          onClick={() => navigate('/forgot-password')}
          className="flex items-center text-sm text-[#8f9192] hover:text-[#1E293B] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Verify OTP</h2>
        <p className="text-[#8f9192] mb-6">Enter the OTP sent to <strong>{email}</strong>.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#8f9192] block mb-1">OTP Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none tracking-widest text-lg"
                placeholder="000000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#3B82F6] hover:bg-opacity-90 text-white font-bold rounded-lg transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {canResend ? (
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-[#3B82F6] hover:text-blue-700 font-medium flex items-center justify-center w-full"
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Resend OTP
            </button>
          ) : (
            <p className="text-[#8f9192]">
              You can resend OTP in <span className="font-bold text-[#1E293B]">{timer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
