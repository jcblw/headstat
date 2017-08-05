import userConstants from '../constants/user';
const initialState = {};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case userConstants.USER_SET_DATA:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}
