import { afterEach } from 'vitest';
import { deleteDirectory, rawBuildPath } from './test_utils.js';

export const useRetriever = (): { pathToClear: (path?: string) => string } => {
  let selectedPathToClear = '';

  const pathToClear = (targetPath = ''): string => {
    if (targetPath === '') {
      return selectedPathToClear;
    }

    if (!targetPath.startsWith(rawBuildPath(''))) {
      throw new Error('Unable to set a path to clear that is not in the build path');
    }

    const previousPath = selectedPathToClear;
    selectedPathToClear = targetPath;

    return previousPath;
  };

  afterEach(async () => {
    if (pathToClear() !== '') {
      await deleteDirectory(pathToClear());
    }
  });

  return {
    pathToClear,
  };
};
