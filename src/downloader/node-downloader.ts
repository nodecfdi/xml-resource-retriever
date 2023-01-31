import { createWriteStream, unlinkSync } from 'node:fs';
import { URL } from 'node:url';
import https from 'node:https';
import http from 'node:http';

import { type DownloaderInterface } from './downloader-interface';

export class NodeDownloader implements DownloaderInterface {
    public async downloadTo(source: string, destination: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const writeStream = createWriteStream(destination);
            const sendRequest = this.adapterFor(source).get(source);

            sendRequest.on('response', (response) => {
                if (response.statusCode === 200) {
                    response.pipe(writeStream);
                } else {
                    writeStream.close();
                    unlinkSync(destination);

                    reject(new Error(`Unable to download ${source} to ${destination}`));
                }
            });

            writeStream.on('finish', () => {
                writeStream.close();

                resolve();
            });

            sendRequest.on('error', () => {
                unlinkSync(destination);

                reject(new Error(`Unable to download ${source} to ${destination}`));
            });

            writeStream.on('error', () => {
                try {
                    unlinkSync(destination);
                } catch {
                    //
                }

                reject(new Error(`Unable to download ${source} to ${destination}`));
            });
        });
    }

    protected adapterFor(inputUrl: string): typeof http | typeof https {
        const adapter: Record<string, typeof http | typeof https> = {
            'http:': http,
            'https:': https
        };
        const targetUrl = new URL(inputUrl);

        return adapter[targetUrl.protocol];
    }
}
