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
      const cache = Object.keys(action.data).reduce((accum, key) => {
        accum[key] = Object.assign(
          {},
          state.cache[key] || {},
          action.data[key]
        );
        return accum;
      }, {});
      return Object.assign({}, state, {
        cache: Object.assign({}, state.cache, cache),
      });
    }
    case jsonAPIConstants.JSON_API_CLEAR_CACHE: {
      return Object.assign({}, state, { cache: {} });
    }

    default:
      return state;
  }
};
