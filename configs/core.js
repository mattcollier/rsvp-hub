/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from 'bedrock';
import {projectName, production} from './project.js';

// core configuration
// it is mandatory that workers is set to one here so that there is a
// 1:1 ratio between workers and unique IP addresses in a deployment so that
// incoming RSVP responses can be routed to the proper worker
config.core.workers = 1;
config.core.master.title = projectName + '-1d';
config.core.worker.title = projectName + '-1d-worker';
config.core.worker.restart = production ? true : false;
config.core.errors.showStack = production ? false : true;
