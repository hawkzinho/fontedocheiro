import DOMPurify from 'dompurify';

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_MB * 1024 * 1024;

export function sanitizeInput(value, maxLength = 500) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeTextarea(value, maxLength = 1200) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeRichDescription(value) {
  const escapedText = String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const html = escapedText
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
}

export function validateImageFile(file) {
  if (!file) {
    throw new Error('Selecione uma imagem válida.');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo inválido. Envie JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Arquivo muito grande. Limite de 5 MB.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error('Extensão inválida. Use jpg, jpeg, png ou webp.');
  }
}

export function buildSafeFileName(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error('Extensão inválida. Use jpg, jpeg, png ou webp.');
  }

  const normalizedExtension = extension === 'jpeg' ? 'jpg' : extension;
  return `${crypto.randomUUID()}.${normalizedExtension}`;
}

export function extractStoragePath(publicUrl) {
  if (!publicUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(publicUrl);
    const marker = '/storage/v1/object/public/perfumes/';
    const index = parsedUrl.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(parsedUrl.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export function compactImages(images) {
  return Array.isArray(images) ? images.filter(Boolean) : [];
}
