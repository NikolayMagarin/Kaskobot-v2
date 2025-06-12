import express from 'express';
import path from 'path';
import { ping } from './ping';

export const server = express();

server.get('/ping', ping());

const publicPath = path.join(__dirname, '../..', 'public');
server.use('/', express.static(publicPath));
