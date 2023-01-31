import { existsSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs';
import { getSerializer, getParser } from '@nodecfdi/cfdiutils-common';
import { dirname } from 'node:path';
import { fileTypeFromFile } from 'file-type';
import { lookup } from 'mime-types';

import { AbstractBaseRetriever } from './abstract-base-retriever';
import { type RetrieverInterface } from './retriever-interface';
import { Utils } from './utils';
import { type DownloaderInterface } from './downloader/downloader-interface';

export abstract class AbstractXmlRetriever extends AbstractBaseRetriever implements RetrieverInterface {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(basePath: string, downloader?: DownloaderInterface) {
        super(basePath, downloader);
    }

    public async retrieve(url: string): Promise<string> {
        this.clearHistory();

        return this.doRetrieve(url);
    }

    /**
     * This method checks if the recently downloaded file from source located at path
     * is a valid resource, if not will remove the file and throw an exception
     *
     * @param source -
     * @param localPath -
     *
     */
    protected async checkIsValidDownloadedFile(source: string, localPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const statsFile = statSync(localPath);
            if (statsFile.size === 0) {
                unlinkSync(localPath);

                reject(new Error(`The source ${source} is not an xml file because it is empty`));
                return;
            }

            void fileTypeFromFile(localPath).then((result) => {
                if (result?.mime !== 'application/xml' && !result?.mime.startsWith('text/')) {
                    const mimeType = lookup(localPath);
                    if (!mimeType || (mimeType !== 'application/xml' && !mimeType.startsWith('text/'))) {
                        unlinkSync(localPath);
                        reject(new Error(`The source ${source} (${result!.mime}) is not an xml file`));
                    }
                }

                resolve();
            });
        });
    }

    /**
     * Must return a string with the namespace to search for
     */
    protected abstract searchNamespace(): string;

    /**
     * Must return a table with rows (array of records)
     * every row must contain the keys element and attribute
     * "element" is the tag name to search for
     * "attribute" is the attribute name that contains the url
     */
    protected abstract searchElements(): Array<Record<string, string>>;

    private async doRetrieve(resource: string): Promise<string> {
        const localFileName = await this.download(resource);
        this.addToHistory(resource, localFileName);

        let fileContent = '';
        if (existsSync(localFileName)) {
            fileContent = readFileSync(localFileName, 'utf8');
        }

        let documentParse: Document | null = null;
        const parser = getParser();
        const errors: Record<string, unknown> = {};

        // Only for @xmldom/xmldom capture not error fatal
        if ((parser as unknown as Record<string, unknown>).options) {
            (parser as unknown as Record<string, Record<string, unknown>>).options = {
                errorHandler(level: string, message: unknown): void {
                    errors[level] = message;
                },
                locator: {}
            };
        }

        try {
            documentParse = parser.parseFromString(fileContent, 'text/xml');

            if (Object.keys(errors).length > 0 || !documentParse.documentElement) {
                throw new Error('Invalid xml');
            }
        } catch (error) {
            unlinkSync(localFileName);

            throw new Error(`The source ${resource} contains errors: ${(error as Error).message}`);
        }

        let changed = false;
        for await (const search of this.searchElements()) {
            const recursiveRetrieve = await this.recursiveRetrieve(
                documentParse,
                search.element,
                search.attribute,
                resource,
                localFileName
            );
            if (recursiveRetrieve) {
                changed = true;
            }
        }

        if (changed) {
            const changedXml = getSerializer().serializeToString(documentParse);
            writeFileSync(localFileName, changedXml, 'utf8');
        }

        return localFileName;
    }

    private async recursiveRetrieve(
        document: Document,
        tagName: string,
        attributeName: string,
        currentUrl: string,
        currentFile: string
    ): Promise<boolean> {
        let modified = false;
        const elements = document.getElementsByTagNameNS(this.searchNamespace(), tagName);
        // eslint-disable-next-line unicorn/prefer-spread
        for await (const element of Array.from(elements)) {
            if (!element.hasAttribute(attributeName)) {
                continue;
            }

            let location = element.getAttribute(attributeName);
            if (!location || location === '') {
                continue;
            }

            location = this.relativeToAbsoluteUrl(location, currentUrl);
            if (Object.keys(this.retrieveHistory()).includes(location)) {
                continue;
            }

            const downloadChild = await this.doRetrieve(location);
            const relative = Utils.relativePath(currentFile, downloadChild);
            element.setAttribute(attributeName, relative);
            modified = true;
        }

        return modified;
    }

    private relativeToAbsoluteUrl(url: string, currentUrl: string): string {
        if (this.urlParts(url)) {
            return url;
        }

        const currentParts = this.urlParts(currentUrl) ?? {};

        return [
            currentParts.scheme,
            '//',
            currentParts.host,
            Utils.simplifyPath(dirname(currentParts.path) + '/' + url).join('/')
        ].join('');
    }
}
