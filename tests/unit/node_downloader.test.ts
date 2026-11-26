import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { NodeDownloader } from '../../src/downloader/node_downloader.js';
import { buildPath, fileContent, publicPath } from '../../test_helpers/test_utils.js';
import { useRetriever } from '../../test_helpers/use_retriever.js';

describe('node downloader', () => {
  const { pathToClear } = useRetriever();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('download existing file successfully', async () => {
    const dir = buildPath('node_downloader_success');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'simple.xsd');
    const downloader = new NodeDownloader();

    await downloader.downloadTo(source, destination);

    expect(existsSync(destination)).toBe(true);
    expect(fileContent(destination)).toBe(fileContent(publicPath('xsd/simple.xsd')));
  });

  test('download empty file successfully', async () => {
    const dir = buildPath('node_downloader_empty');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/other/empty.xml';
    const destination = path.join(dir, 'empty.xml');
    const downloader = new NodeDownloader();

    await downloader.downloadTo(source, destination);

    expect(existsSync(destination)).toBe(true);
    expect(fileContent(destination)).toBe('');
  });

  test('download with response having null body writes empty file', async () => {
    const dir = buildPath('node_downloader_null_body');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/other/empty.xml';
    const destination = path.join(dir, 'null-body.xml');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    const downloader = new NodeDownloader();
    await downloader.downloadTo(source, destination);

    expect(existsSync(destination)).toBe(true);
    expect(fileContent(destination)).toBe('');
  });

  test('download non existent resource throws AggregateError and leaves no file', async () => {
    const dir = buildPath('node_downloader_404');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/non-existent-resource.txt';
    const destination = path.join(dir, 'non-existent.txt');
    const downloader = new NodeDownloader();

    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    await expect(download).rejects.toThrow(`Unable to download ${source} to ${destination}`);
    expect(existsSync(destination)).toBe(false);
  });

  test('download on non operative server throws AggregateError and leaves no file', async () => {
    const dir = buildPath('node_downloader_network');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://non-operative.invalid/other/sample.xml';
    const destination = path.join(dir, 'sample.xml');
    const downloader = new NodeDownloader();

    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    await expect(download).rejects.toThrow(`Unable to download ${source} to ${destination}`);
    expect(existsSync(destination)).toBe(false);
  });

  test('download to non existent destination directory throws AggregateError', async () => {
    const dir = buildPath('node_downloader_bad_dest');
    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'missing-subdir', 'simple.xsd');
    const downloader = new NodeDownloader();

    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    await expect(download).rejects.toThrow(`Unable to download ${source} to ${destination}`);
    expect(existsSync(destination)).toBe(false);
  });

  test('forwards optional RequestInit options to fetch with default timeout signal', async () => {
    const dir = buildPath('node_downloader_options');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'simple.xsd');
    const options = {
      headers: { 'X-Custom-Header': 'nodecfdi' },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const downloader = new NodeDownloader(options);

    await downloader.downloadTo(source, destination);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0];
    expect(calledUrl).toBe(source);
    expect(calledInit?.headers).toStrictEqual(options.headers);
    expect(calledInit?.signal).toBeInstanceOf(AbortSignal);
    expect(existsSync(destination)).toBe(true);
  });

  test('timeoutMs 0 does not inject an AbortSignal when no user signal is provided', async () => {
    const dir = buildPath('node_downloader_no_timeout');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'simple.xsd');

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const downloader = new NodeDownloader({ timeoutMs: 0 });

    await downloader.downloadTo(source, destination);

    expect(fetchSpy).toHaveBeenCalledWith(source, undefined);
    expect(existsSync(destination)).toBe(true);
  });

  test('maxBytes 0 disables response size limit', async () => {
    const dir = buildPath('node_downloader_no_limit');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'simple.xsd');
    const downloader = new NodeDownloader({ maxBytes: 0, timeoutMs: 0 });

    await downloader.downloadTo(source, destination);

    expect(existsSync(destination)).toBe(true);
    expect(fileContent(destination)).toBe(fileContent(publicPath('xsd/simple.xsd')));
  });

  test('aborted signal via optional RequestInit rejects with AggregateError', async () => {
    const dir = buildPath('node_downloader_abort');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'aborted.xsd');
    const downloader = new NodeDownloader({ signal: AbortSignal.abort() });

    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    await expect(download).rejects.toThrow(`Unable to download ${source} to ${destination}`);
    expect(existsSync(destination)).toBe(false);
  });

  test.each([
    ['file protocol', 'file:///etc/passwd'],
    ['data protocol', 'data:text/plain,hello'],
  ])('rejects disallowed %s without calling fetch', async (_name, source) => {
    const dir = buildPath('node_downloader_scheme');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const destination = path.join(dir, 'blocked.xml');
    const downloader = new NodeDownloader();

    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(existsSync(destination)).toBe(false);
  });

  test('rejects redirect to disallowed protocol', async () => {
    const dir = buildPath('node_downloader_redirect');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'redirected.xsd');
    const response = new Response('<root/>', { status: 200 });
    Object.defineProperty(response, 'url', { value: 'file:///etc/passwd' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    const downloader = new NodeDownloader();
    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    expect(existsSync(destination)).toBe(false);
  });

  test('rejects response exceeding maxBytes via Content-Length header', async () => {
    const dir = buildPath('node_downloader_content_length');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'too-large.xsd');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('hello world', {
        status: 200,
        headers: { 'content-length': '100' },
      }),
    );

    const downloader = new NodeDownloader({ maxBytes: 10 });
    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    expect(existsSync(destination)).toBe(false);
  });

  test('rejects chunked response exceeding maxBytes without Content-Length', async () => {
    const dir = buildPath('node_downloader_stream_limit');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'stream-too-large.xsd');
    const stream = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(new Uint8Array(8));
        controller.enqueue(new Uint8Array(8));
        controller.close();
      },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(stream, { status: 200 }));

    const downloader = new NodeDownloader({ maxBytes: 10 });
    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    expect(existsSync(destination)).toBe(false);
    expect(readdirSync(dir)).toStrictEqual([]);
  });

  test('timeoutMs aborts a slow response', async () => {
    const dir = buildPath('node_downloader_timeout');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'slow.xsd');

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(
              init.signal?.reason instanceof Error ? init.signal.reason : new Error('Aborted'),
            );
          });
        }),
    );

    const downloader = new NodeDownloader({ timeoutMs: 25 });
    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    expect(existsSync(destination)).toBe(false);
  });

  test.each([
    ['negative timeoutMs', { timeoutMs: -1 }],
    ['NaN timeoutMs', { timeoutMs: NaN }],
    ['Infinity timeoutMs', { timeoutMs: Infinity }],
    ['negative maxBytes', { maxBytes: -1 }],
    ['NaN maxBytes', { maxBytes: NaN }],
  ])('throws RangeError for %s', (_name, options) => {
    expect(() => new NodeDownloader(options)).toThrow(RangeError);
  });

  test('failed download preserves existing destination file and leaves no tmp files', async () => {
    const dir = buildPath('node_downloader_atomic');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'existing.xsd');
    writeFileSync(destination, '<existing/>', 'utf8');

    const stream = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(new Uint8Array(20));
        controller.close();
      },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(stream, { status: 200 }));

    const downloader = new NodeDownloader({ maxBytes: 5 });

    await expect(downloader.downloadTo(source, destination)).rejects.toBeInstanceOf(AggregateError);
    expect(fileContent(destination)).toBe('<existing/>');
    expect(readdirSync(dir)).toStrictEqual(['existing.xsd']);
  });

  test('forwards RequestInit headers without signal when timeoutMs is 0', async () => {
    const dir = buildPath('node_downloader_headers_no_signal');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'simple.xsd');
    const options = {
      timeoutMs: 0,
      headers: { 'X-Custom-Header': 'nodecfdi' },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const downloader = new NodeDownloader(options);

    await downloader.downloadTo(source, destination);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, calledInit] = fetchSpy.mock.calls[0];
    expect(calledInit?.headers).toStrictEqual(options.headers);
    expect(calledInit?.signal).toBeUndefined();
    expect(existsSync(destination)).toBe(true);
  });

  test('falls back to HTTP status code when response statusText is empty', async () => {
    const dir = buildPath('node_downloader_empty_status_text');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'error.xsd');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('error', { status: 503, statusText: '' }),
    );

    const downloader = new NodeDownloader();
    const download = downloader.downloadTo(source, destination);

    await expect(download).rejects.toBeInstanceOf(AggregateError);
    await expect(download).rejects.toMatchObject({
      errors: [expect.objectContaining({ message: 'HTTP 503' })],
    });
    expect(existsSync(destination)).toBe(false);
  });

  test.each([['5'], ['invalid']])(
    'allows responses with Content-Length %s within maxBytes or non-numeric',
    async (headerValue: string) => {
      const dir = buildPath('node_downloader_valid_content_length');
      pathToClear(dir);
      mkdirSync(dir, { recursive: true });

      const source = 'http://localhost:8999/xsd/simple.xsd';
      const destination = path.join(dir, 'valid.xsd');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('hello', {
          status: 200,
          headers: { 'content-length': headerValue },
        }),
      );

      const downloader = new NodeDownloader({ maxBytes: 100 });
      await downloader.downloadTo(source, destination);

      expect(fileContent(destination)).toBe('hello');
    },
  );

  test('maxBytes 0 with default timeout signal downloads successfully', async () => {
    const dir = buildPath('node_downloader_no_limit_with_signal');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'simple.xsd');
    const downloader = new NodeDownloader({ maxBytes: 0 });

    await downloader.downloadTo(source, destination);

    expect(existsSync(destination)).toBe(true);
    expect(fileContent(destination)).toBe(fileContent(publicPath('xsd/simple.xsd')));
  });
});
