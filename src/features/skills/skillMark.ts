/**
 * A short "element symbol" for a skill card, periodic-table style:
 * "C++" → "C++", "TypeScript" → "TS", "Spring Boot" → "SB", "Python" → "Py".
 */
export function skillMark(name: string): string {
  if (name.length <= 3) return name;
  const words = name.split(/\s+/);
  if (words.length > 1)
    return words
      .map((w) => w[0]!.toUpperCase())
      .join('')
      .slice(0, 2);
  const capitals = name.match(/[A-Z]/g) ?? [];
  if (capitals.length >= 2) return capitals.slice(0, 2).join('');
  return name[0]!.toUpperCase() + (name[1] ?? '').toLowerCase();
}
