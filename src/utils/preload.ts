const preloadedCache = new Set<string>();

/**
 * Preloads an image and resolves when fully decoded off the main UI thread.
 * Resolves immediately if already cached. Never rejects.
 */
export function preloadImage(src: string): Promise<void> {
  if (!src || preloadedCache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    preloadedCache.add(src);
    const img = new Image();
    img.decoding = "async";

    const done = () => {
      resolve();
    };

    img.onload = done;
    img.onerror = done; // Never block UX on missing image asset
    img.src = src;

    if (img.complete) {
      done();
    }
  });
}

/** Preloads a batch of images sequentially or in parallel batches. Never rejects. */
export function preloadImages(srcs: string[]): Promise<void> {
  if (!srcs || srcs.length === 0) return Promise.resolve();
  return Promise.all(srcs.map(preloadImage)).then(() => undefined);
}
