import { createWriteStream, unlinkSync } from 'fs';
import { URL } from 'url';
import https from 'https';
import http from 'http';

import { DownloaderInterface } from './downloader-interface';

export class NodeDownloader implements DownloaderInterface {
    public downloadTo(source: string, destination: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const writeStream = createWriteStream(destination);
            const sendReq = this.adapterFor(source).get(source);

            sendReq.on('response', (response) => {
                if (response.statusCode === 200) {
                    response.pipe(writeStream);
                } else {
                    writeStream.close();
                    unlinkSync(destination);

                    return reject(new Error(`Unable to download ${source} to ${destination}`));
                }
            });

            writeStream.on('finish', () => {
                writeStream.close();

                return resolve();
            });

            sendReq.on('error', () => {
                unlinkSync(destination);

                return reject(new Error(`Unable to download ${source} to ${destination}`));
            });

            writeStream.on('error', () => {
                try {
                    unlinkSync(destination);
                } catch (e) {
                    //
                }

                return reject(new Error(`Unable to download ${source} to ${destination}`));
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
