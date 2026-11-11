import type { DateRange, YearMonth } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatMonth = ({ year, month }: YearMonth) => `${MONTHS[month - 1]} ${year}`;

/** "Jun 2026 – Sep 2026", or "Jan 2026 – Present". */
export function formatRange({ start, end }: DateRange): string {
  return `${formatMonth(start)} – ${end === 'present' ? 'Present' : formatMonth(end)}`;
}

/**
 * Tile monogram for an organisation: initials of its capitalised words
 * ("Government of Prince Edward Island" → "GPEI"), or the first two letters
 * of a one-word name ("Amobys" → "AM").
 */
export function acronym(name: string): string {
  const words = name.split(/\s+/).filter((word) => /^[A-Z]/.test(word));
  if (words.length > 1)
    return words
      .map((word) => word[0])
      .join('')
      .slice(0, 4);
  return name.slice(0, 2).toUpperCase();
}
