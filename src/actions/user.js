import userConstants from '../constants/user';

export const setUserAuth = token => {
  return {
    type: userConstants.USER_SET_AUTH,
    token,
  };
};

export const setUserData = data => {
  return {
    type: userConstants.USER_SET_DATA,
    data,
  };
};

export const setUserId = id => {
  return {
    type: userConstants.USER_SET_ID,
    id,
  };
};

export const setJWTError = err => {
  return {
    type: userConstants.USER_JWT_DECODE_ERROR,
    error: err,
  };
};
