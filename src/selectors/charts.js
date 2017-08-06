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
