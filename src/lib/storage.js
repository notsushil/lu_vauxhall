// src/lib/storage.js - localStorage operations and data management

/** ========= Storage Keys ========= */
export const LSK_REPORT = "levelup_report_draft";
export const LSK_JACKPOTS = "levelup_jackpot_template_v1";
export const LSK_ETH = "levelup_ethnicity_template_v1";

/** ========= Storage Utilities ========= */

// Generic localStorage operations
export function loadFromStorage(key, defaultValue = null) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
    return false;
  }
}

export function clearFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to clear ${key} from localStorage:`, error);
    return false;
  }
}

/** ========= Specific Data Loaders ========= */

// Load report data (rows, roster, logs, jackpots, securityPerformance)
export function loadReportData(defaultRows) {
  const saved = loadFromStorage(LSK_REPORT);
  if (saved) {
    return {
      rows: saved.rows || defaultRows,
      roster: { ...getDefaultRoster(), ...saved.roster },
      logs: saved.logs || getDefaultLogs(),
      jackpots: saved.jackpots || {},
      securityPerformance: { ...getDefaultSecurityPerformance(), ...saved.securityPerformance }
    };
  }
  return { 
    rows: defaultRows, 
    roster: getDefaultRoster(), 
    logs: getDefaultLogs(), 
    jackpots: {},
    securityPerformance: getDefaultSecurityPerformance()
  };
}

// Load jackpot template
export function loadJackpotTemplate(defaultTemplate) {
  return loadFromStorage(LSK_JACKPOTS, defaultTemplate);
}

// Load ethnicity template
export function loadEthnicityTemplate(defaultTemplate) {
  return loadFromStorage(LSK_ETH, defaultTemplate);
}

/** ========= Default Data Structures ========= */

export function getDefaultRoster() {
  return {
    managers: { open: { names: "" }, mid: { names: "" }, close: { names: "" } },
    staffs: { open: { names: "" }, mid: { names: "" }, close: { names: "" } },
    security: { shift: "", names: "" },
  };
}

export function getDefaultLogs() {
  return { gaming: [], bar: [], incidents: [] };
}

export function getDefaultSecurityPerformance() {
  return {
    cashVariance: "",
    tradeFloatVariance: "",
    gamingFloatVariance: "",
    additionalNotes: ""
  };
}

/** ========= Save Operations ========= */

// Save complete report data
export function saveReportData(reportData) {
  return saveToStorage(LSK_REPORT, reportData);
}

// Save jackpot template
export function saveJackpotTemplate(template) {
  return saveToStorage(LSK_JACKPOTS, template);
}

// Save ethnicity template
export function saveEthnicityTemplate(template) {
  return saveToStorage(LSK_ETH, template);
}

// Clear all report data
export function clearReportData() {
  return clearFromStorage(LSK_REPORT);
}
