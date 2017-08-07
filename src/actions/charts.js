import chartsConstants from '../constants/charts';

export const setChartsFilter = filter => {
  return {
    type: chartsConstants.CHARTS_SET_FILTER,
    filter,
  };
};
