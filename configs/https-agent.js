/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from 'bedrock';

// allow self-signed certificates in dev
config['https-agent'].rejectUnauthorized = false;
