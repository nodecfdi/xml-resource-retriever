import type { Document } from '@nodecfdi/cfdi-core';
import type { DownloaderInterface, RetrieverInterface, SearchElement } from './types.js';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { getParser, getSerializer, MIME_TYPE } from '@nodecfdi/cfdi-core';
import { AbstractBaseRetriever } from './abstract_base_retriever.js';
import { relativePath } from './utils/path_utils.js';
import { relativeToAbsoluteUrl } from './utils/url_utils.js';
import { stripUtf8Bom, validateDownloadedXmlFile } from './utils/xml_validation_utils.js';

const DEFAULT_MAX_DEPTH = 50;
const DEFAULT_MAX_RESOURCES = 500;

export abstract class AbstractXmlRetriever
  extends AbstractBaseRetriever
  implements RetrieverInterface {
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

    const localFileName = await this.download(resource);
    const fileContent = stripUtf8Bom(await readFile(localFileName, 'utf8'));

    let documentParse: Document;
    try {
      const parsed = getParser().parseFromString(fileContent, MIME_TYPE.XML_TEXT);
      if (!parsed.documentElement) {
        throw new Error('Empty XML document');
      }
      documentParse = parsed;
    } catch (error) {
      await unlink(localFileName);
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(`The source ${resource} contains errors: ${message}`, { cause: error });
    }

    this.addToHistory(resource, localFileName);

    let changed = false;
    for (const search of this.searchElements()) {
      if (!search.element || !search.attribute) {
        continue;
      }

      const recursiveRetrieve = await this.recursiveRetrieve(
        documentParse,
        search.element,
        search.attribute,
        resource,
        localFileName,
        depth + 1,
      );
      if (!recursiveRetrieve) {
        continue;
      }

      changed = true;
    }

    if (changed) {
      const changedXml = getSerializer().serializeToString(documentParse);
      await writeFile(localFileName, changedXml, 'utf8');
    }

    return localFileName;
  }

  private async recursiveRetrieve(
    document: Document,
    tagName: string,
    attributeName: string,
    currentUrl: string,
    currentFile: string,
    depth: number,
  ): Promise<boolean> {
    let modified = false;
    const elements = document.getElementsByTagNameNS(this.searchNamespace(), tagName);
    for (const element of elements) {
      const rawLocation = element.getAttribute(attributeName)?.trim();
      if (!rawLocation) {
        continue;
      }

      const location = relativeToAbsoluteUrl(rawLocation, currentUrl);
      const downloadChild = this.hasInHistory(location)
        ? this.getFromHistory(location)!
        : await this.doRetrieve(location, depth);

      const relative = relativePath(currentFile, downloadChild);
      if (element.getAttribute(attributeName) === relative) {
        continue;
      }

      element.setAttribute(attributeName, relative);
      modified = true;
    }

    return modified;
  }
}
