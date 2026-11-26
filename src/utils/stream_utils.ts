import { Buffer } from 'node:buffer';
import { Transform } from 'node:stream';

export const validateNonNegativeFinite = (value: number, name: string): number => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number`);
  }

  return value;
};

export const createByteLimitTransform = (maxBytes: number): Transform => {
  let receivedBytes = 0;

  return new Transform({
    transform(chunk: Buffer | Uint8Array | string, _encoding, callback): void {
      const chunkLength = typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.byteLength;
      receivedBytes += chunkLength;
      if (receivedBytes > maxBytes) {
        callback(new Error(`Response exceeded maximum allowed size of ${maxBytes} bytes`));

        return;
      }

      callback(null, chunk);
    },
  });
};

export const buildAbortSignal = (
  timeoutMs: number,
  userSignal?: AbortSignal | null,
): AbortSignal | undefined => {
  const timeoutSignal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;

  if (userSignal && timeoutSignal) {
    return AbortSignal.any([userSignal, timeoutSignal]);
  }

  return userSignal ?? timeoutSignal;
};
