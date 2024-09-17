import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import NodeDownloader from '#src/downloader/node_downloader';
import { type DownloaderInterface, type RetrieverInterface } from '#src/types';

export default abstract class AbstractBaseRetriever implements RetrieverInterface {
  private readonly _basePath: string;

  private declare _downloader: DownloaderInterface;

  /**
   * This variable stores the list of retrieved resources to avoid infinite recursion
   */
  private _history: Record<string, string> = {};

  /**
   * Retriever constructor
   *
   * @param basePath - path base
   * @param downloader - implementation of downloader interface
   */
  protected constructor(basePath: string, downloader?: DownloaderInterface) {
    this._basePath = basePath;
    this.setDownloader(downloader ?? new NodeDownloader());
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
    const parts = this.urlParts(url);
    if (!parts) {
      throw new Error(`Invalid URL: ${url}`);
    }

    return `${this._basePath}/${parts.host}${parts.path}`;
  }

  public async download(url: string): Promise<string> {
    if (url === '') {
      throw new Error('The argument to download is empty');
    }

    // Set destination
    const localPath = this.buildPath(url);

    // Create local path
    const directory = path.dirname(localPath);
    if (!existsSync(directory)) {
      try {
        await mkdir(directory, { recursive: true });
      } catch {
        throw new Error(`Unable to create directory ${directory}`);
      }
    }

    // Download the file into its final destination
    await this._downloader.downloadTo(url, localPath);

    // Check content is valid
    await this.checkIsValidDownloadedFile(url, localPath);

    return localPath;
  }

  public retrieveHistory(): Record<string, string> {
    return this._history;
  }

  public abstract retrieve(url: string): Promise<string>;

  protected clearHistory(): void {
    this._history = {};
  }

  protected addToHistory(source: string, localPath: string): void {
    this._history[source] = localPath;
  }

  /**
   * Retrieve url parts
   * If url is malformed return false
   *
   * @param url - string url
   */
  protected urlParts(url: string): Record<string, string> | undefined {
    try {
      const parsed = new URL(url);
      if (!['https:', 'http:'].includes(parsed.protocol)) {
        return undefined;
      }

      return {
        scheme: parsed.protocol,
        host: parsed.host,
        port: parsed.port,
        path: parsed.pathname,
      };
    } catch {
      return undefined;
    }
  }

  protected abstract checkIsValidDownloadedFile(source: string, localPath: string): Promise<void>;
}
