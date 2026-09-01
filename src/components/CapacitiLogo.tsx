import React from 'react';

interface CapacitiLogoProps {
  className?: string;
  variant?: 'full' | 'icon-only' | 'inline-badge';
  rounded?: 'full' | 'lg' | 'xl' | '2xl' | 'none';
  textClassName?: string;
  subtextClassName?: string;
  showSubtitle?: boolean;
}

export const CapacitiLogoIcon: React.FC<{ className?: string; rounded?: string }> = ({ 
  className = 'w-8 h-8',
  rounded = 'rounded-lg'
}) => (
  <div className={`overflow-hidden shrink-0 inline-flex items-center justify-center ${rounded} ${className} shadow-xs`}>
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full block"
      referrerPolicy="no-referrer"
    >
      {/* Background solid navy fill */}
      <rect width="200" height="200" fill="#1d2342" />
      
      {/* Circular Emblem */}
      <g id="capaciti-emblem">
        <mask id="capacitiCircleMask">
          <circle cx="100" cy="100" r="82" fill="#ffffff" />
        </mask>
        <g mask="url(#capacitiCircleMask)">
          {/* Right Quadrant (Coral Red Chevron Arrows) */}
          <g stroke="#f05046" strokeWidth="11.5" strokeLinejoin="miter" strokeMiterlimit="10">
            <path d="M 195 23 L 118 100 L 195 177" />
            <path d="M 219 23 L 142 100 L 219 177" />
            <path d="M 243 23 L 166 100 L 243 177" />
          </g>

          {/* Top Quadrant (White Chevron Arrows) */}
          <g stroke="#ffffff" strokeWidth="11.5" strokeLinejoin="miter" strokeMiterlimit="10">
            <path d="M 23 5 L 100 82 L 177 5" />
            <path d="M 23 -19 L 100 58 L 177 -19" />
            <path d="M 23 -43 L 100 34 L 177 -43" />
          </g>

          {/* Left Quadrant (White Chevron Arrows) */}
          <g stroke="#ffffff" strokeWidth="11.5" strokeLinejoin="miter" strokeMiterlimit="10">
            <path d="M 5 23 L 82 100 L 5 177" />
            <path d="M -19 23 L 58 100 L -19 177" />
            <path d="M -43 23 L 34 100 L -43 177" />
          </g>

          {/* Bottom Quadrant (White Chevron Arrows) */}
          <g stroke="#ffffff" strokeWidth="11.5" strokeLinejoin="miter" strokeMiterlimit="10">
            <path d="M 23 195 L 100 118 L 177 195" />
            <path d="M 23 219 L 100 142 L 177 219" />
            <path d="M 23 243 L 100 166 L 177 243" />
          </g>

          {/* 4 Diagonal Dividers */}
          <line x1="10" y1="10" x2="190" y2="190" stroke="#1d2342" strokeWidth="6.5" />
          <line x1="190" y1="10" x2="10" y2="190" stroke="#1d2342" strokeWidth="6.5" />

          {/* Center Square */}
          <rect x="88" y="88" width="24" height="24" fill="#1d2342" />
        </g>
      </g>
    </svg>
  </div>
);

export const CapacitiLogo: React.FC<CapacitiLogoProps> = ({
  className = 'w-8 h-8',
  variant = 'full',
  rounded = 'lg',
  textClassName = 'text-slate-900',
  subtextClassName = 'text-sky-600',
  showSubtitle = true,
}) => {
  const roundedClass = 
    rounded === 'full' ? 'rounded-full' :
    rounded === 'xl' ? 'rounded-xl' :
    rounded === '2xl' ? 'rounded-2xl' :
    rounded === 'none' ? 'rounded-none' : 'rounded-lg';

  if (variant === 'icon-only') {
    return <CapacitiLogoIcon className={className} rounded={roundedClass} />;
  }

  return (
    <div className="flex items-center space-x-2.5 shrink-0 select-none">
      <CapacitiLogoIcon className={className} rounded={roundedClass} />
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center space-x-1.5">
          <span className={`font-extrabold tracking-tight text-base ${textClassName}`}>
            CAPACITI
          </span>
          {showSubtitle && (
            <span className={`text-[11px] font-bold tracking-tight ${subtextClassName}`}>
              Service Hub
            </span>
          )}
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-400 font-medium tracking-normal mt-0.5">
            Enterprise Operations
          </span>
        )}
      </div>
    </div>
  );
};
