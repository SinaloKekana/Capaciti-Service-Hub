import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/index.js';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  onQuickDemoLogin?: (email: string, role: string) => void;
  onForgotPassword?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onForgotPassword,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password, role);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl relative text-slate-800">
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
              onClick={() => { setMode('login'); setError(null); }}
              className={`pb-2 px-3 font-bold text-sm transition-colors border-b-2 -mb-[9px] cursor-pointer ${
                mode === 'login' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`pb-2 px-3 font-bold text-sm transition-colors border-b-2 -mb-[9px] cursor-pointer ${
                mode === 'register' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {mode === 'login' ? 'Existing Account' : 'New Account'}
          </span>
        </div>

        {/* Informational Subtext */}
        <div className="mb-4 text-xs text-slate-500">
          {mode === 'login' ? (
            <p>Log in with your credentials to access your ticket dashboard.</p>
          ) : (
            <p>Register a new account as an <strong className="text-slate-800">End User</strong> or <strong className="text-slate-800">Technician</strong>.</p>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs mb-4 font-medium flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">Password</label>
              {mode === 'login' && onForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onForgotPassword();
                  }}
                  className="text-xs text-[#0284c7] hover:text-[#0369a1] font-bold hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
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
            {mode === 'login' && !onForgotPassword && (
              <div className="text-right mt-1">
                <span className="text-[11px] text-slate-400">Secure 256-bit encryption</span>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-sky-500 text-xs focus:bg-white"
              >
                <option value="CUSTOMER">End User / Learner — Submitting and tracking requests</option>
                <option value="EMPLOYEE">Internal Staff — Departmental requests & collaboration</option>
                <option value="TECHNICIAN">Service Desk Technician — Resolving assigned tickets</option>
              </select>
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
                <span>{mode === 'login' ? 'Sign In' : 'Complete Registration'}</span>
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
                <button
                  type="button"
                  onClick={() => {
                    setEmail('mbalientlempendu02@gmail.com');
                    setPassword('Capaciti2026!');
                  }}
                  className="p-1.5 text-left rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 font-semibold transition-colors cursor-pointer col-span-2 flex items-center justify-between"
                >
                  <span>🌸 Mbali Entle Mpendu</span>
                  <span className="text-[10px] text-emerald-700 font-mono">mbalientlempendu02@gmail.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('luthandodidiza197@gmail.com');
                    setPassword('Tech@Capaciti2026!');
                  }}
                  className="p-1.5 text-left rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-sky-900 font-semibold transition-colors cursor-pointer col-span-2 flex items-center justify-between"
                >
                  <span>🛠️ Luthando Didiza</span>
                  <span className="text-[10px] text-sky-700 font-mono">luthandodidiza197@gmail.com</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
