import http from 'node:http';
import url, { fileURLToPath } from 'node:url';
import path, { dirname, join } from 'node:path';
import { existsSync, readFile } from 'node:fs';

const publicPath = (path: string): string => join(dirname(fileURLToPath(import.meta.url)), 'public', path);

export async function startServer(host: string, port: number): Promise<http.Server> {
    return new Promise((resolve) => {
        const server = http.createServer((request, response) => {
            // Parse URL
            const parsedUrl = url.parse(request.url!);
            // Extract URL path
            const pathname = `${parsedUrl.pathname!}`;
            // Based on the URL path, extract the file extension. e.g. .js, .doc, ...
            const { ext } = path.parse(pathname);
            // Maps file extension to MIME typere
            const map: Record<string, string> = {
                '.xml': 'text/xml',
                '.gz': 'application/gzip',
                '.xsd': 'text/xml',
                '.xslt': 'text/xml',
                '.md': 'text/markdown',
                '.txt': 'text/plain'
            };

            const fileWithPath = publicPath(pathname);

            if (existsSync(fileWithPath)) {
                // Read file from file system
                readFile(fileWithPath, (error, data) => {
                    if (error) {
                        response.statusCode = 500;
                        response.end(`Error getting the file: ${error.path!}.`);
                    } else {
                        // If the file is found, set Content-type and send data
                        response.writeHead(200, { 'Content-Type': map[ext] ?? 'text/plain' });
                        response.end(data);
                    }
                });
            } else {
                // If the file is not found, return 404
                response.statusCode = 404;
                response.end(`File ${publicPath(pathname)} not found!`);
            }
        });

        server.listen(port, host, () => {
            resolve(server);
        });
    });
}
