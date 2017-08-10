export const aggregationToChartMap = (aggregation, formatTitle) => {
  return Object.keys(aggregation)
    .map(date => {
      const firstDate = aggregation[date].date;
      const data = {
        name: formatTitle(firstDate),
        sortBy: firstDate,
      };
      Object.keys(aggregation[date]).forEach(key => {
        data[key] = aggregation[date][key].length;
      });
      return data;
    })
    .sort((prev, next) => {
      return new Date(prev.sortBy).valueOf() - new Date(next.sortBy).valueOf();
    });
};

export const aggregationToChartMapTime = (aggregation, formatTitle) => {
  return Object.keys(aggregation)
    .map(date => {
      const firstDate = aggregation[date].date;
      const data = {
        name: formatTitle(firstDate),
        sortBy: firstDate,
      };
      Object.keys(aggregation[date]).forEach(key => {
        if (!Array.isArray(aggregation[date][key])) {
          return;
        }
        data[key] = aggregation[date][key].reduce((accum, a) => {
          if (a.variation && a.variation.duration) {
            accum += a.variation.duration;
          }
          return accum;
        }, 0);
      });
      return data;
    })
    .sort((prev, next) => {
      return new Date(prev.sortBy).valueOf() - new Date(next.sortBy).valueOf();
    });
};

export const allFilters = () => {
  return ['day', 'week', 'month'];
};

export const aggregationToBars = aggregation => {
  const keyHash = Object.keys(aggregation).reduce((accum, date) => {
    const aggregate = aggregation[date];
    return Object.keys(aggregate)
      .filter(key => key !== 'sortBy' && key !== 'date')
      .reduce((acc, key) => {
        if (acc[key]) return acc;
        const color = aggregate[key][0].activityGroupPrimaryColor;
        Object.assign(acc, { [key]: { color, key } });
        return acc;
      }, accum);
  }, {});
  return Object.keys(keyHash).map(key => keyHash[key]);
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
