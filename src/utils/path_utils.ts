export const simplifyPath = (inputPath: string): string[] => {
  const rawParts = inputPath.split('/');
  const stack: string[] = [];

  for (const [index, segment] of rawParts.entries()) {
    if (segment === '.') {
      continue;
    }

    if (segment === '') {
      if (index === 0 || (index === rawParts.length - 1 && stack.length > 0)) {
        stack.push('');
      }
      continue;
    }

    if (segment === '..') {
      if (stack.length === 1 && stack[0] === '') {
        continue;
      }

      if (stack.length > 0 && stack.at(-1) !== '..') {
        stack.pop();
      } else {
        stack.push('..');
      }
      continue;
    }

    stack.push(segment);
  }

  return stack.length === 0 ? [''] : stack;
};

export const relativePath = (sourceFile: string, destinationFile: string): string => {
  const source = simplifyPath(sourceFile);
  const destination = simplifyPath(destinationFile);

  if (source[0] !== '' && destination[0] === '') {
    return destination.join('/');
  }

  let commonDepth = 0;
  while (
    commonDepth < source.length - 1
    && commonDepth < destination.length - 1
    && source[commonDepth] === destination[commonDepth]
  ) {
    commonDepth += 1;
  }

  const upLevels = Math.max(0, source.length - 1 - commonDepth);

  return [...Array.from({ length: upLevels }, () => '..'), ...destination.slice(commonDepth)].join(
    '/',
  );
};
