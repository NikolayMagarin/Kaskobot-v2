import { RequestHandler } from 'express';
import fetch from 'node-fetch';
import { config } from '../config';
import express from 'express';

const selfPingConfig = {
  enabled: Boolean(
    config.env === 'prod' &&
      process.env.SELF_URL &&
      process.env.SELF_PING_SECRET &&
      process.env.SELF_PING_INTERVAL
  ),
  url: process.env.SELF_URL || '',
  secret: process.env.SELF_PING_SECRET || '',
  minInterval:
    (process.env.SELF_PING_INTERVAL &&
      /^\d+$/.test(process.env.SELF_PING_INTERVAL.trim()) &&
      parseInt(process.env.SELF_PING_INTERVAL)) ||
    30_000,
};

export const useSelfPingSecret: RequestHandler = (req, res, next) => {
  if (req.body?.selfPingSecret === selfPingConfig.secret) {
    next();
  } else {
    res.status(403).json({ ok: false, error: 'Not allowed' });
  }
};

export const selfPingHandler: RequestHandler = (req, res) => {
  if (selfPingConfig.enabled) {
    setTimeout(ping, selfPingConfig.minInterval);
  }
  res.json({ ok: true, status: 'alive' });
};

export function ping() {
  if (selfPingConfig.enabled) {
    fetch(selfPingConfig.url + '/api/ping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selfPingSecret: selfPingConfig.secret,
      }),
    }).catch();
  }
}

export function selfPing() {
  return [express.json(), useSelfPingSecret, selfPingHandler];
}
