import { existsSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { getSerializer, getParser } from '@nodecfdi/cfdiutils-common';
import { Magic, MAGIC_MIME_TYPE } from 'mmmagic';
import { dirname } from 'path';

import { AbstractBaseRetriever } from './abstract-base-retriever';
import { RetrieverInterface } from './retriever-interface';
import { Utils } from './utils';
import { DownloaderInterface } from './downloader/downloader-interface';

export abstract class AbstractXmlRetriever extends AbstractBaseRetriever implements RetrieverInterface {
    constructor(basePath: string, downloader?: DownloaderInterface) {
        super(basePath, downloader);
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
    protected abstract searchElements(): Record<string, string>[];

    public retrieve(url: string): Promise<string> {
        this.clearHistory();

        return this.doRetrieve(url);
    }

    private async doRetrieve(resource: string): Promise<string> {
        const localFileName = await this.download(resource);
        this.addToHistory(resource, localFileName);

        let fileContent = '';
        if (existsSync(localFileName)) {
            fileContent = readFileSync(localFileName, 'utf-8');
        }

        let docParse: Document | null = null;
        const parser = getParser();
        const errors: Record<string, unknown> = {};

        // Only for @xmldom/xmldom capture not error fatal
        if ((parser as unknown as Record<string, unknown>).options) {
            (parser as unknown as Record<string, Record<string, unknown>>).options = {
                errorHandler: (level: string, msg: unknown): void => {
                    errors[level] = msg;
                },
                locator: {}
            };
        }

        try {
            docParse = parser.parseFromString(fileContent, 'text/xml');

            if (Object.keys(errors).length !== 0 || !docParse.documentElement) {
                throw new Error('Invalid xml');
            }
        } catch (e) {
            unlinkSync(localFileName);

            throw new Error(`The source ${resource} contains errors: ${(e as Error).message}`);
        }

        let changed = false;
        for (const search of this.searchElements()) {
            const recursiveRetrieve = await this.recursiveRetrieve(
                docParse,
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
            const changedXml = getSerializer().serializeToString(docParse);
            writeFileSync(localFileName, changedXml, 'utf-8');
        }

        return localFileName;
    }

    private async recursiveRetrieve(
        doc: Document,
        tagName: string,
        attributeName: string,
        currentUrl: string,
        currentFile: string
    ): Promise<boolean> {
        let modified = false;
        const elements = doc.getElementsByTagNameNS(this.searchNamespace(), tagName);
        for (const element of Array.from(elements)) {
            if (!element.hasAttribute(attributeName)) {
                continue;
            }
            let location = element.getAttribute(attributeName);
            if (!location || location == '') {
                continue;
            }
            location = this.relativeToAbsoluteUrl(location, currentUrl);
            if (Object.keys(this.retrieveHistory()).indexOf(location) !== -1) {
                continue;
            }
            const downloadChild = await this.doRetrieve(location);
            const relative = Utils.relativePath(currentFile, downloadChild);
            element.setAttribute(attributeName, relative);
            modified = true;
        }

        return modified;
    }

    /**
     * This method checks if the recently downloaded file from source located at path
     * is a valid resource, if not will remove the file and throw an exception
     *
     * @param source -
     * @param localPath -
     *
     */
    protected checkIsValidDownloadedFile(source: string, localPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const statsFile = statSync(localPath);
            if (statsFile.size === 0) {
                unlinkSync(localPath);

                return reject(new Error(`The source ${source} is not an xml file because it is empty`));
            }
            const magic = new Magic(MAGIC_MIME_TYPE);
            magic.detectFile(localPath, (_err, result) => {
                if (
                    typeof result !== 'string' ||
                    ('application/xml' !== result && 'text/' !== result.substring(0, 5))
                ) {
                    unlinkSync(localPath);

                    return reject(new Error(`The source ${source} (${result}) is not an xml file`));
                }

                return resolve();
            });
        });
    }

    private relativeToAbsoluteUrl(url: string, currentUrl: string): string {
        if (this.urlParts(url)) {
            return url;
        }
        const currentParts = this.urlParts(currentUrl) || {};

        return [
            currentParts['scheme'],
            '//',
            currentParts['host'],
            Utils.simplifyPath(dirname(currentParts['path']) + '/' + url).join('/')
        ].join('');
    }
}
