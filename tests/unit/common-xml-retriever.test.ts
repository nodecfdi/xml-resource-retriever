import 'jest-xml-matcher';
import { CommonXmlRetriever } from './common-xml-retriever';
import { AbstractBaseRetriever, NodeDownloader } from '../../src';
import { useRetrieverTestCase } from './retriever-test-case';
import { useTestCase } from '../test-case';
import { existsSync } from 'fs';
import { basename, dirname } from 'path';
import { GlobSync } from 'glob';

describe('CommonXmlRetriever', () => {
    const { fileContents } = useTestCase();
    const { buildPath, pathToClear, publicPath } = useRetrieverTestCase();

    test('construct minimal', () => {
        const retriever = new CommonXmlRetriever('foo');

        expect(retriever).toBeInstanceOf(AbstractBaseRetriever);
        expect(retriever.getBasePath()).toBe('foo');
        expect(retriever.getDownloader()).toBeInstanceOf(NodeDownloader);
    });

    test('base path', () => {
        const retriever = new CommonXmlRetriever(__dirname);

        expect(retriever.getBasePath()).toBe(__dirname);
    });

    test('build path', () => {
        const retriever = new CommonXmlRetriever('..');
        const url = 'http://example.org/some/file.txt';
        const expectedPath = '../example.org/some/file.txt';
        expect(retriever.buildPath(url)).toBe(expectedPath);
    });

    test('download throws exception on empty string', async () => {
        const retriever = new CommonXmlRetriever('foo');

        expect.hasAssertions();
        try {
            await retriever.download('');
        } catch (e) {
            expect(e).toBeInstanceOf(SyntaxError);
            expect(e).toHaveProperty('message', 'The argument to download is empty');
        }
    });

    test('download simple case', async () => {
        const localPath = buildPath('foo');
        pathToClear(localPath);
        const remoteFile = 'http://localhost:8999/xsd/simple.xsd';
        const publicFile = publicPath('xsd/simple.xsd');

        // create retriever
        const retriever = new CommonXmlRetriever(localPath);

        // check for location
        const destination = retriever.buildPath(remoteFile);

        // download
        const downloaded = await retriever.download(remoteFile);

        // check that te returned path is the same as the expected destination
        expect(downloaded).toBe(destination);

        // get string content xml for compare
        const publicXml = fileContents(publicFile);
        const downloadedXml = fileContents(downloaded);

        expect(downloadedXml).toEqualXML(publicXml);
    });

    test('download throws exception on empty file', async () => {
        const localPath = buildPath('empty');
        pathToClear(localPath);
        const remote = 'http://localhost:8999/other/empty.xml';
        const retriever = new CommonXmlRetriever(localPath);

        expect.hasAssertions();
        try {
            await retriever.download(remote);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty('message', `The source ${remote} is not an xml file because it is empty`);
        }
    });

    test('download not an xml file throws an exception and remove the file', async () => {
        const localPath = buildPath('other');
        pathToClear(localPath);
        const remote = 'http://localhost:8999/other/sample.gz';
        const retriever = new CommonXmlRetriever(localPath);

        let raisedException = false;
        try {
            await retriever.download(remote);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty('message', `The source ${remote} (application/x-gzip) is not an xml file`);
            raisedException = true;
        }
        expect(raisedException).toBeTruthy();

        // assert that the file does not exist (even if it was downloaded)
        const local = retriever.buildPath(remote);
        expect(existsSync(local)).toBeFalsy();
    });

    test('download non existent', async () => {
        const localPath = buildPath('non-existent');
        pathToClear(localPath);
        const remote = 'http://localhost:8999/non-existent-resource.txt';
        const retriever = new CommonXmlRetriever(localPath);

        const destination = retriever.buildPath(remote);

        expect.hasAssertions();
        try {
            await retriever.download(remote);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty('message', `Unable to download ${remote} to ${destination}`);
        }
    });

    test('download to non writable', async () => {
        const localPath = '/bin/bash';
        const remote = 'http://localhost:8999/other/sample.xml';
        const retriever = new CommonXmlRetriever(localPath);

        expect.hasAssertions();
        try {
            await retriever.download(remote);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty('message', 'Unable to create directory /bin/bash/localhost:8999/other');
        }
    });

    test.each([
        ['xml correct', 'http://localhost:8999/other/sample.xml'],
        ['xml without header', 'http://localhost:8999/other/xml-without-header.xml'],
    ])('retrieve xml valid cases %s', async (name: string, remote: string) => {
        const localPath = buildPath('sample');
        pathToClear(localPath);
        const retriever = new CommonXmlRetriever(localPath);
        const response = await retriever.retrieve(remote);

        expect(response).not.toBe('');
    });

    test.each([
        ['xml with just header', 'http://localhost:8999/other/xml-just-header.xml'],
        ['xml malformed', 'http://localhost:8999/other/malformed.xml'],
    ])('retrieve xml with errors %s', async (name: string, remote: string) => {
        const localPath = buildPath('malformed');
        pathToClear(localPath);
        const retriever = new CommonXmlRetriever(localPath);

        let raisedException = false;
        try {
            await retriever.retrieve(remote);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty('message', `The source ${remote} contains errors`);
            raisedException = true;
        }

        expect(raisedException).toBeTruthy();
        const local = retriever.buildPath(remote);
        expect(existsSync(local)).toBeFalsy();
    });

    test.each([['scheme://host'], ['host/path'], ['not-an-url']])('build path with invalid url %s', (url: string) => {
        const retriever = new CommonXmlRetriever('basepath');

        expect.hasAssertions();
        try {
            retriever.buildPath(url);
        } catch (e) {
            expect(e).toBeInstanceOf(SyntaxError);
            expect(e).toHaveProperty('message', `Invalid URL: ${url}`);
        }
    });

    test('retrieve with history', async () => {
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
    });
});
