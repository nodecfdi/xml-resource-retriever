import { deleteDirectory, rawBuildPath } from './test_utils.js';

const useRetriever = () => {
  let selectedPathToClear = '';

  const pathToClear = (path = ''): string => {
    if (path === '') {
      return selectedPathToClear;
    }

    if (path.indexOf(rawBuildPath(''))) {
      throw new Error('Unable to set a path to clear that is not in the build path');
    }

    const previousPath = selectedPathToClear;
    selectedPathToClear = path;

    return previousPath;
  };

  // eslint-disable-next-line vitest/require-top-level-describe
  afterEach(async () => {
    if (pathToClear() !== '') {
      await deleteDirectory(pathToClear());
    }
  });

  return {
    pathToClear,
  };
};

export default useRetriever;
