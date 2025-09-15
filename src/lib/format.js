// src/lib/format.js - Money and number formatting utilities

/** ========= Formatting Utilities ========= */

// Number formatters
export const moneyFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
export const numFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

// Money formatting functions
export const toMoney = (n) => Number.isFinite(n) ? `$${moneyFmt.format(n)}` : "";
export const parseMoney = (v) => Number(String(v ?? "").replace(/[^0-9.\-]/g, "")) || 0;

// Slug generation for IDs
export function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Auto-resize textarea helper
export function autosize(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
