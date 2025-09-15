// src/components/LogSection.jsx - Interaction logging components

import React from 'react';
import { TIME_OPTIONS } from '../lib/time.js';
import { autosize } from '../lib/format.js';

export function LogEntry({ row, index, onUpdate, onRemove }) {
  return (
    <div className="logEntry" key={`log-${index}`}>
      <select 
        className="timeSel" 
        value={row.time}
        onChange={e => onUpdate(index, "time", e.target.value)}
      >
        <option value="">Time…</option>
        {TIME_OPTIONS.map(t => <option key={`time-${t}`} value={t}>{t}</option>)}
      </select>
      <textarea 
        placeholder="Interaction details…" 
        value={row.note}
        onChange={e => {
          onUpdate(index, "note", e.target.value);
          autosize(e.target);
        }}
        ref={el => el && autosize(el)} 
      />
      <button className="removeBtn" onClick={() => onRemove(index)}>×</button>
    </div>
  );
}

export function LogCard({ title, logs, onUpdate, onAdd, onRemove }) {
  return (
    <div className="logCard">
      <h3>{title}</h3>
      {logs.map((row, i) => (
        <LogEntry
          key={`${title.toLowerCase()}-${i}`}
          row={row}
          index={i}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
      <button className="addRowBtn" onClick={onAdd}>
        + Add {title.toLowerCase()}
      </button>
    </div>
  );
}

export function LogSection({ logs, onUpdateLog, onAddLogRow, onRemoveLog }) {
  const logTypes = [
    { key: "gaming", title: "Gaming Interaction" },
    { key: "bar", title: "Bar Interaction" },
    { key: "incidents", title: "Incidents (throughout the night)" }
  ];

  return (
    <>
      <h2 className="muted" style={{ textAlign: "left", margin: 0 }}>
        Interactions
      </h2>
      <div className="logWrap" style={{ marginTop: 8 }}>
        {logTypes.map(({ key, title }) => (
          <LogCard
            key={key}
            title={title}
            logs={logs[key]}
            onUpdate={(index, field, value) => onUpdateLog(key, index, field, value)}
            onAdd={() => onAddLogRow(key)}
            onRemove={(index) => onRemoveLog(key, index)}
          />
        ))}
      </div>
    </>
  );
}
