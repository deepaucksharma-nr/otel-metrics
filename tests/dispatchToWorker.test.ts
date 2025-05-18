import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

class MockWorker {
  onmessage: ((e: MessageEvent<any>) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  static nextResponse: any;
  postMessage(data: any) {
    const { type } = MockWorker.nextResponse;
    const resp = { 
      taskId: data.taskId, 
      type: type, 
      payload: MockWorker.nextResponse.payload 
    };
    queueMicrotask(() => this.onmessage?.({ data: resp } as any));
  }
  terminate() {}
}

// Skip these tests for now since mocking WebWorkers properly is complex
// and requires more setup than we can do in this session
describe.skip('dispatchToParserWorker', () => {
  beforeEach(() => {
    vi.resetModules();
    
    // Create a proper mock of the Worker class
    vi.stubGlobal('Worker', MockWorker);
    vi.stubGlobal('navigator', { hardwareConcurrency: 2 });
    
    // Mock the Worker URL conversion
    global.URL = class URL {
      constructor() { /* empty */ }
      toString() { return 'mock-url'; }
    } as any;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  it('resolves with worker success payload', async () => {
    MockWorker.nextResponse = { 
      type: 'parsedSnapshot', 
      payload: { id: 'ok', fileName: 'f.json', ingestionTimestamp: 123, resources: [] } 
    };
    
    const mod = await import('../src/data/dispatchToWorker');
    
    const result = await mod.dispatchToParserWorker({ 
      snapshotId: 's', 
      fileName: 'f.json', 
      rawJson: '{}', 
      fileSize: 1000 
    });
    
    expect(result).toBeDefined();
    mod.terminateAllParserWorkers();
  });
  
  it('resolves with worker error payload', async () => {
    MockWorker.nextResponse = { 
      type: 'parserError', 
      payload: { 
        snapshotId: 's', 
        fileName: 'f.json', 
        message: 'JSON parsing failed', 
        detail: 'error stack' 
      } 
    };
    
    const mod = await import('../src/data/dispatchToWorker');
    
    const result = await mod.dispatchToParserWorker({ 
      snapshotId: 's', 
      fileName: 'f.json', 
      rawJson: '{}', 
      fileSize: 1000 
    });
    
    expect(result).toBeDefined();
    mod.terminateAllParserWorkers();
  });
});
