// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";

// Import utilities
import { toMoney, parseMoney, numFmt, slug } from "./lib/format.js";
import { HOURS, emptyRow } from "./lib/time.js";
import { 
  loadReportData, 
  loadJackpotTemplate, 
  loadEthnicityTemplate,
  saveReportData,
  saveJackpotTemplate,
  saveEthnicityTemplate,
  clearReportData,
  getDefaultRoster,
  getDefaultLogs
} from "./lib/storage.js";
import { DEFAULT_JACKPOT_TEMPLATE, DEFAULT_ETHNICITY_TEMPLATE } from "./lib/constants.js";

// Import components
import { RosterSection } from "./components/RosterCard.jsx";
import { LogSection } from "./components/LogSection.jsx";
import { JackpotsSection } from "./components/Jackpots.jsx";
import { EthnicityEditor } from "./components/EthnicityEditor.jsx";
import { VipDrawer } from "./components/VipDrawer.jsx";

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

/** ========= Main Component ========= */
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

  /** Load Data from Storage */
  const defaultRows = HOURS.map(emptyRow);
  const { rows, roster, logs, jackpots } = loadReportData(defaultRows);
  const [reportRows, setReportRows] = useState(rows);
  const [reportRoster, setReportRoster] = useState(roster);
  const [reportLogs, setReportLogs] = useState(logs);
  const [reportJackpots, setReportJackpots] = useState(jackpots);

  /** Templates */
  const [ethnicityTemplate, setEthnicityTemplate] = useState(() => 
    loadEthnicityTemplate(DEFAULT_ETHNICITY_TEMPLATE)
  );
  const [jackpotTemplate, setJackpotTemplate] = useState(() => 
    loadJackpotTemplate(DEFAULT_JACKPOT_TEMPLATE)
  );

  /** Template Editing States */
  const [editingEth, setEditingEth] = useState(false);
  const [ethDraft, setEthDraft] = useState(() => ethnicityTemplate.map(e => ({...e})));
  const [editingNames, setEditingNames] = useState(false);
  const [namesDraft, setNamesDraft] = useState(() => jackpotTemplate.map(j => ({...j})));

  useEffect(() => { setEthDraft(ethnicityTemplate.map(e => ({...e}))); }, [editingEth]);
  useEffect(() => { setNamesDraft(jackpotTemplate.map(j => ({...j}))); }, [editingNames]);

  /** VIP Editing State */
  const [editing, setEditing] = useState(null);
  const [editEthnicity, setEditEthnicity] = useState(ethnicityTemplate[0]?.key || "");
  const [editCount, setEditCount] = useState("");
  
  useEffect(() => {
    setEditEthnicity(prev => ethnicityTemplate.find(e=>e.key===prev)?.key ?? (ethnicityTemplate[0]?.key || ""));
  }, [ethnicityTemplate]);

  /** Aggregates */
  const totals = useMemo(() => {
    const all = Object.fromEntries(ethnicityTemplate.map(e => [e.key, 0]));
    let egmSum = 0;
    reportRows.forEach(r => {
      egmSum += parseMoney(r.egm);
      for (const [k, v] of Object.entries(r.vip || {})) all[k] = (all[k]||0) + (Number(v)||0);
    });
    return { all, egmSum };
  }, [reportRows, ethnicityTemplate]);

  const increments = useMemo(() => {
    const inc = [];
    for (let i=0; i<reportRows.length; i++){
      const cur = parseMoney(reportRows[i].turnover);
      const prev = i===0 ? 0 : parseMoney(reportRows[i-1].turnover);
      const val = i===0 ? cur : (cur - prev);
      inc.push(val > 0 ? val : 0);
    }
    return inc;
  }, [reportRows]);

  /** Actions */
  function updateCell(i, key, value){
    setReportRows(prev => { const next=[...prev]; next[i] = { ...next[i], [key]: value }; return next; });
  }
  
  function formatTurnoverOnBlur(i){
    setReportRows(prev => { const next=[...prev]; const n=parseMoney(next[i].turnover); next[i].turnover = n ? toMoney(n) : ""; return next; });
  }

  function openEdit(i){ setEditing(i); setEditEthnicity(ethnicityTemplate[0]?.key || ""); setEditCount(""); }
  
  function addVip(){
    if (editing==null) return;
    const c = Number(editCount); if (!c) return;
    setReportRows(prev=>{
      const next=[...prev]; const r={...next[editing]}; const vip={...(r.vip||{})};
      vip[editEthnicity] = (Number(vip[editEthnicity])||0) + c;
      r.vip = vip; next[editing]=r; return next;
    });
    setEditCount("");
  }
  
  function removeVip(eth){
    if (editing==null) return;
    setReportRows(prev=>{
      const next=[...prev]; const r={...next[editing]}; const vip={...(r.vip||{})};
      delete vip[eth]; r.vip=vip; next[editing]=r; return next;
    });
  }

  function updateRoster(group, shift, value){
    setReportRoster(prev => ({ ...prev, [group]: { ...prev[group], [shift]: { names:value } } }));
  }
  
  function updateSecurity(field, value){
    setReportRoster(prev => ({ ...prev, security: { ...prev.security, [field]: value } }));
  }

  function addLogRow(kind){ setReportLogs(prev => ({ ...prev, [kind]: [...prev[kind], { time:"", note:"" }] })); }
  
  function updateLog(kind, index, field, value){
    setReportLogs(prev => {
      const next = { ...prev };
      next[kind] = next[kind].map((row,i)=> i===index ? { ...row, [field]: value } : row);
      return next;
    });
  }
  
  function removeLog(kind, index){
    setReportLogs(prev => {
      const next = { ...prev };
      next[kind] = next[kind].filter((_,i)=>i!==index);
      return next;
    });
  }

  function updateJackpotAmount(id, value){ setReportJackpots(prev=>({ ...prev, [id]: value })); }
  
  function formatJackpotOnBlur(id){
    setReportJackpots(prev => { const raw=parseMoney(prev[id]); return { ...prev, [id]: raw ? toMoney(raw) : "" }; });
  }

  /** Template Management */
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
    saveEthnicityTemplate(clean);
    setEditEthnicity(prev => clean.find(e=>e.key===prev)?.key ?? (clean[0]?.key || ""));
    setEditingEth(false);
  }

  function startEditNames(){ setEditingNames(true); }
  function cancelEditNames(){ setEditingNames(false); }
  function changeName(i, value){
    setNamesDraft(prev => {
      const next=[...prev];
      next[i] = { ...next[i], name:value };
      return next;
    });
  }
  function saveNames(){
    const cleaned = namesDraft
      .map(j => ({ id: slug(j.name || j.id), name: (j.name ?? "").trim() }))
      .filter(j => j.name);
    setJackpotTemplate(cleaned);
    saveJackpotTemplate(cleaned);
    setEditingNames(false);
  }

  function saveDraft(){
    saveReportData({ rows: reportRows, roster: reportRoster, logs: reportLogs, jackpots: reportJackpots });
    alert("Draft saved locally.");
  }
  
  function clearDraft(){
    clearReportData();
    alert("Local draft cleared.");
  }

  // Enhanced submit function that sends report via email
  async function submit(){
    try {
      const reportData = {
        date: sydDate,
        weather: weather,
        rows: reportRows,
        roster: reportRoster,
        logs: reportLogs,
        jackpots: reportJackpots,
        totals: totals,
        submittedAt: new Date().toISOString()
      };

      const htmlContent = generateReportHTML(reportData);
      
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "dhakalsushil02@gmail.com",
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

  /** ========= Render ========= */
  return (
    <>
      <Theme />
      <div className="wrap">
        <div className="card">
          <h1>LevelUP Shift Report</h1>

          {/* Date / Weather */}
          <div className="info">
            <div className="infoCard">{sydDate || "Sydney date loading…"}</div>
            <div className="infoCard">
              Weather in Granville:&nbsp;
              {weather ? (<><b>{weather.temp}°C</b>&nbsp;— {weather.desc}</>) : "—"}
            </div>
          </div>

          {/* ROSTER */}
          <RosterSection 
            roster={reportRoster}
            onUpdateRoster={updateRoster}
            onUpdateSecurity={updateSecurity}
          />

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
                {reportRows.map((r,i)=>(
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

          {/* Interactions */}
          <LogSection 
            logs={reportLogs}
            onUpdateLog={updateLog}
            onAddLogRow={addLogRow}
            onRemoveLog={removeLog}
          />

          <div className="divider" />

          {/* Jackpots */}
          <JackpotsSection
            jackpotTemplate={jackpotTemplate}
            namesDraft={namesDraft}
            editingNames={editingNames}
            jackpots={reportJackpots}
            onStartEditNames={startEditNames}
            onCancelEditNames={cancelEditNames}
            onSaveNames={saveNames}
            onChangeName={changeName}
            onUpdateAmount={updateJackpotAmount}
            onFormatAmount={formatJackpotOnBlur}
          />

          <div className="divider" />

          {/* Ethnicity Editor */}
          <EthnicityEditor
            ethnicityTemplate={ethnicityTemplate}
            ethDraft={ethDraft}
            editingEth={editingEth}
            onStartEditEth={startEditEth}
            onCancelEditEth={cancelEditEth}
            onSaveEth={saveEth}
            onChangeEthName={changeEthName}
            onAddEthRow={addEthRow}
            onRemoveEthRow={removeEthRow}
          />

          {/* Footer */}
          <div className="footer">
            <button className="btn ghost" onClick={clearDraft}>Clear Draft</button>
            <button className="btn" onClick={saveDraft}>Save Draft</button>
            <button className="btn gradient" onClick={submit}>Submit Report</button>
          </div>
        </div>
      </div>

      {/* VIP Edit Drawer */}
      <VipDrawer
        editing={editing}
        rows={reportRows}
        ethnicityTemplate={ethnicityTemplate}
        editEthnicity={editEthnicity}
        editCount={editCount}
        onClose={() => setEditing(null)}
        onSetEditEthnicity={setEditEthnicity}
        onSetEditCount={setEditCount}
        onAddVip={addVip}
        onRemoveVip={removeVip}
      />
    </>
  );
}