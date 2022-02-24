import { Utils } from '../../src';

describe('Utils.relativePath', () => {
    test.each([
        ['absolutes', '/h/u/schemas/structs/foo.xml', '/h/u/schemas/entity/money.xml', '../entity/money.xml'],
        ['relative 0 up', 'a1/a2/a3', 'a1/a2/b1', 'b1'],
        ['relative 1 up', 'a1/a2/a3', 'a1/b1', '../b1'],
        ['relative 2 up', 'a1/a2/a3', 'b1', '../../b1'],
        ['both absolute', '/foo/bar/baz', '/root', '../../root'],
        ['both relative', 'foo/bar/baz', 'root', '../../root'],
        ['absolute to relative', '/foo/bar/baz', 'root', '../../../root'],
        ['relative to absolute', 'foo/bar/baz', '/root', '/root'],
    ])('expected behaviour %s', (name: string, source: string, destination: string, expected: string) => {
        expect(Utils.relativePath(source, destination)).toBe(expected);
    });
});
