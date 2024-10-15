/* eslint-disable vitest/require-top-level-describe */
import { type Server } from 'node:http';
import { startServer } from './server.js';

let server: Server;

beforeAll(async () => {
  server = await startServer('localhost', 8999);
});

afterAll(() => {
  server.close();
});
