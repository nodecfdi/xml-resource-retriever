import { RetrieverInterface } from './retriever-interface';
import { DownloaderInterface } from './downloader/downloader-interface';
import { NodeDownloader } from './downloader/node-downloader';
import { dirname } from 'path';
import { existsSync } from 'fs';
import { URL } from 'url';
import mkdirp from 'mkdirp';

export abstract class AbstractBaseRetriever implements RetrieverInterface {
    private readonly _basePath: string;
    private _downloader!: DownloaderInterface;

    /**
     * This variable stores the list of retrieved resources to avoid infinite recursion
     * @private
     */
    private _history: Record<string, string> = {};

    protected abstract checkIsValidDownloadedFile(source: string, localPath: string): Promise<void>;

    public abstract retrieve(url: string): Promise<string>;

    /**
     * Retriever constructor
     *
     * @param basePath
     * @param downloader
     * @protected
     */
    protected constructor(basePath: string, downloader: DownloaderInterface | null = null) {
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
            throw new SyntaxError(`Invalid URL: ${url}`);
        }
        return `${this._basePath}/${parts.host}${parts.path}`;
    }

    public async download(url: string): Promise<string> {
        if ('' === url) {
            return Promise.reject(new SyntaxError('The argument to download is empty'));
        }

        // set destination
        const localPath = this.buildPath(url);

        // create local path
        const dir = dirname(localPath);
        if (!existsSync(dir)) {
            try {
                await mkdirp(dir);
            } catch (e) {
                return Promise.reject(new SyntaxError(`Unable to create directory ${dir}`));
            }
        }

        // download the file into its final destination
        await this._downloader.downloadTo(url, localPath);

        // check content is valid
        await this.checkIsValidDownloadedFile(url, localPath);

        return localPath;
    }

    public retrieveHistory(): Record<string, string> {
        return this._history;
    }

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
     * @param url
     * @protected
     */
    protected urlParts(url: string): Record<string, string> | undefined {
        try {
            const parsed = new URL(url);
            if (!['https:', 'http:'].includes(parsed.protocol)) {
                return undefined;
            }
            if (parsed.pathname === '') {
                return undefined;
            }
            return {
                scheme: parsed.protocol,
                host: parsed.host,
                port: parsed.port,
                path: parsed.pathname,
            };
        } catch (e) {
            return undefined;
        }
    }
}
