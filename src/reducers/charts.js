import chartsConstants from '../constants/charts';
const initialState = {
  filter: 'day',
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case chartsConstants.CHARTS_SET_FILTER:
      return Object.assign({}, state, { filter: action.filter });
    default:
      return state;
  }
}
