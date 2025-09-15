// src/components/RosterCard.jsx - Roster management component

import React from 'react';

export function RosterCard({ title, shifts, roster, onUpdate }) {
  return (
    <div className="rosterCard">
      <h3>{title}</h3>
      {shifts.map(shift => (
        <div className="row" key={`${title.toLowerCase()}-${shift}`}>
          <div style={{ minWidth: 80, opacity: 0.95, textTransform: "capitalize" }}>
            {shift}
          </div>
          <input 
            placeholder="Name"
            value={roster[shift]?.names || ""}
            onChange={e => onUpdate(shift, e.target.value)} 
          />
        </div>
      ))}
    </div>
  );
}

export function SecurityCard({ roster, onUpdate }) {
  return (
    <div className="rosterCard">
      <h3>Security on Duty</h3>
      <div className="row">
        <div style={{ minWidth: 80 }}>Shift</div>
        <input 
          placeholder="Name"
          value={roster.shift || ""}
          onChange={e => onUpdate("shift", e.target.value)} 
        />
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <div style={{ minWidth: 80 }}>Names</div>
        <input 
          placeholder="Name"
          value={roster.names || ""}
          onChange={e => onUpdate("names", e.target.value)} 
        />
      </div>
    </div>
  );
}

export function RosterSection({ roster, onUpdateRoster, onUpdateSecurity }) {
  return (
    <div className="rosterGrid">
      <RosterCard
        title="Managers"
        shifts={["open", "mid", "close"]}
        roster={roster.managers}
        onUpdate={(shift, value) => onUpdateRoster("managers", shift, value)}
      />
      
      <RosterCard
        title="Staffs"
        shifts={["open", "mid", "close"]}
        roster={roster.staffs}
        onUpdate={(shift, value) => onUpdateRoster("staffs", shift, value)}
      />
      
      <SecurityCard
        roster={roster.security}
        onUpdate={onUpdateSecurity}
      />
    </div>
  );
}
