import chartsConstants from '../constants/charts';

export const setChartsFilter = filter => {
  return {
    type: chartsConstants.CHARTS_SET_FILTER,
    filter,
  };
};

export const setChartsBreakdown = breakdown => {
  return {
    type: chartsConstants.CHARTS_SET_BREAKDOWN,
    breakdown,
  };
};

export const setChartsMetric = metric => {
  return {
    type: chartsConstants.CHARTS_SET_METRIC,
    metric,
  };
};
