export class Utils {
    public static relativePath(sourceFile: string, destinationFile: string): string {
        let source = Utils.simplifyPath(sourceFile);
        let destination = Utils.simplifyPath(destinationFile);
        if ('' !== source[0] && '' === destination[0]) {
            return destination.join('/');
        }
        // remove the common path
        for (const [depth, dir] of source.entries()) {
            if (destination[depth] !== undefined) {
                if (dir === destination[depth]) {
                    delete destination[depth];
                    delete source[depth];
                } else {
                    break;
                }
            }
        }

        // clear all undefined
        source = source.filter((s) => s !== undefined);
        destination = destination.filter((s) => s !== undefined);

        // add '..' to the beginning of the source as required by the length of from
        const fromLength = source.length;
        for (let i = 0; i < fromLength - 1; i++) {
            destination.unshift('..');
        }

        return destination.join('/');
    }

    /**
     * Simplify a path and return it parts is an array
     *
     * @param path -
     */
    public static simplifyPath(path: string): string[] {
        const parts = path.replace(/\/\//g, '/./').split('/');
        const count = parts.length;
        for (let i = 0; i < count; i = i + 1) {
            // is '..' and previous is not '..'
            if (i > 0 && '..' === parts[i] && '..' !== parts[i - 1]) {
                parts.splice(i - 1, 1);
                parts.splice(i - 1, 1);

                return Utils.simplifyPath(parts.join('/'));
            }
            // is inner '.'
            if ('.' === parts[i]) {
                parts.splice(i, 1);

                return Utils.simplifyPath(parts.join('/'));
            }
        }

        return parts;
    }
}
