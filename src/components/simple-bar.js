import React from 'react';
import './simple-bar.css';
import '../flex.css';

const shortName = {
  sessions: 'sessions',
  minutes: 'min',
};

export default ({ max = 0, value = 0, label = 'Label', suffix = 'Min' }) => {
  const width = {
    width: value ? `${100 / (max / value)}%` : '8px',
  };
  return (
    <div className="simple-bar--container">
      <div className="simple-bar--barConainer">
        <div
          className={`simple-bar--bar ${!value ? 'simple-bar--barGrey' : ''}`}
          style={width}
        />
      </div>
      <div className="u-flex" style={width}>
        <p className="u-flex--1 simple-bar--label">
          {label}
        </p>
        <p className="u-flex--0 simple-bar--value">
          {`${value} ${shortName[suffix]}`}
        </p>
      </div>
    </div>
  );
};
