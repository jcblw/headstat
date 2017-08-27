import React from 'react';

export const filterLabels = { day: 'Daily', week: 'Weekly', month: 'Monthly' };

export default ({
  filter,
  allFilters,
  onFilterChange,
  breakdown,
  onBreakdownChange,
  metric,
  onMetricChange,
}) => {
  return (
    <div>
      <select value={filter} onChange={onFilterChange}>
        {allFilters.map(_filter => {
          return (
            <option key={_filter} value={_filter}>
              {filterLabels[_filter]}
            </option>
          );
        })}
      </select>
      <select value={breakdown} onChange={onBreakdownChange}>
        <option value="total">Total</option>
        <option value="not-total">By activity</option>
      </select>
      <select value={metric} onChange={onMetricChange}>
        <option value="sessions">Sessions</option>
        <option value="minutes">Minutes</option>
      </select>
    </div>
  );
};
