import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ✅ Typed helper for combining class names safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
