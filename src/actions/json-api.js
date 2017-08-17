import jsonAPIConstants from '../constants/json-api';

export const setToken = token => {
  return {
    type: jsonAPIConstants.JSON_API_SET_TOKEN,
    token,
  };
};

export const setOptions = options => {
  return {
    type: jsonAPIConstants.JSON_API_SET_OPTIONS,
    options,
  };
};

export const getResource = (modelName, ...args) => {
  const id = typeof args[0] === 'string' ? args[0] : null;
  const query = typeof args[0] === 'object' ? args[0] : args[1];
  return {
    type: jsonAPIConstants.JSON_API_GET_RESOURCE,
    modelName,
    id,
    query,
  };
};

export const fetchingResource = (modelName, id) => {
  return {
    type: jsonAPIConstants.JSON_API_FETCHING_RESOURCE,
    modelName,
    id,
  };
};

export const cacheResource = data => {
  return {
    type: jsonAPIConstants.JSON_API_CACHE_RESOURCE,
    data,
  };
};

export const errorFetching = (modelName, id, error) => {
  return {
    type: jsonAPIConstants.JSON_API_RESOURCE_ERROR,
    modelName,
    id,
    error,
  };
};

export const clearCache = () => {
  return {
    type: jsonAPIConstants.JSON_API_CLEAR_CACHE,
  };
};
