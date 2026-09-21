import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import {
  ShoppingBag,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Store,
  UserCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'ROLE_SELLER' ? 'ROLE_SELLER' : 'ROLE_BUYER';

  // Step 1: form details, Step 2: OTP verification
  const [step, setStep] = useState(1);

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // OTP State
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password validation rules
  const rules = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);
  const isPasswordMatching = password.length > 0 && password === confirmPassword;

  // Cooldown timer effect
  useEffect(() => {
    let interval = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please make sure your password satisfies all security criteria');
      return;
    }

    if (!isPasswordMatching) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.sendOtp(email, 'REGISTRATION');
      toast.success(`Verification OTP sent to ${email}`);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setSubmitting(true);
    try {
      await authApi.sendOtp(email, 'REGISTRATION');
      toast.success(`New OTP sent to ${email}`);
      setCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleFinalRegister = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        fullName,
        email,
        password,
        confirmPassword,
        city,
        phone,
        role,
        otp,
      });

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

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Create your Resellara account' : 'Verify your email address'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {step === 1
              ? 'Join thousands of buyers and verified sellers in your community.'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {step === 1 ? (
            <>
              {/* Role Selector Tabs */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Choose your primary role
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_BUYER')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                      role === 'ROLE_BUYER'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>I'm a Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_SELLER')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                      role === 'ROLE_SELLER'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>I'm a Seller</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
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

                {/* Password Requirements Checklist */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                    Password Security Requirements:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1.5 ${rules.length ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      {rules.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>At least 6 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${rules.uppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      {rules.uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>1 uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${rules.lowercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      {rules.lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>1 lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${rules.number ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      {rules.number ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>At least 1 number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 sm:col-span-2 ${rules.special ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      {rules.special ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>1 special character (@$!%*?&#^...)</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white ${
                        confirmPassword.length > 0 && !isPasswordMatching
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-[11px] mt-1 font-medium ${isPasswordMatching ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {isPasswordMatching ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad, Telangana"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !isPasswordValid || !isPasswordMatching}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition mt-2"
                >
                  {submitting ? 'Sending Verification Code...' : 'Send Email OTP to Verify'}
                </button>
              </form>
            </>
          ) : (
            /* Step 2: OTP Verification Screen */
            <form onSubmit={handleFinalRegister} className="space-y-6 text-center">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-left">
                <div className="flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">A 6-digit OTP has been dispatched.</p>
                    <p className="text-emerald-700 mt-0.5">
                      Please check your inbox at <strong>{email}</strong>. The code is valid for 5 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3 text-2xl font-black tracking-widest text-center bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 hover:text-slate-800 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0 || submitting}
                  onClick={handleResendOtp}
                  className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition"
              >
                {submitting ? 'Verifying & Creating Account...' : `Complete Registration as ${role === 'ROLE_SELLER' ? 'Seller' : 'Buyer'}`}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:underline">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}