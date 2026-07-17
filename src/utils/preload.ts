/**
 * Preloads an image and resolves when fully decoded.
 * Resolves immediately if already cached. Never rejects.
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // resolve anyway — never block the UX
    img.src = src;
    if (img.complete) resolve(); // cached
  });
}

/** Preloads all images for a set of srcs. Never rejects. */
export function preloadImages(srcs: string[]): Promise<void> {
  return Promise.all(srcs.map(preloadImage)).then(() => undefined);
}
