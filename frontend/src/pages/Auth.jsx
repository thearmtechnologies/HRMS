import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Building2, ShieldCheck, Users, Wallet } from 'lucide-react';

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Login logic goes here
    console.log('Login attempt with:', email);
  };

  return (
    // Main Background: #f0f3f5
    <div className="min-h-screen bg-[#f0f3f5] flex items-center justify-center p-4 sm:p-8 font-sans text-sm sm:text-base">
      
      {/* Card Container: #fdfdfe */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-[#fdfdfe] rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* Left Side - Branding (Primary Color: #3d766d) */}
        <div className="w-full md:w-1/2 bg-[#3d766d] text-white p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Building2 size={32} className="text-[#fdfdfe]" />
              </div>
              <span className="text-2xl font-bold tracking-wide text-[#fdfdfe]">ARM HRMS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Manage your <br className="hidden sm:block" /> workforce intelligently.
            </h1>
            
            <p className="text-[#d6d9df] text-base sm:text-lg max-w-sm mb-8 sm:mb-12 leading-relaxed">
              A complete suite for attendance, leave management, payroll, and departmental operations.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="flex items-center gap-3">
              <Users className="text-[#bdc2c7]" size={20} />
              <span className="text-[#fdfdfe] text-sm font-medium">HR & Employees</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#bdc2c7]" size={20} />
              <span className="text-[#fdfdfe] text-sm font-medium">Leave & Attendance</span>
            </div>
            <div className="flex items-center gap-3">
              <Wallet className="text-[#bdc2c7]" size={20} />
              <span className="text-[#fdfdfe] text-sm font-medium">Payroll & Finance</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="text-[#bdc2c7]" size={20} />
              <span className="text-[#fdfdfe] text-sm font-medium">Projects Dept</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-center bg-[#fdfdfe]">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-[#3d766d] mb-2">Welcome Back</h2>
            <p className="text-[#8f9192] mb-8">Please enter your credentials to access the portal.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#8f9192] block">Work Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#bdc2c7]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#f0f3f5] border border-[#d6d9df] rounded-xl text-[#8f9192] focus:outline-none focus:ring-2 focus:ring-[#3d766d] focus:border-transparent transition-all placeholder:text-[#bdc2c7]"
                    placeholder="john.doe@company.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#8f9192] block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#bdc2c7]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 bg-[#f0f3f5] border border-[#d6d9df] rounded-xl text-[#8f9192] focus:outline-none focus:ring-2 focus:ring-[#3d766d] focus:border-transparent transition-all placeholder:text-[#bdc2c7]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8f9192] hover:text-[#3d766d] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#d6d9df] text-[#3d766d] focus:ring-[#3d766d]"
                  />
                  <span className="text-sm text-[#8f9192] group-hover:text-[#3d766d] transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-sm font-semibold text-[#3d766d] hover:underline focus:outline-none">
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#3d766d] hover:bg-opacity-90 text-[#fdfdfe] font-bold rounded-xl shadow-lg shadow-[#3d766d]/20 transition-all transform hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d766d] mt-8"
              >
                Sign In
              </button>
            </form>
            
            <div className="mt-10 text-center">
              <p className="text-sm text-[#8f9192]">
                Having trouble logging in? <br/>
                <button className="text-[#3d766d] font-semibold hover:underline focus:outline-none mt-1">
                  Contact IT Support
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}