import express from 'express';
import path from 'path';

export const server = express();

const publicPath = path.join(__dirname, '../..', 'public');
server.use('/', express.static(publicPath));
