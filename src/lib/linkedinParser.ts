/**
 * Parses raw text copied from LinkedIn Sales Navigator / Search results.
 *
 * Typical patterns:
 *   "Jan de Vries\nTweedegraads connectie\nSenior Developer\nAcme Corp"
 *   "Jan de Vries\n2nd\nSenior Developer bij Acme Corp"
 *   "Jan de Vries\nSenior Developer - Acme Corp"
 *
 * Returns extracted leads with name, jobTitle, company.
 */

export interface ParsedLead {
  fullName: string;
  jobTitle: string;
  company: string;
}

const CONNECTION_PATTERNS = [
  /^\d+(st|nd|rd|th)$/i,
  /^(eerste|tweede|derde)graads?\s*connectie$/i,
  /^(1st|2nd|3rd)\s*degree/i,
  /^connect$/i,
  /^following$/i,
  /^message$/i,
  /^follow$/i,
  /^pending$/i,
  /^inmessage$/i,
];

const SKIP_PATTERNS = [
  /^(view|see)\s+(profile|more)/i,
  /^\d+\s*(mutual|shared)\s*(connection|contact)/i,
  /^sponsored/i,
  /^promoted/i,
  /^people\s+also\s+viewed/i,
  /^\d+\s*follower/i,
  /^save$/i,
  /^share$/i,
];

function isConnectionDegree(line: string): boolean {
  return CONNECTION_PATTERNS.some((p) => p.test(line.trim()));
}

function isSkipLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (SKIP_PATTERNS.some((p) => p.test(t))) return true;
  // Pure numbers or very short noise
  if (/^\d+$/.test(t)) return true;
  return false;
}

function isLikelyName(line: string): boolean {
  const t = line.trim();
  // A name is typically 2-5 words, no special chars like | or @
  if (t.includes("|") || t.includes("@") || t.includes("•")) return false;
  const words = t.split(/\s+/);
  if (words.length < 2 || words.length > 6) return false;
  // All words should start with uppercase (or be common particles)
  const particles = new Set(["de", "van", "der", "het", "den", "von", "di", "el", "la", "le", "du", "dos", "da"]);
  return words.every((w) => /^[A-ZÀ-ÖØ-Ý]/.test(w) || particles.has(w.toLowerCase()));
}

function splitJobAndCompany(line: string): { jobTitle: string; company: string } {
  // Common separators: " bij ", " at ", " - ", " | ", " @ "
  const separators = [" bij ", " at ", " @ "];
  for (const sep of separators) {
    const idx = line.toLowerCase().indexOf(sep);
    if (idx > 0) {
      return {
        jobTitle: line.slice(0, idx).trim(),
        company: line.slice(idx + sep.length).trim(),
      };
    }
  }
  // Try " - " and " | " (but only if result looks reasonable)
  for (const sep of [" - ", " | "]) {
    const idx = line.indexOf(sep);
    if (idx > 0) {
      return {
        jobTitle: line.slice(0, idx).trim(),
        company: line.slice(idx + sep.length).trim(),
      };
    }
  }
  return { jobTitle: line.trim(), company: "" };
}

export function parseLinkedInText(rawText: string): ParsedLead[] {
  const lines = rawText
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: ParsedLead[] = [];
  let i = 0;

  while (i < lines.length) {
    // Skip noise lines
    if (isSkipLine(lines[i]) || isConnectionDegree(lines[i])) {
      i++;
      continue;
    }

    // Try to detect a name
    if (isLikelyName(lines[i])) {
      const name = lines[i];
      i++;

      // Skip connection degree lines
      while (i < lines.length && (isConnectionDegree(lines[i]) || isSkipLine(lines[i]))) {
        i++;
      }

      // Next meaningful line should be job title (possibly with company)
      let jobTitle = "";
      let company = "";

      if (i < lines.length && !isLikelyName(lines[i])) {
        const parsed = splitJobAndCompany(lines[i]);
        jobTitle = parsed.jobTitle;
        company = parsed.company;
        i++;

        // If no company yet, next line might be the company
        if (!company && i < lines.length && !isLikelyName(lines[i]) && !isConnectionDegree(lines[i]) && !isSkipLine(lines[i])) {
          // Check if this line looks like a company (not another job title)
          const nextLine = lines[i].trim();
          if (nextLine && !nextLine.toLowerCase().includes("degree") && nextLine.length < 80) {
            company = nextLine;
            i++;
          }
        }
      }

      results.push({ fullName: name, jobTitle, company });
    } else {
      i++;
    }
  }

  return results;
}
