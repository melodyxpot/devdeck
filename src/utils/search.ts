export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesQuery(haystack: string, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  const hay = haystack.toLowerCase();
  if (hay.includes(q)) return true;
  const tokens = q.split(/\s+/);
  return tokens.every((token) => hay.includes(token));
}

export function fuzzyScore(haystack: string, query: string): number {
  const q = normalizeQuery(query);
  if (!q) return 1;
  const hay = haystack.toLowerCase();
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 80;
  if (hay.includes(q)) return 60;
  let score = 0;
  let index = 0;
  for (const char of q) {
    const found = hay.indexOf(char, index);
    if (found === -1) return 0;
    score += 2;
    if (found === index) score += 3;
    index = found + 1;
  }
  return score;
}
