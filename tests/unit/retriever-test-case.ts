import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { sync } from 'rimraf';

const useRetrieverTestCase = (): {
    pathToClear(path: string): string;
    buildPath(path: string): string;
    publicPath(path: string): string;
    assetPath(path: string): string;
} => {
    let _pathToClear = '';

    afterEach(() => {
        if ('' !== pathToClear()) {
            deleteDir(pathToClear());
        }
    });

    function pathToClear(path = ''): string {
        if ('' == path) {
            return _pathToClear;
        }
        if (path.indexOf(buildPath(''))) {
            throw new Error('Unable to set a path to clear that is not in the build path');
        }
        const previousPath = _pathToClear;
        _pathToClear = path;
        return previousPath;
    }

    function buildPath(path: string): string {
        return join(__dirname, '..', '..', 'build', 'tests', path);
    }

    function publicPath(path: string): string {
        return join(__dirname, '..', 'public', path);
    }

    function assetPath(path: string): string {
        return join(__dirname, '..', 'assets', path);
    }

    function deleteDir(dirname: string): void {
        if (!existsSync(dirname)) return;
        const stat = statSync(dirname);
        if (!stat.isDirectory()) return;
        sync(dirname);
    }

    return {
        buildPath,
        pathToClear,
        publicPath,
        assetPath,
    };
};

export { useRetrieverTestCase };
