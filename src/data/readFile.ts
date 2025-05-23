import { ValidFile } from './fileValidator';
import { decompressGzip } from './decompressGzip';

/**
 * Turn a validated File into a UTF-8 string ready for JSON parsing.
 *
 * The file is read as an `ArrayBuffer` using the DOM `FileReader` API. If the
 * provided {@link ValidFile} indicates a gzipped file, the buffer is inflated
 * via {@link decompressGzip}. Otherwise the buffer is decoded directly
 * with `TextDecoder('utf-8')`. Any read or decompression failure rejects the
 * returned promise with an `Error`.
 *
 * @param vf - File that has passed `validateFile`; also carries the gzip flag.
 * @returns Plain text contents of the file.
 * @throws Error if the browser fails to read the file or if decompression
 * throws.
 *
 * @dependency {@link decompressGzip}
 * @consumers `dispatchToWorker.ts`, `StaticFileProvider.tsx`
 */
export async function readFileContent(vf: ValidFile): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const buffer = reader.result as ArrayBuffer;
      try {
        if (vf.isGzipped) {
          const text = await decompressGzip(buffer);
          resolve(text);
        } else {
          const text = new TextDecoder('utf-8').decode(buffer);
          resolve(text);
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    reader.onerror = () => {
      reject(new Error(`File read error: ${reader.error?.message}`));
    };

    reader.readAsArrayBuffer(vf.file);
  });
}
