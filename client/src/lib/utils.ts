import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price with currency symbol
export function formatPrice(price: string | number, options: {
  currency?: 'USD' | 'EUR' | 'GBP';
  notation?: Intl.NumberFormatOptions['notation']
} = {}) {
  const { currency = 'USD', notation = 'standard' } = options;
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

// Parse price from string to number
export function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^\d.-]/g, ''));
}

// Calculate discount percentage
export function calculateDiscount(price: string | number, compareAtPrice: string | number): number {
  const currentPrice = typeof price === 'string' ? parseFloat(price) : price;
  const originalPrice = typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : compareAtPrice;
  
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Format date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Check if object is empty
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

// Get item from localStorage with expiry check
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const { value, expiry } = JSON.parse(item);
    
    // Check if the item has expired
    if (expiry && new Date().getTime() > expiry) {
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    return value as T;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Set item in localStorage with optional expiry
export function setStorageItem<T>(key: string, value: T, expiryHours?: number): void {
  try {
    const item = {
      value,
      expiry: expiryHours ? new Date().getTime() + expiryHours * 60 * 60 * 1000 : null,
    };
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error);
  }
}

// Remove item from localStorage
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h * 360, s * 100, l * 100];
}

// Generate a lighter or darker color variant
export function generateColorVariant(hexColor: string, variant: 'lighter' | 'darker', amount: number = 0.1): string {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);
  
  // Convert RGB to HSL
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Adjust lightness
  const newL = variant === 'lighter' ? 
    Math.min(100, l + amount * 100) : 
    Math.max(0, l - amount * 100);
  
  // Convert HSL to hex (simplified)
  const c = (1 - Math.abs(2 * newL / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = newL / 100 - c / 2;
  
  let r1, g1, b1;
  
  if (h >= 0 && h < 60) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r1, g1, b1] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r1, g1, b1] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }
  
  r = Math.round((r1 + m) * 255);
  g = Math.round((g1 + m) * 255);
  b = Math.round((b1 + m) * 255);
  
  // Convert RGB back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Format Stripe error
export function formatStripeError(error: any): string {
  if (!error) return "An unknown error occurred";
  
  if (typeof error === "string") return error;
  
  if (error.type === "card_error") {
    return error.message || "Your card was declined";
  }
  
  return error.message || "An error occurred during payment processing";
}
