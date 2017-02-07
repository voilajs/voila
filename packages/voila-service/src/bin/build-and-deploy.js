#!/usr/bin/env node

'use strict';

import { join, resolve } from 'path';
import minimist from 'minimist';
import { buildAndDeploy } from '../lib/builder-and-deployer';
import { formatMessage, showErrorAndExit, getEnvironmentConfig, getAWSConfig } from 'voila-common';

const DEFAULT_REGION = 'us-east-1';
const DEFAULT_STAGE = 'development';
const DEFAULT_MEMORY_SIZE = 128;
const DEFAULT_TIMEOUT = 3;

const argv = minimist(process.argv.slice(2), {
  string: [
    'input-dir',
    'output-dir',
    'stage',
    'role',
    'environment',
    'aws-access-key-id',
    'aws-secret-access-key',
    'aws-region'
  ],
  number: [
    'memory-size',
    'timeout'
  ],
  alias: {
    'environment': ['env']
  }
});

let inputDir = argv['input-dir'] || argv._[0];
if (!inputDir) {
  showErrorAndExit('\'input-dir\' parameter is missing');
}
inputDir = resolve(process.cwd(), inputDir);

const pkg = require(join(inputDir, 'package.json'));

const { name, version } = pkg;

const config = pkg.voila || {};

const outputDir = argv['output-dir'] || config.outputDir || join(inputDir, '.voila');

const stage = argv.stage || config.stage || DEFAULT_STAGE;

const role = argv.role || config.role;

const memorySize = argv['memory-size'] || config.memorySize || DEFAULT_MEMORY_SIZE;
const timeout = argv['timeout'] || config.timeout || DEFAULT_TIMEOUT;

const environment = getEnvironmentConfig(config.environment, argv.environment);

const awsConfig = getAWSConfig({ region: DEFAULT_REGION }, process.env, config, argv);

(async function() {
  const apiURL = await buildAndDeploy({ inputDir, outputDir, name, version, stage, role, memorySize, timeout, environment, awsConfig });
  console.log(formatMessage({ status: 'success', name, stage, message: 'Build and deployment completed', info: apiURL }));
})().catch(showErrorAndExit);