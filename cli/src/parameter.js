import {entries, isPlainObject} from 'lodash';
import {compactObject, throwUserError, formatCode} from 'run-common';

import Type from './type';

export class Parameter {
  constructor(param) {
    Object.assign(this, param);
  }

  static create(definition: Object | string, {defaultName, context}) {
    if (typeof definition === 'string') {
      definition = {name: definition};
    }

    const name = definition.name || defaultName;
    if (!name) {
      throwUserError(`Parameter ${formatCode('name')} property is missing`, {context});
    }

    const defaultValue = definition.default;

    let type;
    if (definition.type) {
      type = definition.type;
    } else if (defaultValue !== undefined) {
      type = Type.infer(defaultValue, {context});
    } else {
      type = 'string';
    }

    const param = new this({
      name,
      type: Type.create(type, {context}),
      default: defaultValue
    });

    return param;
  }

  toJSON() {
    let json = {
      name: this.name,
      type: this.type.toJSON(),
      default: this.default
    };
    json = compactObject(json);
    if (Object.keys(json).length === 1) {
      // If there is only one property, it must be the name and we can simplify the JSON
      json = json.name;
    }
    return json;
  }

  static createMany(definitions: Array | Object, {context}) {
    if (Array.isArray(definitions)) {
      return definitions.map(definition => this.create(definition, {context}));
    }

    return entries(definitions).map(([name, definition]) => {
      if (!isPlainObject(definition)) {
        definition = {default: definition};
      }
      return this.create(definition, {defaultName: name, context});
    });
  }
}

export default Parameter;