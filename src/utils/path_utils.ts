export const simplifyPath = (path: string): string[] => {
  const parts = path.replaceAll('//', '/./').split('/');
  const count = parts.length;
  for (let index = 0; index < count; index += 1) {
    // Is '..' and previous is not '..'
    if (index > 0 && parts[index] === '..' && parts[index - 1] !== '..') {
      parts.splice(index - 1, 1);
      parts.splice(index - 1, 1);

      return simplifyPath(parts.join('/'));
    }

    // Is inner '.'
    if (parts[index] === '.') {
      parts.splice(index, 1);

      return simplifyPath(parts.join('/'));
    }
  }

  return parts;
};

export const relativePath = (sourceFile: string, destinationFile: string): string => {
  let source: (string | undefined)[] = simplifyPath(sourceFile);
  let destination: (string | undefined)[] = simplifyPath(destinationFile);
  if (source[0] !== '' && destination[0] === '') {
    return destination.join('/');
  }

  // Remove the common path
  for (const [depth, directory] of source.entries()) {
    if (directory === destination[depth]) {
      destination[depth] = undefined;
      source[depth] = undefined;
    } else {
      break;
    }
  }

  // Clear all undefined
  source = source.filter((s) => s !== undefined);
  destination = destination.filter((s) => s !== undefined);

  // Add '..' to the beginning of the source as required by the length of from
  const fromLength = source.length;
  for (let index = 0; index < fromLength - 1; index += 1) {
    destination.unshift('..');
  }

  return destination.join('/');
};
