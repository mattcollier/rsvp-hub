/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from 'bedrock';
import {projectName} from './project.js';

// express info
config.express.session.secret = process.env.EXPRESS_SECRET;
config.express.session.key = projectName + '.sid';
config.express.session.prefix = projectName + '.';
