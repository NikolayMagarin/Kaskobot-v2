import express from 'express';
import path from 'path';
import { selfPing } from './ping';

export const server = express();

server.post('/api/ping', selfPing());

const publicPath = path.join(__dirname, '../..', 'public');
server.use('/', express.static(publicPath));
