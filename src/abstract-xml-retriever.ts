import { AbstractBaseRetriever } from './abstract-base-retriever';
import { RetrieverInterface } from './retriever-interface';
import { existsSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { Magic, MAGIC_MIME_TYPE } from 'mmmagic';
import { dirname } from 'path';
import { Utils } from './utils';
import { DownloaderInterface } from './downloader/downloader-interface';

export abstract class AbstractXmlRetriever extends AbstractBaseRetriever implements RetrieverInterface {
    constructor(basePath: string, downloader: DownloaderInterface | null = null) {
        super(basePath, downloader);
    }

    /**
     * Must return a string with the namespace to search for
     *
     * @protected
     */
    protected abstract searchNamespace(): string;

    /**
     * Must return a table with rows (array of records)
     * every row must contain the keys element and attribute
     * "element" is the tag name to search for
     * "attribute" is the attribute name that contains the url
     *
     * @protected
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
        const existFile = existsSync(localFileName);
        if (existFile) {
            fileContent = readFileSync(localFileName, 'binary');
        }
        const errors: Record<string, unknown> = {};
        const parser = new DOMParser({
            errorHandler: (level, msg): void => {
                errors[level] = msg;
            },
        });
        const docParse = parser.parseFromString(fileContent, 'text/xml');
        if (Object.keys(errors).length !== 0 || docParse.documentElement === null) {
            unlinkSync(localFileName);
            return Promise.reject(SyntaxError(`The source ${resource} contains errors`));
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
            const changedXml = new XMLSerializer().serializeToString(docParse);
            writeFileSync(localFileName, changedXml);
        }
        return Promise.resolve(localFileName);
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
        for (let i = 0; i < elements.length; i++) {
            if (!elements[i].hasAttribute(attributeName)) {
                continue;
            }
            let location = elements[i].getAttribute(attributeName);
            if (!location || location == '') {
                continue;
            }
            location = this.relativeToAbsoluteUrl(location, currentUrl);
            if (Object.keys(this.retrieveHistory()).indexOf(location) !== -1) {
                continue;
            }
            const downloadChild = await this.doRetrieve(location);
            const relative = Utils.relativePath(currentFile, downloadChild);
            elements[i].setAttribute(attributeName, relative);
            modified = true;
        }
        return Promise.resolve(modified);
    }

    /**
     * This method checks if the recently downloaded file from source located at path
     * is a valid resource, if not will remove the file and throw an exception
     *
     * @param source
     * @param localPath
     * @protected
     */
    protected checkIsValidDownloadedFile(source: string, localPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const statsFile = statSync(localPath);
            if (statsFile.size === 0) {
                unlinkSync(localPath);
                return reject(new Error(`The source ${source} is not an xml file because it is empty`));
            }
            const magic = new Magic(MAGIC_MIME_TYPE);
            magic.detectFile(localPath, (err, result) => {
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
        const currentParts = this.urlParts(currentUrl) ?? {};
        return [
            currentParts['scheme'],
            '//',
            currentParts['host'],
            Utils.simplifyPath(dirname(currentParts['path']) + '/' + url).join('/'),
        ].join('');
    }
}
