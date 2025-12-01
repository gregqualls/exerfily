/**
 * Utility functions for handling GIF images
 */

/**
 * Check if a URL points to a GIF image
 */
export function isGifUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.gif') || lowerUrl.includes('.gif?') || lowerUrl.includes('gif');
}

/**
 * Extract two frames from a GIF (first and last frame)
 * Returns an array of two image data URLs or null if extraction fails
 */
export async function extractGifFrames(gifUrl: string): Promise<string[] | null> {
  try {
    // Load the GIF as an image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = gifUrl;
    });

    // Create a canvas to extract frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = img.width;
    canvas.height = img.height;

    // For GIFs, we'll try to extract frames by drawing the image at different times
    // However, since we can't easily extract frames from animated GIFs in the browser,
    // we'll use a workaround: create two canvas elements and draw the image
    // The first frame is just the initial state, the last frame we'll approximate
    
    const frames: string[] = [];
    
    // First frame - just draw the image normally
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    frames.push(canvas.toDataURL('image/png'));

    // For the "last" frame, we'll use the same image but this is a limitation
    // In a real implementation, you'd need a GIF parser library or server-side processing
    // For now, we'll duplicate the first frame as a placeholder
    // TODO: Implement proper GIF frame extraction using a library or backend service
    frames.push(canvas.toDataURL('image/png'));

    return frames;
  } catch (error) {
    console.error('Error extracting GIF frames:', error);
    return null;
  }
}

/**
 * Generate frame URLs from a GIF URL
 * This is a simpler approach that works with services that can extract frames
 */
export function getGifFrameUrls(gifUrl: string, _frameIndices: number[] = [0, -1]): string[] {
  // For ExerciseDB GIFs, we can try to extract frames using a service
  // Or we can use the GIF URL directly and let the browser handle it
  // For now, return the original URL twice as a fallback
  return [gifUrl, gifUrl];
}

/**
 * Check if we should split a GIF into two frames for display
 */
export function shouldSplitGif(url: string): boolean {
  return isGifUrl(url);
}

