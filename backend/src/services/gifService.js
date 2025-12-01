import gifFrames from 'gif-frames';
import { unlinkSync, readFileSync, createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extract a specific frame from a GIF URL
 * @param {string} gifUrl - URL of the GIF
 * @param {number} frameIndex - Index of frame to extract (0 for first, -1 for last)
 * @returns {Promise<Buffer>} - Image buffer of the extracted frame
 */
export async function extractGifFrame(gifUrl, frameIndex = 0) {
  let tempGifPath = null;
  let tempFramePath = null;

  try {
    // Download the GIF to a temporary file
    const response = await fetch(gifUrl);
    if (!response.ok) {
      throw new Error(`Failed to download GIF: ${response.status}`);
    }

    const gifBuffer = await response.arrayBuffer();
    tempGifPath = join(tmpdir(), `gif_${Date.now()}_${Math.random().toString(36).substring(7)}.gif`);
    
    // Write GIF to temp file
    const fs = await import('fs/promises');
    await fs.writeFile(tempGifPath, Buffer.from(gifBuffer));

    // Extract frames
    const frameData = await gifFrames({
      url: tempGifPath,
      frames: 'all',
      outputType: 'png',
      cumulative: false
    });

    // Determine which frame to use
    let targetFrameIndex;
    if (frameIndex === -1 || frameIndex === 1) {
      // For "end" position, use a frame from the middle of the animation
      // This is typically where the peak contraction/end position happens
      // Most exercise GIFs show: start -> contraction -> return to start
      // So we want the middle frame where the peak contraction is
      if (frameData.length <= 2) {
        // If only 1-2 frames, use the last one
        targetFrameIndex = frameData.length - 1;
      } else {
        // Use frame at ~60% through the animation for peak contraction
        // This avoids the return-to-start frame at the end
        const peakFrame = Math.floor(frameData.length * 0.6);
        targetFrameIndex = Math.max(1, Math.min(peakFrame, frameData.length - 2));
      }
    } else {
      // First frame (or specific index)
      targetFrameIndex = Math.min(frameIndex, frameData.length - 1);
    }
    
    console.log(`Extracting frame ${targetFrameIndex} of ${frameData.length} (requested: ${frameIndex})`);

    const frame = frameData[targetFrameIndex];
    
    // Get the frame image - gif-frames returns frames with getImage() method that returns a stream
    const frameImageStream = frame.getImage();
    
    // Write the stream to a temporary file, then read it as a buffer
    tempFramePath = join(tmpdir(), `frame_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);
    const writeStream = createWriteStream(tempFramePath);
    
    // Pipe the stream to the file
    await pipeline(frameImageStream, writeStream);
    
    // Read the frame buffer from the temp file
    const frameBuffer = readFileSync(tempFramePath);
    
    // Clean up temp frame files
    frameData.forEach(f => {
      try {
        // Frames might have temp files created by gif-frames
        // We'll clean up our own temp file separately
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    return frameBuffer;
  } catch (error) {
    console.error('Error extracting GIF frame:', error);
    throw error;
  } finally {
    // Clean up temp files
    if (tempGifPath) {
      try {
        unlinkSync(tempGifPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    if (tempFramePath) {
      try {
        unlinkSync(tempFramePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

