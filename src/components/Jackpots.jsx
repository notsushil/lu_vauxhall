// src/components/Jackpots.jsx - Jackpot management component

import React from 'react';
import { parseMoney, toMoney } from '../lib/format.js';

export function JackpotItem({ 
  jackpot, 
  index, 
  editingNames, 
  namesDraft, 
  jackpots, 
  onChangeName, 
  onUpdateAmount, 
  onFormatAmount 
}) {
  return (
    <div
      className="jItem"
      key={editingNames ? index : (jackpot.id || index)}
    >
      <div className="jName">
        {!editingNames ? (
          jackpot.name
        ) : (
          <input 
            className="editField" 
            value={jackpot.name}
            onChange={e => onChangeName(index, e.target.value)} 
          />
        )}
      </div>
      <div className="jAmount">
        {!editingNames ? (
          <input 
            placeholder="$"
            value={jackpots[jackpot.id] || ""}
            onChange={e => onUpdateAmount(jackpot.id, e.target.value)}
            onBlur={() => onFormatAmount(jackpot.id)} 
          />
        ) : (
          <input disabled placeholder="$ (disabled while editing names)" />
        )}
      </div>
    </div>
  );
}

export function JackpotsSection({ 
  jackpotTemplate, 
  namesDraft, 
  editingNames, 
  jackpots, 
  onStartEditNames, 
  onCancelEditNames, 
  onSaveNames, 
  onChangeName, 
  onUpdateAmount, 
  onFormatAmount 
}) {
  return (
    <>
      <div className="jackpotsHeader" style={{ marginTop: 18 }}>
        <h2 style={{ margin: 0 }}>Link Jackpots</h2>
        {!editingNames ? (
          <button className="btn" onClick={onStartEditNames}>
            Edit jackpot names
          </button>
        ) : (
          <div className="editBar">
            <button className="btn gradient" onClick={onSaveNames}>
              Save names
            </button>
            <button className="btn ghost" onClick={onCancelEditNames}>
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {!editingNames && (
        <div className="muted" style={{ textAlign: "left", marginTop: 6 }}>
          Jackpot names are fixed. Enter amounts for this shift.
        </div>
      )}

      <div className="jGrid" style={{ marginTop: 12 }}>
        {(editingNames ? namesDraft : jackpotTemplate).map((jackpot, idx) => (
          <JackpotItem
            key={editingNames ? idx : (jackpot.id || idx)}
            jackpot={jackpot}
            index={idx}
            editingNames={editingNames}
            namesDraft={namesDraft}
            jackpots={jackpots}
            onChangeName={onChangeName}
            onUpdateAmount={onUpdateAmount}
            onFormatAmount={onFormatAmount}
          />
        ))}
      </div>
    </>
  );
}
