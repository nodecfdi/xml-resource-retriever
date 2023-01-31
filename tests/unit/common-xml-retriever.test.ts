import 'jest-xml-matcher';
import { existsSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobSync } from 'glob';
import { install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMParser, DOMImplementation } from '@xmldom/xmldom';

import { AbstractBaseRetriever } from '~/abstract-base-retriever';
import { NodeDownloader } from '~/downloader/node-downloader';
import { CommonXmlRetriever } from './common-xml-retriever';
import { useRetrieverTestCase } from './retriever-test-case';
import { useTestCase } from '../test-case';

describe('CommonXmlRetriever', () => {
    const { buildPath, pathToClear, publicPath } = useRetrieverTestCase();
    const { fileContents } = useTestCase();

    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
    });

    test('construct_minimal', () => {
        const retriever = new CommonXmlRetriever('foo');

        expect(retriever).toBeInstanceOf(AbstractBaseRetriever);
        expect(retriever.getBasePath()).toBe('foo');
        expect(retriever.getDownloader()).toBeInstanceOf(NodeDownloader);
    });

    test('base_path', () => {
        const retriever = new CommonXmlRetriever(dirname(fileURLToPath(import.meta.url)));

        expect(retriever.getBasePath()).toBe(dirname(fileURLToPath(import.meta.url)));
    });

    test('build_path', () => {
        const retriever = new CommonXmlRetriever('..');
        const url = 'http://example.org/some/file.txt';
        const expectedPath = '../example.org/some/file.txt';
        expect(retriever.buildPath(url)).toBe(expectedPath);
    });

    test('download_throws_exception_on_empty_string', async () => {
        const retriever = new CommonXmlRetriever('foo');

        const t = async (): Promise<string> => retriever.download('');

        await expect(t).rejects.toBeInstanceOf(Error);
        await expect(t).rejects.toThrow('The argument to download is empty');
    });

    test('download_simple_case', async () => {
        const localPath = buildPath('foo');
        pathToClear(localPath);
        const remoteFile = 'http://localhost:8999/xsd/simple.xsd';
        const publicFile = publicPath('xsd/simple.xsd');

        // Create retriever
        const retriever = new CommonXmlRetriever(localPath);

        // Check for location
        const destination = retriever.buildPath(remoteFile);

        // Download
        const downloaded = await retriever.download(remoteFile);

        // Check that te returned path is the same as the expected destination
        expect(downloaded).toBe(destination);

        // Get string content xml for compare
        const publicXml = fileContents(publicFile);
        const downloadedXml = fileContents(downloaded);

        expect(downloadedXml).toEqualXML(publicXml);
    }, 30_000);

    test('download_throws_exception_on_empty_file', async () => {
        const localPath = buildPath('empty');
        pathToClear(localPath);
        const remote = 'http://localhost:8999/other/empty.xml';
        const retriever = new CommonXmlRetriever(localPath);

        const t = async (): Promise<string> => retriever.download(remote);

        await expect(t).rejects.toBeInstanceOf(Error);
        await expect(t).rejects.toThrow(`The source ${remote} is not an xml file because it is empty`);
    }, 30_000);

    test('download_not_an_xml_file_throws_an_exception_and_remove_the_file', async () => {
        const localPath = buildPath('other');
        pathToClear(localPath);
        const remote = 'http://localhost:8999/other/sample.gz';
        const retriever = new CommonXmlRetriever(localPath);

        const t = async (): Promise<string> => retriever.download(remote);

        await expect(t).rejects.toBeInstanceOf(Error);
        await expect(t).rejects.toThrow(`The source ${remote} (application/gzip) is not an xml file`);

        // Assert that the file does not exist (even if it was downloaded)
        const local = retriever.buildPath(remote);
        expect(existsSync(local)).toBeFalsy();
    }, 30_000);

    test('download_non_existent', async () => {
        const localPath = buildPath('non-existent');
        pathToClear(localPath);
        const remote = 'http://localhost:8999/non-existent-resource.txt';
        const retriever = new CommonXmlRetriever(localPath);

        const destination = retriever.buildPath(remote);

        const t = async (): Promise<string> => retriever.download(remote);

        await expect(t).rejects.toBeInstanceOf(Error);
        await expect(t).rejects.toThrow(`Unable to download ${remote} to ${destination}`);
    }, 30_000);

    test('download_to_non_writable', async () => {
        const localPath = '/bin/bash';
        const remote = 'http://localhost:8999/other/sample.xml';
        const retriever = new CommonXmlRetriever(localPath);

        const t = async (): Promise<string> => retriever.download(remote);

        await expect(t).rejects.toBeInstanceOf(Error);
        await expect(t).rejects.toThrow('Unable to create directory /bin/bash/localhost:8999/other');
    });

    test.each([
        ['xml correct', 'http://localhost:8999/other/sample.xml'],
        ['xml without header', 'http://localhost:8999/other/xml-without-header.xml']
    ])(
        'retrieve_xml_valid_cases %s',
        async (_name: string, remote: string) => {
            const localPath = buildPath('sample');
            pathToClear(localPath);
            const retriever = new CommonXmlRetriever(localPath);
            const response = await retriever.retrieve(remote);

            expect(response).not.toBe('');
        },
        30_000
    );

    test.each([
        ['xml with just header', 'http://localhost:8999/other/xml-just-header.xml'],
        ['xml malformed', 'http://localhost:8999/other/malformed.xml']
    ])(
        'retrieve_xml_with_errors %s',
        async (_name: string, remote: string) => {
            const localPath = buildPath('malformed');
            pathToClear(localPath);
            const retriever = new CommonXmlRetriever(localPath);

            const t = async (): Promise<string> => retriever.retrieve(remote);

            await expect(t).rejects.toBeInstanceOf(Error);
            await expect(t).rejects.toThrow(`The source ${remote} contains errors`);

            const local = retriever.buildPath(remote);
            expect(existsSync(local)).toBeFalsy();
        },
        30_000
    );

    test.each([['scheme://host'], ['host/path'], ['not-an-url']])('build_path_with_invalid_url %s', (url: string) => {
        const retriever = new CommonXmlRetriever('basepath');

        const t = (): string => retriever.buildPath(url);

        expect(t).toThrow(Error);
        expect(t).toThrow(`Invalid URL: ${url}`);
    });

    test('retrieve_with_history', async () => {
        const localPath = buildPath('common');
        pathToClear(localPath);

        const remoteParent = 'http://localhost:8999/other/common/parent.xml';
        const expectedRetrievedFiles = ['parent.xml', 'child.xml', 'recursive-self.xml', 'foo.xml'];

        expect(existsSync(localPath)).toBeFalsy();

        const retriever = new CommonXmlRetriever(localPath);
        const expectedDestination = dirname(retriever.buildPath(remoteParent));
        await retriever.retrieve(remoteParent);

        const history = retriever.retrieveHistory();
        expect(Object.values(history)).toHaveLength(expectedRetrievedFiles.length);

        const retrievedFiles = new GlobSync(`${expectedDestination}/*.xml`);
        expect(retrievedFiles.found).toHaveLength(expectedRetrievedFiles.length);

        for (const retrievedFile of retrievedFiles.found) {
            expect(Object.values(history)).toContain(retrievedFile);
            expect(expectedRetrievedFiles).toContain(basename(retrievedFile));
        }
    }, 30_000);
});
