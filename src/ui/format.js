// Display formatting. Internal values stay full-precision; rounding happens here only.

const UNIT_FACTOR = { s: 1, m: 60, h: 3600 };
export const RATE_UNITS = ['s', 'm', 'h'];

export function formatAmount(v) {
  if (!isFinite(v)) return '∞';
  const a = Math.abs(v);
  let s;
  if (a >= 1000) s = Math.round(v).toLocaleString('en-US');
  else if (a >= 100) s = v.toFixed(1);
  else if (a >= 10) s = v.toFixed(2);
  else s = v.toFixed(3);
  // strip trailing zeros / trailing dot
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

export function formatRate(perSec, unit = 's', signed = false) {
  const v = perSec * (UNIT_FACTOR[unit] || 1);
  const sign = signed && v > 1e-9 ? '+' : '';
  return `${sign}${formatAmount(v)}/${unit}`;
}

export function formatPower(kW) {
  if (Math.abs(kW) >= 1000) return `${formatAmount(kW / 1000)} MW`;
  return `${formatAmount(kW)} kW`;
}
