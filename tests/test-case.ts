import { existsSync, readFileSync } from 'fs';

export class TestCase {
    public static filePath(filename: string): string {
        return `${__dirname}/_files/${filename}`;
    }

    public static fileContents(filename: string): string {
        if (!existsSync(filename)) {
            return '';
        }

        return readFileSync(filename, 'binary');
    }

    public static testIf(condition: boolean): jest.It {
        return condition ? test : test.skip;
    }
}
