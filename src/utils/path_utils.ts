const pushParentSegment = (stack: string[]): void => {
  if (stack.length === 1 && stack[0] === '') {
    return;
  }

  if (stack.length > 0 && stack.at(-1) !== '..') {
    stack.pop();

    return;
  }

  stack.push('..');
};

const appendPathSegment = (
  stack: string[],
  segment: string,
  index: number,
  lastIndex: number,
): void => {
  if (segment === '.') {
    return;
  }

  if (segment === '') {
    if (index === 0 || (index === lastIndex && stack.length > 0)) {
      stack.push('');
    }

    return;
  }

  if (segment === '..') {
    pushParentSegment(stack);

    return;
  }

  stack.push(segment);
};

export const simplifyPath = (inputPath: string): string[] => {
  const rawParts = inputPath.split('/');
  const lastIndex = rawParts.length - 1;
  const stack: string[] = [];

  for (const [index, segment] of rawParts.entries()) {
    appendPathSegment(stack, segment, index, lastIndex);
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
