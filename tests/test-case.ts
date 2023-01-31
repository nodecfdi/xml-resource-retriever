import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const useTestCase = (): {
    filePath: (filename: string) => string;
    fileContents: (filename: string) => string;
} => {
    const filePath = (filename: string): string => join(dirname(fileURLToPath(import.meta.url)), '_files', filename);
    const fileContents = (filename: string): string => {
        if (!existsSync(filename)) {
            return '';
        }

        return readFileSync(filename, 'binary');
    };

    return {
        filePath,
        fileContents
    };
};

export { useTestCase };
