import jsonAPIConstants from '../constants/json-api';
const initialState = {
  fetchOptions: {
    host: '',
    endpoint: '',
  },
  token: '',
  cache: {},
};

export const jsonapi = (state = initialState, action) => {
  switch (action.type) {
    case jsonAPIConstants.JSON_API_SET_TOKEN:
      return Object.assign({}, state, { token: action.token });
    case jsonAPIConstants.JSON_API_SET_OPTIONS: {
      return Object.assign({}, state, {
        fetchOptions: Object.assign({}, state.fetchOptions, action.options),
      });
    }
    case jsonAPIConstants.JSON_API_CACHE_RESOURCE: {
      return Object.assign({}, state, {
        cache: Object.assign({}, state.cache, action.data),
      });
    }

    default:
      return state;
  }
};
