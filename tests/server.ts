import { existsSync, readFile } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { publicPath } from './test_utils.js';

export const startServer = async (host: string, port: number): Promise<http.Server> => {
  return new Promise((resolve) => {
    const server = http.createServer((request, response) => {
      const baseUrl = `http://${request.headers.host}/`;
      // Parse URL
      const parsedUrl = new URL(request.url!, baseUrl);
      // Extract URL path
      const { pathname } = parsedUrl;
      // Based on the URL path, extract the file extension. e.g. .js, .doc, ...
      const { ext } = path.parse(pathname);
      // Maps file extension to MIME typere
      const map: Record<string, string> = {
        '.xml': 'text/xml',
        '.gz': 'application/gzip',
        '.xsd': 'text/xml',
        '.xslt': 'text/xml',
        '.md': 'text/markdown',
        '.txt': 'text/plain',
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
      console.info('Server started in', host, port);
      resolve(server);
    });
  });
};
