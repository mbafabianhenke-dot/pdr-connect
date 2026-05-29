// Anti-bypass chat filter — security-critical, do not weaken
const PHONE_REGEX = /(\+?\d[\d\s\-.()]{5,}\d)/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PLATFORM_REGEX =
  /\b(whatsapp|telegram|signal|instagram|facebook|fb|insta|tg|wa\.me|t\.me)\b/gi;

export interface FilterResult {
  filtered: boolean;
  text: string;
  originalText: string;
  detectedPatterns: string[];
}

export function filterMessage(text: string): FilterResult {
  const originalText = text;
  const detected: string[] = [];
  let filtered = false;

  let result = text.replace(PHONE_REGEX, (match) => {
    detected.push(`phone: ${match}`);
    filtered = true;
    return '***';
  });

  result = result.replace(EMAIL_REGEX, (match) => {
    detected.push(`email: ${match}`);
    filtered = true;
    return '***';
  });

  result = result.replace(PLATFORM_REGEX, (match) => {
    detected.push(`platform: ${match}`);
    filtered = true;
    return '***';
  });

  return { filtered, text: result, originalText, detectedPatterns: detected };
}
