import type { DownloaderInterface } from '../../src/types.js';
import { existsSync, readdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { AbstractBaseRetriever } from '../../src/abstract_base_retriever.js';
import { NodeDownloader } from '../../src/downloader/node_downloader.js';
import { CommonXmlRetriever } from '../../test_helpers/common_xml_retriever.js';
import { buildPath, fileContent, getDirname, publicPath } from '../../test_helpers/test_utils.js';
import { useRetriever } from '../../test_helpers/use_retriever.js';

describe('common xml retriever', () => {
  const { pathToClear } = useRetriever();

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

  test('download simple case', async () => {
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
    const publicXml = fileContent(publicFile);
    const downloadedXml = fileContent(downloaded);

    expect(downloadedXml).toEqualXML(publicXml);
  }, 30_000);

  test('download throws exception on empty file', async () => {
    const localPath = buildPath('empty');
    pathToClear(localPath);
    const remote = 'http://localhost:8999/other/empty.xml';
    const retriever = new CommonXmlRetriever(localPath);
    const t = async (): Promise<string> => retriever.download(remote);

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow(`The source ${remote} is not an xml file because it is empty`);
  }, 30_000);

  test('download not an xml file throws an exception and remove the file', async () => {
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

  test('download non-xml json file without magic bytes reports mime type cleanly', async () => {
    const localPath = buildPath('json');
    pathToClear(localPath);
    const remote = 'http://example.org/data.json';
    const fakeDownloader: DownloaderInterface = {
      downloadTo: async (_source, destination) => {
        await writeFile(destination, '{"ok":true}', 'utf8');
      },
    };
    const retriever = new CommonXmlRetriever(localPath, fakeDownloader);

    await expect(retriever.download(remote)).rejects.toThrow(
      `The source ${remote} (application/json) is not an xml file`,
    );
    expect(existsSync(retriever.buildPath(remote))).toBe(false);
  });

  test('download unknown extension without magic bytes reports unknown mime type', async () => {
    const localPath = buildPath('unknown_ext');
    pathToClear(localPath);
    const remote = 'http://example.org/resource.unknownext';
    const fakeDownloader: DownloaderInterface = {
      downloadTo: async (_source, destination) => {
        await writeFile(destination, 'plain binary-like content', 'utf8');
      },
    };
    const retriever = new CommonXmlRetriever(localPath, fakeDownloader);

    await expect(retriever.download(remote)).rejects.toThrow(
      `The source ${remote} (unknown) is not an xml file`,
    );
    expect(existsSync(retriever.buildPath(remote))).toBe(false);
  });

  test('download accepts xslt file without xml declaration header', async () => {
    const localPath = buildPath('xslt_no_header');
    pathToClear(localPath);
    const remote = 'http://example.org/transform.xslt';
    const fakeDownloader: DownloaderInterface = {
      downloadTo: async (_source, destination) => {
        await writeFile(
          destination,
          '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"/>',
          'utf8',
        );
      },
    };
    const retriever = new CommonXmlRetriever(localPath, fakeDownloader);

    const downloaded = await retriever.download(remote);
    expect(existsSync(downloaded)).toBe(true);
  });

  test('download non existent', async () => {
    const localPath = buildPath('non-existent');
    pathToClear(localPath);
    const remote = 'http://localhost:8999/non-existent-resource.txt';
    const retriever = new CommonXmlRetriever(localPath);

    const destination = retriever.buildPath(remote);

    const t = async (): Promise<string> => retriever.download(remote);

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow(`Unable to download ${remote} to ${destination}`);
  }, 30_000);

  test('download to non writable', async () => {
    const localPath = '/bin/bash';
    const remote = 'http://localhost:8999/other/sample.xml';
    const retriever = new CommonXmlRetriever(localPath);

    const t = async (): Promise<string> => retriever.download(remote);

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow('Unable to create directory /bin/bash/localhost:8999/other');
  });

  test('download on non operative server', async () => {
    const localPath = buildPath('non-existent');
    pathToClear(localPath);
    const remote = 'http://non-operative.invalid/other/sample.xml';
    const retriever = new CommonXmlRetriever(localPath);

    const destination = retriever.buildPath(remote);

    const t = async (): Promise<string> => retriever.download(remote);

    await expect(t).rejects.toBeInstanceOf(Error);
    await expect(t).rejects.toThrow(`Unable to download ${remote} to ${destination}`);
  });

  test.each([
    ['xml correct', 'http://localhost:8999/other/sample.xml'],
    ['xml without header', 'http://localhost:8999/other/xml-without-header.xml'],
  ])(
    'retrieve xml valid cases %s',
    async (_name: string, remote: string) => {
      const localPath = buildPath('sample');
      pathToClear(localPath);
      const retriever = new CommonXmlRetriever(localPath);
      const response = await retriever.retrieve(remote);

      expect(response).not.toBe('');
    },
    30_000,
  );

  test.each([
    ['xml with just header', 'http://localhost:8999/other/xml-just-header.xml'],
    ['xml malformed', 'http://localhost:8999/other/malformed.xml'],
  ])(
    'retrieve xml with errors %s',
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
    30_000,
  );

  test.each([
    ['scheme://host'],
    ['host/path'],
    ['not-an-url'],
    ['http://localhost:8999/a%00b.xml'],
    ['http://localhost:8999/a\0b.xml'],
  ])('build path with invalid url %s', (url: string) => {
    const retriever = new CommonXmlRetriever('basepath');

    const t = (): string => retriever.buildPath(url);

    expect(t).toThrow(Error);
    expect(t).toThrow(`Invalid URL: ${url}`);
  });

  test('download rejects trailing slash directory url', async () => {
    const localPath = buildPath('trailing_slash');
    pathToClear(localPath);
    const retriever = new CommonXmlRetriever(localPath);
    const url = 'http://localhost:8999/dir/';

    await expect(retriever.download(url)).rejects.toThrow(`Invalid URL: ${url}`);
  });

  test('retrieve with history rewrites cyclic references and returns isolated snapshot', async () => {
    const localPath = buildPath('common');
    pathToClear(localPath);
    const remoteParent = 'http://localhost:8999/other/common/parent.xml';
    const expectedRetrievedFiles = ['parent.xml', 'child.xml', 'recursive-self.xml', 'foo.xml'];

    expect(existsSync(localPath)).toBeFalsy();

    const retriever = new CommonXmlRetriever(localPath);
    const expectedDestination = path.dirname(retriever.buildPath(remoteParent));
    await retriever.retrieve(remoteParent);

    const history = retriever.retrieveHistory();
    expect(Object.values(history)).toHaveLength(expectedRetrievedFiles.length);

    history['http://mutated.invalid/x.xml'] = '/tmp/mutated.xml';
    expect(Object.keys(retriever.retrieveHistory())).toHaveLength(expectedRetrievedFiles.length);

    const retrievedFiles = readdirSync(expectedDestination)
      .filter((file) => file.endsWith('.xml'))
      .map((file) => `${expectedDestination}/${file}`);
    expect(retrievedFiles).toHaveLength(expectedRetrievedFiles.length);

    for (const retrievedFile of retrievedFiles) {
      expect(Object.values(retriever.retrieveHistory())).toContain(retrievedFile);
      expect(expectedRetrievedFiles).toContain(path.basename(retrievedFile));
    }

    const childContent = fileContent(
      retriever.buildPath('http://localhost:8999/other/common/child.xml'),
    );
    expect(childContent).toContain('href="parent.xml"');

    const selfContent = fileContent(
      retriever.buildPath('http://localhost:8999/other/common/recursive-self.xml'),
    );
    expect(selfContent).toContain('href="recursive-self.xml"');
  }, 30_000);

  test('rejects unsafe scheme referenced inside xml', async () => {
    const localPath = buildPath('unsafe_ref');
    pathToClear(localPath);
    const entryUrl = 'http://example.org/entry.xml';
    const fakeDownloader: DownloaderInterface = {
      downloadTo: async (_source, destination) => {
        await writeFile(
          destination,
          '<x:root xmlns:x="http://example.com/ns"><x:resource href="file:///etc/passwd"/></x:root>',
          'utf8',
        );
      },
    };
    const retriever = new CommonXmlRetriever(localPath, fakeDownloader);

    await expect(retriever.retrieve(entryUrl)).rejects.toThrow('Invalid URL: file:///etc/passwd');
  });

  test('resolves root-relative and excessive parent traversal references safely', async () => {
    const localPath = buildPath('relative_refs');
    pathToClear(localPath);
    const files: Record<string, string> = {
      'http://example.org/a/b/root.xml':
        '<x:root xmlns:x="http://example.com/ns"><x:resource href="/shared/one.xml"/><x:resource href="../../../../../../other/two.xml"/></x:root>',
      'http://example.org/shared/one.xml': '<x:root xmlns:x="http://example.com/ns"/>',
      'http://example.org/other/two.xml': '<x:root xmlns:x="http://example.com/ns"/>',
    };
    const fakeDownloader: DownloaderInterface = {
      downloadTo: async (source, destination) => {
        const content = files[source];
        if (!content) {
          throw new Error(`Unexpected URL: ${source}`);
        }
        await writeFile(destination, content, 'utf8');
      },
    };
    const retriever = new CommonXmlRetriever(localPath, fakeDownloader);

    const rootLocal = await retriever.retrieve('http://example.org/a/b/root.xml');
    const rootContent = fileContent(rootLocal);
    expect(rootContent).toContain('href="../../shared/one.xml"');
    expect(rootContent).toContain('href="../../other/two.xml"');
  });

  test('enforces maximum recursion depth limit', async () => {
    const localPath = buildPath('max_depth');
    pathToClear(localPath);

    class ShallowRetriever extends CommonXmlRetriever {
      protected override maxDepth(): number {
        return 1;
      }
    }

    const fakeDownloader: DownloaderInterface = {
      downloadTo: async (source, destination) => {
        const current = Number(/(\d+)\.xml$/.exec(source)?.[1] ?? '0');
        await writeFile(
          destination,
          `<x:root xmlns:x="http://example.com/ns"><x:resource href="n${current + 1}.xml"/></x:root>`,
          'utf8',
        );
      },
    };
    const retriever = new ShallowRetriever(localPath, fakeDownloader);

    await expect(retriever.retrieve('http://example.org/n0.xml')).rejects.toThrow(
      'Maximum recursion depth (1) exceeded',
    );
  });

  test('enforces maximum resource limit', async () => {
    const localPath = buildPath('max_resources');
    pathToClear(localPath);

    class SmallBudgetRetriever extends CommonXmlRetriever {
      protected override maxResources(): number {
        return 2;
      }
    }

    const fakeDownloader: DownloaderInterface = {
      downloadTo: async (source, destination) => {
        if (source.endsWith('entry.xml')) {
          await writeFile(
            destination,
            '<x:root xmlns:x="http://example.com/ns"><x:resource href="a.xml"/><x:resource href="b.xml"/></x:root>',
            'utf8',
          );

          return;
        }
        await writeFile(destination, '<x:root xmlns:x="http://example.com/ns"/>', 'utf8');
      },
    };
    const retriever = new SmallBudgetRetriever(localPath, fakeDownloader);

    await expect(retriever.retrieve('http://example.org/entry.xml')).rejects.toThrow(
      'Maximum resource limit (2) exceeded',
    );
  });
});
