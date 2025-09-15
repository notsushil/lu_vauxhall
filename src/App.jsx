// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";

/** ========= Config ========= */
const HOURS = [
  "10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm",
  "10pm","11pm","12am","1am","2am","3am","4am","5am","6am"
];

const LSK_REPORT   = "levelup_report_draft";
const LSK_JACKPOTS = "levelup_jackpot_template_v1";
const LSK_ETH      = "levelup_ethnicity_template_v1";

function slug(s){
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const DEFAULT_JACKPOT_TEMPLATE = [
  { id: slug("Dragon Link $15k"),        name: "Dragon Link $15k" },
  { id: slug("Dollar Storm $50k"),       name: "Dollar Storm $50k" },
  { id: slug("Dragon Link $20k"),        name: "Dragon Link $20k" },
  { id: slug("Bull Rush $20k"),          name: "Bull Rush $20k" },
  { id: slug("Dragon Link $90k"),        name: "Dragon Link $90k" },
  { id: slug("Shenlong Unleashed $50k"), name: "Shenlong Unleashed $50k" },
];

const DEFAULT_ETHNICITY_TEMPLATE = [
  { key: "Middle Eastern" },
  { key: "East Asian" },
  { key: "South Asian" },
  { key: "European" },
  { key: "Maori/Pacific" },
  { key: "African" },
  { key: "Latin American" },
  { key: "Other" },
];

/** ========= Styles ========= */
const Theme = () => (
  <style>{`
    :root{
      --bg1:#A56EFF; --bg2:#FF6FD8; --bg3:#FFC371;
      --card: rgba(255,255,255,0.18);
      --card-solid: rgba(255,255,255,0.10);
      --text-on:#fff;
      --line: rgba(255,255,255,0.25);
      --input:#ffffff22;
      --chip:#ffffff2e;
    }
    
    /* Global layout and typography */
    body {
      color: var(--text-on);
      display:flex; justify-content:center; align-items:flex-start; min-height:100vh; background:none;
    }
    body::before{
      content:""; position:fixed; inset:0; z-index:-1; pointer-events:none;
      background:
        radial-gradient(150% 150% at -10% -10%, #A56EFF, var(--bg1) 50%),
        radial-gradient(150% 150% at 110% 110%, #FFC371, var(--bg3) 50%),
        linear-gradient(135deg, var(--bg1), var(--bg2) 50%, var(--bg3));
      background-size:cover; background-attachment:fixed;
    }

    .wrap{ width:100%; max-width:1100px; margin:24px auto; padding:0 16px 56px; }
    .card{
      width:100%; background: linear-gradient(135deg, var(--bg1), var(--bg2) 50%, var(--bg3));
      border:1px solid var(--line); border-radius:18px; padding:20px; box-shadow:0 12px 40px #0003, inset 0 1px 0 #fff2;
      position:relative; overflow:visible;
    }
    .card::before{ content:""; position:absolute; inset:0; border-radius:18px; pointer-events:none;
      background: linear-gradient(180deg, #fff1, #fff0);
    }

    h1{margin:0 0 8px; text-align:center; font-size:28px}
    .muted{opacity:.9; text-align:center; margin-bottom:16px}

    .info{ display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:8px; }
    .infoCard{ background:var(--card-solid); border:1px solid var(--line); border-radius:12px; padding:8px 12px; }

    .row{display:flex; gap:10px; flex-wrap:wrap; align-items:center}
    .divider{height:1px; background:var(--line); margin:18px 0}

    input, select, textarea{
      width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--line);
      background:var(--input); color:#fff; outline:none;
    }
    label{display:block; font-size:12px; opacity:.95; margin-bottom:6px}
    .money{text-align:right} .readonly{opacity:.9}

    .table-scroll{ width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
    table{ width:100%; border-collapse:collapse; margin-top:12px; table-layout:fixed; }
    th,td{ padding:10px; border-bottom:1px solid var(--line); text-align:left; font-size:14px; word-wrap:break-word }
    th{opacity:.95}
    th:last-child, td:last-child{ width:88px; }

    .chip{display:inline-flex; gap:6px; align-items:center; padding:6px 10px; border-radius:999px; background:var(--chip); border:1px solid var(--line); margin:2px}
    .btn{ padding:10px 14px; border-radius:12px; border:1px solid var(--line); background:#fff; color:#111; font-weight:700; cursor:pointer }
    .btn.ghost{background:transparent; color:#fff}
    .btn.gradient{ background:linear-gradient(90deg, var(--bg1), var(--bg2), var(--bg3)); color:#111; border:none }
    .footer{display:flex; gap:12px; justify-content:flex-end; margin-top:18px}

    /* Roster: 3 cards side by side */
    .rosterGrid{ display:grid; gap:12px; grid-template-columns: 1fr; }
    @media (min-width: 900px){ .rosterGrid{ grid-template-columns: 1fr 1fr 1fr; } }
    .rosterCard{ background:var(--card-solid); border:1px solid var(--line); border-radius:14px; padding:12px; }
    .rosterCard h3{ margin:0 0 8px; font-size:16px }

    /* Interactions: stack time over textarea */
    .logWrap{ display:grid; gap:12px; grid-template-columns: 1fr; }
    .logCard{ background:var(--card-solid); border:1px solid var(--line); border-radius:14px; padding:12px; }
    .logCard h3{ margin:0 0 10px; font-size:16px; }
    .logEntry{ display:flex; flex-direction:column; gap:10px; align-items:stretch; margin-bottom:10px; }
    .logEntry .timeSel{ min-width:100%; }
    .logEntry textarea{ width:100%; min-height:36px; max-height:260px; overflow:hidden; resize:none; }
    .removeBtn{ align-self:flex-end; background:#fff; color:#111; border:none; border-radius:10px; padding:8px 10px; cursor:pointer; font-weight:700; }
    .addRowBtn{ width:100%; margin-top:6px; padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#fff; color:#111; font-weight:700; cursor:pointer; }

    /* Jackpots / Ethnicity blocks */
    .jackpotsHeader{ display:flex; justify-content:space-between; align-items:center; gap:10px; }
    .jGrid{ display:grid; gap:12px; grid-template-columns:1fr; }
    @media (min-width: 900px){ .jGrid{ grid-template-columns:1fr 1fr 1fr; } }
    .jItem{ background:var(--card-solid); border:1px solid var(--line); border-radius:14px; padding:12px; display:flex; gap:10px; align-items:center; }
    .jName{ flex:1; }
    .jAmount{ width:160px; }
    .jAmount input{ text-align:right; }
    .editBar{ display:flex; gap:8px; align-items:center; }
    .editField{ background:#2a2144; }
  `}</style>
);

/** ========= Helpers ========= */
const moneyFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const numFmt   = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const toMoney  = (n) => Number.isFinite(n) ? `$${moneyFmt.format(n)}` : "";
const parseMoney = (v) => Number(String(v ?? "").replace(/[^0-9.\-]/g, "")) || 0;

const emptyRow = (hour) => ({ hour, turnover: "", egm: "", vip: {} });

function buildTimeOptions() {
  const opts = [];
  let h = 9, m = 0;
  for (let i = 0; i <= 21 * 2; i++) {
    const hh = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "pm" : "am";
    const mm = m.toString().padStart(2, "0");
    opts.push(`${hh}:${mm} ${ampm}`);
    m += 30; if (m === 60) { m = 0; h = (h + 1) % 24; }
  }
  return opts;
}
const TIME_OPTIONS = buildTimeOptions();
function autosize(el){ if(!el) return; el.style.height="auto"; el.style.height=el.scrollHeight+"px"; }

/** ========= Main ========= */
export default function App() {
  /** Date (no time) & Weather */
  const [sydDate, setSydDate] = useState("");
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date().toLocaleDateString("en-AU", {
        timeZone: "Australia/Sydney",
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      setSydDate(d);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const key = import.meta.env.VITE_OWM_KEY || "YOUR_OPENWEATHERMAP_API_KEY";
    if (!key || key.startsWith("YOUR_")) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Granville,AU&units=metric&appid=${key}`)
      .then(r=>r.json())
      .then(d=>{ if(d && d.main) setWeather({ temp: Math.round(d.main.temp), desc: d.weather?.[0]?.description ?? "" }); })
      .catch(()=>{});
  }, []);

  /** Load Drafts */
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(LSK_REPORT);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return p;
        if (p && p.rows) return p.rows;
      } catch {}
    }
    return HOURS.map(emptyRow);
  });

  const defaultRoster = {
    managers: { open:{names:""}, mid:{names:""}, close:{names:""} },
    staffs:   { open:{names:""}, mid:{names:""}, close:{names:""} },
    security: { shift:"", names:"" },
  };
  const [roster, setRoster] = useState(() => {
    const saved = localStorage.getItem(LSK_REPORT);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) return defaultRoster;
        const r = p.roster ?? defaultRoster;
        return { ...defaultRoster, ...r };
      } catch {}
    }
    return defaultRoster;
  });

  const defaultLogs = { gaming: [], bar: [], incidents: [] };
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem(LSK_REPORT);
    if (saved) { try {
      const p = JSON.parse(saved);
      if (Array.isArray(p)) return defaultLogs;
      return p.logs ?? defaultLogs;
    } catch {} }
    return defaultLogs;
  });

  /** Editable Ethnicity Template */
  const [ethnicityTemplate, setEthnicityTemplate] = useState(() => {
    const saved = localStorage.getItem(LSK_ETH);
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return DEFAULT_ETHNICITY_TEMPLATE;
  });
  const [editingEth, setEditingEth] = useState(false);
  const [ethDraft, setEthDraft] = useState(() => ethnicityTemplate.map(e => ({...e})));
  useEffect(() => { setEthDraft(ethnicityTemplate.map(e => ({...e}))); }, [editingEth]);

  function startEditEth(){ setEditingEth(true); }
  function cancelEditEth(){ setEditingEth(false); }
  function changeEthName(idx, value){
    setEthDraft(prev => prev.map((e,i)=> i===idx ? ({ ...e, key: value }) : e));
  }
  function addEthRow(){ setEthDraft(prev => [...prev, { key: "New" }]); }
  function removeEthRow(idx){ setEthDraft(prev => prev.filter((_,i)=> i!==idx)); }
  function saveEth(){
    const clean = ethDraft.map(e=>({ key: String(e.key||"").trim() })).filter(e=>e.key);
    setEthnicityTemplate(clean);
    localStorage.setItem(LSK_ETH, JSON.stringify(clean));
    // keep drawer value valid
    setEditEthnicity(prev => clean.find(e=>e.key===prev)?.key ?? (clean[0]?.key || ""));
    setEditingEth(false);
  }

  /** Jackpots (editable names + amounts) */
  const [jackpotTemplate, setJackpotTemplate] = useState(() => {
    const saved = localStorage.getItem(LSK_JACKPOTS);
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return DEFAULT_JACKPOT_TEMPLATE;
  });
  const [jackpots, setJackpots] = useState(() => {
    const saved = localStorage.getItem(LSK_REPORT);
    if (saved) { try {
      const p = JSON.parse(saved);
      if (Array.isArray(p)) return {};
      return p.jackpots ?? {};
    } catch {} }
    return {};
  });
  const [editingNames, setEditingNames] = useState(false);
  const [namesDraft, setNamesDraft] = useState(() => jackpotTemplate.map(j => ({...j})));
  useEffect(() => { setNamesDraft(jackpotTemplate.map(j => ({...j}))); }, [editingNames]);

  /** Aggregates */
  const totals = useMemo(() => {
    const all = Object.fromEntries(ethnicityTemplate.map(e => [e.key, 0]));
    let egmSum = 0;
    rows.forEach(r => {
      egmSum += parseMoney(r.egm);
      for (const [k, v] of Object.entries(r.vip || {})) all[k] = (all[k]||0) + (Number(v)||0);
    });
    return { all, egmSum };
  }, [rows, ethnicityTemplate]);

  const increments = useMemo(() => {
    const inc = [];
    for (let i=0; i<rows.length; i++){
      const cur = parseMoney(rows[i].turnover);
      const prev = i===0 ? 0 : parseMoney(rows[i-1].turnover);
      const val = i===0 ? cur : (cur - prev);
      inc.push(val > 0 ? val : 0);
    }
    return inc;
  }, [rows]);

  /** Actions */
  function updateCell(i, key, value){
    setRows(prev => { const next=[...prev]; next[i] = { ...next[i], [key]: value }; return next; });
  }
  function formatTurnoverOnBlur(i){
    setRows(prev => { const next=[...prev]; const n=parseMoney(next[i].turnover); next[i].turnover = n ? toMoney(n) : ""; return next; });
  }

  const [editing, setEditing] = useState(null);
  const [editEthnicity, setEditEthnicity] = useState(ethnicityTemplate[0]?.key || "");
  const [editCount, setEditCount] = useState("");
  useEffect(() => {
    setEditEthnicity(prev => ethnicityTemplate.find(e=>e.key===prev)?.key ?? (ethnicityTemplate[0]?.key || ""));
  }, [ethnicityTemplate]);

  function openEdit(i){ setEditing(i); setEditEthnicity(ethnicityTemplate[0]?.key || ""); setEditCount(""); }
  function addVip(){
    if (editing==null) return;
    const c = Number(editCount); if (!c) return;
    setRows(prev=>{
      const next=[...prev]; const r={...next[editing]}; const vip={...(r.vip||{})};
      vip[editEthnicity] = (Number(vip[editEthnicity])||0) + c;
      r.vip = vip; next[editing]=r; return next;
    });
    setEditCount("");
  }
  function removeVip(eth){
    if (editing==null) return;
    setRows(prev=>{
      const next=[...prev]; const r={...next[editing]}; const vip={...(r.vip||{})};
      delete vip[eth]; r.vip=vip; next[editing]=r; return next;
    });
  }

  function updateRoster(group, shift, value){
    setRoster(prev => ({ ...prev, [group]: { ...prev[group], [shift]: { names:value } } }));
  }
  function updateSecurity(field, value){
    setRoster(prev => ({ ...prev, security: { ...prev.security, [field]: value } }));
  }

  function addLogRow(kind){ setLogs(prev => ({ ...prev, [kind]: [...prev[kind], { time:"", note:"" }] })); }
  function updateLog(kind, index, field, value){
    setLogs(prev => {
      const next = { ...prev };
      next[kind] = next[kind].map((row,i)=> i===index ? { ...row, [field]: value } : row);
      return next;
    });
  }
  function removeLog(kind, index){
    setLogs(prev => {
      const next = { ...prev };
      next[kind] = next[kind].filter((_,i)=>i!==index);
      return next;
    });
  }

  function updateJackpotAmount(id, value){ setJackpots(prev=>({ ...prev, [id]: value })); }
  function formatJackpotOnBlur(id){
    setJackpots(prev => { const raw=parseMoney(prev[id]); return { ...prev, [id]: raw ? toMoney(raw) : "" }; });
  }

  function saveDraft(){
    localStorage.setItem(LSK_REPORT, JSON.stringify({ rows, roster, logs, jackpots }));
    alert("Draft saved locally.");
  }
  function clearDraft(){
    localStorage.removeItem(LSK_REPORT);
    alert("Local draft cleared.");
  }

  // Enhanced submit function that sends report via email
  async function submit(){
    try {
      // Generate report data
      const reportData = {
        date: sydDate,
        weather: weather,
        rows: rows,
        roster: roster,
        logs: logs,
        jackpots: jackpots,
        totals: totals,
        submittedAt: new Date().toISOString()
      };

      // Generate HTML content for the report
      const htmlContent = generateReportHTML(reportData);
      
      // Send via your existing API
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "dhakalsushil02@gmail.com", // Your verified Resend email
          subject: `LevelUP Shift Report - ${sydDate}`,
          html: htmlContent
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Report sent successfully to ${result.to}!`);
      } else {
        console.error("API Error:", result);
        throw new Error(result.error || "Failed to send report");
      }

    } catch (error) {
      console.error("Submit error:", error);
      alert(`❌ Error: ${error.message}`);
    }
  }


  // Generate HTML content for the report
  function generateReportHTML(data) {
    return `
      <html>
        <head><title>LevelUP Shift Report</title></head>
        <body>
          <h1>LevelUP Shift Report</h1>
          <h2>${data.date}</h2>
          ${data.weather ? `<p>Weather: ${data.weather.temp}°C - ${data.weather.desc}</p>` : ''}
          
          <h3>Roster</h3>
          <h4>Managers</h4>
          <p>Open: ${data.roster.managers.open.names}</p>
          <p>Mid: ${data.roster.managers.mid.names}</p>
          <p>Close: ${data.roster.managers.close.names}</p>
          
          <h4>Staff</h4>
          <p>Open: ${data.roster.staffs.open.names}</p>
          <p>Mid: ${data.roster.staffs.mid.names}</p>
          <p>Close: ${data.roster.staffs.close.names}</p>
          
          <h4>Security</h4>
          <p>Shift: ${data.roster.security.shift}</p>
          <p>Names: ${data.roster.security.names}</p>
          
          <h3>Hourly Data</h3>
          <table border="1">
            <tr><th>Time</th><th>Turnover</th><th>EGM</th><th>VIP Mix</th></tr>
            ${data.rows.map(row => `
              <tr>
                <td>${row.hour}</td>
                <td>${row.turnover}</td>
                <td>${row.egm}</td>
                <td>${Object.entries(row.vip || {}).map(([k,v]) => `${k}: ${v}`).join(', ')}</td>
              </tr>
            `).join('')}
          </table>
          
          <h3>Jackpots</h3>
          ${Object.entries(data.jackpots).map(([id, amount]) => 
            `<p>${id}: ${amount}</p>`
          ).join('')}
          
          <h3>Interactions</h3>
          <h4>Gaming</h4>
          ${data.logs.gaming.map(log => `<p>${log.time}: ${log.note}</p>`).join('')}
          
          <h4>Bar</h4>
          ${data.logs.bar.map(log => `<p>${log.time}: ${log.note}</p>`).join('')}
          
          <h4>Incidents</h4>
          ${data.logs.incidents.map(log => `<p>${log.time}: ${log.note}</p>`).join('')}
        </body>
      </html>
    `;
  }

  // Generate text content for the report
  function generateReportText(data) {
    let text = `LevelUP Shift Report\n`;
    text += `Date: ${data.date}\n`;
    if (data.weather) {
      text += `Weather: ${data.weather.temp}°C - ${data.weather.desc}\n`;
    }
    text += `\n`;
    
    text += `ROSTER\n`;
    text += `Managers - Open: ${data.roster.managers.open.names}\n`;
    text += `Managers - Mid: ${data.roster.managers.mid.names}\n`;
    text += `Managers - Close: ${data.roster.managers.close.names}\n`;
    text += `Staff - Open: ${data.roster.staffs.open.names}\n`;
    text += `Staff - Mid: ${data.roster.staffs.mid.names}\n`;
    text += `Staff - Close: ${data.roster.staffs.close.names}\n`;
    text += `Security: ${data.roster.security.shift} - ${data.roster.security.names}\n\n`;
    
    text += `HOURLY DATA\n`;
    data.rows.forEach(row => {
      text += `${row.hour}: Turnover ${row.turnover}, EGM ${row.egm}`;
      if (row.vip && Object.keys(row.vip).length > 0) {
        text += `, VIP: ${Object.entries(row.vip).map(([k,v]) => `${k}: ${v}`).join(', ')}`;
      }
      text += `\n`;
    });
    
    text += `\nJACKPOTS\n`;
    Object.entries(data.jackpots).forEach(([id, amount]) => {
      if (amount) text += `${id}: ${amount}\n`;
    });
    
    text += `\nINTERACTIONS\n`;
    text += `Gaming:\n`;
    data.logs.gaming.forEach(log => {
      if (log.time && log.note) text += `${log.time}: ${log.note}\n`;
    });
    
    text += `Bar:\n`;
    data.logs.bar.forEach(log => {
      if (log.time && log.note) text += `${log.time}: ${log.note}\n`;
    });
    
    text += `Incidents:\n`;
    data.logs.incidents.forEach(log => {
      if (log.time && log.note) text += `${log.time}: ${log.note}\n`;
    });
    
    return text;
  }

  // Jackpot names editor (fix: stable keys + don't mutate id while typing)
  function startEditNames(){ setEditingNames(true); }
  function cancelEditNames(){ setEditingNames(false); }
  function changeName(i, value){
    setNamesDraft(prev => {
      const next=[...prev];
      next[i] = { ...next[i], name:value }; // DO NOT touch id while typing
      return next;
    });
  }
  function saveNames(){
    const cleaned = namesDraft
      .map(j => ({ id: slug(j.name || j.id), name: (j.name ?? "").trim() }))
      .filter(j => j.name);
    setJackpotTemplate(cleaned);
    localStorage.setItem(LSK_JACKPOTS, JSON.stringify(cleaned));
    setEditingNames(false);
  }

  /** ========= Render ========= */
  return (
    <>
      <Theme />
      <div className="wrap">
        <div className="card">
          <h1>LevelUP Shift Report</h1>

          {/* Date / Weather (no time) */}
          <div className="info">
            <div className="infoCard">{sydDate || "Sydney date loading…"}</div>
            <div className="infoCard">
              Weather in Granville:&nbsp;
              {weather ? (<><b>{weather.temp}°C</b>&nbsp;— {weather.desc}</>) : "—"}
            </div>
          </div>

          {/* ROSTER (3 side-by-side cards) */}
          <div className="rosterGrid">
            <div className="rosterCard">
              <h3>Managers</h3>
              {["open","mid","close"].map(shift=>(
                <div className="row" key={`mgr-${shift}`}>
                  <div style={{minWidth:80, opacity:.95, textTransform:"capitalize"}}>{shift}</div>
                  <input placeholder="Name"
                         value={roster.managers[shift].names}
                         onChange={e=>updateRoster("managers", shift, e.target.value)} />
                </div>
              ))}
            </div>

            <div className="rosterCard">
              <h3>Staffs</h3>
              {["open","mid","close"].map(shift=>(
                <div className="row" key={`stf-${shift}`}>
                  <div style={{minWidth:80, opacity:.95, textTransform:"capitalize"}}>{shift}</div>
                  <input placeholder="Name"
                         value={roster.staffs[shift].names}
                         onChange={e=>updateRoster("staffs", shift, e.target.value)} />
                </div>
              ))}
            </div>

            <div className="rosterCard">
              <h3>Security on Duty</h3>
              <div className="row">
                <div style={{minWidth:80}}>Shift</div>
                <input placeholder="Name"
                       value={roster.security.shift}
                       onChange={e=>updateSecurity("shift", e.target.value)} />
              </div>
              <div className="row" style={{marginTop:8}}>
                <div style={{minWidth:80}}>Names</div>
                <input placeholder="Name"
                       value={roster.security.names}
                       onChange={e=>updateSecurity("names", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* TABLE */}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{width:80}}>Time</th>
                  <th>Turnover</th>
                  <th>Increments ('000s)</th>
                  <th>EGM in play</th>
                  <th style={{minWidth:240}}>VIP Mix</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={r.hour}>
                    <td>{r.hour}</td>
                    <td>
                      <input className="money" placeholder="$"
                             value={r.turnover}
                             onChange={e=>updateCell(i,"turnover",e.target.value)}
                             onBlur={()=>formatTurnoverOnBlur(i)} />
                    </td>
                    <td>
                      <input className="money readonly" placeholder="000s" readOnly tabIndex={-1}
                             value={increments[i] ? numFmt.format(increments[i]) : ""} />
                    </td>
                    <td>
                      <input placeholder="#"
                             value={r.egm}
                             onChange={e=>updateCell(i,"egm",e.target.value)} />
                    </td>
                    <td>
                      {Object.keys(r.vip||{}).length===0 ? (
                        <span className="muted" style={{fontSize:13}}>—</span>
                      ) : (
                        <div style={{display:"flex", flexWrap:"wrap"}}>
                          {Object.entries(r.vip).map(([k,v])=>(
                            <span key={k} className="chip"><b>{k}:</b> {v}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td><button className="btn" onClick={()=>openEdit(i)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divider" />

          {/* Interactions (stacked) */}
          <h2 className="muted" style={{textAlign:"left", margin:0}}>Interactions</h2>
          <div className="logWrap" style={{marginTop:8}}>
            {/* Gaming */}
            <div className="logCard">
              <h3>Gaming Interaction</h3>
              {logs.gaming.map((row,i)=>(
                <div className="logEntry" key={`g-${i}`}>
                  <select className="timeSel" value={row.time}
                          onChange={e=>updateLog("gaming",i,"time",e.target.value)}>
                    <option value="">Time…</option>
                    {TIME_OPTIONS.map(t=><option key={`gt-${t}`} value={t}>{t}</option>)}
                  </select>
                  <textarea placeholder="Interaction details…" value={row.note}
                            onChange={e=>{updateLog("gaming",i,"note",e.target.value); autosize(e.target);}}
                            ref={el=>el&&autosize(el)} />
                  <button className="removeBtn" onClick={()=>removeLog("gaming",i)}>×</button>
                </div>
              ))}
              <button className="addRowBtn" onClick={()=>addLogRow("gaming")}>+ Add gaming interaction</button>
            </div>

            {/* Bar */}
            <div className="logCard">
              <h3>Bar Interaction</h3>
              {logs.bar.map((row,i)=>(
                <div className="logEntry" key={`b-${i}`}>
                  <select className="timeSel" value={row.time}
                          onChange={e=>updateLog("bar",i,"time",e.target.value)}>
                    <option value="">Time…</option>
                    {TIME_OPTIONS.map(t=><option key={`bt-${t}`} value={t}>{t}</option>)}
                  </select>
                  <textarea placeholder="Interaction details…" value={row.note}
                            onChange={e=>{updateLog("bar",i,"note",e.target.value); autosize(e.target);}}
                            ref={el=>el&&autosize(el)} />
                  <button className="removeBtn" onClick={()=>removeLog("bar",i)}>×</button>
                </div>
              ))}
              <button className="addRowBtn" onClick={()=>addLogRow("bar")}>+ Add bar interaction</button>
            </div>

            {/* Incidents */}
            <div className="logCard">
              <h3>Incidents (throughout the night)</h3>
              {logs.incidents.map((row,i)=>(
                <div className="logEntry" key={`i-${i}`}>
                  <select className="timeSel" value={row.time}
                          onChange={e=>updateLog("incidents",i,"time",e.target.value)}>
                    <option value="">Time…</option>
                    {TIME_OPTIONS.map(t=><option key={`it-${t}`} value={t}>{t}</option>)}
                  </select>
                  <textarea placeholder="Incident details…" value={row.note}
                            onChange={e=>{updateLog("incidents",i,"note",e.target.value); autosize(e.target);}}
                            ref={el=>el&&autosize(el)} />
                  <button className="removeBtn" onClick={()=>removeLog("incidents",i)}>×</button>
                </div>
              ))}
              <button className="addRowBtn" onClick={()=>addLogRow("incidents")}>+ Add incident</button>
            </div>
          </div>

          <div className="divider" />

          {/* Link Jackpots (3 columns, editable names) */}
          <div className="jackpotsHeader" style={{marginTop:18}}>
            <h2 style={{margin:0}}>Link Jackpots</h2>
            {!editingNames ? (
              <button className="btn" onClick={startEditNames}>Edit jackpot names</button>
            ) : (
              <div className="editBar">
                <button className="btn gradient" onClick={saveNames}>Save names</button>
                <button className="btn ghost" onClick={cancelEditNames}>Cancel</button>
              </div>
            )}
          </div>
          {!editingNames && (
            <div className="muted" style={{textAlign:"left", marginTop:6}}>
              Jackpot names are fixed. Enter amounts for this shift.
            </div>
          )}

          <div className="jGrid" style={{marginTop:12}}>
            {(editingNames ? namesDraft : jackpotTemplate).map((j, idx) => (
              <div
                className="jItem"
                key={editingNames ? idx : (j.id || idx)}  // stable while editing
              >
                <div className="jName">
                  {!editingNames ? (
                    j.name
                  ) : (
                    <input className="editField" value={j.name}
                           onChange={e=>changeName(idx, e.target.value)} />
                  )}
                </div>
                <div className="jAmount">
                  {!editingNames ? (
                    <input placeholder="$"
                           value={jackpots[j.id] || ""}
                           onChange={e=>updateJackpotAmount(j.id, e.target.value)}
                           onBlur={()=>formatJackpotOnBlur(j.id)} />
                  ) : (
                    <input disabled placeholder="$ (disabled while editing names)" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Ethnicity chips (VM only) AT THE END */}
          <div className="jackpotsHeader" style={{marginTop:16}}>
            <h2 style={{margin:0}}>Ethnicity Chips <span className="muted" style={{fontSize:14}}>(VM only)</span></h2>
            {!editingEth ? (
              <button className="btn" onClick={startEditEth}>Edit ethnicity names</button>
            ) : (
              <div className="editBar">
                <button className="btn gradient" onClick={saveEth}>Save names</button>
                <button className="btn ghost" onClick={cancelEditEth}>Cancel</button>
              </div>
            )}
          </div>
          {!editingEth && (
            <div className="muted" style={{textAlign:"left", marginTop:6}}>
              These are the quick-select options used in the VIP Mix drawer.
            </div>
          )}
          <div className="jGrid" style={{marginTop:12}}>
            {(editingEth ? ethDraft : ethnicityTemplate).map((e, idx) => (
              <div
                className="jItem"
                key={editingEth ? idx : (e.key || idx)}   
              >
                <div className="jName">
                  {!editingEth ? (
                    e.key
                  ) : (
                    <input className="editField" value={e.key}
                           onChange={ev=>changeEthName(idx, ev.target.value)} />
                  )}
                </div>
                <div className="jAmount">
                  {!editingEth ? (
                    <input disabled placeholder="(used in VIP editor)" />
                  ) : (
                    <div className="editBar">
                      <button className="btn ghost" onClick={()=>removeEthRow(idx)}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {editingEth && <button className="addRowBtn" onClick={addEthRow}>+ Add ethnicity chip</button>}

          {/* Footer */}
          <div className="footer">
            <button className="btn ghost" onClick={clearDraft}>Clear Draft</button>
            <button className="btn" onClick={saveDraft}>Save Draft</button>
            <button className="btn gradient" onClick={submit}>Submit Report</button>
          </div>
        </div>
      </div>

      {/* VIP Edit Drawer */}
      {editing !== null && (
        <div className="drawer" onClick={()=>setEditing(null)} style={{background:"#0006", position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
          <div className="sheet" onClick={e=>e.stopPropagation()} style={{width:680, maxWidth:"100%", background:"#1f1637cc", border:"1px solid var(--line)", borderRadius:16, padding:18, backdropFilter:"blur(10px)", position:"relative"}}>
            <button className="btn ghost" style={{position:"absolute", right:18, top:14}} onClick={()=>setEditing(null)}>Close</button>
            <h3 style={{margin:"0 0 8px"}}>Edit VIP Mix — {rows[editing].hour}</h3>

            <div className="row" style={{marginTop:8, alignItems:"flex-end"}}>
              <div style={{minWidth:260, flex:1}}>
                <label>Ethnicity</label>
                <select style={{width:"100%"}} value={editEthnicity} onChange={e=>setEditEthnicity(e.target.value)}>
                  {ethnicityTemplate.map(e => <option key={e.key} value={e.key}>{e.key}</option>)}
                </select>
              </div>
              <div style={{minWidth:160}}>
                <label>Count</label>
                <input placeholder="2" value={editCount} onChange={e=>setEditCount(e.target.value)} />
              </div>
              <button className="btn gradient" onClick={addVip}>Add</button>
            </div>

            <div style={{marginTop:12}}>
              {(Object.entries(rows[editing].vip || {}).length === 0) ? (
                <div className="muted">No VIP entries yet.</div>
              ) : (
                <div style={{display:"flex", flexWrap:"wrap"}}>
                  {Object.entries(rows[editing].vip).map(([k,v])=>(
                    <span key={k} className="chip">
                      <b>{k}:</b> {v}
                      <button className="btn ghost" style={{padding:"4px 8px", marginLeft:8}} onClick={()=>removeVip(k)}>remove</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
