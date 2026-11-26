import type { Document, Element } from '@nodecfdi/cfdi-core';
import type { DownloaderInterface, RetrieverInterface, SearchElement } from './types.js';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { getParser, getSerializer, MIME_TYPE } from '@nodecfdi/cfdi-core';
import { AbstractBaseRetriever } from './abstract_base_retriever.js';
import { relativePath } from './utils/path_utils.js';
import { relativeToAbsoluteUrl } from './utils/url_utils.js';
import { stripUtf8Bom, validateDownloadedXmlFile } from './utils/xml_validation_utils.js';

const DEFAULT_MAX_DEPTH = 50;
const DEFAULT_MAX_RESOURCES = 500;
const DEFAULT_MAX_CONCURRENT_DOWNLOADS = 6;

export abstract class AbstractXmlRetriever extends AbstractBaseRetriever implements RetrieverInterface {
  private _activeDownloads = 0;

  private readonly _downloadQueue: (() => void)[] = [];

  public constructor(basePath: string, downloader?: DownloaderInterface) {
    super(basePath, downloader);
  }

  public async retrieve(url: string): Promise<string> {
    this.clearHistory();

    return this.doRetrieve(url);
  }

  /**
   * This method checks if the recently downloaded file from source located at path
   * is a valid resource, if not will remove the file and throw an exception
   */
  protected async checkIsValidDownloadedFile(source: string, localPath: string): Promise<void> {
    await validateDownloadedXmlFile(source, localPath);
  }

  /**
   * Maximum recursion depth allowed when following linked XML resources
   */
  protected maxDepth(): number {
    return DEFAULT_MAX_DEPTH;
  }

  /**
   * Maximum total number of XML resources allowed in a single retrieve operation
   */
  protected maxResources(): number {
    return DEFAULT_MAX_RESOURCES;
  }

  /**
   * Maximum number of simultaneous downloads in a single retrieve operation
   */
  protected maxConcurrentDownloads(): number {
    return DEFAULT_MAX_CONCURRENT_DOWNLOADS;
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
  protected abstract searchElements(): (SearchElement | Record<string, string>)[];

  private async acquireDownloadSlot(): Promise<void> {
    if (this._activeDownloads < Math.max(1, this.maxConcurrentDownloads())) {
      this._activeDownloads += 1;

      return;
    }

    await new Promise<void>((resolve) => {
      this._downloadQueue.push(resolve);
    });

    await this.acquireDownloadSlot();
  }

  private async limitedDownload(url: string): Promise<string> {
    await this.acquireDownloadSlot();
    try {
      return await this.download(url);
    } finally {
      this._activeDownloads -= 1;
      this._downloadQueue.shift()?.();
    }
  }

  private async readAndParseDocument(resource: string, localFileName: string): Promise<Document> {
    const fileContent = stripUtf8Bom(await readFile(localFileName, 'utf8'));

    try {
      const parsed = getParser().parseFromString(fileContent, MIME_TYPE.XML_TEXT);
      if (!parsed.documentElement) {
        throw new Error('Empty XML document');
      }

      return parsed;
    } catch (error) {
      await unlink(localFileName);
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(`The source ${resource} contains errors: ${message}`, { cause: error });
    }
  }

  private collectResourceLinks(
    documentParse: Document,
    resource: string,
  ): { element: Element; attribute: string; location: string }[] {
    const namespace = this.searchNamespace();
    const links: { element: Element; attribute: string; location: string }[] = [];

    for (const { element: tagName, attribute } of this.searchElements()) {
      if (!tagName || !attribute) {
        continue;
      }

      for (const element of documentParse.getElementsByTagNameNS(namespace, tagName)) {
        const rawLocation = element.getAttribute(attribute)?.trim();
        if (rawLocation) {
          links.push({ element, attribute, location: relativeToAbsoluteUrl(rawLocation, resource) });
        }
      }
    }

    return links;
  }

  private applyRelativeLinks(
    localFileName: string,
    links: { element: Element; attribute: string; location: string }[],
    results: PromiseSettledResult<string>[],
  ): boolean {
    let changed = false;

    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') {
        throw result.reason;
      }

      const { element, attribute } = links[index];
      const relative = relativePath(localFileName, result.value);
      if (element.getAttribute(attribute) === relative) {
        continue;
      }

      element.setAttribute(attribute, relative);
      changed = true;
    }

    return changed;
  }

  private async doRetrieve(resource: string, depth = 0): Promise<string> {
    const maxDepth = this.maxDepth();
    if (depth > maxDepth) {
      throw new Error(`Maximum recursion depth (${maxDepth}) exceeded while retrieving ${resource}`);
    }

    const maxResources = this.maxResources();
    if (this.historySize() >= maxResources) {
      throw new Error(
        `Maximum resource limit (${maxResources}) exceeded while retrieving ${resource}`,
      );
    }

    // Claim before any await: siblings run concurrently, so cycles and the resource limit rely on it
    this.addToHistory(resource, this.buildPath(resource));
    const localFileName = await this.limitedDownload(resource);
    const documentParse = await this.readAndParseDocument(resource, localFileName);
    const links = this.collectResourceLinks(documentParse, resource);

    // allSettled: wait for every sibling so no download keeps running after a rejection
    const results = await Promise.allSettled(
      links.map(async ({ location }) =>
        this.getFromHistory(location) ?? this.doRetrieve(location, depth + 1),
      ),
    );

    if (this.applyRelativeLinks(localFileName, links, results)) {
      const changedXml = getSerializer().serializeToString(documentParse);
      await writeFile(localFileName, changedXml, 'utf8');
    }

    return localFileName;
  }
}
