import { startServer } from './server.js';

// eslint-disable-next-line vitest/require-hook
let teardown = false;

export default async function () {
  const server = await startServer('localhost', 8999);

  return async () => {
    if (teardown) {
      throw new Error('Teardown called twice');
    }

    teardown = true;

    return new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  };
}
