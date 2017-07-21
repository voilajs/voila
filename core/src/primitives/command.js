import {isPlainObject, last} from 'lodash';
import {getPropertyKeyAndValue} from 'run-common';
import {formatCode} from '@resdir/console';

import MethodResource from './method';

export class CommandResource extends MethodResource {
  async _normalizeArguments(args, {parse}) {
    let optionsArgument;

    if (parse && isPlainObject(last(args))) {
      optionsArgument = args.pop();
    }

    const {normalizedArguments, remainingArguments} = await super._normalizeArguments(args, {
      parse
    });

    const normalizedOptions = {};

    if (optionsArgument === undefined) {
      optionsArgument = remainingArguments.shift();
    }

    if (optionsArgument === undefined) {
      optionsArgument = {};
    }

    if (!isPlainObject(optionsArgument)) {
      throw new Error(
        `Invalid argument type. The ${formatCode('options')} argument should be a plain Object.`
      );
    }

    const remainingOptions = {...optionsArgument};

    const options = [];
    let resource = this;
    while (resource) {
      const resourceOptions = resource.$getOptions && resource.$getOptions();
      if (resourceOptions) {
        for (const newOption of resourceOptions) {
          if (!options.find(option => option.$getKey() === newOption.$getKey())) {
            options.push(newOption);
          }
        }
      }
      resource = resource.$getParent();
    }

    for (const option of options) {
      const {key, value} =
        getPropertyKeyAndValue(remainingOptions, option.$getKey(), option.$aliases) || {};
      if (key !== undefined) {
        delete remainingOptions[key];
      }
      const normalizedValue = (await option.$extend(value, {parse})).$autoUnbox();
      if (normalizedValue !== undefined) {
        normalizedOptions[option.$getKey()] = normalizedValue;
      }
    }

    const remainingOptionKeys = Object.keys(remainingOptions);
    if (remainingOptionKeys.length) {
      throw new Error(`Invalid command option: ${formatCode(remainingOptionKeys[0])}.`);
    }

    normalizedArguments.push(normalizedOptions);

    return {normalizedArguments, remainingArguments};
  }

  _shiftVariadicArguments(args) {
    // Get arguments before options
    const lastArguments = [];
    while (args.length) {
      if (isPlainObject(args[0])) {
        break;
      }
      lastArguments.push(args.shift());
    }
    return lastArguments;
  }

  async $invoke(expression = {arguments: [], options: {}}, {parent} = {}) {
    const fn = this.$getFunction({parseArguments: true});
    const args = [...expression.arguments, expression.options];
    return await fn.apply(parent, args);
  }
}

export default CommandResource;
