import { existsSync, readFileSync } from 'fs';
import { EOL } from 'os';
import { install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMParser, DOMImplementation } from '@xmldom/xmldom';

import { TestCase } from '../test-case';
import { useRetrieverTestCase } from './retriever-test-case';
import { XsltRetriever } from '~/xslt-retriever';

describe('XsltRetriever', () => {
    const { buildPath, pathToClear, assetPath, publicPath } = useRetrieverTestCase();

    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
    });

    test('retrieve recursive', async () => {
        const localPath = buildPath('recursive');
        pathToClear(localPath);
        const retriever = new XsltRetriever(localPath);
        const remote = 'http://localhost:8999/xslt/entities/ticket.xslt';
        const expectedRemotes = [
            retriever.buildPath(remote),
            retriever.buildPath('http://localhost:8999/xslt/articles/books.xslt')
        ];

        // verify path of downloaded file
        const local = await retriever.retrieve(remote);
        expect(local).toBe(expectedRemotes[0]);

        // verify file exists
        for (const expectedRemote of expectedRemotes) {
            expect(existsSync(expectedRemote)).toBeTruthy();
        }

        // get string content xml for compare
        const assetXml = TestCase.fileContents(assetPath('expected-ticket.xslt'));
        const localXml = TestCase.fileContents(local);

        expect(localXml).toEqualXML(assetXml);
    }, 30000);

    TestCase.testIf(existsSync(publicPath('www.sat.gob.mx')) && existsSync(publicPath('sat-urls.txt')))(
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
                // eslint-disable-next-line jest/no-standalone-expect
                expect(existsSync(retriever.buildPath(`${remotePrefix}${expectedRemote}`))).toBeTruthy();
            }
        },
        30000
    );
});
