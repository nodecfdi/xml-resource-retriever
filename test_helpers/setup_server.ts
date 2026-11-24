import { startServer } from './server.js';

export default async function setup(): Promise<() => Promise<void>> {
  const server = await startServer('localhost', 8999);

  return async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };
}
