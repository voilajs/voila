import {Resource, MacroResource} from 'run-core';

export async function run(expression = '', {directory} = {}) {
  let userResource;

  if (directory) {
    userResource = await Resource.$load(directory, {
      searchInParentDirectories: true,
      throwIfNotFound: false
    });
  }

  let resource = userResource;
  if (!resource) {
    resource = await Resource.$create(undefined, {directory});
  }

  const macro = await MacroResource.$create({'@expression': expression}, {directory});

  return await macro.$invoke(undefined, {parent: resource});
}
