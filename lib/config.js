/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
const {config} = bedrock;
import path from 'path';

bedrock.events.on('bedrock.configure', async () => {
  await import(path.join(config.paths.config, 'paths.js'));
  await import(path.join(config.paths.config, 'core.js'));
  await import(path.join(config.paths.config, 'logging.js'));
  await import(path.join(config.paths.config, 'server.js'));
  await import(path.join(config.paths.config, 'express.js'));
  // await import(path.join(config.paths.config, 'database.js'));
  await import(path.join(config.paths.config, 'https-agent.js'));
  await import(path.join(config.paths.config, 'paths.js'));
});
