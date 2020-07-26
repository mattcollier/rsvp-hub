/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
import brExpress from 'bedrock-express';
import logger from './logger.js';
const {asyncHandler} = brExpress;
const {util: {BedrockError}} = bedrock;
const Busboy = require('busboy');

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
    logger.debug('Client Report', {body: req.body});
    res.status(204).end();
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

      const busboy = new Busboy({headers: req.headers});
      // array of promises for each file, resolve to file info
      const filePromises = [];
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
        // TODO: WRITE FILE SOMEWHERE
        const fileUpload = new Promise(resolve => {
          console.log('WORKING WITH FILE', {filename});
          resolve({id: 'myID', controller: 'myController', jwe: 'myJwe'});
        });
        filePromises.push(fileUpload);
      });
      busboy.on('finish', async () => {
        try {
          const results = await Promise.all(filePromises);
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
          // TODO: support multiple files and results
          if(results.length === 0) {
            throw new BedrockError('No files present.',
              'RangeError', {
                public: true,
                httpStatusCode: 400
              });
          }
          if(results.length > 1) {
            throw new BedrockError('Multiple files not supported.',
              'RangeError', {
                public: true,
                httpStatusCode: 400
              });
          }
          // TODO: Update the file's meta data with valid: true once it passes
          //       all checks
          // // passed limits, saved, and processed: mark all as valid
          //   return Promise.all(results.map(info => setFileMeta(info._id, {
          //     valid: true
          //   })));
          const [fileInfo] = results;
          const {id, controller, jwe} = fileInfo;
          const baseUrl = `${baseUri}`;
          const url = baseUrl + `/files/${encodeURIComponent(id)}` + '?' +
            `controller=${encodeURIComponent(controller)}`;
          res.status(200).json({
            url,
            jwe
          });
        } catch(e) {
          logger.error('Error storing multipart content', {error: e});
          throw e;
        }
      });
      req.pipe(busboy);
    })
  );
});
