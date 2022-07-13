export interface RetrieverInterface {
    /**
     * Must return the base path where the elements will be downloaded
     */
    getBasePath(): string;

    /**
     * Return the path where an url would be located
     *
     * @param url -
     */
    buildPath(url: string): string;

    /**
     * Retrieve an url and all its related resources
     * Return the path where the resource is located (as in buildPath)
     *
     * @param url -
     */
    retrieve(url: string): Promise<string>;

    /**
     * Returns the history of the last retrieve operation
     * The return is un record of key value pairs where the key is the url retrieved and the value is the path
     */
    retrieveHistory(): Record<string, string>;

    /**
     * Download an url without its related resources
     * Return the path where the resource is located (as in buildPath)
     *
     * @param url -
     */
    download(url: string): Promise<string>;
}
