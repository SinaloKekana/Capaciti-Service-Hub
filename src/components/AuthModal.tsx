import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/index.js';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight, Zap, CheckCircle2, RefreshCw, ExternalLink, KeyRound } from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';
import { api } from '../services/api.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string, role: UserRole) => Promise<any>;
  onQuickDemoLogin?: (email: string, role: string) => void;
  initialMode?: 'login' | 'register' | 'verify';
  initialEmail?: string;
  initialToken?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  initialMode = 'login',
  initialEmail = '',
  initialToken = '',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationToken, setVerificationToken] = useState(initialToken);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    if (initialEmail) setEmail(initialEmail);
    if (initialToken) setVerificationToken(initialToken);
    setError(null);
    setSuccessNotice(null);
  }, [initialMode, initialEmail, initialToken, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else if (mode === 'register') {
        const res = await onRegister(name, email, password, role);
        if (res && res.verificationUrl) {
          setVerificationUrl(res.verificationUrl);
        }
        if (res && res.verificationToken) {
          setVerificationToken(res.verificationToken);
        }
        setSuccessNotice(`Verification email sent to ${email}. Please verify your email.`);
        setMode('verify');
      } else if (mode === 'verify') {
        const verifyRes = await api.verifyEmail({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
          token: verificationToken.trim() || undefined,
        });
        setSuccessNotice('Email address verified successfully!');
        // Refresh authenticated user
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          onClose();
        } else {
          setMode('login');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address to resend verification.');
      return;
    }
    setResending(true);
    setError(null);
    try {
      const res = await api.resendVerification(email.trim().toLowerCase());
      if (res.verificationUrl) setVerificationUrl(res.verificationUrl);
      if (res.verificationToken) setVerificationToken(res.verificationToken);
      setSuccessNotice(res.message || `A new verification email was sent to ${email}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleSimulateClickLink = async () => {
    if (!verificationToken && !verificationCode) {
      setError('No verification token active.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.verifyEmail({
        token: verificationToken,
        email: email.trim().toLowerCase(),
        code: verificationCode.trim() || undefined,
      });
      setSuccessNotice('Email address successfully verified via verification link!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl relative text-slate-800 animate-in fade-in duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Logo */}
        <div className="flex items-center space-x-2.5 mb-4">
          <CapacitiLogoIcon className="w-8 h-8 rounded-lg shrink-0" />
          <div>
            <div className="font-extrabold text-sm tracking-wider uppercase text-slate-900 leading-tight">
              CAPACITI
            </div>
            <div className="text-[11px] text-sky-600 font-semibold leading-tight">
              Service Hub
            </div>
          </div>
        </div>

        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 mb-5 pb-2 justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessNotice(null); }}
              className={`pb-2 px-3 font-bold text-sm transition-colors border-b-2 -mb-[9px] cursor-pointer ${
                mode === 'login' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccessNotice(null); }}
              className={`pb-2 px-3 font-bold text-sm transition-colors border-b-2 -mb-[9px] cursor-pointer ${
                mode === 'register' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
            {mode === 'verify' && (
              <button
                type="button"
                className="pb-2 px-3 font-bold text-sm text-[#0284c7] border-b-2 border-[#0284c7] -mb-[9px]"
              >
                Verify Email
              </button>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {mode === 'login' ? 'Existing Account' : mode === 'register' ? 'New Account' : 'Security Step'}
          </span>
        </div>

        {/* Informational Subtext */}
        <div className="mb-4 text-xs text-slate-500">
          {mode === 'login' ? (
            <p>Log in with your credentials to access your ticket dashboard.</p>
          ) : mode === 'register' ? (
            <p>Register a new account as an <strong className="text-slate-800">End User</strong> or <strong className="text-slate-800">Staff</strong>.</p>
          ) : (
            <p>Verify your personal email address to activate your Capaciti Service Hub account.</p>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs mb-4 font-medium flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs mb-4 font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* VERIFICATION SCREEN */}
        {mode === 'verify' ? (
          <div className="space-y-4 text-xs">
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-slate-700 space-y-2.5">
              <div className="flex items-center space-x-2 text-sky-800 font-bold text-xs">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Verification Link Sent to Personal Email</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                A verification link has been dispatched to <strong>{email}</strong>. Please check your personal inbox (and spam/junk folder) and click the link to activate your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 font-mono tracking-widest text-center text-sm font-bold focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold transition-all shadow-xs text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <span>Confirm & Activate Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sky-600 hover:text-sky-700 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Resending...' : 'Resend Verification Email'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>

            {/* Preview helper to verify link directly */}
            {verificationUrl && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Direct Verification Link:</span>
                  <button
                    type="button"
                    onClick={handleSimulateClickLink}
                    className="text-sky-600 hover:underline inline-flex items-center space-x-1 font-bold"
                  >
                    <span>Click to Simulate Email Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-mono break-all bg-white p-1.5 rounded border border-slate-200">
                  {verificationUrl}
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Masibulele Madikane"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-xs font-medium focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@capaciti.org.za"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-xs font-medium focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-xs font-medium focus:bg-white"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-sky-500 text-xs focus:bg-white"
                >
                  <option value="CUSTOMER">End User — Submitting and tracking requests</option>
                  <option value="EMPLOYEE">Staff — Internal departmental requests & collaboration</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                  Role registration is restricted to <strong>End User</strong> and <strong>Staff</strong> only. Service Desk Technician privileges are assigned by system administrators upon review.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold transition-all shadow-xs text-xs flex items-center justify-center space-x-1.5 mt-4 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account & Send Verification'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Quick Demo Role Presets */}
            {mode === 'login' && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Quick Demo Role Logins</span>
                  <span className="text-sky-600 lowercase font-medium">click to fill</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@capaciti.org');
                      setPassword('Admin@Capaciti2026!');
                    }}
                    className="p-1.5 text-left rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 font-semibold transition-colors cursor-pointer"
                  >
                    👑 Global Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('hr.manager@capaciti.org');
                      setPassword('Manager@Capaciti2026!');
                    }}
                    className="p-1.5 text-left rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-purple-900 font-semibold transition-colors cursor-pointer"
                  >
                    👥 HR Director
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('finance.manager@capaciti.org');
                      setPassword('Manager@Capaciti2026!');
                    }}
                    className="p-1.5 text-left rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 font-semibold transition-colors cursor-pointer"
                  >
                    💰 Finance CFO
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('it.director@capaciti.org');
                      setPassword('Manager@Capaciti2026!');
                    }}
                    className="p-1.5 text-left rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 text-cyan-900 font-semibold transition-colors cursor-pointer"
                  >
                    💻 IT Director
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('facilities.manager@capaciti.org');
                      setPassword('Manager@Capaciti2026!');
                    }}
                    className="p-1.5 text-left rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200/80 text-orange-900 font-semibold transition-colors cursor-pointer"
                  >
                    🏢 Facilities Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('tech.luthando@capaciti.org');
                      setPassword('Tech@Capaciti2026!');
                    }}
                    className="p-1.5 text-left rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200/80 text-teal-900 font-semibold transition-colors cursor-pointer"
                  >
                    🛠️ Technician
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
