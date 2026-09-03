import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';
import { api } from '../services/api.js';

interface ResetPasswordViewProps {
  token: string;
  onBackToLogin: () => void;
  onRequestNewResetLink: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  token,
  onBackToLogin,
  onRequestNewResetLink,
}) => {
  const [currentToken, setCurrentToken] = useState<string>(() => {
    if (token && token.trim()) return token.trim();
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('resetToken') || searchParams.get('token');
      if (urlToken && urlToken.trim()) return urlToken.trim();
      
      const hash = window.location.hash || '';
      const hashMatch = hash.match(/token=([a-zA-Z0-9_-]+)/);
      if (hashMatch && hashMatch[1]) return hashMatch[1].trim();
    }
    return '';
  });

  const [manualTokenInput, setManualTokenInput] = useState('');
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<{
    valid: boolean;
    email?: string;
    name?: string;
    reason?: string;
    error?: string;
  } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync currentToken if prop changes
  useEffect(() => {
    if (token && token.trim() && token.trim() !== currentToken) {
      setCurrentToken(token.trim());
    }
  }, [token]);

  // Verify token on mount or currentToken change
  useEffect(() => {
    let isMounted = true;
    const checkToken = async () => {
      setIsVerifyingToken(true);
      setTokenStatus(null);
      setSubmitError(null);

      const clean = currentToken.trim();
      if (!clean) {
        if (isMounted) {
          setTokenStatus({
            valid: false,
            reason: 'missing',
            error: 'No password reset token was detected. Enter your token below or request a new reset link.',
          });
          setIsVerifyingToken(false);
        }
        return;
      }

      try {
        const result = await api.verifyResetToken(clean);
        if (isMounted) {
          setTokenStatus(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setTokenStatus({
            valid: false,
            reason: 'invalid',
            error: 'This password reset link is invalid or has expired. Please request a new password reset link.',
          });
        }
      } finally {
        if (isMounted) {
          setIsVerifyingToken(false);
        }
      }
    };

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [currentToken]);

  // Real-time password requirement validators
  const hasMin8 = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword);

  const allRequirementsMet = hasMin8 && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Strength score calculation (0 to 100)
  const calculateStrength = () => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-400' };
    let passedCount = 0;
    if (hasMin8) passedCount++;
    if (hasUpper) passedCount++;
    if (hasLower) passedCount++;
    if (hasNumber) passedCount++;
    if (hasSpecial) passedCount++;
    if (newPassword.length >= 12) passedCount++;

    if (passedCount <= 2) {
      return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    } else if (passedCount <= 4) {
      return { score: 60, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    } else {
      return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
    }
  };

  const strength = calculateStrength();
  const isFormReadyToSubmit = allRequirementsMet && passwordsMatch && tokenStatus?.valid && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormReadyToSubmit) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await api.resetPassword(currentToken.trim(), newPassword.trim());
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err.message || 'Unable to update password. Please try again.';
      setSubmitError(msg);
      if (msg.includes('expired') || msg.includes('invalid') || msg.includes('used')) {
        setTokenStatus({
          valid: false,
          reason: 'expired',
          error: 'This password reset link is invalid or has expired. Please request a new password reset link.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-800 relative">
        
        {/* Top Brand Header */}
        <div className="flex items-center space-x-3 mb-6">
          <CapacitiLogoIcon className="w-9 h-9 rounded-xl shrink-0" />
          <div>
            <div className="font-extrabold text-sm tracking-wider uppercase text-slate-900 leading-tight">
              CAPACITI
            </div>
            <div className="text-xs text-sky-600 font-semibold leading-tight">
              Enterprise Identity & Access
            </div>
          </div>
        </div>

        {/* Loading State for Token Verification */}
        {isVerifyingToken && (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Verifying security token...</p>
          </div>
        )}

        {/* INVALID OR EXPIRED TOKEN STATE */}
        {!isVerifyingToken && !isSuccess && (!tokenStatus || !tokenStatus.valid) && (
          <div className="text-center py-2 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                Invalid or Expired Link
              </h2>
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 leading-relaxed font-medium">
                {tokenStatus?.error || 'This password reset link is invalid or has expired. Please request a new password reset link.'}
              </div>
            </div>

            {/* Manual Token Entry Fallback */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                <span>Have a reset token? Enter it manually:</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  placeholder="Paste token here..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualTokenInput.trim()) {
                      setCurrentToken(manualTokenInput.trim());
                    }
                  }}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onRequestNewResetLink}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request New Reset Link</span>
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* SUCCESSFUL PASSWORD RESET STATE */}
        {!isVerifyingToken && isSuccess && (
          <div className="text-center py-2 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                Password Reset Successful
              </h2>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed font-medium">
                Your password has been successfully updated. You can now log in using your new password.
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE RESET PASSWORD FORM (TOKEN IS VALID) */}
        {!isVerifyingToken && !isSuccess && tokenStatus?.valid && (
          <div>
            {/* Header / Title */}
            <div className="mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-bold mb-2.5">
                <KeyRound className="w-3 h-3" />
                <span>Secure Password Update</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Create a New Password
              </h1>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {tokenStatus.email ? (
                  <>Updating credentials for <strong className="text-slate-800">{tokenStatus.email}</strong>.</>
                ) : (
                  'Choose a strong, unique password to secure your account.'
                )}
              </p>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-medium flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* New Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="mt-1 flex items-center space-x-1.5 text-[11px]">
                    {passwordsMatch ? (
                      <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Passwords match</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold flex items-center space-x-1">
                        <X className="w-3 h-3" />
                        <span>Passwords do not match</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-700 mb-1">Password Requirements:</div>
                
                <div className={`flex items-center space-x-2 ${hasMin8 ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasMin8 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Minimum 8 characters</span>
                </div>

                <div className={`flex items-center space-x-2 ${hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasUpper ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>At least 1 uppercase letter (A-Z)</span>
                </div>

                <div className={`flex items-center space-x-2 ${hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasLower ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>At least 1 lowercase letter (a-z)</span>
                </div>

                <div className={`flex items-center space-x-2 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasNumber ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>At least 1 number (0-9)</span>
                </div>

                <div className={`flex items-center space-x-2 ${hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasSpecial ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>At least 1 special character (!@#$%^&*...)</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormReadyToSubmit}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
              >
                Cancel and return to <span className="text-[#0284c7] underline font-bold">Login</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
