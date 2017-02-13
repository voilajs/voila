#!/usr/bin/env node

'use strict';

import { resolve } from 'path';
import minimist from 'minimist';
import { red, green, gray, cyan } from 'chalk';
import { createUserError, showErrorAndExit } from '@voila/common';
import { initialize } from '../lib/initializer';

const DEFAULT_STAGE = 'development';

(async function() {
  const voilaCLIPkg = require('../../package.json');
  console.log(`\n${green(voilaCLIPkg.displayName)} ${gray(`v${voilaCLIPkg.version}`)}\n`);

  const argv = minimist(process.argv.slice(2), {
    string: [
      'type',
      'package-dir',
      'stage'
    ],
    boolean: [
      'yarn'
    ],
    default: {
      'yarn': null
    }
  });

  const type = argv.type || argv._[0];
  if (!type) {
    throw createUserError(`${red('\'type\' option is missing.')} Please specify the type of your package. Example: ${cyan('`voila init @voila/module`')}.`);
  }

  let pkgDir = argv['package-dir'];
  if (pkgDir) {
    pkgDir = resolve(process.cwd(), pkgDir);
  } else {
    pkgDir = process.cwd();
  }

  const stage = argv['stage'] || DEFAULT_STAGE;

  const yarn = argv['yarn'];

  await initialize({ pkgDir, stage, type, yarn });

  console.log('\nVoilà! Your package is initialized.\n');
})().catch(showErrorAndExit);