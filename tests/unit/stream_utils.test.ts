import { Buffer } from 'node:buffer';
import { describe, expect, test, vi } from 'vitest';
import {
  buildAbortSignal,
  createByteLimitTransform,
  validateNonNegativeFinite,
} from '../../src/utils/stream_utils.js';

describe('stream utils', () => {
  test('validateNonNegativeFinite returns valid values and rejects invalid ones', () => {
    expect(validateNonNegativeFinite(0, 'timeoutMs')).toBe(0);
    expect(validateNonNegativeFinite(100, 'maxBytes')).toBe(100);
    expect(() => validateNonNegativeFinite(-1, 'timeoutMs')).toThrow(RangeError);
    expect(() => validateNonNegativeFinite(NaN, 'timeoutMs')).toThrow(RangeError);
    expect(() => validateNonNegativeFinite(Infinity, 'maxBytes')).toThrow(
      RangeError,
    );
  });

  test('createByteLimitTransform enforces byte limit for Uint8Array and string chunks', () => {
    const withinLimitTransform = createByteLimitTransform(4);
    const passCallback = vi.fn();
    withinLimitTransform._transform('áé', 'utf8', passCallback);
    expect(passCallback).toHaveBeenCalledWith(null, 'áé');

    const stringExceedTransform = createByteLimitTransform(3);
    const stringFailCallback = vi.fn();
    stringExceedTransform._transform('áé', 'utf8', stringFailCallback);
    expect(stringFailCallback).toHaveBeenCalledWith(
      new Error('Response exceeded maximum allowed size of 3 bytes'),
    );

    const bufferTransform = createByteLimitTransform(4);
    const bufferPassCallback = vi.fn();
    const bufferFailCallback = vi.fn();
    const chunk = Buffer.from([1, 2, 3]);
    bufferTransform._transform(chunk, 'utf8', bufferPassCallback);
    expect(bufferPassCallback).toHaveBeenCalledWith(null, chunk);
    bufferTransform._transform(new Uint8Array(2), 'utf8', bufferFailCallback);
    expect(bufferFailCallback).toHaveBeenCalledWith(
      new Error('Response exceeded maximum allowed size of 4 bytes'),
    );
  });

  test('buildAbortSignal handles all combinations of timeoutMs and userSignal', () => {
    expect(buildAbortSignal(0)).toBeUndefined();

    const timeoutOnly = buildAbortSignal(1000);
    expect(timeoutOnly).toBeInstanceOf(AbortSignal);

    const controller = new AbortController();
    expect(buildAbortSignal(0, controller.signal)).toBe(controller.signal);

    const combined = buildAbortSignal(1000, controller.signal);
    expect(combined).toBeInstanceOf(AbortSignal);
    expect(combined).not.toBe(controller.signal);
    controller.abort('user cancelled');
    expect(combined?.aborted).toBe(true);
    expect(combined?.reason).toBe('user cancelled');
  });
});
