import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스를 병합하는 유틸리티 함수
 *
 * clsx와 tailwind-merge를 함께 사용하여:
 * 1. 조건부 클래스 적용
 * 2. Tailwind 클래스 충돌 자동 해결
 *
 * @example
 * cn("px-2 py-1", "px-4") // "py-1 px-4" (px-2는 px-4로 덮어씀)
 * cn("bg-red-500", isActive && "bg-blue-500") // 조건부 클래스
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
