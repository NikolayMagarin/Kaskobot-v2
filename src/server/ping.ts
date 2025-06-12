import { RequestHandler } from 'express';

export function ping(): RequestHandler {
  return (req, res) => {
    res.status(200).send('pong');
  };
}
