import fetch from 'isomorphic-fetch';
import normalize from 'json-api-normalizer';
import jsonAPIConstants from '../constants/json-api';
import {
  fetchingResource,
  errorFetching,
  cacheResource,
} from '../actions/json-api';
import qs from 'query-string';

export const request = state => (action, method) => {
  const { token, fetchOptions: { host, endpoint } } = state.jsonapi;
  const { data } = action;
  const options = {
    method,
    headers: {
      'Content-type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body:
      data && method.toUpperCase() !== 'GET' ? JSON.stringify(data) : undefined,
  };
  return fetch(buildURL(host, endpoint, action), options).then(resp =>
    resp.json()
  );
};

export const cache = ({ jsonapi: { cache } }, { modelName, id }) => {
  const resource = cache[modelName];
  if (!id || !resource) return null;
  return resource[id];
};

export const buildURL = (host, endpoint, { modelName, id, query }) => {
  return `${host}${endpoint}/${modelName}${id ? `/${id}` : ''}${query
    ? `?${qs.stringify(query)}`
    : ''}`;
};

const middleware = store => next => action => {
  next(action);
  switch (action.type) {
    case jsonAPIConstants.JSON_API_GET_RESOURCE: {
      const state = store.getState();
      const authedRequest = request(state);
      const cached = cache(state, action);
      if (cached) return;
      store.dispatch(fetchingResource(action.modelName, action.id));
      authedRequest(action, 'GET')
        .then(resp => {
          store.dispatch(cacheResource(normalize(resp)));
        })
        .catch(error => {
          console.error(error);
          store.dispatch(errorFetching(Object.assign({}, action, { error })));
        });
      break;
    }
    default:
  }
};

export default middleware;
