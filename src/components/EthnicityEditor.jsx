// src/components/EthnicityEditor.jsx - Ethnicity template management component

import React from 'react';

export function EthnicityItem({ 
  ethnicity, 
  index, 
  editingEth, 
  ethDraft, 
  onChangeEthName, 
  onRemoveEthRow 
}) {
  return (
    <div
      className="jItem"
      key={editingEth ? index : (ethnicity.key || index)}
    >
      <div className="jName">
        {!editingEth ? (
          ethnicity.key
        ) : (
          <input 
            className="editField" 
            value={ethnicity.key}
            onChange={e => onChangeEthName(index, e.target.value)} 
          />
        )}
      </div>
      <div className="jAmount">
        {!editingEth ? (
          <input disabled placeholder="(used in VIP editor)" />
        ) : (
          <div className="editBar">
            <button className="btn ghost" onClick={() => onRemoveEthRow(index)}>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function EthnicityEditor({ 
  ethnicityTemplate, 
  ethDraft, 
  editingEth, 
  onStartEditEth, 
  onCancelEditEth, 
  onSaveEth, 
  onChangeEthName, 
  onAddEthRow, 
  onRemoveEthRow 
}) {
  return (
    <>
      <div className="jackpotsHeader" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>
          Ethnicity Chips <span className="muted" style={{ fontSize: 14 }}>(VM only)</span>
        </h2>
        {!editingEth ? (
          <button className="btn" onClick={onStartEditEth}>
            Edit ethnicity names
          </button>
        ) : (
          <div className="editBar">
            <button className="btn gradient" onClick={onSaveEth}>
              Save names
            </button>
            <button className="btn ghost" onClick={onCancelEditEth}>
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {!editingEth && (
        <div className="muted" style={{ textAlign: "left", marginTop: 6 }}>
          These are the quick-select options used in the VIP Mix drawer.
        </div>
      )}
      
      <div className="jGrid" style={{ marginTop: 12 }}>
        {(editingEth ? ethDraft : ethnicityTemplate).map((ethnicity, idx) => (
          <EthnicityItem
            key={editingEth ? idx : (ethnicity.key || idx)}
            ethnicity={ethnicity}
            index={idx}
            editingEth={editingEth}
            ethDraft={ethDraft}
            onChangeEthName={onChangeEthName}
            onRemoveEthRow={onRemoveEthRow}
          />
        ))}
      </div>
      
      {editingEth && (
        <button className="addRowBtn" onClick={onAddEthRow}>
          + Add ethnicity chip
        </button>
      )}
    </>
  );
}
