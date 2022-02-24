import 'jest-xml-matcher';
import { useRetrieverTestCase } from './retriever-test-case';
import { XsdRetriever } from '../../src';
import { existsSync } from 'fs';
import { useTestCase } from '../test-case';

describe('XsdRetriever', () => {
    const { fileContents, testIf } = useTestCase();
    const { buildPath, pathToClear, assetPath, publicPath } = useRetrieverTestCase();

    test('retrieve recursive', async () => {
        const localPath = buildPath('recursive');
        pathToClear(localPath);
        const retriever = new XsdRetriever(localPath);
        const remote = 'http://localhost:8999/xsd/entities/ticket.xsd';
        const expectedRemotes = [
            retriever.buildPath(remote),
            retriever.buildPath('http://localhost:8999/xsd/articles/books.xsd'),
        ];

        // verify path of downloaded file
        const local = await retriever.retrieve(remote);
        expect(local).toBe(expectedRemotes[0]);

        // verify file exists
        for (const expectedRemote of expectedRemotes) {
            expect(existsSync(expectedRemote)).toBeTruthy();
        }

        // get string content xml for compare
        const assetXml = fileContents(assetPath('expected-ticket.xsd'));
        const localXml = fileContents(local);

        expect(localXml).toEqualXML(assetXml);
    });

    testIf(existsSync(publicPath('www.sat.gob.mx')))('retrieve complex structure', async () => {
        const localPath = buildPath('SATXSD');
        pathToClear(localPath);
        const remotePrefix = 'http://localhost:8999/www.sat.gob.mx/sitio_internet/';
        const remote = `${remotePrefix}cfd/3/cfdv33.xsd`;
        const retriever = new XsdRetriever(localPath);
        const expectedRemotes = ['cfd/3/cfdv33.xsd', 'cfd/tipoDatos/tdCFDI/tdCFDI.xsd', 'cfd/catalogos/catCFDI.xsd'];

        // verify path of downloaded file
        await retriever.retrieve(remote);

        // verify file exists
        for (const expectedRemote of expectedRemotes) {
            expect(existsSync(retriever.buildPath(`${remotePrefix}${expectedRemote}`))).toBeTruthy();
        }
    });
});
