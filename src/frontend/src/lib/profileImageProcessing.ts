/**
 * Client-side image processing utility for profile photos.
 * Resizes images to max 512x512 while maintaining aspect ratio,
 * compresses to JPEG at 70% quality, and validates size < 200KB.
 */

export interface ProcessedImage {
  file: File;
  dataUrl: string;
  sizeKB: number;
  isValid: boolean;
  error?: string;
}

/**
 * Process an image file: resize, compress, and validate size.
 */
export async function processProfileImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      // Calculate new dimensions (max 512x512, maintain aspect ratio)
      let width = img.width;
      let height = img.height;
      const maxDimension = 512;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({
          file,
          dataUrl: '',
          sizeKB: 0,
          isValid: false,
          error: 'Failed to create canvas context',
        });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG blob at 70% quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              file,
              dataUrl: '',
              sizeKB: 0,
              isValid: false,
              error: 'Failed to compress image',
            });
            return;
          }

          const sizeKB = blob.size / 1024;
          const isValid = sizeKB <= 200;
          const processedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          // Create data URL for preview
          const dataUrlReader = new FileReader();
          dataUrlReader.onload = (e) => {
            resolve({
              file: processedFile,
              dataUrl: e.target?.result as string,
              sizeKB,
              isValid,
              error: isValid ? undefined : `Image size (${sizeKB.toFixed(1)}KB) exceeds 200KB limit`,
            });
          };
          dataUrlReader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.7
      );
    };

    img.onerror = () => {
      resolve({
        file,
        dataUrl: '',
        sizeKB: 0,
        isValid: false,
        error: 'Failed to load image',
      });
    };

    reader.readAsDataURL(file);
  });
}
