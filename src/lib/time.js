// src/lib/time.js - Time-related utilities and constants

/** ========= Time Constants ========= */
export const HOURS = [
  "10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm",
  "10pm","11pm","12am","1am","2am","3am","4am","5am","6am"
];

/** ========= Time Utilities ========= */

// Build time options for dropdowns (30-minute intervals)
export function buildTimeOptions() {
  const opts = [];
  let h = 9, m = 0;
  for (let i = 0; i <= 21 * 2; i++) {
    const hh = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "pm" : "am";
    const mm = m.toString().padStart(2, "0");
    opts.push(`${hh}:${mm} ${ampm}`);
    m += 30; 
    if (m === 60) { 
      m = 0; 
      h = (h + 1) % 24; 
    }
  }
  return opts;
}

// Pre-built time options for performance
export const TIME_OPTIONS = buildTimeOptions();

// Create empty row for hourly data
export const emptyRow = (hour) => ({ hour, turnover: "", egm: "", vip: {} });
