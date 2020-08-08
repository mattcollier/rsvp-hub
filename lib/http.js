/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
import brExpress from 'bedrock-express';
import logger from './logger.js';
const {asyncHandler} = brExpress;
const {util: {uuid, BedrockError}} = bedrock;
import Busboy from 'busboy';
import path from 'path';
import fs from 'fs';
import LRU from 'lru-cache';

const CACHE = new LRU({
  maxAge: 60 * 1000,
});

const fileLocation = process.env.RSVP_LOG_FILE_LOCATION;

bedrock.events.on('bedrock-express.configure.routes', app => {
  const {baseUri} = bedrock.config.server;

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
    const {body} = req;
    logger.debug('Client Report', {body});
    CACHE.set(body.hostname, body);
    res.status(204).end();
  }));

  app.get('/report', asyncHandler(async (req, res) => {
    // remove expired items from the cache
    CACHE.prune();
    res.json(CACHE.values());
  }));

  // POST /files (Receives a file)
  app.post(
    '/files',
    asyncHandler(async (req, res) => {
      const contentType = req.headers['content-type'];
      if(!/^multipart\/form-data/.test(contentType)) {
        throw new BedrockError(
          'Unsupported content type.',
          'DataError',
          {contentType, httpStatusCode: 415, public: true});
      }
      const {controller} = req.query;
      if(!controller) {
        throw new BedrockError(
          'The "controller" query parameter must be specified.',
          'DataError',
          {controller, httpStatusCode: 400, public: true});
      }

      const fileInfo = {};
      const busboy = new Busboy({headers: req.headers});
      // array of promises for each file, resolve to file info
      // error flags
      let partsLimit = false;
      let filesLimit = false;
      let fieldsLimit = false;

      busboy.on('partsLimit', () => {
        partsLimit = true;
      });
      busboy.on('filesLimit', () => {
        filesLimit = true;
      });
      busboy.on('fieldsLimit', () => {
        fieldsLimit = true;
      });
      // eslint-disable-next-line no-unused-vars
      busboy.on('file', (fieldname, file, filename, encoding, contentType) => {
        const f = `${uuid()}_${filename}`;
        fileInfo.id = f;
        const saveTo = path.join(fileLocation, f);
        file.pipe(fs.createWriteStream(saveTo));
      });
      busboy.on('finish', async () => {
        try {
          if(partsLimit) {
            throw new BedrockError('Too many parts.', 'RangeError', {
              public: true,
              httpStatusCode: 400
            });
          }
          if(filesLimit) {
            throw new BedrockError('Too many files.', 'RangeError', {
              public: true,
              httpStatusCode: 400
            });
          }
          if(fieldsLimit) {
            throw new BedrockError('Too many fields.', 'RangeError', {
              public: true,
              httpStatusCode: 400
            });
          }

          const {id} = fileInfo;
          const baseUrl = `${baseUri}`;
          const url = baseUrl + `/files/${encodeURIComponent(id)}`;
          res.status(200).json({url});
        } catch(e) {
          logger.error('Error storing multipart content', {error: e});
          throw e;
        }
      });
      req.pipe(busboy);
    })
  );
});
