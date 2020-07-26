/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from 'bedrock';
import {projectName} from './project.js';

// logging
config.loggers.email.silent = true;
config.loggers.email.to = [`${projectName}@localhost`];
config.loggers.email.from = `${projectName}@localhost`;
