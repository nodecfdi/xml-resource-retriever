export interface DownloaderInterface {
    downloadTo(source: string, destination: string): Promise<void>;
}
