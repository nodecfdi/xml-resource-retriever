import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getParser, getSerializer, MIME_TYPE } from '@nodecfdi/cfdi-core';
import AbstractBaseRetriever from '#src/abstract_base_retriever';
import { type DownloaderInterface, type RetrieverInterface } from '#src/types';
import { relativePath, simplifyPath } from '#src/utils/path_utils';

export default abstract class AbstractXmlRetriever
  extends AbstractBaseRetriever
  implements RetrieverInterface
{
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
    const statsFile = statSync(localPath);
    if (statsFile.size === 0) {
      unlinkSync(localPath);
      throw new Error(`The source ${source} is not an xml file because it is empty`);
    }

    const { fileTypeFromFile } = await import('file-type');
    const result = await fileTypeFromFile(localPath);
    let mimeType: string | undefined = result?.mime;
    if (!mimeType) {
      const { default: mime } = await import('mime');
      mimeType = mime.getType(localPath) ?? undefined;
    }

    if (mimeType !== 'application/xml' && !mimeType?.startsWith('text/')) {
      unlinkSync(localPath);
      throw new Error(`The source ${source} (${result!.mime}) is not an xml file`);
    }
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

  private async doRetrieve(resource: string): Promise<string> {
    const localFileName = await this.download(resource);
    this.addToHistory(resource, localFileName);

    let fileContent = '';
    if (existsSync(localFileName)) {
      fileContent = readFileSync(localFileName, 'utf8').replaceAll(/^\uFEFF/g, '');
    }

    let documentParse: Document | null = null;
    try {
      documentParse = getParser().parseFromString(fileContent, MIME_TYPE.XML_TEXT);
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
        localFileName,
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
    currentFile: string,
  ): Promise<boolean> {
    let modified = false;
    const elements = document.getElementsByTagNameNS(this.searchNamespace(), tagName);
    // eslint-disable-next-line unicorn/prefer-spread
    for (const element of Array.from(elements)) {
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
      const relative = relativePath(currentFile, downloadChild);
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
      simplifyPath(`${path.dirname(currentParts.path)}/${url}`).join('/'),
    ].join('');
  }
}
