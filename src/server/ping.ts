import { server } from '.';

server.get('/ping', (req, res) => {
  res.status(200).send('pong');
});
