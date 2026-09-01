import { RequestItem, Priority, SLAStatus } from '../types/index.js';

export interface SLACalculationResult {
  createdAt: Date;
  targetHours: number;
  deadline: Date;
  isResolved: boolean;
  resolvedAt: Date | null;
  
  // Timing values
  elapsedMs: number;
  totalTargetMs: number;
  remainingMs: number; // Positive if remaining, negative if breached/overdue
  percentElapsed: number; // 0 to 100
  
  // Status flags
  status: SLAStatus;
  isWithinSLA: boolean;
  isAtRisk: boolean;
  isBreached: boolean;
  
  // Countdown breakdown
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    formattedCountdown: string; // e.g. "05:23:14" or "1d 04:12:00"
    isOverdue: boolean;
    overdueFormatted: string; // e.g. "+02:15:30 overdue"
  };
  
  // Resolution outcome
  resolutionOutcome?: {
    totalDurationMs: number;
    durationFormatted: string; // e.g. "3h 45m 12s"
    resolvedWithinSLA: boolean;
    differenceMs: number; // difference between target and actual
    differenceFormatted: string; // e.g. "4h 15m ahead" or "2h 30m exceeded"
    label: string; // e.g. "Resolved Within SLA" or "Resolved Above SLA Limit"
  };
}

export function getSLATargetHoursForPriority(priority?: Priority): number {
  switch (priority) {
    case 'Urgent':
      return 2;
    case 'High':
      return 8;
    case 'Medium':
      return 24;
    case 'Low':
      return 72;
    default:
      return 24;
  }
}

export function calculateDetailedSLA(
  ticket: Pick<RequestItem, 'createdAt' | 'priority' | 'status' | 'slaTargetHours' | 'resolvedAt' | 'updatedAt'>,
  currentDate: Date = new Date()
): SLACalculationResult {
  const createdAt = new Date(ticket.createdAt);
  const targetHours = ticket.slaTargetHours || getSLATargetHoursForPriority(ticket.priority);
  const totalTargetMs = targetHours * 60 * 60 * 1000;
  const deadline = new Date(createdAt.getTime() + totalTargetMs);
  
  const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';
  
  let resolvedAt: Date | null = null;
  if (isResolved) {
    if (ticket.resolvedAt) {
      resolvedAt = new Date(ticket.resolvedAt);
    } else if (ticket.updatedAt) {
      resolvedAt = new Date(ticket.updatedAt);
    } else {
      resolvedAt = currentDate;
    }
  }

  const comparisonTime = isResolved && resolvedAt ? resolvedAt.getTime() : currentDate.getTime();
  const elapsedMs = Math.max(0, comparisonTime - createdAt.getTime());
  const remainingMs = totalTargetMs - elapsedMs;
  const percentElapsed = Math.min(100, Math.max(0, (elapsedMs / totalTargetMs) * 100));

  // Time components helper
  const formatTimeParts = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(Math.abs(ms) / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds, totalSeconds };
  };

  const remainingParts = formatTimeParts(remainingMs);
  const isOverdue = remainingMs < 0;

  // Format countdown string
  let formattedCountdown = '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (remainingParts.days > 0) {
    formattedCountdown = `${remainingParts.days}d ${pad(remainingParts.hours)}:${pad(remainingParts.minutes)}:${pad(remainingParts.seconds)}`;
  } else {
    formattedCountdown = `${pad(remainingParts.hours)}:${pad(remainingParts.minutes)}:${pad(remainingParts.seconds)}`;
  }

  const overdueFormatted = isOverdue
    ? `+${formattedCountdown} Overdue`
    : `${formattedCountdown} remaining`;

  // Status calculation
  let status: SLAStatus = 'Within SLA';
  let isWithinSLA = true;
  let isAtRisk = false;
  let isBreached = false;

  if (isResolved) {
    const resolvedDurationMs = elapsedMs;
    isWithinSLA = resolvedDurationMs <= totalTargetMs;
    isBreached = !isWithinSLA;
    status = isWithinSLA ? 'Within SLA' : 'Breached';
  } else {
    if (remainingMs <= 0) {
      status = 'Breached';
      isBreached = true;
      isWithinSLA = false;
    } else if (remainingMs <= totalTargetMs * 0.25 || remainingMs <= 2 * 3600 * 1000) {
      status = 'At Risk';
      isAtRisk = true;
      isWithinSLA = true;
    } else {
      status = 'Within SLA';
      isWithinSLA = true;
    }
  }

  let resolutionOutcome: SLACalculationResult['resolutionOutcome'] | undefined;
  if (isResolved) {
    const durParts = formatTimeParts(elapsedMs);
    let durationFormatted = '';
    if (durParts.days > 0) {
      durationFormatted = `${durParts.days}d ${durParts.hours}h ${durParts.minutes}m`;
    } else if (durParts.hours > 0) {
      durationFormatted = `${durParts.hours}h ${durParts.minutes}m`;
    } else {
      durationFormatted = `${durParts.minutes}m ${durParts.seconds}s`;
    }

    const diffMs = Math.abs(totalTargetMs - elapsedMs);
    const diffParts = formatTimeParts(diffMs);
    let diffFormatted = '';
    if (diffParts.days > 0) {
      diffFormatted = `${diffParts.days}d ${diffParts.hours}h ${diffParts.minutes}m`;
    } else if (diffParts.hours > 0) {
      diffFormatted = `${diffParts.hours}h ${diffParts.minutes}m`;
    } else {
      diffFormatted = `${diffParts.minutes}m ${diffParts.seconds}s`;
    }

    const resolvedWithinSLA = elapsedMs <= totalTargetMs;

    resolutionOutcome = {
      totalDurationMs: elapsedMs,
      durationFormatted,
      resolvedWithinSLA,
      differenceMs: diffMs,
      differenceFormatted: resolvedWithinSLA ? `${diffFormatted} ahead of SLA target` : `${diffFormatted} exceeded SLA limit`,
      label: resolvedWithinSLA ? 'Resolved Within SLA' : 'Resolved Above SLA Target',
    };
  }

  return {
    createdAt,
    targetHours,
    deadline,
    isResolved,
    resolvedAt,
    elapsedMs,
    totalTargetMs,
    remainingMs,
    percentElapsed,
    status,
    isWithinSLA,
    isAtRisk,
    isBreached,
    countdown: {
      days: remainingParts.days,
      hours: remainingParts.hours,
      minutes: remainingParts.minutes,
      seconds: remainingParts.seconds,
      formattedCountdown,
      isOverdue,
      overdueFormatted,
    },
    resolutionOutcome,
  };
}
