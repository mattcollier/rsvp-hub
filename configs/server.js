/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from 'bedrock';

// server info
config.server.port = process.env.BEDROCK_HTTPS_PORT;
config.server.httpPort = process.env.BEDROCK_HTTP_PORT;
config.server.domain = process.env.NODE_HOST;
config.server.host = process.env.BEDROCK_SERVER_HOST;
