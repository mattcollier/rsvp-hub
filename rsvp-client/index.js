/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import dbHttpClient from '@digitalbazaar/http-client';
import {Agent} from 'https';
import delay from 'delay';

const {httpClient} = dbHttpClient;

const agent = new Agent({rejectUnauthorized: false});

async function run() {
  const {data: reports} = await httpClient.get(
    'https://104.131.25.239:44443/report', {
      agent
    });
  const summary = {};
  summary.reportCount = reports.length;
  summary.totalAverageRequests = 0;
  summary.requestAverages = [];
  summary.latencyAverages = [];
  summary.totalNon2xx = 0;
  let totalLatency = 0;
  for(const report of reports) {
    // console.log('PPPPP', JSON.stringify(report, null, 2));
    const averageRequests = report.stats.requests.average;
    summary.requestAverages.push(averageRequests);
    summary.totalAverageRequests += Math.floor(averageRequests);
    summary.totalNon2xx += report.stats.non2xx;
    const averageLatency = report.stats.latency.average;
    summary.latencyAverages.push(averageLatency);
    totalLatency += averageLatency;
  }
  summary.averageLatency = Math.ceil(totalLatency / summary.reportCount);
  // console.log(JSON.stringify(summary, null, 2));
  console.log(
    Date.now(),
    summary.reportCount,
    summary.totalAverageRequests,
    summary.averageLatency,
    summary.totalNon2xx
  );
}

async function loop() {
  while(true) {
    await run();
    await delay(1000 * 60);
  }
}

loop().catch(console.error);
