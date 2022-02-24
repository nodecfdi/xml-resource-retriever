import { existsSync, readFileSync } from 'fs';

const useTestCase = (): {
    fileContents(filePath: string): string;
    testIf(condition: boolean): jest.It;
} => {
    const fileContents = (filePath: string): string => {
        if (!existsSync(filePath)) {
            return '';
        }
        return readFileSync(filePath, 'binary');
    };

    const testIf = (condition: boolean): jest.It => (condition ? test : test.skip);

    return {
        fileContents,
        testIf,
    };
};
export { useTestCase };
