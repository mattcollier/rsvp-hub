/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
import brExpress from 'bedrock-express';
import logger from './logger.js';
const {asyncHandler} = brExpress;

bedrock.events.on('bedrock-express.configure.routes', app => {

  /**
   * Dummy method for dev convenience, is not included in our API specs.
   */
  // FIXME: remove this endpoint when this module is deployed with other
  // modules as it will cause conflicts. This endpoint is currently used
  // to respond to readiness probes
  app.get('/', asyncHandler(async (req, res) => {
    res.send('RSVP HUB OK.');
  }));

  app.post('/report', asyncHandler(async (req, res) => {
    logger.debug('Client Report', {body: req.body});
    res.status(204).end();
  }));
});
