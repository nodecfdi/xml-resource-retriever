import { dirname, join } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import rimraf from 'rimraf';
import { fileURLToPath } from 'node:url';

const useRetrieverTestCase = (): {
    pathToClear(path: string): string;
    buildPath(path: string): string;
    publicPath(path: string): string;
    assetPath(path: string): string;
} => {
    let _pathToClear = '';

    afterEach(async () => {
        if (pathToClear() !== '') {
            await deleteDirectory(pathToClear());
        }
    });

    function pathToClear(path = ''): string {
        if (path === '') {
            return _pathToClear;
        }

        if (path.indexOf(buildPath(''))) {
            throw new Error('Unable to set a path to clear that is not in the build path');
        }

        const previousPath = _pathToClear;
        _pathToClear = path;

        return previousPath;
    }

    const buildPath = (path: string): string =>
        join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'tests', '_build', path);

    const publicPath = (path: string): string => join(dirname(fileURLToPath(import.meta.url)), '..', 'public', path);

    const assetPath = (path: string): string => join(dirname(fileURLToPath(import.meta.url)), '..', '_files', path);

    const deleteDirectory = async (dirname: string): Promise<void> =>
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
            return rimraf(dirname)
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });

    return {
        buildPath,
        pathToClear,
        publicPath,
        assetPath
    };
};

export { useRetrieverTestCase };
