// src/components/VipDrawer.jsx - VIP mix editing modal component

import React from 'react';

export function VipDrawer({ 
  editing, 
  rows, 
  ethnicityTemplate, 
  editEthnicity, 
  editCount, 
  onClose, 
  onSetEditEthnicity, 
  onSetEditCount, 
  onAddVip, 
  onRemoveVip 
}) {
  if (editing === null) return null;

  return (
    <div 
      className="drawer" 
      onClick={onClose} 
      style={{
        background: "#0006", 
        position: "fixed", 
        inset: 0, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 20
      }}
    >
      <div 
        className="sheet" 
        onClick={e => e.stopPropagation()} 
        style={{
          width: 680, 
          maxWidth: "100%", 
          background: "#1f1637cc", 
          border: "1px solid var(--line)", 
          borderRadius: 16, 
          padding: 18, 
          backdropFilter: "blur(10px)", 
          position: "relative"
        }}
      >
        <button 
          className="btn ghost" 
          style={{ position: "absolute", right: 18, top: 14 }} 
          onClick={onClose}
        >
          Close
        </button>
        
        <h3 style={{ margin: "0 0 8px" }}>
          Edit VIP Mix — {rows[editing].hour}
        </h3>

        <div className="row" style={{ marginTop: 8, alignItems: "flex-end" }}>
          <div style={{ minWidth: 260, flex: 1 }}>
            <label>Ethnicity</label>
            <select 
              style={{ width: "100%" }} 
              value={editEthnicity} 
              onChange={e => onSetEditEthnicity(e.target.value)}
            >
              {ethnicityTemplate.map(e => (
                <option key={e.key} value={e.key}>{e.key}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 160 }}>
            <label>Count</label>
            <input 
              placeholder="2" 
              value={editCount} 
              onChange={e => onSetEditCount(e.target.value)} 
            />
          </div>
          <button className="btn gradient" onClick={onAddVip}>
            Add
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {(Object.entries(rows[editing].vip || {}).length === 0) ? (
            <div className="muted">No VIP entries yet.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {Object.entries(rows[editing].vip).map(([k, v]) => (
                <span key={k} className="chip">
                  <b>{k}:</b> {v}
                  <button 
                    className="btn ghost" 
                    style={{ padding: "4px 8px", marginLeft: 8 }} 
                    onClick={() => onRemoveVip(k)}
                  >
                    remove
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
