import { describe, beforeEach, it, expect, vi } from 'vitest';
import { bus } from '../src/services/eventBus';
import { registerEventListeners } from '../src/services/eventListeners';
import { useMetricsSlice } from '../src/state/metricsSlice';

const sampleSnapshot = {
  id: 'snap1',
  fileName: 'file.json',
  ingestionTimestamp: 0,
  resources: [],
};

let cleanup: () => void;

describe('event listener integration', () => {
  beforeEach(() => {
    if (cleanup) cleanup();
    useMetricsSlice.setState({
      snapshots: {},
      snapshotOrder: [],
      loading: {},
      progress: {},
      errors: {},
      taskMap: {},
    });
    
    // Mock crypto.randomUUID for consistent task IDs
    const originalCrypto = global.crypto;
    vi.stubGlobal('crypto', {
      ...originalCrypto,
      randomUUID: vi.fn().mockReturnValue('test-task-id')
    });
    
    cleanup = registerEventListeners();
  });

  it('adds snapshot on loaded event', () => {
    bus.emit('data.snapshot.loaded', { snapshot: sampleSnapshot });
    expect(useMetricsSlice.getState().snapshots['snap1']).toEqual(sampleSnapshot);
  });

  it('tracks loading files', () => {
    bus.emit('data.snapshot.load.start', { fileName: 'foo.json', fileSize: 1000 });
    expect(useMetricsSlice.getState().loading['foo.json']).toBe(true);
  });

  it('records errors', () => {
    bus.emit('data.snapshot.error', { fileName: 'bar.json', error: 'oops' });
    expect(useMetricsSlice.getState().errors['bar.json'].message).toBe('oops');
  });
});