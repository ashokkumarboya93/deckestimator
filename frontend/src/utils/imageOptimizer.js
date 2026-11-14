// =============================================
// Deck Estimator — Client-Side Image Optimizer
// =============================================
// Resizes and compresses user avatars before upload/storage
// to cut payload sizes by ~90-97% without visible quality loss.

export async function compressAvatarImage(file, maxDimension = 256, quality = 0.82) {
  if (!file || typeof window === 'undefined') {
    throw new Error('Invalid image file');
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;
        if (width <= 0 || height <= 0) {
          throw new Error('Invalid image dimensions');
        }

        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode selected image file.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Resolves avatar paths: data URIs and full URLs are preserved;
 * relative storage paths like /uploads/avatars/... are mapped to the backend host.
 */
export function resolveAvatarUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  if (
    rawUrl.startsWith('data:') ||
    rawUrl.startsWith('blob:') ||
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://')
  ) {
    return rawUrl;
  }
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:5000${cleanPath}`;
}

