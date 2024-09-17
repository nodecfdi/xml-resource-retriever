import 'jest-xml-matcher';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import AbstractBaseRetriever from '#src/abstract_base_retriever';
import NodeDownloader from '#src/downloader/node_downloader';
import { buildPath, deleteDirectory, fileContent, getDirname, publicPath } from '../test_utils.js';
import CommonXmlRetriever from './common_xml_retriever.js';

describe('common xml retriever', () => {
  test('construct minimal', () => {
    const retriever = new CommonXmlRetriever('foo');

    expect(retriever).toBeInstanceOf(AbstractBaseRetriever);
    expect(retriever.getBasePath()).toBe('foo');
    expect(retriever.getDownloader()).toBeInstanceOf(NodeDownloader);
  });

  test('base path', () => {
    const retriever = new CommonXmlRetriever(getDirname(import.meta.url));

    expect(retriever.getBasePath()).toBe(getDirname(import.meta.url));
  });

  test('build path', () => {
    const retriever = new CommonXmlRetriever('..');
    const url = 'http://example.org/some/file.txt';
    const expectedPath = '../example.org/some/file.txt';

    expect(retriever.buildPath(url)).toBe(expectedPath);
  });

  test('download throws exception on empty string', async () => {
    const retriever = new CommonXmlRetriever('foo');

    const t = async (): Promise<string> => retriever.download('');

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow('The argument to download is empty');
  });

  test('download_simple_case', async () => {
    const localPath = buildPath('foo');
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
    const publicXml = fileContent(publicFile);
    const downloadedXml = fileContent(downloaded);

    expect(downloadedXml).toEqualXML(publicXml);

    await deleteDirectory(localPath);
  }, 30_000);

  test('download_throws_exception_on_empty_file', async () => {
    const localPath = buildPath('empty');
    const remote = 'http://localhost:8999/other/empty.xml';
    const retriever = new CommonXmlRetriever(localPath);
    const t = async (): Promise<string> => retriever.download(remote);

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow(`The source ${remote} is not an xml file because it is empty`);

    await deleteDirectory(localPath);
  }, 30_000);

  test('download_not_an_xml_file_throws_an_exception_and_remove_the_file', async () => {
    const localPath = buildPath('other');
    const remote = 'http://localhost:8999/other/sample.gz';
    const retriever = new CommonXmlRetriever(localPath);

    const t = async (): Promise<string> => retriever.download(remote);

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow(`The source ${remote} (application/gzip) is not an xml file`);

    // Assert that the file does not exist (even if it was downloaded)
    const local = retriever.buildPath(remote);
    expect(existsSync(local)).toBeFalsy();

    await deleteDirectory(localPath);
  }, 30_000);

  test('download_non_existent', async () => {
    const localPath = buildPath('non-existent');
    const remote = 'http://localhost:8999/non-existent-resource.txt';
    const retriever = new CommonXmlRetriever(localPath);

    const destination = retriever.buildPath(remote);

    const t = async (): Promise<string> => retriever.download(remote);

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow(`Unable to download ${remote} to ${destination}`);

    await deleteDirectory(localPath);
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
    ['xml without header', 'http://localhost:8999/other/xml-without-header.xml'],
  ])(
    'retrieve_xml_valid_cases %s',
    async (_name: string, remote: string) => {
      const localPath = buildPath('sample');
      const retriever = new CommonXmlRetriever(localPath);
      const response = await retriever.retrieve(remote);

      expect(response).not.toBe('');

      await deleteDirectory(localPath);
    },
    30_000,
  );

  test.each([
    ['xml with just header', 'http://localhost:8999/other/xml-just-header.xml'],
    ['xml malformed', 'http://localhost:8999/other/malformed.xml'],
  ])(
    'retrieve_xml_with_errors %s',
    async (_name: string, remote: string) => {
      const localPath = buildPath('malformed');
      const retriever = new CommonXmlRetriever(localPath);

      const t = async (): Promise<string> => retriever.retrieve(remote);

      await expect(t).rejects.toBeInstanceOf(Error);
      await expect(t).rejects.toThrow(`The source ${remote} contains errors`);

      const local = retriever.buildPath(remote);
      expect(existsSync(local)).toBeFalsy();

      await deleteDirectory(localPath);
    },
    30_000,
  );

  test.each([['scheme://host'], ['host/path'], ['not-an-url']])(
    'build_path_with_invalid_url %s',
    (url: string) => {
      const retriever = new CommonXmlRetriever('basepath');

      const t = (): string => retriever.buildPath(url);

      expect(t).toThrow(Error);
      expect(t).toThrow(`Invalid URL: ${url}`);
    },
  );

  test('retrieve_with_history', async () => {
    const localPath = buildPath('common');
    const remoteParent = 'http://localhost:8999/other/common/parent.xml';
    const expectedRetrievedFiles = ['parent.xml', 'child.xml', 'recursive-self.xml', 'foo.xml'];

    expect(existsSync(localPath)).toBeFalsy();

    const retriever = new CommonXmlRetriever(localPath);
    const expectedDestination = path.dirname(retriever.buildPath(remoteParent));
    await retriever.retrieve(remoteParent);

    const history = retriever.retrieveHistory();
    expect(Object.values(history)).toHaveLength(expectedRetrievedFiles.length);

    const retrievedFiles = globSync(`${expectedDestination}/*.xml`);
    expect(retrievedFiles).toHaveLength(expectedRetrievedFiles.length);

    for (const retrievedFile of retrievedFiles) {
      expect(Object.values(history)).toContain(retrievedFile);
      expect(expectedRetrievedFiles).toContain(path.basename(retrievedFile));
    }

    await deleteDirectory(localPath);
  }, 30_000);
});
