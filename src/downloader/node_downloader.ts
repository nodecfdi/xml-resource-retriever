import type { DownloaderInterface, NodeDownloaderOptions } from '../types.js';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { rename, unlink, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import {
  buildAbortSignal,
  createByteLimitTransform,
  validateNonNegativeFinite,
} from '../utils/stream_utils.js';
import { assertAllowedHttpUrl } from '../utils/url_utils.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

export class NodeDownloader implements DownloaderInterface {
  private readonly _requestInit?: RequestInit;

  private readonly _timeoutMs: number;

  private readonly _maxBytes: number;

  public constructor(options?: NodeDownloaderOptions) {
    const {
      timeoutMs = DEFAULT_TIMEOUT_MS,
      maxBytes = DEFAULT_MAX_BYTES,
      ...requestInit
    } = options ?? {};

    this._timeoutMs = validateNonNegativeFinite(timeoutMs, 'timeoutMs');
    this._maxBytes = validateNonNegativeFinite(maxBytes, 'maxBytes');
    this._requestInit = Object.keys(requestInit).length > 0 ? requestInit : undefined;
  }

  public async downloadTo(source: string, destination: string): Promise<void> {
    let tempDestination: string | undefined;
    let response: Response | undefined;

    try {
      assertAllowedHttpUrl(source);
      const signal = buildAbortSignal(this._timeoutMs, this._requestInit?.signal);
      let fetchInit: RequestInit | undefined;
      if (signal || this._requestInit) {
        fetchInit = { ...this._requestInit };
        if (signal) {
          fetchInit.signal = signal;
        }
      }

      response = await fetch(source, fetchInit);

      if (response.url !== '') {
        assertAllowedHttpUrl(response.url);
      }

      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(response.statusText || `HTTP ${response.status}`);
      }

      this.assertContentLengthWithinLimit(response.headers);

      tempDestination = `${destination}.${randomUUID()}.tmp`;

      if (response.body) {
        await this.writeResponseStream(response.body, tempDestination, signal);
      } else {
        await writeFile(tempDestination, '');
      }

      await rename(tempDestination, destination);
      tempDestination = undefined;
    } catch (error) {
      await this.cancelBodySafely(response);
      throw await this.handleError(
        error,
        `Unable to download ${source} to ${destination}`,
        tempDestination,
      );
    }
  }

  private assertContentLengthWithinLimit(headers: Headers): void {
    if (this._maxBytes === 0) {
      return;
    }

    const contentLengthHeader = headers.get('content-length');
    if (contentLengthHeader === null) {
      return;
    }

    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > this._maxBytes) {
      throw new Error(`Response exceeded maximum allowed size of ${this._maxBytes} bytes`);
    }
  }

  private async writeResponseStream(
    body: ReadableStream<Uint8Array>,
    tempDestination: string,
    signal?: AbortSignal,
  ): Promise<void> {
    const writeStream = createWriteStream(tempDestination);

    if (this._maxBytes > 0) {
      const limitTransform = createByteLimitTransform(this._maxBytes);
      await (signal
        ? pipeline(body, limitTransform, writeStream, { signal })
        : pipeline(body, limitTransform, writeStream));

      return;
    }

    await (signal ? pipeline(body, writeStream, { signal }) : pipeline(body, writeStream));
  }

  private async cancelBodySafely(response?: Response): Promise<void> {
    if (response?.body && !response.body.locked) {
      try {
        await response.body.cancel();
      } catch {
        // Ignore stream cancellation errors during error cleanup
      }
    }
  }

  private async handleError(
    error: unknown,
    message: string,
    tempDestination?: string,
  ): Promise<AggregateError> {
    if (tempDestination !== undefined) {
      try {
        await unlink(tempDestination);
      } catch {
        // Ignore cleanup failure when temporary file was not created
      }
    }

    return new AggregateError([error], message);
  }
}
