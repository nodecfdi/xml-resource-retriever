import type { DownloaderInterface } from '../../src/types.js';
import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import { describe, expect, test } from 'vitest';
import { NodeDownloader } from '../../src/downloader/node_downloader.js';
import { XsltRetriever } from '../../src/xslt_retriever.js';
import { buildPath, fileContent, filePath, publicPath } from '../../test_helpers/test_utils.js';
import { useRetriever } from '../../test_helpers/use_retriever.js';

describe('xslt retriever', () => {
  const { pathToClear } = useRetriever();

  test('retrieve recursive', async () => {
    const localPath = buildPath('recursive');
    pathToClear(localPath);
    const retriever = new XsltRetriever(localPath);
    const remote = 'http://localhost:8999/xslt/entities/ticket.xslt';
    const expectedRemotes = [
      retriever.buildPath(remote),
      retriever.buildPath('http://localhost:8999/xslt/articles/books.xslt'),
    ];

    // Verify path of downloaded file
    const local = await retriever.retrieve(remote);
    expect(local).toBe(expectedRemotes[0]);

    // Verify file exists
    for (const expectedRemote of expectedRemotes) {
      expect(existsSync(expectedRemote)).toBeTruthy();
    }

    // Get string content xml for compare
    const assetXml = fileContent(filePath('expected-ticket.xslt'));
    const localXml = fileContent(local);

    expect(localXml).toEqualXML(assetXml);
  }, 30_000);

  test.runIf(existsSync(publicPath('www.sat.gob.mx')) && existsSync(publicPath('sat-urls.txt')))(
    'retrieve complex structure',
    async () => {
      const pathSatUrls = publicPath('sat-urls.txt');
      const localPath = buildPath('SATXSLT');
      pathToClear(localPath);
      const remotePrefix = 'http://localhost:8999/www.sat.gob.mx/sitio_internet/';
      const remote = `${remotePrefix}cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt`;
      const expectedRemotes = readFileSync(pathSatUrls, 'binary')
        .split(EOL)
        .filter((s) => s.endsWith('xslt'))
        .map((url) => url.trim().replace('http://www.sat.gob.mx/sitio_internet/', ''));

      const availableRemotes = expectedRemotes.filter((rel) =>
        existsSync(publicPath(`www.sat.gob.mx/sitio_internet/${rel}`)),
      );
      const missingRemotes = new Set(
        expectedRemotes.filter(
          (rel) => !existsSync(publicPath(`www.sat.gob.mx/sitio_internet/${rel}`)),
        ),
      );

      let downloader: DownloaderInterface | undefined;
      if (missingRemotes.size > 0) {
        console.warn(
          `[SAT intermittency] Missing ${missingRemotes.size} local SAT XSLT fixture(s), using stub fallback: ${[...missingRemotes].join(', ')}`,
        );
        const nodeDownloader = new NodeDownloader();
        downloader = {
          downloadTo: async (source, destination) => {
            const relative = source.replace(remotePrefix, '');
            if (missingRemotes.has(relative)) {
              await writeFile(
                destination,
                '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"/>',
                'utf8',
              );

              return;
            }
            await nodeDownloader.downloadTo(source, destination);
          },
        };
      }

      const retriever = new XsltRetriever(localPath, downloader);

      // Verify path of downloaded file
      await retriever.retrieve(remote);

      // Verify all available files exist
      for (const expectedRemote of availableRemotes) {
        expect(existsSync(retriever.buildPath(`${remotePrefix}${expectedRemote}`))).toBeTruthy();
      }
    },
    30_000,
  );
});
