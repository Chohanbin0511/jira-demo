"use client";

import * as React from "react";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/_utilities/utilities";

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  debounceMs?: number;
  maxWidth?: string;
}

export function SearchBar({
  value = "",
  onChange,
  placeholder = "검색...",
  className,
  showClearButton = true,
  onClear,
  debounceMs = 300,
  maxWidth = "max-w-sm",
}: SearchBarProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 외부 value 변경 시 로컬 값 동기화
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce 처리
  React.useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (onChange) {
      debounceTimerRef.current = setTimeout(() => {
        onChange(localValue);
      }, debounceMs);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, onChange, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
    onClear?.();
  };

  return (
    <div className={cn("relative w-full", maxWidth, className)}>
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="pl-8 pr-8 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      {showClearButton && localValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
