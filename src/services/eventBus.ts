import mitt from 'mitt';
import type { ParsedSnapshot, SeriesKey } from '@intellimetric/contracts/types';

/**
 * Map of all events that can be emitted on the global {@link bus} instance.
 *
 * Consumers should subscribe to the events relevant to their domain and emit
 * new events as state changes occur. This decouples data providers, workers
 * and UI components by removing direct imports between layers.
 */
export type EventMap = {
  /**
   * A file is being processed.
   *
   * Emitted by the StaticFileProvider when it begins reading a file.
   */
  'data.snapshot.loading': { fileId: string; fileName: string };

  /**
   * A snapshot has been parsed and is ready for use.
   *
   * Typically emitted by the parser worker once parsing succeeds.
   */
  'data.snapshot.loaded': { snapshot: ParsedSnapshot };

  /**
   * Reports any error that occurred during snapshot processing.
   */
  'data.snapshot.error': { fileName: string; error: string; detail?: string };

  /**
   * A file load operation has started.
   */
  'data.snapshot.load.start': { fileName: string; fileSize: number };
  
  /**
   * Progress update for a file being processed.
   */
  'data.snapshot.load.progress': { 
    taskId: string;
    fileName: string;
    progress: number; // 0-100 percentage
    stage: 'parsing' | 'mapping' | 'processing' 
  };
  
  /**
   * A file load operation has been canceled.
   */
  'data.snapshot.load.cancel': { fileName: string; taskId: string };

  /**
   * A metric widget is requesting to inspect a specific metric.
   */
  'ui.metric.inspect': { metricName: string; snapshotId: string };

  /** Open the data point inspector drawer. */
  'ui.inspector.open': {
    snapshotId: string;
    metricName: string;
    seriesKey: SeriesKey;
    pointId: number;
  };

  /** Close the data point inspector drawer. */
  'ui.inspector.close': void;

  /** Toggle attribute drop simulation for cardinality analysis. */
  'ui.cardinality.simulateDrop': { key: string; drop: boolean };

  /**
   * Clear all application state.
   */
  'app.reset': void;
};

/**
 * Global mitt-based event channel for decoupled communication.
 *
 * The bus is a singleton that should be imported wherever cross-layer
 * communication is required. Use `bus.on` to listen for events and
 * `bus.emit` to broadcast new events.
 */
export const bus = mitt<EventMap>();

/**
 * The type of the exported {@link bus} instance.
 */
export type EventBus = typeof bus;