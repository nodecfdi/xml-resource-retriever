import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Get filename for a given file path URL
 */
export const getFilename = (url: string | URL): string => {
  return fileURLToPath(url);
};

/**
 * Get dirname for a given file path URL
 */
export const getDirname = (url: string | URL): string => {
  return path.dirname(getFilename(url));
};

export const filePath = (file: string): string =>
  path.join(getDirname(import.meta.url), '_files', file);

export const buildPath = (file: string): string =>
  path.join(getDirname(import.meta.url), '_build', file);

export const publicPath = (file: string): string =>
  path.join(getDirname(import.meta.url), 'public', file);

export const fileContent = (file: string): string => {
  if (!existsSync(file)) {
    return '';
  }

  return readFileSync(file).toString();
};

export const fileContents = (append: string): string => fileContent(filePath(append));

export const deleteDirectory = async (dirname: string): Promise<void> =>
  new Promise<void>((resolve) => {
    if (!existsSync(dirname)) {
      resolve();

      return;
    }

    const stat = statSync(dirname);
    if (!stat.isDirectory()) {
      resolve();

      return;
    }

    rmSync(dirname, { recursive: true, force: true });

    resolve();
  });
