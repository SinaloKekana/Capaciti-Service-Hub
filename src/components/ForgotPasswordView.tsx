import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldAlert, KeyRound, Clock, ShieldCheck, Copy, Check, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';
import { api } from '../services/api.js';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
  onOpenNotifications?: () => void;
  onNavigateToReset?: (token: string) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToLogin,
  onOpenNotifications,
  onNavigateToReset,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentResetUrl, setSentResetUrl] = useState<string | null>(null);
  const [sentToken, setSentToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{
    attempted: boolean;
    provider: string;
    success: boolean;
    to: string;
    error?: string;
    resendRestricted?: boolean;
    allowedAccountEmail?: string;
    message?: string;
  } | null>(null);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please provide a valid email address (e.g. user@capaciti.org).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(cleanEmail);
      if (res.resetUrl) {
        setSentResetUrl(res.resetUrl);
      }
      if (res.resetToken) {
        setSentToken(res.resetToken);
      }
      if (res.delivery) {
        setDeliveryStatus(res.delivery);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit password reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (sentResetUrl) {
      navigator.clipboard.writeText(sentResetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyToken = () => {
    if (sentToken) {
      navigator.clipboard.writeText(sentToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleResetAnother = () => {
    setEmail('');
    setIsSubmitted(false);
    setErrorMessage(null);
    setSentResetUrl(null);
    setSentToken(null);
    setDeliveryStatus(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-800 relative">
        
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

        {/* Back Button */}
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Login</span>
        </button>

        {!isSubmitted ? (
          <div>
            {/* Title & Description */}
            <div className="mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-bold mb-2.5">
                <KeyRound className="w-3 h-3" />
                <span>Account Recovery</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Forgot Your Password?
              </h1>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Enter your registered email address and we’ll send you a secure link to reset your password.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-medium flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. name@capaciti.org or your email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Security Hint */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start space-x-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Reset links remain valid for <strong>30 minutes</strong> and are single-use for your account security.</span>
              </div>

              {/* Send Reset Link Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col space-y-2.5 text-center">
              {onNavigateToReset && (
                <button
                  type="button"
                  onClick={() => onNavigateToReset('')}
                  className="text-xs text-sky-600 hover:text-sky-800 font-bold inline-flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Already have a security token? Reset password here</span>
                </button>
              )}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs text-slate-600 hover:text-sky-600 font-semibold transition-colors cursor-pointer"
              >
                Remembered your password? <span className="text-[#0284c7] underline font-bold">Log in</span>
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation / Success State */
          <div className="text-center py-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                Password Reset Initiated
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed text-left space-y-1.5">
                <p className="font-semibold text-slate-900">
                  Password reset credentials for <strong className="text-slate-800">{email}</strong> have been generated.
                </p>
                <p className="text-[11px] text-slate-500">
                  Valid for 30 minutes for single-use verification.
                </p>
              </div>
            </div>

            {/* Resend Free Sandbox Warning or Delivery Status */}
            {deliveryStatus?.resendRestricted && (
              <div className="bg-amber-50/95 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 text-left space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Resend Free Sandbox Restriction Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Resend is currently operating in free sandbox testing mode. By Resend's security policy, testing emails can only be delivered to your verified developer address (<strong>{deliveryStatus.allowedAccountEmail || 'luthandodidiza197@gmail.com'}</strong>). Outbound mail to <strong>{email}</strong> was held by Resend.
                </p>
                <p className="text-[11px] text-amber-900 font-semibold pt-1 border-t border-amber-200/80">
                  💡 <strong>No domain?</strong> You can configure <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code> in your environment settings to deliver real emails to any address via Gmail SMTP with zero domain verification required!
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  👉 You can still reset this user immediately using the direct link or security token below!
                </p>
              </div>
            )}

            {deliveryStatus?.success && (deliveryStatus?.provider === 'gmail_smtp' || deliveryStatus?.provider === 'smtp') && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 text-left flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-900">
                    Real Email Dispatched via {deliveryStatus.provider === 'gmail_smtp' ? 'Gmail SMTP' : 'Custom SMTP'}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Delivered directly to <strong className="text-emerald-950 font-semibold">{deliveryStatus.to}</strong> without requiring any custom domain registration!
                  </div>
                </div>
              </div>
            )}

            {deliveryStatus && !deliveryStatus.success && (deliveryStatus.provider === 'gmail_smtp' || deliveryStatus.provider === 'smtp') && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 text-left space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{deliveryStatus.provider === 'gmail_smtp' ? 'Gmail SMTP Dispatch Issue' : 'SMTP Dispatch Issue'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700">
                  {deliveryStatus.message || deliveryStatus.error}
                </p>
              </div>
            )}

            {deliveryStatus?.success && deliveryStatus?.provider === 'resend' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 text-left flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Real Email Dispatched via Resend:</span> Outbound reset message sent to <strong className="text-emerald-950">{deliveryStatus.to}</strong>.
                </div>
              </div>
            )}

            {/* Direct Security Token Card */}
            {sentToken && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    One-Time Security Token
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="text-[11px] text-sky-600 hover:text-sky-800 font-bold inline-flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Token</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 break-all select-all">
                  {sentToken}
                </div>
              </div>
            )}

            {/* Live Verification Link & Direct Testing Card */}
            {sentResetUrl && (
              <div className="p-4 bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-sky-900">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Public Password Reset Link</span>
                  </div>
                  <span className="text-[10px] bg-sky-200/70 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                    Active (30 mins)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {onNavigateToReset && sentToken ? (
                    <button
                      type="button"
                      onClick={() => onNavigateToReset(sentToken)}
                      className="flex-1 py-2.5 px-3.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <span>Open Reset Password Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <a
                      href={sentResetUrl}
                      className="flex-1 py-2.5 px-3.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all text-center"
                    >
                      <span>Open Reset Password Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* In-App Notifications Drawer Option */}
            {onOpenNotifications && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-start space-x-2.5 text-[11px] text-slate-700">
                <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">In-App Notification Center:</span>
                  <button
                    type="button"
                    onClick={onOpenNotifications}
                    className="block mt-0.5 font-bold text-sky-600 hover:text-sky-800 underline cursor-pointer"
                  >
                    View dispatched email & security receipts →
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Back to Login
              </button>

              <button
                type="button"
                onClick={handleResetAnother}
                className="w-full py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Send to a different email address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
