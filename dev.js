/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
const {config} = bedrock;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

config.paths.config = path.join(__dirname, 'configs');
config.paths.accounts = path.join(config.paths.config, 'accounts.js');

require('./lib/index.js');

console.log('Process environment:', process.env);

bedrock.start();
