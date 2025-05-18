import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { randomId } from '../src/utils/randomId';

describe('randomId', () => {
  let originalCrypto: Crypto;

  beforeEach(() => {
    originalCrypto = globalThis.crypto;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true
    });
  });

  it('uses crypto.randomUUID when available', () => {
    const mock = vi.fn().mockReturnValue('abc-123');
    
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: mock,
        getRandomValues: originalCrypto?.getRandomValues
      },
      writable: true,
      configurable: true
    });

    const id = randomId();
    expect(id).toBe('abc-123');
    expect(mock).toHaveBeenCalled();
  });

  it('falls back when randomUUID is missing', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: vi.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i % 256;
          }
        })
      },
      writable: true,
      configurable: true
    });

    const id = randomId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});