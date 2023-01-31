/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { startServer } from './server';

export default async function () {
    const server = await startServer('localhost', 8999);
    return async () =>
        new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
}
