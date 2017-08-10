import chartsConstants from '../constants/charts';
const initialState = {
  filter: 'month',
  breakdown: 'total',
  metric: 'sessions',
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case chartsConstants.CHARTS_SET_FILTER:
      return Object.assign({}, state, { filter: action.filter });
    case chartsConstants.CHARTS_SET_BREAKDOWN:
      return Object.assign({}, state, { breakdown: action.breakdown });
    case chartsConstants.CHARTS_SET_METRIC:
      return Object.assign({}, state, { metric: action.metric });
    default:
      return state;
  }
}
