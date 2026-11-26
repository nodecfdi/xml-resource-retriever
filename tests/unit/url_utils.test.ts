import { describe, expect, test } from 'vitest';
import {
  assertAllowedHttpUrl,
  parseHttpUrlParts,
  relativeToAbsoluteUrl,
  resolveLocalFilePath,
} from '../../src/utils/url_utils.js';

describe('url utils', () => {
  test('assertAllowedHttpUrl accepts http and https and rejects other protocols', () => {
    expect(assertAllowedHttpUrl('http://example.org/a.xml').protocol).toBe('http:');
    expect(assertAllowedHttpUrl('https://example.org/a.xml').protocol).toBe('https:');
    expect(() => assertAllowedHttpUrl('ftp://example.org/a.xml')).toThrow(
      'Unsupported URL protocol: ftp:',
    );
  });

  test('parseHttpUrlParts parses valid http/https urls and rejects invalid ones', () => {
    expect(parseHttpUrlParts('https://example.org:8443/xsd/doc.xsd')).toStrictEqual({
      scheme: 'https:',
      host: 'example.org:8443',
      port: '8443',
      path: '/xsd/doc.xsd',
    });
    expect(parseHttpUrlParts('http://example.org/a\0b.xml')).toBeUndefined();
    expect(parseHttpUrlParts('http://example.org/a%00b.xml')).toBeUndefined();
    expect(parseHttpUrlParts('file:///etc/passwd')).toBeUndefined();
    expect(parseHttpUrlParts('not-an-url')).toBeUndefined();
  });

  test('resolveLocalFilePath handles root basePath and rejects path escapes', () => {
    expect(resolveLocalFilePath('/', 'http://example.org/a/file.xml')).toBe(
      '/example.org/a/file.xml',
    );
    expect(resolveLocalFilePath('/tmp/base/', 'http://example.org/a/file.xml')).toBe(
      '/tmp/base/example.org/a/file.xml',
    );
    expect(() => resolveLocalFilePath('/tmp/base', 'http://../escape.xml')).toThrow(
      'Invalid URL: http://../escape.xml',
    );
    expect(() => resolveLocalFilePath('/tmp/base', 'http://.')).toThrow(
      'Invalid URL: http://.',
    );
  });

  test.each([
    [
      'absolute url unchanged',
      'https://other.example.org/schema.xsd',
      'http://example.org/a/b.xml',
      'https://other.example.org/schema.xsd',
    ],
    [
      'protocol-relative url',
      '//cdn.example.org/schema.xsd',
      'https://example.org/a/b.xml',
      'https://cdn.example.org/schema.xsd',
    ],
    [
      'triple slash normalizes path',
      '///shared//schema.xsd',
      'https://example.org/a/b.xml',
      'https://example.org/shared/schema.xsd',
    ],
    [
      'preserves query and hash while normalizing path slashes',
      'dir//file.xml?ref=a//b#sec//1',
      'http://example.org/base/doc.xml',
      'http://example.org/base/dir/file.xml?ref=a//b#sec//1',
    ],
    [
      'preserves hash only while normalizing path slashes',
      'dir//file.xml#frag//1',
      'http://example.org/base/doc.xml',
      'http://example.org/base/dir/file.xml#frag//1',
    ],
  ])(
    'relativeToAbsoluteUrl %s',
    (_name: string, url: string, currentUrl: string, expected: string) => {
      expect(relativeToAbsoluteUrl(url, currentUrl)).toBe(expected);
    },
  );
});
