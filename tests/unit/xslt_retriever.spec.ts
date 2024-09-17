import 'jest-xml-matcher';
import { existsSync, readFileSync } from 'node:fs';
import { EOL } from 'node:os';
import XsltRetriever from '#src/xslt_retriever';
import { buildPath, deleteDirectory, fileContent, filePath, publicPath } from '../test_utils.js';

describe('xslt retriever', () => {
  test('retrieve recursive', async () => {
    const localPath = buildPath('recursive');
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

    await deleteDirectory(localPath);
  }, 30_000);

  test.runIf(existsSync(publicPath('www.sat.gob.mx')) && existsSync(publicPath('sat-urls.txt')))(
    'retrieve complex structure',
    async () => {
      const pathSatUrls = publicPath('sat-urls.txt');
      const localPath = buildPath('SATXSLT');
      const remotePrefix = 'http://localhost:8999/www.sat.gob.mx/sitio_internet/';
      const remote = `${remotePrefix}cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt`;
      const retriever = new XsltRetriever(localPath);
      const expectedRemotes = readFileSync(pathSatUrls, 'binary')
        .split(EOL)
        .filter((s) => s.endsWith('xslt'))
        .map((url) => url.trim().replace('http://www.sat.gob.mx/sitio_internet/', ''));

      // Verify path of downloaded file
      await retriever.retrieve(remote);

      // Verify file exists
      for (const expectedRemote of expectedRemotes) {
        expect(existsSync(retriever.buildPath(`${remotePrefix}${expectedRemote}`))).toBeTruthy();
      }

      await deleteDirectory(localPath);
    },
    30_000,
  );
});
