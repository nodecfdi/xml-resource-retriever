export interface RetrieverInterface {
  /**
   * Must return the base path where the elements will be downloaded
   */
  getBasePath: () => string;

  /**
   * Return the path where an url would be located
   *
   * @param url -
   */
  buildPath: (url: string) => string;

  /**
   * Retrieve an url and all its related resources
   * Return the path where the resource is located (as in buildPath)
   *
   * @param url -
   */
  retrieve: (url: string) => Promise<string>;

  /**
   * Returns the history of the last retrieve operation
   * The return is a record of key-value pairs where the key is the url retrieved and the value is the path
   */
  retrieveHistory: () => Record<string, string>;

  /**
   * Download an url without its related resources
   * Return the path where the resource is located (as in buildPath)
   *
   * @param url -
   */
  download: (url: string) => Promise<string>;
}

export interface DownloaderInterface {
  downloadTo: (source: string, destination: string) => Promise<void>;
}

export interface UrlParts {
  scheme: string;
  host: string;
  port: string;
  path: string;
}

export interface SearchElement {
  element: string;
  attribute: string;
}

export interface NodeDownloaderOptions extends RequestInit {
  /**
   * Maximum time in milliseconds allowed for the request and body download.
   * Set to `0` to disable the timeout.
   *
   * @defaultValue 30_000
   */
  timeoutMs?: number;

  /**
   * Maximum response size in bytes allowed during download.
   * Set to `0` to disable the size limit.
   *
   * @defaultValue 52_428_800 (50 MiB)
   */
  maxBytes?: number;
}
