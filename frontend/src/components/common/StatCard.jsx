import React from 'react';

/**
 * Universal StatCard Component
 * Enforces consistent layout across the HRMS: Icon (if present), Value, and Title.
 * Strips out extra descriptions, progress bars, or trends as per enterprise design guidelines.
 */
export default function StatCard({
  title,
  label,
  value,
  count,
  number,
  children,
  icon: Icon,
  colorClass = "bg-blue-50 text-[#3B82F6]",
  iconClass,
  isAmount = false,
  available,
  total,
  isUnlimited = false,
  className = "",
  onClick
}) {
  // 1. Determine Title
  const displayTitle = title ?? label ?? "";

  // 2. Determine Value
  let displayValue = value ?? count ?? number ?? children;
  if (displayValue === undefined && available !== undefined) {
    displayValue = isUnlimited ? available : `${available} / ${total ?? 0}`;
  }
  if (displayValue === undefined || displayValue === null) {
    displayValue = 0;
  }

  // Determine if text should scale down slightly for long strings / currency values
  const isLongText = isAmount || (typeof displayValue === 'string' && displayValue.length > 8);

  // Use iconClass if provided, otherwise colorClass
  const finalIconClass = iconClass || colorClass;

  return (
    <div
      onClick={onClick}
      className={`bg-[#fdfdfe] rounded-2xl border border-[#d6d9df]/80 p-3.5 sm:p-4 flex flex-col justify-between shadow-xs hover:border-[#3B82F6]/50 hover:shadow-sm transition-all duration-200 min-w-0 overflow-hidden h-full ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-2.5 mb-2 sm:mb-2.5 min-w-0">
        {Icon ? (
          <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 flex items-center justify-center ${finalIconClass}`}>
            {typeof Icon === 'function' || typeof Icon === 'object' ? (
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            ) : (
              Icon
            )}
          </div>
        ) : null}
        <div className="text-right min-w-0 flex-1 truncate">
          <span
            className={`${
              isLongText
                ? 'text-base sm:text-lg md:text-xl font-bold'
                : 'text-xl sm:text-2xl md:text-3xl font-black'
            } text-[#1E293B] tracking-tight block truncate leading-none`}
            title={typeof displayValue === 'string' || typeof displayValue === 'number' ? String(displayValue) : undefined}
          >
            {displayValue}
          </span>
        </div>
      </div>
      <div className="min-w-0 pt-2 border-t border-[#f0f3f5]">
        <span
          className="text-xs sm:text-sm font-semibold text-slate-600 block line-clamp-2 leading-snug tracking-tight"
          title={typeof displayTitle === 'string' ? displayTitle : undefined}
        >
          {displayTitle}
        </span>
      </div>
    </div>
  );
}
