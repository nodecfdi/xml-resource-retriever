/**
 * \@vitest-environment jsdom
 */

import 'jest-xml-matcher';
import { existsSync, readFileSync } from 'node:fs';
import { EOL } from 'node:os';
import { install } from '@nodecfdi/cfdiutils-common';

import { useRetrieverTestCase } from './retriever-test-case';
import { XsdRetriever } from '~/xsd-retriever';
import { useTestCase } from '../test-case';

describe('XsdRetriever_jsdom', () => {
    const { buildPath, pathToClear, assetPath, publicPath } = useRetrieverTestCase();
    const { fileContents } = useTestCase();

    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), document.implementation);
    });

    test('retrieve recursive', async () => {
        const localPath = buildPath('recursive');
        pathToClear(localPath);
        const retriever = new XsdRetriever(localPath);
        const remote = 'http://localhost:8999/xsd/entities/ticket.xsd';
        const expectedRemotes = [
            retriever.buildPath(remote),
            retriever.buildPath('http://localhost:8999/xsd/articles/books.xsd')
        ];

        // Verify path of downloaded file
        const local = await retriever.retrieve(remote);
        expect(local).toBe(expectedRemotes[0]);

        // Verify file exists
        for (const expectedRemote of expectedRemotes) {
            expect(existsSync(expectedRemote)).toBeTruthy();
        }

        // Get string content xml for compare on jsdom need remove xml header for match
        const assetXml = fileContents(assetPath('expected-ticket.xsd')).replace(
            '<?xml version="1.0" encoding="UTF-8"?>',
            ''
        );
        const localXml = fileContents(local);

        expect(localXml).toEqualXML(assetXml);
    });

    test.runIf(existsSync(publicPath('www.sat.gob.mx')) && existsSync(publicPath('sat-urls.txt')))(
        'retrieve complex structure',
        async () => {
            const pathSatUrls = publicPath('sat-urls.txt');
            const localPath = buildPath('SATXSD');
            pathToClear(localPath);
            const remotePrefix = 'http://localhost:8999/www.sat.gob.mx/sitio_internet/';
            const remote = `${remotePrefix}cfd/3/cfdv33.xsd`;
            const retriever = new XsdRetriever(localPath);
            const expectedRemotes = readFileSync(pathSatUrls, 'binary')
                .split(EOL)
                .filter((s) => s.endsWith('xsd'))
                .map((url) => url.trim().replace('http://www.sat.gob.mx/sitio_internet/', ''));

            // Verify path of downloaded file
            await retriever.retrieve(remote);

            // Verify file exists
            for (const expectedRemote of expectedRemotes) {
                expect(existsSync(retriever.buildPath(`${remotePrefix}${expectedRemote}`))).toBeTruthy();
            }
        },
        30_000
    );
});
