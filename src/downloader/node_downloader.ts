import type { DownloaderInterface } from '../types.js';
import { createWriteStream } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

export default class NodeDownloader implements DownloaderInterface {
  private readonly _options?: RequestInit;

  public constructor(options?: RequestInit) {
    this._options = options;
  }

  public async downloadTo(source: string, destination: string): Promise<void> {
    try {
      const response = await fetch(source, this._options);

      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(response.statusText || `HTTP ${response.status}`);
      }

      if (response.body) {
        await pipeline(response.body, createWriteStream(destination));
      } else {
        await writeFile(destination, '');
      }
    } catch (error) {
      throw await this.handleError(
        error,
        `Unable to download ${source} to ${destination}`,
        destination,
      );
    }
  }

  private async handleError(
    error: unknown,
    message: string,
    destination: string,
  ): Promise<AggregateError> {
    try {
      await unlink(destination);
    } catch {
      //
    }

    return new AggregateError([error], message);
  }
}
