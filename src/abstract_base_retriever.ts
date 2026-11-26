import type { DownloaderInterface, RetrieverInterface, UrlParts } from './types.js';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { NodeDownloader } from './downloader/node_downloader.js';
import { parseHttpUrlParts, resolveLocalFilePath } from './utils/url_utils.js';

export abstract class AbstractBaseRetriever implements RetrieverInterface {
  private readonly _basePath: string;

  private _downloader: DownloaderInterface;

  /**
   * This map stores the list of retrieved resources to avoid infinite recursion
   */
  private readonly _history = new Map<string, string>();

  /**
   * Retriever constructor
   *
   * @param basePath - path base
   * @param downloader - implementation of downloader interface
   */
  protected constructor(basePath: string, downloader?: DownloaderInterface) {
    this._basePath = basePath;
    this._downloader = downloader ?? new NodeDownloader();
  }

  public getBasePath(): string {
    return this._basePath;
  }

  public getDownloader(): DownloaderInterface {
    return this._downloader;
  }

  public setDownloader(downloader: DownloaderInterface): void {
    this._downloader = downloader;
  }

  public buildPath(url: string): string {
    return resolveLocalFilePath(this._basePath, url);
  }

  public async download(url: string): Promise<string> {
    if (url === '') {
      throw new Error('The argument to download is empty');
    }

    const localPath = this.buildPath(url);
    if (localPath.endsWith('/')) {
      throw new Error(`Invalid URL: ${url}`);
    }

    const directory = path.dirname(localPath);
    try {
      await mkdir(directory, { recursive: true });
    } catch (error) {
      throw new Error(`Unable to create directory ${directory}`, { cause: error });
    }

    await this._downloader.downloadTo(url, localPath);
    await this.checkIsValidDownloadedFile(url, localPath);

    return localPath;
  }

  public retrieveHistory(): Record<string, string> {
    return Object.fromEntries(this._history);
  }

  public abstract retrieve(url: string): Promise<string>;

  protected clearHistory(): void {
    this._history.clear();
  }

  protected addToHistory(source: string, localPath: string): void {
    this._history.set(source, localPath);
  }

  protected hasInHistory(source: string): boolean {
    return this._history.has(source);
  }

  protected getFromHistory(source: string): string | undefined {
    return this._history.get(source);
  }

  protected historySize(): number {
    return this._history.size;
  }

  /**
   * Retrieve url parts
   * If url is malformed return undefined
   *
   * @param url - string url
   */
  protected urlParts(url: string): UrlParts | undefined {
    return parseHttpUrlParts(url);
  }

  protected abstract checkIsValidDownloadedFile(source: string, localPath: string): Promise<void>;
}
