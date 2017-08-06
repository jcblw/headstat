export const normalize = data => {
  // potentially hydrate relationships here
  const { type, id } = data;
  return Object.assign({}, data.attributes, { id, type });
};

export const select = (modelName, id, { jsonapi: { cache } }) => {
  const resource = cache[modelName];
  if (!id)
    return resource
      ? Object.keys(resource).map(key => normalize(resource[key]))
      : [];
  return normalize(resource[id]);
};
