import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface GifFrameExtractorProps {
  gifUrl: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  frameIndex?: number; // 0 for first frame, 1 for last frame
}

/**
 * Component that extracts a specific frame from a GIF using the backend API
 * For print view, we'll use this to show first and last frames
 */
export default function GifFrameExtractor({
  gifUrl,
  alt,
  className,
  style,
  frameIndex = 0
}: GifFrameExtractorProps) {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const extractFrame = async () => {
      try {
        setLoading(true);
        console.log(`Extracting frame ${frameIndex} from GIF: ${gifUrl}`);
        // Call backend endpoint to extract frame
        const frameParam = frameIndex === 1 ? '1' : '0';
        // Add cache-busting parameter to ensure we get fresh frames
        const cacheBuster = Date.now();
        const apiUrl = `${API_BASE_URL}/api/gif/frame?url=${encodeURIComponent(gifUrl)}&frame=${frameParam}&_t=${cacheBuster}`;
        console.log(`Calling API: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Frame extraction failed: ${response.status}`, errorText);
          throw new Error(`Failed to extract frame: ${response.status} ${errorText}`);
        }

        // Check if response is actually an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          const errorText = await response.text();
          console.error('Response is not an image:', contentType, errorText);
          throw new Error('Response is not an image');
        }

        // Convert response to blob URL
        const blob = await response.blob();
        console.log(`Frame extracted successfully, blob size: ${blob.size}`);
        const blobUrl = URL.createObjectURL(blob);
        setFrameUrl(blobUrl);
      } catch (error) {
        console.error('Error extracting GIF frame:', error);
        // Fallback to original GIF URL
        setFrameUrl(gifUrl);
      } finally {
        setLoading(false);
      }
    };

    extractFrame();

    // Cleanup blob URL on unmount
    return () => {
      if (frameUrl && frameUrl.startsWith('blob:')) {
        URL.revokeObjectURL(frameUrl);
      }
    };
  }, [gifUrl, frameIndex]);

  // Show loading state or extracted frame
  if (loading) {
    return (
      <div className={className} style={style}>
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-500">Loading frame...</span>
        </div>
      </div>
    );
  }

  if (frameUrl) {
    return (
      <img
        src={frameUrl}
        alt={alt}
        className={className}
        style={style}
        onError={(e) => {
          // Fallback to original GIF if extraction fails
          (e.target as HTMLImageElement).src = gifUrl;
        }}
      />
    );
  }

  // Fallback to original GIF
  return (
    <img
      src={gifUrl}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

