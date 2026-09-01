import React, { useState, useEffect } from 'react';
import { RequestItem } from '../types/index.js';
import { calculateDetailedSLA, SLACalculationResult } from '../utils/slaCalculator.js';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Hourglass,
  Calendar,
  Zap,
  Check
} from 'lucide-react';

/**
 * Hook to get real-time ticking SLA calculation updated every second
 */
export function useSLATimer(ticket: RequestItem | null | undefined): SLACalculationResult | null {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // If ticket is already resolved, no need for active 1s ticker, just update once
    if (ticket && (ticket.status === 'Resolved' || ticket.status === 'Closed')) {
      return;
    }

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket?.id, ticket?.status]);

  if (!ticket) return null;
  return calculateDetailedSLA(ticket, now);
}

interface SLACountdownBadgeProps {
  ticket: RequestItem;
  className?: string;
  showIcon?: boolean;
}

/**
 * Compact, high-visibility countdown badge for table rows and card headers
 */
export const SLACountdownBadge: React.FC<SLACountdownBadgeProps> = ({
  ticket,
  className = '',
  showIcon = true,
}) => {
  const sla = useSLATimer(ticket);
  if (!sla) return null;

  // 1. Resolved state
  if (sla.isResolved) {
    if (sla.isWithinSLA) {
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs ${className}`}
          title={`Resolved in ${sla.resolutionOutcome?.durationFormatted} (${sla.resolutionOutcome?.differenceFormatted})`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
          <span>Met SLA ({sla.resolutionOutcome?.durationFormatted})</span>
        </span>
      );
    } else {
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs ${className}`}
          title={`Resolved in ${sla.resolutionOutcome?.durationFormatted} (${sla.resolutionOutcome?.differenceFormatted})`}
        >
          {showIcon && <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />}
          <span>Resolved Above SLA (+{sla.resolutionOutcome?.differenceFormatted.split(' ')[0]})</span>
        </span>
      );
    }
  }

  // 2. Active Breached state
  if (sla.isBreached) {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs ${className}`}
        title={`SLA Breached! Exceeded target by ${sla.countdown.formattedCountdown}`}
      >
        {showIcon && (
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
        )}
        <span className="font-mono">+{sla.countdown.formattedCountdown} Breached</span>
      </span>
    );
  }

  // 3. Active At Risk state (< 25% or < 2 hours remaining)
  if (sla.isAtRisk) {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs ${className}`}
        title={`SLA At Risk! ${sla.countdown.formattedCountdown} remaining before target deadline`}
      >
        {showIcon && (
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
          </span>
        )}
        <span className="font-mono">{sla.countdown.formattedCountdown} left</span>
      </span>
    );
  }

  // 4. Active Within SLA (Normal countdown)
  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs ${className}`}
      title={`Target: ${sla.targetHours}h. Countdown: ${sla.countdown.formattedCountdown} remaining`}
    >
      {showIcon && <Clock className="w-3 h-3 text-emerald-600 shrink-0" />}
      <span className="font-mono">{sla.countdown.formattedCountdown} left</span>
    </span>
  );
};

interface SLACountdownCardProps {
  ticket: RequestItem;
  className?: string;
}

/**
 * Detailed SLA Monitor Card for Modals, Detail Views, and Submission Confirmations
 */
export const SLACountdownCard: React.FC<SLACountdownCardProps> = ({
  ticket,
  className = '',
}) => {
  const sla = useSLATimer(ticket);
  if (!sla) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs font-sans text-slate-800 ${className}`}>
      {/* Header with Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            SLA Countdown & Resolution Tracker
          </span>
        </div>

        <div>
          {sla.isResolved ? (
            sla.isWithinSLA ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RESOLVED WITHIN SLA</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>RESOLVED ABOVE SLA TARGET</span>
              </span>
            )
          ) : sla.isBreached ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SLA BREACHED (OVERDUE)</span>
            </span>
          ) : sla.isAtRisk ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SLA AT RISK (&lt;25% REMAINING)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Hourglass className="w-3.5 h-3.5" />
              <span>COUNTDOWN ACTIVE (WITHIN SLA)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Digital Clock Timer Display */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {sla.isResolved
            ? 'Total Resolution Duration'
            : sla.isBreached
            ? 'Time Exceeded Beyond SLA Target'
            : 'Time Remaining Until SLA Deadline'}
        </div>

        {/* Digital Clock Display */}
        <div className="flex items-baseline space-x-2 font-mono">
          {sla.isResolved ? (
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {sla.resolutionOutcome?.durationFormatted}
            </div>
          ) : (
            <>
              {sla.countdown.days > 0 && (
                <div className="flex flex-col items-center">
                  <span className={`text-2xl sm:text-3xl font-extrabold ${sla.isBreached ? 'text-rose-600' : 'text-slate-900'}`}>
                    {pad(sla.countdown.days)}
                  </span>
                  <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">Days</span>
                </div>
              )}
              {sla.countdown.days > 0 && <span className="text-xl font-bold text-slate-300">:</span>}

              <div className="flex flex-col items-center">
                <span className={`text-2xl sm:text-3xl font-extrabold ${sla.isBreached ? 'text-rose-600' : 'text-slate-900'}`}>
                  {sla.isBreached ? `+${pad(sla.countdown.hours)}` : pad(sla.countdown.hours)}
                </span>
                <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">Hours</span>
              </div>
              <span className="text-xl font-bold text-slate-300">:</span>

              <div className="flex flex-col items-center">
                <span className={`text-2xl sm:text-3xl font-extrabold ${sla.isBreached ? 'text-rose-600' : 'text-slate-900'}`}>
                  {pad(sla.countdown.minutes)}
                </span>
                <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">Minutes</span>
              </div>
              <span className="text-xl font-bold text-slate-300">:</span>

              <div className="flex flex-col items-center">
                <span className={`text-2xl sm:text-3xl font-extrabold ${sla.isBreached ? 'text-rose-600' : 'text-slate-900'}`}>
                  {pad(sla.countdown.seconds)}
                </span>
                <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">Seconds</span>
              </div>
            </>
          )}
        </div>

        {/* Informative Explanation Subtitle */}
        <p className="text-xs text-slate-600 max-w-md pt-1">
          {sla.isResolved ? (
            sla.isWithinSLA ? (
              <span className="text-emerald-700 font-medium">
                ✓ Successfully resolved in {sla.resolutionOutcome?.durationFormatted} — which is {sla.resolutionOutcome?.differenceFormatted} of the {sla.targetHours}h SLA window.
              </span>
            ) : (
              <span className="text-rose-700 font-medium">
                ⚠ Resolved in {sla.resolutionOutcome?.durationFormatted} — which exceeded the standard {sla.targetHours}h SLA limit by {sla.resolutionOutcome?.differenceFormatted}.
              </span>
            )
          ) : sla.isBreached ? (
            <span className="text-rose-700 font-medium">
              ⚠ Ticket has exceeded the required {sla.targetHours}-hour resolution timeframe by {sla.countdown.formattedCountdown}. Immediate technician attention requested.
            </span>
          ) : sla.isAtRisk ? (
            <span className="text-amber-700 font-medium">
              ⚠ Critical countdown warning: Less than 25% of the {sla.targetHours}-hour resolution timeframe remains.
            </span>
          ) : (
            <span className="text-slate-600">
              Standard {sla.targetHours}-hour SLA resolution window for <strong className="text-slate-800 font-semibold">{ticket.priority}</strong> priority requests.
            </span>
          )}
        </p>
      </div>

      {/* Progress Bar (0 to 100%) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-500">SLA Window Progress</span>
          <span className={sla.isBreached ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
            {sla.isBreached ? '100% (Breached)' : `${Math.round(sla.percentElapsed)}% elapsed`}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              sla.isResolved
                ? sla.isWithinSLA
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
                : sla.isBreached
                ? 'bg-rose-500'
                : sla.isAtRisk
                ? 'bg-amber-500'
                : 'bg-[#0284c7]'
            }`}
            style={{ width: `${Math.min(100, sla.percentElapsed)}%` }}
          />
        </div>
      </div>

      {/* Milestone Timestamps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-[11px]">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Ticket Logged</span>
          <span className="font-semibold text-slate-800">
            {sla.createdAt.toLocaleDateString()} {sla.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">SLA Target Deadline</span>
          <span className="font-semibold text-slate-800">
            {sla.deadline.toLocaleDateString()} {sla.deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">
            {sla.isResolved ? 'Resolved Date/Time' : 'Target Window'}
          </span>
          <span className="font-semibold text-slate-800">
            {sla.isResolved && sla.resolvedAt
              ? `${sla.resolvedAt.toLocaleDateString()} ${sla.resolvedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : `${sla.targetHours} Hours (${ticket.priority} priority)`}
          </span>
        </div>
      </div>
    </div>
  );
};
