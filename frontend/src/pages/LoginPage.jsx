import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import {
  ShoppingBag,
  Lock,
  Mail,
  UserCheck,
  KeyRound,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  HelpCircle,
  LogIn,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password modal state
  // null | 'EMAIL' | 'OTP_CHOICE' | 'RESET_PASSWORD'
  const [forgotModal, setForgotModal] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Reset password inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Cooldown timer
  useEffect(() => {
    let interval = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_SELLER' && from === '/') {
        navigate('/seller');
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSubmitting(true);
    try {
      const user = await login(demoEmail, demoPass);
      if (user.role === 'ROLE_SELLER') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  // Forgot Password: Request OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your registered email');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.sendOtp(forgotEmail, 'FORGOT_PASSWORD');
      toast.success(`If an account exists, a 6-digit OTP has been sent to ${forgotEmail}`);
      setForgotModal('OTP_CHOICE');
      setCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to send recovery code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (cooldown > 0) return;
    setSubmitting(true);
    try {
      await authApi.sendOtp(forgotEmail, 'FORGOT_PASSWORD');
      toast.success(`New OTP sent to ${forgotEmail}`);
      setCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setSubmitting(false);
    }
  };

  // Option A: Direct Login via OTP
  const handleOtpLogin = async () => {
    if (!forgotOtp || forgotOtp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setSubmitting(true);
    try {
      const user = await loginWithOtp(forgotEmail, forgotOtp);
      setForgotModal(null);
      if (user.role === 'ROLE_SELLER') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  // Option B: Reset Password
  const resetRules = {
    length: newPassword.length >= 6,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(newPassword),
  };
  const isResetPasswordValid = Object.values(resetRules).every(Boolean);
  const isResetPasswordMatching = newPassword.length > 0 && newPassword === confirmPassword;

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isResetPasswordValid) {
      toast.error('New password does not meet security criteria');
      return;
    }
    if (!isResetPasswordMatching) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword,
        confirmPassword,
      });
      toast.success('Password updated successfully! You can now log in.');
      setPassword(newPassword);
      setEmail(forgotEmail);
      setForgotModal(null);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back to Resellara
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to manage your listings or track your item offers.
          </p>
        </div>

        {/* Instant Demo Accounts */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant Demo Accounts (One Click)</span>
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('seller@sellara.com', 'Sellara@123', 'ROLE_SELLER')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Login as Seller
              <span className="block text-[10px] opacity-80 font-normal">Alex Rivera</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('buyer@sellara.com', 'Sellara@123', 'ROLE_BUYER')}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition shadow-sm"
            >
              Login as Buyer
              <span className="block text-[10px] text-slate-500 font-normal">Sarah Chen</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seller@sellara.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email || '');
                    setForgotModal('EMAIL');
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition mt-2"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password / OTP Login Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95">
            {/* Modal Stage 1: Request OTP */}
            {forgotModal === 'EMAIL' && (
              <form onSubmit={handleForgotSendOtp} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Forgot Password / OTP Login</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your registered email to receive a secure 6-digit login or reset code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
                  >
                    {submitting ? 'Sending Code...' : 'Send Recovery OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Stage 2: Enter OTP & Choose Option A (Login via OTP) or Option B (Reset Password) */}
            {forgotModal === 'OTP_CHOICE' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Enter Verification Code</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    A 6-digit OTP was sent to <strong>{forgotEmail}</strong> (valid for 5 mins).
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3 text-2xl font-black tracking-widest text-center bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setForgotModal('EMAIL')}
                    className="flex items-center gap-1 hover:text-slate-800"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    disabled={cooldown > 0 || submitting}
                    onClick={handleResendForgotOtp}
                    className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>

                {/* Option A & Option B Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    disabled={submitting || forgotOtp.length !== 6}
                    onClick={handleOtpLogin}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Option A: Login Directly Using OTP</span>
                  </button>

                  <button
                    type="button"
                    disabled={forgotOtp.length !== 6}
                    onClick={() => setForgotModal('RESET_PASSWORD')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Option B: Set a New Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotModal(null)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Modal Stage 3: Reset Password */}
            {forgotModal === 'RESET_PASSWORD' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Set New Password</h3>
                  <p className="text-xs text-slate-500">Enter a secure new password for your account.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Password Criteria Checklist */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1">
                  <div className={`flex items-center gap-1.5 ${resetRules.length ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {resetRules.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${resetRules.uppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {resetRules.uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${resetRules.lowercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {resetRules.lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>1 lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${resetRules.number ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {resetRules.number ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>At least 1 number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${resetRules.special ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {resetRules.special ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>1 special character (@$!%*?&#^...)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  {confirmPassword.length > 0 && (
                    <p className={`text-[11px] mt-1 font-medium ${isResetPasswordMatching ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {isResetPasswordMatching ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal('OTP_CHOICE')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isResetPasswordValid || !isResetPasswordMatching}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
                  >
                    {submitting ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}