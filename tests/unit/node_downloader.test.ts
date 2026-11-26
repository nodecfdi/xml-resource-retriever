import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';
import NodeDownloader from '../../src/downloader/node_downloader.js';
import { buildPath, fileContent, publicPath } from '../../test_helpers/test_utils.js';
import useRetriever from '../../test_helpers/use_retriever.js';

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

  test('forwards optional RequestInit options to fetch', async () => {
    const dir = buildPath('node_downloader_options');
    pathToClear(dir);
    mkdirSync(dir, { recursive: true });

    const source = 'http://localhost:8999/xsd/simple.xsd';
    const destination = path.join(dir, 'simple.xsd');
    const options: RequestInit = {
      headers: { 'X-Custom-Header': 'nodecfdi' },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const downloader = new NodeDownloader(options);

    await downloader.downloadTo(source, destination);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(source, options);
    expect(existsSync(destination)).toBe(true);
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
});
