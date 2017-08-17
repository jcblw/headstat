import userConstants from '../constants/user';
const initialState = {
  userId: null,
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case userConstants.USER_SET_DATA:
      return Object.assign({}, state, action.data);
    case userConstants.USER_SET_ID:
      return Object.assign({}, state, { userId: action.id });
    default:
      return state;
  }
}
