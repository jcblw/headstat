export const aggregationToChartMap = (aggregation, formatTitle) => {
  return Object.keys(aggregation)
    .map(date => {
      const firstDate = aggregation[date][0]
        ? aggregation[date][0].updatedAt
        : aggregation[date].date;
      return {
        name: formatTitle(firstDate),
        sessions: aggregation[date].length,
        sortBy: firstDate,
      };
    })
    .filter(aggregat => aggregat.sessions < 10)
    .sort((prev, next) => {
      return new Date(prev.sortBy).valueOf() - new Date(next.sortBy).valueOf();
    });
};

export const allFilters = () => {
  return ['day', 'week', 'month'];
};

const basicTitle = _date => {
  if (!_date) return 'Invalid Date';
  const date = new Date(_date);
  const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
  const month = formatter.format(date);
  return `${month} ${date.getDate() + 1}`;
};

export const titleFormatters = {
  day: basicTitle,
  month(_date) {
    if (!_date) return 'Invalid Date';
    const date = new Date(_date);
    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
    return formatter.format(date);
  },
  week: basicTitle,
};
