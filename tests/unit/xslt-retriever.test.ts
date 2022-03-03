import 'jest-xml-matcher';
import { useTestCase } from '../test-case';
import { useRetrieverTestCase } from './retriever-test-case';
import { XsltRetriever } from '../../src';
import { existsSync, readFileSync } from 'fs';
import { EOL } from 'os';

describe('XsltRetriever', () => {
    const { fileContents, testIf } = useTestCase();
    const { buildPath, pathToClear, assetPath, publicPath } = useRetrieverTestCase();

    test('retrieve recursive', async () => {
        const localPath = buildPath('recursive');
        pathToClear(localPath);
        const retriever = new XsltRetriever(localPath);
        const remote = 'http://localhost:8999/xslt/entities/ticket.xslt';
        const expectedRemotes = [
            retriever.buildPath(remote),
            retriever.buildPath('http://localhost:8999/xslt/articles/books.xslt'),
        ];

        // verify path of downloaded file
        const local = await retriever.retrieve(remote);
        expect(local).toBe(expectedRemotes[0]);

        // verify file exists
        for (const expectedRemote of expectedRemotes) {
            expect(existsSync(expectedRemote)).toBeTruthy();
        }

        // get string content xml for compare
        const assetXml = fileContents(assetPath('expected-ticket.xslt'));
        const localXml = fileContents(local);

        expect(localXml).toEqualXML(assetXml);
    }, 30000);

    testIf(existsSync(publicPath('www.sat.gob.mx')) && existsSync(publicPath('sat-urls.txt')))(
        'retrieve complex structure',
        async () => {
            const pathSatUrls = publicPath('sat-urls.txt');
            const localPath = buildPath('SATXSLT');
            pathToClear(localPath);
            const remotePrefix = 'http://localhost:8999/www.sat.gob.mx/sitio_internet/';
            const remote = `${remotePrefix}cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt`;
            const retriever = new XsltRetriever(localPath);
            const expectedRemotes = readFileSync(pathSatUrls, 'binary')
                .split(EOL)
                .filter((s) => /xslt$/.test(s))
                .map((url) => {
                    return url.trim().replace('http://www.sat.gob.mx/sitio_internet/', '');
                });

            // verify path of downloaded file
            await retriever.retrieve(remote);

            // verify file exists
            for (const expectedRemote of expectedRemotes) {
                expect(existsSync(retriever.buildPath(`${remotePrefix}${expectedRemote}`))).toBeTruthy();
            }
        },
        30000
    );
});
