import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rimraf } from 'rimraf';

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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  new Promise<void>((resolve, reject) => {
    if (!existsSync(dirname)) {
      resolve();

      return;
    }

    const stat = statSync(dirname);
    if (!stat.isDirectory()) {
      resolve();

      return;
    }

    // eslint-disable-next-line no-promise-executor-return
    return (
      rimraf(dirname)
        // eslint-disable-next-line promise/always-return, promise/prefer-await-to-then
        .then(() => {
          resolve();
        })
        // eslint-disable-next-line promise/prefer-await-to-then
        .catch((error: unknown) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(error);
        })
    );
  });
