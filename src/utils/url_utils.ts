import type { UrlParts } from '../types.js';
import path from 'node:path';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export const assertAllowedHttpUrl = (rawUrl: string): URL => {
  const parsed = new URL(rawUrl);
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  }

  return parsed;
};

export const parseHttpUrlParts = (url: string): UrlParts | undefined => {
  if (url.includes('\0') || url.includes('%00')) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol) || parsed.hostname === '') {
      return undefined;
    }

    return {
      scheme: parsed.protocol,
      host: parsed.host,
      port: parsed.port,
      path: parsed.pathname,
    };
  } catch {
    return undefined;
  }
};

export const resolveLocalFilePath = (basePath: string, url: string): string => {
  const parts = parseHttpUrlParts(url);
  if (!parts) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/+$/, '');
  const localPath = `${normalizedBase}/${parts.host}${parts.path}`;

  const resolvedBase = path.resolve(basePath);
  const resolvedTarget = path.resolve(localPath);
  const relative = path.relative(resolvedBase, resolvedTarget);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  return localPath;
};

export const relativeToAbsoluteUrl = (url: string, currentUrl: string): string => {
  if (/^[a-z][a-z\d+\-.]*:/i.test(url)) {
    return url;
  }

  if (url.startsWith('//') && !url.startsWith('///')) {
    return new URL(url, currentUrl).href;
  }

  const queryOrHashIndex = url.search(/[?#]/);
  const pathPart = queryOrHashIndex === -1 ? url : url.slice(0, queryOrHashIndex);
  const suffix = queryOrHashIndex === -1 ? '' : url.slice(queryOrHashIndex);
  const normalizedPath = pathPart.replaceAll(/\/{2,}/g, '/');

  return new URL(`${normalizedPath}${suffix}`, currentUrl).href;
};
