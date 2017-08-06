import jwtDecode from 'jwt-decode';
import userConstants from '../constants/user';
import { setUserData, setJWTError } from '../actions/user';
import { setToken } from '../actions/json-api';

const middleware = store => next => action => {
  switch (action.type) {
    case userConstants.USER_SET_AUTH: {
      let data;
      let err;
      try {
        data = jwtDecode(action.token);
      } catch (e) {
        data = null;
        err = e;
      }
      if (err) {
        return store.dispatch(setJWTError(err));
      }
      store.dispatch(setToken(action.token));
      return store.dispatch(setUserData(data));
    }
    default:
      return next(action);
  }
};

export default middleware;
