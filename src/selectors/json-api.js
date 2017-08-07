export const normalize = (data, store) => {
  // potentially hydrate relationships here
  if (!data) return data;
  const { type, id, relationships } = data;
  const hydratedRelationships = Object.keys(
    relationships
  ).reduce((accum, key) => {
    const { data: { type, id } } = relationships[key];
    accum[key] = select(type, id, store);
    return accum;
  }, {});
  return Object.assign({}, data.attributes, hydratedRelationships, {
    id,
    type,
    relationships,
  });
};

export const relationshipsToArray = data => {
  const { relationships } = data;
  if (!relationships) return [];
  return Object.keys(relationships).map(type => relationships[type]);
};

export const select = (modelName, id, store) => {
  const { jsonapi: { cache } } = store;
  const resource = cache[modelName];
  if (!id)
    return resource
      ? Object.keys(resource).map(key => normalize(resource[key], store))
      : [];
  if (!resource) return {};
  return normalize(resource[id], store);
};
