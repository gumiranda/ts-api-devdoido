import express from 'express';
import setupMiddlewares from './middlewares';
import setupRoutes from './routes';

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
setupMiddlewares(app, io);
setupRoutes(app);
export { app, server, io };
