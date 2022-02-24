import { Utils } from '../../src';

describe('Utils.simplifyPath', () => {
    test.each([
        ['a/b/c/d/e', ['a', 'b', 'c', 'd', 'e']],
        ['/a/b/c/d/e', ['', 'a', 'b', 'c', 'd', 'e']],
        ['/a/b/c/x/../d', ['', 'a', 'b', 'c', 'd']],
        ['/a/b/c/d/e/..', ['', 'a', 'b', 'c', 'd']],
        ['a///b', ['a', 'b']],
        ['a/./b', ['a', 'b']],
        ['./a/b/c', ['a', 'b', 'c']],
        ['./a///./../b/c', ['b', 'c']],
        ['x/./././.', ['x']],
        ['../../../x', ['..', '..', '..', 'x']],
        ['x', ['x']],
        ['', ['']],
        ['.', ['']],
        ['/', ['', '']],
        ['./', ['']],
        ['./.', ['']],
    ])('expected behavior %s', (source: string, expected: string[]) => {
        expect(Utils.simplifyPath(source)).toStrictEqual(expected);
    });
});
