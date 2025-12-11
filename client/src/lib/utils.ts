import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3
  });
}
