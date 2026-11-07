/** Split a free-text notes field into individual notes. */
export function splitNotes(text: string): string[] {
  return text.split(/[,\n•|]+/).map((n) => n.trim().replace(/[.;]$/, '')).filter(Boolean);
}

/** The opening (top) notes if the text is tiered ("Top Notes: …"), otherwise the first few notes. */
export function leadNotes(text: string | null | undefined, count = 3): string[] {
  if (!text) return [];
  const tierRe = /\b(top|heart|middle|base)(?:\s*notes?)?\s*[:–-]/gi;
  const matches = [...text.matchAll(tierRe)];
  if (matches.length > 0) {
    const first = matches[0];
    const start = (first.index ?? 0) + first[0].length;
    const end = matches[1]?.index ?? text.length;
    const top = splitNotes(text.slice(start, end));
    if (top.length > 0) return top.slice(0, count);
  }
  return splitNotes(text.replace(tierRe, '')).slice(0, count);
}
