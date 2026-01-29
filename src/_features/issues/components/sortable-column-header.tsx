"use client";

interface ColumnHeaderProps {
  id: string;
  name: string;
  color: string | null;
  count: number;
  limit: number | null;
  children?: React.ReactNode;
}

export function ColumnHeader({
  id,
  name,
  color,
  count,
  limit,
  children,
}: ColumnHeaderProps) {
  const isLimitExceeded = limit !== null && count > limit;
  const isAtLimit = limit !== null && count === limit;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2 flex-1">
        {color ? (
          <div
            className="w-1.5 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        ) : (
          <div className="w-1.5 h-6 rounded-full flex-shrink-0 bg-[#DFE1E6]" />
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-[#172B4D] uppercase tracking-wide truncate">
            {name}
          </h2>
          {limit !== null && (
            <span className={`text-xs font-medium whitespace-nowrap ${
              isLimitExceeded
                ? "text-red-600"
                : isAtLimit
                ? "text-orange-600"
                : "text-[#6B778C]"
            }`}>
              (최대 {limit}개 가능)
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-semibold bg-white px-2 py-0.5 rounded ${
            isLimitExceeded
              ? "text-red-600"
              : isAtLimit
              ? "text-orange-600"
              : "text-[#6B778C]"
          }`}
        >
          {limit !== null ? `${count}/${limit}` : count}
        </span>
        {children}
      </div>
    </div>
  );
}
