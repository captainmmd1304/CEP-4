export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function asSet(values = []) {
  return new Set(values.map((v) => String(v).trim().toLowerCase()).filter(Boolean));
}

export function setIntersectionSize(a, b) {
  let count = 0;
  for (const item of a) {
    if (b.has(item)) count += 1;
  }
  return count;
}

export function jaccardSimilarity(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = setIntersectionSize(a, b);
  const union = a.size + b.size - intersection;
  if (union <= 0) return 0;
  return intersection / union;
}

export function unique(array = []) {
  return [...new Set(array.filter(Boolean))];
}

export function pairKey(a, b) {
  const left = Number(a);
  const right = Number(b);
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

export function safeDivide(numerator, denominator, fallback = 0) {
  if (!denominator) return fallback;
  return numerator / denominator;
}

export function toPercent(value, multiplier = 100) {
  return Math.round(value * multiplier);
}

export function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}
