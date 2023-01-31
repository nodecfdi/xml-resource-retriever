export type DownloaderInterface = {
    downloadTo(source: string, destination: string): Promise<void>;
};
