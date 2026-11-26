import { existsSync, readFile } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { publicPath } from './test_utils.js';

const MIME_MAP: Record<string, string> = {
  '.xml': 'text/xml',
  '.gz': 'application/gzip',
  '.xsd': 'text/xml',
  '.xslt': 'text/xml',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
};

export const startServer = async (host: string, port: number): Promise<http.Server> => {
  const publicDir = path.resolve(publicPath(''));

  return new Promise((resolve) => {
    const server = http.createServer((request, response) => {
      const baseUrl = `http://${request.headers.host}/`;
      const { pathname } = new URL(request.url!, baseUrl);
      const { ext } = path.parse(pathname);
      const fileWithPath = path.resolve(publicDir, pathname.replace(/^\/+/, ''));

      if (fileWithPath !== publicDir && !fileWithPath.startsWith(`${publicDir}${path.sep}`)) {
        response.statusCode = 403;
        response.end('Forbidden');

        return;
      }

      if (existsSync(fileWithPath)) {
        readFile(fileWithPath, (error, data) => {
          if (error) {
            response.statusCode = 500;
            response.end(`Error getting the file: ${error.path!}.`);
          } else {
            response.writeHead(200, { 'Content-Type': MIME_MAP[ext] ?? 'text/plain' });
            response.end(data);
          }
        });
      } else {
        response.statusCode = 404;
        response.end(`File ${fileWithPath} not found!`);
      }
    });

    server.listen(port, host, () => {
      console.info('Server started in', host, port);
      resolve(server);
    });
  });
};
